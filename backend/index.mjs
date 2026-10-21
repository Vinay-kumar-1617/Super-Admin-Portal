import { createHash, randomBytes } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { demoAccounts, demoPassword } from './demo-accounts.mjs'
import { getDashboardData } from './dashboard-data.mjs'

const backendDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(backendDirectory, '..')
const databasePath = process.env.DATABASE_PATH ?? resolve(backendDirectory, 'data/fieldwork.sqlite')
const sessionCookieName = 'fieldwork_session'
const sessionLifetimeMs = 8 * 60 * 60 * 1000
const isProduction = process.env.NODE_ENV === 'production'

mkdirSync(dirname(databasePath), { recursive: true })

const database = new DatabaseSync(databasePath)
database.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    scope TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
`)

if (!isProduction || process.env.SEED_DEMO_ACCOUNTS === 'true') {
  const passwordHash = await bcrypt.hash(demoPassword, 12)
  const insertDemoAccount = database.prepare(`
    INSERT INTO users (email, password_hash, role, scope)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(email) DO NOTHING
  `)
  for (const account of demoAccounts) {
    insertDemoAccount.run(account.email, passwordHash, account.role, account.scope)
  }
}

const findUserByEmail = database.prepare('SELECT * FROM users WHERE email = ?')
const findSessionUser = database.prepare(`
  SELECT users.id, users.email, users.role, users.scope
  FROM sessions
  JOIN users ON users.id = sessions.user_id
  WHERE sessions.token_hash = ? AND sessions.expires_at > ?
`)
const insertSession = database.prepare(
  'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
)
const deleteSession = database.prepare('DELETE FROM sessions WHERE token_hash = ?')
const deleteExpiredSessions = database.prepare('DELETE FROM sessions WHERE expires_at <= ?')

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Try again later.' },
})

function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

function publicUser(user) {
  return { email: user.email, role: user.role, scope: user.scope }
}

function setSessionCookie(response, token) {
  response.cookie(sessionCookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: sessionLifetimeMs,
    path: '/',
  })
}

function clearSessionCookie(response) {
  response.clearCookie(sessionCookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  })
}

function requireUser(request, response, next) {
  const token = request.cookies[sessionCookieName]
  if (!token) return response.status(401).json({ error: 'Authentication required.' })

  const user = findSessionUser.get(hashSessionToken(token), Date.now())
  if (!user) {
    clearSessionCookie(response)
    return response.status(401).json({ error: 'Session expired. Sign in again.' })
  }

  request.user = user
  next()
}

function dashboardResponse(user) {
  return { user: publicUser(user), dashboard: getDashboardData(user.role) }
}

app.post('/api/auth/login', loginLimiter, async (request, response, next) => {
  try {
    const email = typeof request.body?.email === 'string' ? request.body.email.trim() : ''
    const password = typeof request.body?.password === 'string' ? request.body.password : ''
    if (!email || !password) {
      return response.status(400).json({ error: 'Email and password are required.' })
    }

    const user = findUserByEmail.get(email)
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return response.status(401).json({ error: 'Email or password is incorrect.' })
    }

    const token = randomBytes(32).toString('base64url')
    const expiresAt = Date.now() + sessionLifetimeMs
    deleteExpiredSessions.run(Date.now())
    insertSession.run(hashSessionToken(token), user.id, expiresAt)
    setSessionCookie(response, token)
    response.json(dashboardResponse(user))
  } catch (error) {
    next(error)
  }
})

app.get('/api/auth/session', requireUser, (request, response) => {
  response.json(dashboardResponse(request.user))
})

app.get('/api/dashboard', requireUser, (request, response) => {
  response.json({ dashboard: getDashboardData(request.user.role) })
})

app.post('/api/auth/logout', (request, response) => {
  const token = request.cookies[sessionCookieName]
  if (token) deleteSession.run(hashSessionToken(token))
  clearSessionCookie(response)
  response.status(204).end()
})

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'API route not found.' })
})

const staticDirectory = resolve(projectRoot, 'frontend/dist')
app.use(express.static(staticDirectory))
app.use((request, response, next) => {
  if (request.method === 'GET' && !request.path.startsWith('/api/')) {
    return response.sendFile(resolve(staticDirectory, 'index.html'), (error) => {
      if (error) next()
    })
  }
  next()
})

app.use((error, _request, response, _next) => {
  console.error('Request failed:', error)
  response.status(500).json({ error: 'An unexpected server error occurred.' })
})

const port = Number(process.env.API_PORT ?? 3001)
const host = process.env.HOST ?? '0.0.0.0'
app.listen(port, host, () => {
  console.log(`Fieldwork auth server listening on http://${host}:${port}`)
  if (!isProduction || process.env.SEED_DEMO_ACCOUNTS === 'true') {
    console.log(`Seeded ${demoAccounts.length} demo users. Shared demo password: ${demoPassword}`)
  }
})