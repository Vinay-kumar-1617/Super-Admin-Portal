import { useState } from 'react'
import type { RoleKey } from '@fieldwork/shared'
import { getSignedInProfile } from './profile'
import { emailForRole, roleAccounts } from './roleAccounts'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type LoginScreenProps = {
  onLogin: (roleKey: RoleKey, email: string) => void
  onDemoLogin: (roleKey: RoleKey, email: string) => void
  onClose?: () => void
}

export default function LoginScreen({ onLogin, onDemoLogin, onClose }: LoginScreenProps) {
  const [email, setEmail] = useState(emailForRole('super-admin'))
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const canPreviewRoles = import.meta.env.DEV && !isSupabaseConfigured

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values first.')
      return
    }
    if (!normalizedEmail || !password) {
      setError('Enter your work email and password.')
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })
      if (signInError) throw signInError
      if (!data.user) throw new Error('Supabase did not return an authenticated user.')

      const profile = await getSignedInProfile(data.user.id, data.user.email ?? normalizedEmail)
      if (!profile) {
        await supabase.auth.signOut()
        throw new Error('No EquipHub role profile is assigned to this account. Contact a super admin.')
      }

      setError('')
      onLogin(profile.roleKey, profile.email)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        {onClose && (
          <button type="button" className="login-close" onClick={onClose} aria-label="Close login panel">×</button>
        )}

        <div className="login-brand">
          <span className="brand-mark">E</span>
          <span className="brand-word">EquipHub</span>
        </div>

        <div className="login-header">
          <p className="login-eyebrow">Admin access</p>
          <h1>Sign in to your dashboard</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field-block">
            <span>Work email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@equiphub.in"
              autoComplete="email"
            />
          </label>

          <label className="field-block">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="primary-btn login-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <div className="dummy-accounts">
          <p>{canPreviewRoles ? 'Development role previews' : 'Staff emails'}</p>
          <div className="account-grid">
            {roleAccounts.map((account) => (
              <button
                type="button"
                key={account.email}
                className="demo-account"
                onClick={() => {
                  if (canPreviewRoles) {
                    onDemoLogin(account.key, account.email)
                    return
                  }
                  setEmail(account.email)
                  setPassword('')
                  setError('')
                }}
              >
                <span>{account.label}</span>
                <small>{canPreviewRoles ? 'Open local dashboard preview' : account.email}</small>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
