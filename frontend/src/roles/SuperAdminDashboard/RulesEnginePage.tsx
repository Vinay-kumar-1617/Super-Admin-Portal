import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { statesPageStyles } from './pageStyles'
import {
  actionCatalog,
  actionLabel,
  aiExamplePrompts,
  approvalLevels,
  categoryMeta,
  conditionFieldMap,
  conditionFields,
  defaultSchedule,
  defaultSimulationContext,
  describeAction,
  describeCondition,
  describeSchedule,
  detectConflicts,
  documentOptions,
  domainCategories,
  emptyExceptions,
  exceptionSummary,
  initialRuleAuditLog,
  nextRuleId,
  notifyAudiences,
  notifyChannels,
  nowStamp,
  operatorLabels,
  operatorsForType,
  parseRuleWithAI,
  prettyDate,
  rulePriorities,
  ruleStatuses,
  runSimulation,
  scopeLabel,
  scopeLevels,
  scopeTargetOptions,
  todayStamp,
  type ActionType,
  type AiParsedRule,
  type ConditionFieldKey,
  type ConditionOperator,
  type RuleAction,
  type RuleAuditAction,
  type RuleAuditEntry,
  type RuleCategory,
  type RuleCondition,
  type RuleDomain,
  type RuleItem,
  type RulePriority,
  type RuleScopeLevel,
  type RuleStatus,
  type RuleVersion,
  type SimulationContext,
  type SimulationOutcome,
} from './rulesEngineData'

export type RulesEnginePageProps = {
  section: RulesPageSection
  domain: RuleDomain
  rules: RuleItem[]
  setRules: Dispatch<SetStateAction<RuleItem[]>>
  onBack: () => void
  onNavigate: (section: RulesPageSection) => void
}

export type RulesPageSection = 'Global Rules' | 'Booking Rules' | 'Pricing'

type RuleDraft = Omit<
  RuleItem,
  'id' | 'versions' | 'audit' | 'createdBy' | 'createdDate' | 'updatedDate'
> & {
  id: string | null
  aiGenerated: boolean
}

type RulesTab = 'library' | 'simulator' | 'conflicts' | 'audit'

type ConfirmRequest = {
  title: string
  body: string
  confirmLabel: string
  tone: 'danger' | 'warn'
  run: () => void
}

const currentActor = 'Diya Reddy'

const builderSteps = [
  'Identity',
  'Scope',
  'Conditions',
  'Actions',
  'Schedule & exceptions',
  'Review & publish',
]

const tabDefs: { id: RulesTab; label: string }[] = [
  { id: 'library', label: 'Rule library' },
  { id: 'simulator', label: 'Rule simulator' },
  { id: 'conflicts', label: 'Conflict detection' },
  { id: 'audit', label: 'Audit log' },
]

const auditActions: RuleAuditAction[] = [
  'Create',
  'Edit',
  'Activate',
  'Pause',
  'Schedule',
  'Duplicate',
  'Archive',
  'Publish',
  'Conflict scan',
  'Simulation',
  'AI draft',
  'Restore',
]

const moneyActionTypes: ActionType[] = ['add_fee', 'add_deposit', 'apply_discount', 'apply_penalty']

const fieldGroups: string[] = [...new Set(conditionFields.map((field) => field.group))]

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const makeVersion = (versionNumber: number, summary: string, status: RuleStatus): RuleVersion => ({
  version: versionNumber,
  date: todayStamp(),
  actor: currentActor,
  summary,
  status,
})

const latestVersionNumber = (rule: RuleItem): number =>
  (rule.versions[rule.versions.length - 1]?.version ?? 0) + 1

const nextCode = (rules: RuleItem[]): string => {
  const numbers = rules
    .map((rule) => Number(rule.code.split('-')[1]))
    .filter((value) => Number.isFinite(value))
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1
  return `GLR-${String(next).padStart(3, '0')}`
}

const emptyDraft = (domain: RuleDomain, code: string): RuleDraft => ({
  id: null,
  code,
  name: '',
  description: '',
  category: domainCategories[domain][0],
  scope: { level: 'Global', target: '' },
  matchMode: 'all',
  conditions: [],
  actions: [],
  priority: 'Medium',
  status: 'Draft',
  schedule: defaultSchedule(),
  exceptions: emptyExceptions(),
  aiGenerated: false,
})

const draftFromRule = (rule: RuleItem): RuleDraft => ({
  id: rule.id,
  code: rule.code,
  name: rule.name,
  description: rule.description,
  category: rule.category,
  scope: { ...rule.scope },
  matchMode: rule.matchMode,
  conditions: rule.conditions.map((condition) => ({ ...condition })),
  actions: rule.actions.map((action) => ({ ...action })),
  priority: rule.priority,
  status: rule.status,
  schedule: { ...rule.schedule, days: [...rule.schedule.days] },
  exceptions: {
    customers: [...rule.exceptions.customers],
    owners: [...rule.exceptions.owners],
    machines: [...rule.exceptions.machines],
    locations: [...rule.exceptions.locations],
  },
  aiGenerated: Boolean(rule.aiGenerated),
})

const auditActionForStatus = (status: RuleStatus, isNew: boolean): RuleAuditAction => {
  if (isNew && status === 'Draft') return 'Create'
  if (status === 'Active') return 'Publish'
  if (status === 'Scheduled') return 'Schedule'
  if (status === 'Paused') return 'Pause'
  if (status === 'Archived') return 'Archive'
  return 'Edit'
}

const statusSummary = (status: RuleStatus, schedule: RuleDraft['schedule']): string => {
  if (status === 'Active') return 'Published to production'
  if (status === 'Scheduled') return `Scheduled effective ${prettyDate(schedule.startDate)}`
  if (status === 'Paused') return 'Rule paused'
  if (status === 'Archived') return 'Rule archived'
  return 'Draft saved'
}

const simPresets: { label: string; build: () => SimulationContext }[] = [
  {
    label: 'Standard excavator rental',
    build: () => defaultSimulationContext(),
  },
  {
    label: 'Weekend enterprise booking',
    build: () => {
      const ctx = defaultSimulationContext()
      return {
        ...ctx,
        customerName: 'Tata Projects Ltd',
        values: {
          ...ctx.values,
          customerType: 'Enterprise',
          rentalTotalValue: 140000,
          rentalDailyRate: 7000,
          rentalDurationDays: 20,
          isWeekend: true,
          paymentStatus: 'Pending',
        },
      }
    },
  },
  {
    label: 'Late return, insurance expired',
    build: () => {
      const ctx = defaultSimulationContext()
      return {
        ...ctx,
        machineId: 'CRN-1188',
        values: {
          ...ctx.values,
          equipmentType: 'Hydraulic Crane',
          lateReturnHours: 6,
          insuranceStatus: 'Expired',
          rentalTotalValue: 62000,
        },
      }
    },
  },
  {
    label: 'Short-notice unpaid partner booking',
    build: () => {
      const ctx = defaultSimulationContext()
      return {
        ...ctx,
        values: {
          ...ctx.values,
          advanceNoticeHours: 3,
          paymentStatus: 'Pending',
          bookingChannel: 'Partner API',
          city: 'Warangal',
        },
      }
    },
  },
]

export default function RulesEnginePage({
  section,
  domain,
  rules,
  setRules,
  onBack,
  onNavigate,
}: RulesEnginePageProps) {
  const [tab, setTab] = useState<RulesTab>('library')
  const [view, setView] = useState<'library' | 'builder' | 'detail'>('library')
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<RuleDraft | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<'overview' | 'versions' | 'audit'>('overview')
  const [selectedSimPreset, setSelectedSimPreset] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | RuleStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | RuleCategory>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | RulePriority>('all')

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null)

  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResult, setAiResult] = useState<AiParsedRule | null>(null)

  const [simContext, setSimContext] = useState<SimulationContext>(defaultSimulationContext)
  const [simOutcome, setSimOutcome] = useState<SimulationOutcome | null>(null)
  const [simOnlyRuleId, setSimOnlyRuleId] = useState('')
  const [simIncludeInactive, setSimIncludeInactive] = useState(false)

  const [reviewedConflicts, setReviewedConflicts] = useState<string[]>([])
  const [auditEntries, setAuditEntries] = useState<RuleAuditEntry[]>(initialRuleAuditLog)
  const [auditActionFilter, setAuditActionFilter] = useState<'all' | RuleAuditAction>('all')
  const [auditQuery, setAuditQuery] = useState('')

  const rulesEngineStyles = `
    .re-page { display: grid; gap: 18px; min-width: 0; }
    .re-back {
      display: inline-flex; align-items: center; gap: 8px; margin: 0 0 8px; padding: 0; border: 0;
      background: transparent; color: var(--brand-orange); font: inherit; font-size: 0.78rem; font-weight: 800; cursor: pointer;
    }
    .re-back:hover { color: #c94310; text-decoration: underline; }
    .re-back:focus-visible { outline: 3px solid rgba(255,107,44,0.4); outline-offset: 4px; }
    .re-controls {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      min-width: 0; flex-wrap: wrap;
    }
    .re-domain-tabs { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
    .re-domain-tab {
      border: 1px solid rgba(15,23,42,0.1); background: #fff; border-radius: 999px; padding: 8px 14px;
      color: #475569; font: inherit; font-size: 0.8rem; font-weight: 700; cursor: pointer;
    }
    .re-domain-tab:hover { border-color: rgba(255,107,44,0.4); color: #c94310; }
    .re-domain-tab.active {
      border-color: transparent; background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-deep));
      color: #fff; box-shadow: 0 10px 22px -10px rgba(239,74,18,0.7);
    }
    .re-header-actions { display: flex; gap: 8px; flex-wrap: wrap; flex: 0 0 auto; }
    .re-page-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
    .re-page-actions .re-new-rule { background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-deep)); box-shadow: 0 8px 18px rgba(239,74,18,0.25); }
    .re-page-actions .re-new-rule:hover { background: linear-gradient(135deg, var(--brand-orange-deep), #d93d0c); box-shadow: 0 10px 22px rgba(239,74,18,0.35); }
    .re-stats { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 12px; }
    .re-stat {
      display: grid; gap: 6px; padding: 14px 16px; background: #fff; border: 1px solid rgba(15,23,42,0.08);
      border-radius: 12px; box-shadow: 0 10px 22px rgba(15,23,42,0.04);
    }
    button.re-stat {
      width: 100%; color: inherit; font: inherit; text-align: left; cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
    }
    button.re-stat:hover { transform: translateY(-2px); border-color: rgba(255,107,44,0.5); }
    button.re-stat:focus-visible { outline: 3px solid rgba(255,107,44,0.4); outline-offset: 2px; }
    button.re-stat.selected { border-color: var(--brand-orange); box-shadow: 0 0 0 2px rgba(255,107,44,0.14); }
    .re-stat span { color: var(--muted); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
    .re-stat strong { font-size: 1.35rem; color: #182230; }
    .re-stat.warn { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.07); }
    .re-stat.warn strong { color: #b45309; }
    .re-tabs {
      display: flex; gap: 6px; background: #fff; border: 1px solid rgba(15,23,42,0.08);
      border-radius: 12px; padding: 6px; box-shadow: 0 10px 22px rgba(15,23,42,0.04);
    }
    .re-tab {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
      border: 0; background: transparent; border-radius: 9px; padding: 10px 12px; font: inherit;
      font-size: 0.79rem; font-weight: 800; color: var(--muted); cursor: pointer;
    }
    .re-tab:hover { color: #182230; }
    .re-tab.active { background: rgba(255,107,44,0.1); color: var(--brand-orange-deep); box-shadow: inset 0 0 0 1px rgba(255,107,44,0.35); }
    .re-tab-badge {
      min-width: 20px; padding: 1px 6px; border-radius: 999px; background: rgba(239,68,68,0.12);
      color: #b91c1c; font-size: 0.66rem; font-weight: 900;
    }
    .re-tab.active .re-tab-badge { background: rgba(239,68,68,0.16); }
    .re-panel {
      background: #fff; border: 1px solid rgba(15,23,42,0.08); border-radius: 14px; overflow: hidden;
      box-shadow: 0 12px 28px rgba(15,23,42,0.05); min-width: 0;
    }
    .re-toolbar {
      display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 15px 18px;
      border-bottom: 1px solid rgba(15,23,42,0.07);
    }
    .re-toolbar-title { display: grid; gap: 3px; }
    .re-toolbar-title strong { font-size: 0.92rem; color: #182230; }
    .re-toolbar-spacer { margin-left: auto; }
    .re-count { color: var(--muted); font-size: 0.74rem; font-weight: 700; white-space: nowrap; }
    .re-rule-list { display: grid; }
    .re-rule-row {
      display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px 20px; align-items: center;
      padding: 16px 18px; border-bottom: 1px solid rgba(15,23,42,0.07);
    }
    .re-rule-row:last-child { border-bottom: 0; }
    .re-rule-row:hover { background: #fcfcfd; }
    .re-rule-main { display: grid; gap: 8px; min-width: 0; }
    .re-rule-title { display: flex; align-items: center; gap: 8px; min-width: 0; flex-wrap: wrap; }
    .re-rule-title strong { color: #182230; font-size: 0.86rem; line-height: 1.35; }
    .re-rule-description { margin: 0; color: #64748b; font-size: 0.75rem; line-height: 1.45; }
    .re-rule-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
    .re-rule-logic { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 18px; }
    .re-rule-logic-item { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: baseline; gap: 7px; min-width: 0; }
    .re-rule-logic-item > strong {
      color: #64748b; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .re-rule-logic-item > span { min-width: 0; color: #334155; font-size: 0.72rem; line-height: 1.4; }
    .re-rule-side { display: grid; justify-items: end; gap: 10px; }
    .re-rule-dates { display: flex; gap: 12px; justify-content: flex-end; color: #64748b; font-size: 0.68rem; }
    .re-code {
      display: inline-flex; align-items: center; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.67rem; color: #475569; background: #f1f5f9; border: 1px solid rgba(15,23,42,0.1);
      border-radius: 6px; padding: 2px 7px; letter-spacing: 0.03em;
    }
    .re-chip {
      display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 999px;
      font-size: 0.67rem; font-weight: 800; border: 1px solid rgba(15,23,42,0.1); background: #f8fafc;
      color: #334155; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
    }
    .re-chip.if { background: rgba(37,99,235,0.08); border-color: rgba(37,99,235,0.2); color: #1d4ed8; }
    .re-chip.then { background: rgba(8,166,108,0.1); border-color: rgba(8,166,108,0.25); color: #078653; }
    .re-chip.warn { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.3); color: #b45309; }
    .re-chip.scope { background: rgba(124,58,237,0.08); border-color: rgba(124,58,237,0.22); color: #6d28d9; }
    .re-chip.ai { background: rgba(14,165,233,0.1); border-color: rgba(14,165,233,0.28); color: #0369a1; }
    .re-chip.muted { background: #f1f5f9; color: #64748b; border-color: rgba(15,23,42,0.08); }
    .re-chip-stack { display: flex; flex-wrap: wrap; gap: 5px; width: 100%; max-width: none; }
    .re-sub { color: var(--muted); font-size: 0.71rem; line-height: 1.45; }
    .re-priority {
      display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 999px;
      font-size: 0.67rem; font-weight: 900; letter-spacing: 0.02em; border: 1px solid transparent;
    }
    .re-priority.critical { background: rgba(220,38,38,0.12); color: #b91c1c; border-color: rgba(220,38,38,0.3); }
    .re-priority.high { background: rgba(245,158,11,0.14); color: #b45309; border-color: rgba(245,158,11,0.32); }
    .re-priority.medium { background: rgba(37,99,235,0.1); color: #1d4ed8; border-color: rgba(37,99,235,0.26); }
    .re-priority.low { background: #f1f5f9; color: #64748b; border-color: rgba(15,23,42,0.1); }
    .re-status {
      display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px;
      font-size: 0.67rem; font-weight: 900; border: 1px solid transparent;
    }
    .re-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .re-status.active { background: rgba(8,166,108,0.12); color: #078653; border-color: rgba(8,166,108,0.3); }
    .re-status.draft { background: #f1f5f9; color: #64748b; border-color: rgba(15,23,42,0.12); }
    .re-status.scheduled { background: rgba(37,99,235,0.1); color: #1d4ed8; border-color: rgba(37,99,235,0.26); }
    .re-status.paused { background: rgba(245,158,11,0.14); color: #b45309; border-color: rgba(245,158,11,0.3); }
    .re-status.archived { background: rgba(100,116,139,0.14); color: #475569; border-color: rgba(100,116,139,0.3); }
    .re-row-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 5px; }
    .re-act {
      border: 1px solid rgba(15,23,42,0.12); background: #fff; border-radius: 7px; padding: 6px 9px;
      font: inherit; font-size: 0.68rem; font-weight: 750; color: #334155; cursor: pointer; white-space: nowrap;
    }
    .re-act:hover { border-color: var(--brand-orange); color: var(--brand-orange-deep); }
    .re-act.primary { background: var(--brand-orange); border-color: var(--brand-orange); color: #fff; }
    .re-act.primary:hover { background: var(--brand-orange-deep); color: #fff; }
    .re-act.danger { color: #b91c1c; border-color: rgba(239,68,68,0.3); }
    .re-act.danger:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.5); color: #b91c1c; }
    .re-act:disabled { opacity: 0.45; cursor: not-allowed; }
    @media (max-width: 760px) {
      .re-rule-row { grid-template-columns: minmax(0, 1fr); }
      .re-rule-side { justify-items: start; }
      .re-rule-dates { justify-content: flex-start; }
      .re-row-actions { justify-content: flex-start; }
    }
    @media (max-width: 520px) {
      .re-rule-logic { grid-template-columns: minmax(0, 1fr); }
      .re-rule-dates { flex-wrap: wrap; }
    }
    .re-link {
      border: 0; background: transparent; padding: 0; font: inherit; font-size: 0.7rem; font-weight: 800;
      color: var(--brand-orange-deep); cursor: pointer; text-decoration: underline;
    }
    .re-steps { display: flex; gap: 6px; flex-wrap: wrap; padding: 14px 18px; border-bottom: 1px solid rgba(15,23,42,0.07); }
    .re-step {
      display: flex; align-items: center; gap: 8px; border: 1px solid rgba(15,23,42,0.1); background: #fff;
      border-radius: 999px; padding: 7px 13px; font: inherit; font-size: 0.73rem; font-weight: 800;
      color: #64748b; cursor: pointer;
    }
    .re-step:hover { border-color: rgba(255,107,44,0.5); color: var(--brand-orange-deep); }
    .re-step.active { border-color: var(--brand-orange); background: rgba(255,107,44,0.09); color: var(--brand-orange-deep); }
    .re-step.done { border-color: rgba(8,166,108,0.35); color: #078653; }
    .re-step-num {
      width: 20px; height: 20px; border-radius: 50%; background: #eef2f7; display: grid; place-items: center;
      font-size: 0.65rem; font-weight: 900;
    }
    .re-step.active .re-step-num { background: var(--brand-orange); color: #fff; }
    .re-step.done .re-step-num { background: rgba(8,166,108,0.18); color: #078653; }
    .re-builder-body { padding: 18px; display: grid; gap: 16px; }
    .re-builder-footer {
      display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 18px;
      border-top: 1px solid rgba(15,23,42,0.07); background: #f8fafc; flex-wrap: wrap;
    }
    .re-builder-footer-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .re-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; }
    .re-field { display: grid; gap: 6px; min-width: 0; align-content: start; }
    .re-field label, .re-field .re-label, .re-ai-examples .re-label {
      color: #64748b; font-size: 0.68rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .re-field input, .re-field select, .re-field textarea {
      width: 100%; padding: 8px 10px; border: 1px solid rgba(15,23,42,0.14); border-radius: 8px;
      background: #fff; color: #182230; font: inherit; font-size: 0.8rem;
    }
    .re-field textarea { min-height: 84px; resize: vertical; line-height: 1.5; }
    .re-field input:focus, .re-field select:focus, .re-field textarea:focus {
      outline: none; border-color: var(--brand-orange); box-shadow: 0 0 0 3px rgba(255,107,44,0.14);
    }
    .re-field input[readonly] { background: #f8fafc; color: #64748b; }
    .re-field .re-hint { color: var(--muted); font-size: 0.7rem; line-height: 1.4; }
    .re-field.full { grid-column: 1 / -1; }
    .re-section-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
    .re-section-title h4 { margin: 0; font-size: 0.95rem; color: #182230; }
    .re-section-title p { margin: 3px 0 0; color: var(--muted); font-size: 0.76rem; line-height: 1.45; }
    .re-subheading {
      margin: 0; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;
    }
    .re-empty-inline {
      margin: 0; padding: 14px 16px; border: 1px dashed rgba(15,23,42,0.2); border-radius: 10px;
      background: #f8fafc; color: var(--muted); font-size: 0.78rem; line-height: 1.5;
    }
    .re-cond-row {
      display: grid; grid-template-columns: 1.2fr 0.9fr 1.1fr auto; gap: 10px; align-items: end;
      padding: 12px; border: 1px solid rgba(15,23,42,0.08); border-radius: 10px; background: #f8fafc;
    }
    .re-action-list { display: grid; gap: 10px; }
    .re-action-card {
      border: 1px solid rgba(15,23,42,0.09); border-radius: 10px; padding: 13px; display: grid; gap: 11px;
      background: #fff; box-shadow: 0 8px 18px rgba(15,23,42,0.04);
    }
    .re-action-card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .re-action-card-head strong { font-size: 0.83rem; color: #182230; }
    .re-action-card-note { margin: 0; color: var(--muted); font-size: 0.75rem; line-height: 1.45; }
    .re-action-config { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; }
    .re-action-palette { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; }
    .re-palette-card {
      text-align: left; border: 1px dashed rgba(15,23,42,0.22); background: #fff; border-radius: 10px;
      padding: 11px 12px; font: inherit; cursor: pointer; display: grid; gap: 4px;
    }
    .re-palette-card:hover { border-color: var(--brand-orange); background: rgba(255,107,44,0.05); }
    .re-palette-card strong { font-size: 0.77rem; color: #182230; }
    .re-palette-card span { color: var(--muted); font-size: 0.69rem; line-height: 1.4; }
    .re-doc-chips { display: flex; flex-wrap: wrap; gap: 7px; }
    .re-doc-chip {
      border: 1px solid rgba(15,23,42,0.14); background: #fff; border-radius: 999px; padding: 5px 11px;
      font: inherit; font-size: 0.7rem; font-weight: 800; color: #475569; cursor: pointer;
    }
    .re-doc-chip:hover { border-color: var(--brand-orange); color: var(--brand-orange-deep); }
    .re-doc-chip.on { background: rgba(8,166,108,0.1); border-color: rgba(8,166,108,0.35); color: #078653; }
    .re-day-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .re-day {
      width: 46px; height: 34px; border-radius: 8px; border: 1px solid rgba(15,23,42,0.14); background: #fff;
      font: inherit; font-size: 0.7rem; font-weight: 900; color: #64748b; cursor: pointer;
    }
    .re-day.on { background: rgba(255,107,44,0.12); border-color: var(--brand-orange); color: var(--brand-orange-deep); }
    .re-summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; }
    .re-summary-card {
      border: 1px solid rgba(15,23,42,0.08); border-radius: 10px; padding: 13px; background: #f8fafc;
      display: grid; gap: 9px; align-content: start;
    }
    .re-summary-card.wide { grid-column: 1 / -1; }
    .re-summary-card h5 {
      margin: 0; font-size: 0.68rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;
    }
    .re-bullets { margin: 0; padding-left: 17px; display: grid; gap: 5px; font-size: 0.77rem; color: #334155; line-height: 1.45; }
    .re-check { display: inline-flex; align-items: center; gap: 7px; font-size: 0.75rem; font-weight: 700; color: #475569; }
    .re-check input { accent-color: var(--brand-orange); width: 14px; height: 14px; }
    .re-detail-head {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 18px;
      border-bottom: 1px solid rgba(15,23,42,0.07); flex-wrap: wrap;
    }
    .re-detail-meta { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-bottom: 7px; }
    .re-detail-head h3 { margin: 0 0 6px; font-size: 1.15rem; color: #182230; }
    .re-detail-head .re-detail-desc { margin: 0; color: var(--muted); font-size: 0.8rem; line-height: 1.5; max-width: 82ch; }
    .re-detail-body { padding: 18px; display: grid; gap: 14px; }
    .re-detail-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 14px; }
    .re-detail-block {
      border: 1px solid rgba(15,23,42,0.08); border-radius: 10px; padding: 14px; background: #fff;
      display: grid; gap: 10px; align-content: start;
    }
    .re-detail-block h5 {
      margin: 0; font-size: 0.69rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;
    }
    .re-kv { display: grid; grid-template-columns: 150px 1fr; gap: 8px 12px; margin: 0; font-size: 0.78rem; }
    .re-kv dt { color: var(--muted); font-weight: 700; }
    .re-kv dd { margin: 0; color: #182230; }
    .re-timeline { display: grid; }
    .re-version { display: grid; grid-template-columns: auto 1fr; gap: 13px; padding: 12px 0; border-bottom: 1px dashed rgba(15,23,42,0.14); }
    .re-version:last-child { border-bottom: 0; }
    .re-version-dot {
      width: 12px; height: 12px; border-radius: 50%; background: var(--brand-orange); margin-top: 5px;
      box-shadow: 0 0 0 4px rgba(255,107,44,0.16);
    }
    .re-version-body { display: grid; gap: 4px; }
    .re-version-body strong { font-size: 0.8rem; color: #182230; }
    .re-version-meta { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; color: var(--muted); font-size: 0.71rem; }
    .re-sim-layout { display: grid; grid-template-columns: 330px 1fr; gap: 16px; padding: 18px; align-items: start; }
    .re-sim-side { display: grid; gap: 13px; }
    .re-preset-select {
      width: 100%; padding: 8px 10px; border: 1px solid rgba(15,23,42,0.14); border-radius: 8px;
      background: #fff; color: #182230; font: inherit; font-size: 0.78rem;
    }
    .re-preset-select:focus { outline: none; border-color: var(--brand-orange); box-shadow: 0 0 0 3px rgba(255,107,44,0.14); }
    .re-sim-group {
      border: 1px solid rgba(15,23,42,0.08); border-radius: 10px; padding: 11px; display: grid; gap: 9px; background: #f8fafc;
    }
    .re-sim-group h5 { margin: 0; font-size: 0.67rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .re-sim-fields { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; }
    .re-sim-field { display: grid; gap: 4px; min-width: 0; }
    .re-sim-field span { font-size: 0.66rem; font-weight: 800; color: #64748b; }
    .re-sim-field input, .re-sim-field select {
      width: 100%; min-width: 0; padding: 6px 8px; border: 1px solid rgba(15,23,42,0.14); border-radius: 7px;
      background: #fff; color: #182230; font: inherit; font-size: 0.74rem;
    }
    .re-sim-field input:focus, .re-sim-field select:focus {
      outline: none; border-color: var(--brand-orange); box-shadow: 0 0 0 3px rgba(255,107,44,0.12);
    }
    .re-sim-main { display: grid; gap: 14px; min-width: 0; }
    .re-totals { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 10px; }
    .re-total {
      border: 1px solid rgba(15,23,42,0.08); border-radius: 10px; padding: 11px 12px; display: grid; gap: 5px; background: #f8fafc;
    }
    .re-total span { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }
    .re-total strong { font-size: 1.02rem; color: #182230; }
    .re-total.payable { background: rgba(8,166,108,0.08); border-color: rgba(8,166,108,0.3); }
    .re-total.payable strong { color: #078653; }
    .re-outcome-flags { display: flex; flex-wrap: wrap; gap: 7px; }
    .re-outcome-list { display: grid; gap: 10px; }
    .re-outcome {
      border: 1px solid rgba(15,23,42,0.09); border-left: 3px solid var(--brand-orange); border-radius: 10px;
      padding: 12px 14px; display: grid; gap: 8px; background: #fff;
    }
    .re-outcome.blocked { border-left-color: #dc2626; background: rgba(239,68,68,0.04); }
    .re-outcome-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    .re-outcome-head strong { font-size: 0.83rem; color: #182230; }
    .re-reason-list { margin: 0; padding-left: 16px; display: grid; gap: 4px; font-size: 0.73rem; color: #475569; line-height: 1.45; }
    .re-skipped { border: 1px solid rgba(15,23,42,0.09); border-radius: 10px; background: #f8fafc; padding: 11px 13px; }
    .re-skipped summary { cursor: pointer; font-size: 0.77rem; font-weight: 800; color: #475569; }
    .re-skip-list { margin: 10px 0 0; padding: 0; list-style: none; display: grid; gap: 8px; }
    .re-skip-list li { font-size: 0.73rem; color: #475569; line-height: 1.45; }
    .re-skip-list strong { color: #182230; }
    .re-conflict-list { display: grid; gap: 12px; padding: 18px; }
    .re-conflict {
      border: 1px solid rgba(15,23,42,0.1); border-radius: 12px; padding: 15px; display: grid; gap: 10px;
      background: #fff; box-shadow: 0 8px 18px rgba(15,23,42,0.04);
    }
    .re-conflict.sev-high { border-left: 4px solid #dc2626; }
    .re-conflict.sev-medium { border-left: 4px solid #f59e0b; }
    .re-conflict.sev-low { border-left: 4px solid #3b82f6; }
    .re-conflict.is-reviewed { opacity: 0.72; background: #f8fafc; }
    .re-conflict-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .re-conflict-meta { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
    .re-conflict-summary { margin: 0; font-size: 0.8rem; color: #334155; line-height: 1.5; }
    .re-conflict-rules { display: flex; gap: 10px; flex-wrap: wrap; }
    .re-conflict-rule {
      border: 1px solid rgba(15,23,42,0.1); border-radius: 9px; padding: 9px 12px; display: grid; gap: 4px;
      background: #f8fafc; font-size: 0.77rem; justify-items: start;
    }
    .re-conflict-rule strong { color: #182230; }
    .re-conflict-suggestion {
      margin: 0; padding: 9px 11px; border-radius: 9px; background: rgba(37,99,235,0.06);
      border: 1px solid rgba(37,99,235,0.16); color: #1e40af; font-size: 0.76rem; line-height: 1.5;
    }
    .re-audit-wrap { overflow-x: auto; padding: 4px 18px 18px; }
    .re-audit-table { width: 100%; min-width: 940px; border-collapse: collapse; text-align: left; font-size: 0.77rem; }
    .re-audit-table th, .re-audit-table td { padding: 10px 12px; border-bottom: 1px solid rgba(15,23,42,0.06); vertical-align: top; }
    .re-audit-table th {
      color: #64748b; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background: #f8fafc;
    }
    .re-audit-action {
      display: inline-flex; padding: 3px 8px; border-radius: 6px; font-size: 0.66rem; font-weight: 900;
      background: rgba(37,99,235,0.08); color: #1d4ed8; border: 1px solid rgba(37,99,235,0.18); white-space: nowrap;
    }
    .re-ai-modal { max-width: 820px; width: 100%; }
    .re-confirm-modal { max-width: 520px; width: 100%; }
    .re-ai-examples { display: grid; gap: 7px; margin-top: 4px; }
    .re-ai-example {
      text-align: left; border: 1px solid rgba(15,23,42,0.1); background: #f8fafc; border-radius: 9px;
      padding: 9px 11px; font: inherit; font-size: 0.75rem; color: #334155; cursor: pointer; line-height: 1.45;
    }
    .re-ai-example:hover { border-color: var(--brand-orange); background: rgba(255,107,44,0.05); }
    .re-ai-result { display: grid; gap: 12px; margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(15,23,42,0.08); }
    .re-confidence { display: grid; gap: 6px; }
    .re-confidence-head { display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; }
    .re-confidence-head span { font-weight: 900; color: var(--brand-orange-deep); }
    .re-confidence-bar { height: 8px; border-radius: 999px; background: #eef2f7; overflow: hidden; }
    .re-confidence-fill { height: 100%; background: linear-gradient(90deg, var(--brand-orange), #22c55e); }
    .re-detected { display: flex; flex-wrap: wrap; gap: 6px; }
    .re-ai-note {
      margin: 0; font-size: 0.74rem; color: #b45309; background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.28); border-radius: 8px; padding: 8px 10px; line-height: 1.45;
    }
    .re-btn-danger {
      min-height: 37px; padding: 8px 14px; border: 1px solid #dc2626; border-radius: 8px; background: #dc2626;
      color: #fff; font: inherit; font-size: 0.76rem; font-weight: 800; cursor: pointer;
    }
    .re-btn-danger:hover { background: #b91c1c; }
    .re-btn-warn {
      min-height: 37px; padding: 8px 14px; border: 1px solid #f59e0b; border-radius: 8px; background: #f59e0b;
      color: #fff; font: inherit; font-size: 0.76rem; font-weight: 800; cursor: pointer;
    }
    .re-btn-warn:hover { background: #d97706; }
    .re-btn-danger:disabled, .re-btn-warn:disabled { opacity: 0.5; cursor: not-allowed; }
  `

  const domainRules = useMemo(
    () => rules.filter((rule) => domainCategories[domain].includes(rule.category)),
    [rules, domain],
  )

  const conflicts = useMemo(() => detectConflicts(domainRules), [domainRules])

  const filteredRules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return domainRules.filter((rule) => {
      if (statusFilter !== 'all' && rule.status !== statusFilter) return false
      if (categoryFilter !== 'all' && rule.category !== categoryFilter) return false
      if (priorityFilter !== 'all' && rule.priority !== priorityFilter) return false
      if (!query) return true
      return (
        rule.name.toLowerCase().includes(query) ||
        rule.code.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query) ||
        rule.category.toLowerCase().includes(query) ||
        scopeLabel(rule.scope).toLowerCase().includes(query) ||
        rule.conditions.some((condition) => describeCondition(condition).toLowerCase().includes(query)) ||
        rule.actions.some((action) => describeAction(action).toLowerCase().includes(query))
      )
    })
  }, [domainRules, searchQuery, statusFilter, categoryFilter, priorityFilter])

  const stats = useMemo(() => {
    const count = (status: RuleStatus) => domainRules.filter((rule) => rule.status === status).length
    return {
      total: domainRules.length,
      active: count('Active'),
      scheduled: count('Scheduled'),
      drafts: count('Draft'),
      paused: count('Paused'),
      conflicts: conflicts.length,
    }
  }, [domainRules, conflicts])

  const auditRows = useMemo(() => {
    const merged: RuleAuditEntry[] = [...auditEntries]
    for (const rule of domainRules) merged.push(...rule.audit)
    const seen = new Set<string>()
    return merged
      .filter((entry) => {
        const key = `${entry.ts}|${entry.detail}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => (a.ts === b.ts ? 0 : a.ts < b.ts ? 1 : -1))
  }, [auditEntries, domainRules])

  const filteredAuditRows = useMemo(() => {
    const query = auditQuery.trim().toLowerCase()
    return auditRows.filter((entry) => {
      if (auditActionFilter !== 'all' && entry.action !== auditActionFilter) return false
      if (!query) return true
      return (
        entry.actor.toLowerCase().includes(query) ||
        entry.detail.toLowerCase().includes(query) ||
        (entry.ruleName ?? '').toLowerCase().includes(query)
      )
    })
  }, [auditRows, auditActionFilter, auditQuery])

  const detailRule = detailId === null ? null : (rules.find((rule) => rule.id === detailId) ?? null)
  const effectiveView: 'library' | 'builder' | 'detail' =
    view === 'builder' && !draft ? 'library' : view === 'detail' && !detailRule ? 'library' : view
  const hasActiveFilters = Boolean(
    searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || priorityFilter !== 'all',
  )

  const filterRulesByStatus = (status: RuleStatus | 'all') => {
    setView('library')
    setTab('library')
    setSearchQuery('')
    setStatusFilter(status)
    setCategoryFilter('all')
    setPriorityFilter('all')
  }

  const openConflictsFromStat = () => {
    setView('library')
    setTab('conflicts')
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    window.setTimeout(() => setToastMessage(null), 4000)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setPriorityFilter('all')
  }

  const pushAudit = (action: RuleAuditAction, detail: string) => {
    setAuditEntries((prev) => [
      { id: nextRuleId('aud'), ts: nowStamp(), actor: currentActor, action, detail },
      ...prev,
    ])
  }

  const openCreate = () => {
    setDraft(emptyDraft(domain, nextCode(domainRules)))
    setStep(0)
    setView('builder')
  }

  const openEdit = (rule: RuleItem) => {
    setDraft(draftFromRule(rule))
    setStep(0)
    setView('builder')
  }

  const closeBuilder = () => {
    setDraft(null)
    setView('library')
    setTab('library')
  }

  const openDetail = (rule: RuleItem) => {
    setDetailId(rule.id)
    setDetailTab('overview')
    setView('detail')
  }

  const closeDetail = () => {
    setDetailId(null)
    setView('library')
    setTab('library')
  }

  const updateDraft = (patch: Partial<RuleDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const setScopeLevel = (level: RuleScopeLevel) => {
    const target = level === 'Global' ? '' : (scopeTargetOptions(level)[0] ?? '')
    updateDraft({ scope: { level, target } })
  }

  const addCondition = () => {
    const def = conditionFields[0]
    const condition: RuleCondition = {
      id: nextRuleId('cond'),
      field: def.key,
      operator: operatorsForType(def.type)[0],
      value: def.type === 'select' ? (def.options?.[0] ?? '') : '0',
    }
    setDraft((prev) => (prev ? { ...prev, conditions: [...prev.conditions, condition] } : prev))
  }

  const updateCondition = (id: string, patch: Partial<RuleCondition>) => {
    setDraft((prev) =>
      prev
        ? { ...prev, conditions: prev.conditions.map((item) => (item.id === id ? { ...item, ...patch } : item)) }
        : prev,
    )
  }

  const changeConditionField = (id: string, key: ConditionFieldKey) => {
    const def = conditionFieldMap[key]
    const operator = operatorsForType(def.type)[0]
    const value = def.type === 'select' ? (def.options?.[0] ?? '') : def.type === 'number' ? '0' : 'true'
    updateCondition(id, { field: key, operator, value })
  }

  const removeCondition = (id: string) => {
    setDraft((prev) =>
      prev ? { ...prev, conditions: prev.conditions.filter((item) => item.id !== id) } : prev,
    )
  }

  const addAction = (type: ActionType) => {
    const action: RuleAction = { id: nextRuleId('act'), type }
    if (moneyActionTypes.includes(type)) {
      action.unit = type === 'apply_discount' || type === 'add_deposit' ? 'percent' : 'flat'
      action.amount = type === 'add_deposit' ? 10 : type === 'apply_discount' ? 5 : type === 'apply_penalty' ? 2000 : 500
      action.label = actionCatalog.find((item) => item.type === type)?.label ?? ''
    } else if (type === 'require_approval') {
      action.approvalLevel = approvalLevels[1]
    } else if (type === 'require_documents') {
      action.documents = ['Insurance Certificate']
    } else if (type === 'send_notification') {
      action.channel = 'In-app'
      action.audience = 'Customer'
    }
    setDraft((prev) => (prev ? { ...prev, actions: [...prev.actions, action] } : prev))
  }

  const updateAction = (id: string, patch: Partial<RuleAction>) => {
    setDraft((prev) =>
      prev ? { ...prev, actions: prev.actions.map((item) => (item.id === id ? { ...item, ...patch } : item)) } : prev,
    )
  }

  const removeAction = (id: string) => {
    setDraft((prev) => (prev ? { ...prev, actions: prev.actions.filter((item) => item.id !== id) } : prev))
  }

  const toggleDocument = (action: RuleAction, document: string) => {
    const current = action.documents ?? []
    const next = current.includes(document)
      ? current.filter((item) => item !== document)
      : [...current, document]
    updateAction(action.id, { documents: next })
  }

  const toggleDay = (index: number) => {
    setDraft((prev) => {
      if (!prev) return prev
      const days = prev.schedule.days.includes(index)
        ? prev.schedule.days.filter((day) => day !== index)
        : [...prev.schedule.days, index].sort((a, b) => a - b)
      return { ...prev, schedule: { ...prev.schedule, days } }
    })
  }

  const updateExceptions = (key: 'customers' | 'owners' | 'machines' | 'locations', text: string) => {
    const values = text
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    setDraft((prev) => {
      if (!prev) return prev
      const exceptions = { ...prev.exceptions }
      exceptions[key] = values
      return { ...prev, exceptions }
    })
  }

  const commitDraft = (status: RuleStatus) => {
    const active = draft
    if (!active) return
    const name = active.name.trim()
    if (!name) {
      showToast('Give the rule a name before saving.')
      setStep(0)
      return
    }
    if (active.scope.level !== 'Global' && !active.scope.target) {
      showToast('Choose a scope target before saving.')
      setStep(1)
      return
    }
    if (active.actions.length === 0) {
      showToast('Add at least one action before saving.')
      setStep(3)
      return
    }

    const date = todayStamp()
    const stamp = nowStamp()
    const summary = statusSummary(status, active.schedule)
    const auditAction = auditActionForStatus(status, active.id === null)

    if (active.id) {
      const existing = rules.find((rule) => rule.id === active.id)
      const baseVersion = existing ? (existing.versions[existing.versions.length - 1]?.version ?? 0) + 1 : 1
      const updated: RuleItem = {
        id: active.id,
        code: active.code,
        name,
        description: active.description.trim(),
        category: active.category,
        scope: active.scope,
        matchMode: active.matchMode,
        conditions: active.conditions,
        actions: active.actions,
        priority: active.priority,
        status,
        schedule: active.schedule,
        exceptions: active.exceptions,
        createdBy: existing?.createdBy ?? currentActor,
        createdDate: existing?.createdDate ?? date,
        updatedDate: date,
        aiGenerated: active.aiGenerated,
        versions: [...(existing?.versions ?? []), makeVersion(baseVersion, summary, status)],
        audit: [
          {
            id: nextRuleId('aud'),
            ts: stamp,
            actor: currentActor,
            action: auditAction,
            detail: `${summary} (${active.code})`,
            ruleId: active.id,
            ruleName: name,
          },
          ...(existing?.audit ?? []),
        ],
      }
      setRules((prev) => prev.map((rule) => (rule.id === active.id ? updated : rule)))
      showToast(`${active.code} — ${summary.toLowerCase()}.`)
    } else {
      const id = nextRuleId('rule')
      const created: RuleItem = {
        id,
        code: active.code,
        name,
        description: active.description.trim(),
        category: active.category,
        scope: active.scope,
        matchMode: active.matchMode,
        conditions: active.conditions,
        actions: active.actions,
        priority: active.priority,
        status,
        schedule: active.schedule,
        exceptions: active.exceptions,
        createdBy: currentActor,
        createdDate: date,
        updatedDate: date,
        aiGenerated: active.aiGenerated,
        versions: [makeVersion(1, summary, status)],
        audit: [
          {
            id: nextRuleId('aud'),
            ts: stamp,
            actor: currentActor,
            action: auditAction,
            detail: `${summary} (${active.code})`,
            ruleId: id,
            ruleName: name,
          },
        ],
      }
      setRules((prev) => [created, ...prev])
      showToast(`${active.code} created — ${summary.toLowerCase()}.`)
    }

    setDraft(null)
    setView('library')
    setTab('library')
  }

  const publishDraft = () => {
    if (!draft) return
    const futureSchedule = draft.schedule.mode === 'Scheduled' && draft.schedule.startDate > todayStamp()
    commitDraft(futureSchedule ? 'Scheduled' : 'Active')
  }

  const changeStatus = (rule: RuleItem, status: RuleStatus, note: string, action: RuleAuditAction) => {
    const stamp = nowStamp()
    const date = todayStamp()
    const updated: RuleItem = {
      ...rule,
      status,
      updatedDate: date,
      versions: [...rule.versions, makeVersion(latestVersionNumber(rule), note, status)],
      audit: [
        {
          id: nextRuleId('aud'),
          ts: stamp,
          actor: currentActor,
          action,
          detail: note,
          ruleId: rule.id,
          ruleName: rule.name,
        },
        ...rule.audit,
      ],
    }
    setRules((prev) => prev.map((item) => (item.id === rule.id ? updated : item)))
    showToast(`${rule.code} — ${note.toLowerCase()}.`)
  }

  const activateRule = (rule: RuleItem) => changeStatus(rule, 'Active', 'Rule activated', 'Activate')
  const pauseRule = (rule: RuleItem) => changeStatus(rule, 'Paused', 'Rule paused', 'Pause')

  const requestArchive = (rule: RuleItem) => {
    setConfirm({
      title: 'Archive rule',
      body: `${rule.code} · ${rule.name} will stop evaluating bookings and move to the archive. You can restore it later from the archived filter.`,
      confirmLabel: 'Archive rule',
      tone: 'danger',
      run: () => changeStatus(rule, 'Archived', 'Rule archived', 'Archive'),
    })
  }

  const duplicateRule = (rule: RuleItem) => {
    const code = nextCode(domainRules)
    const id = nextRuleId('rule')
    const name = `${rule.name} (copy)`
    const date = todayStamp()
    const copy: RuleItem = {
      ...rule,
      id,
      code,
      name,
      status: 'Draft',
      createdDate: date,
      updatedDate: date,
      versions: [makeVersion(1, `Duplicated from ${rule.code}`, 'Draft')],
      audit: [
        {
          id: nextRuleId('aud'),
          ts: nowStamp(),
          actor: currentActor,
          action: 'Duplicate',
          detail: `Duplicated from ${rule.code} · ${rule.name}`,
          ruleId: id,
          ruleName: name,
        },
        ...rule.audit,
      ],
    }
    setRules((prev) => [copy, ...prev])
    showToast(`${code} created as a draft copy of ${rule.code}.`)
  }

  const openAiModal = () => {
    setAiPrompt('')
    setAiResult(null)
    setAiOpen(true)
  }

  const closeAiModal = () => {
    setAiOpen(false)
    setAiResult(null)
    setAiPrompt('')
  }

  const generateAiRule = () => {
    const prompt = aiPrompt.trim()
    if (!prompt) {
      showToast('Describe the rule in plain language first.')
      return
    }
    const parsed = parseRuleWithAI(prompt)
    setAiResult(parsed)
    const shortPrompt = prompt.length > 90 ? `${prompt.slice(0, 87)}...` : prompt
    pushAudit(
      'AI draft',
      `AI draft generated: "${shortPrompt}" — ${parsed.conditions.length} condition(s), ${parsed.actions.length} action(s), ${parsed.confidence}% confidence.`,
    )
  }

  const draftFromAi = (): RuleDraft | null => {
    if (!aiResult) return null
    const categories = domainCategories[domain]
    return {
      id: null,
      code: nextCode(domainRules),
      name: aiResult.name,
      description: aiResult.description,
      category: categories.includes(aiResult.category) ? aiResult.category : categories[0],
      scope: aiResult.scope,
      matchMode: aiResult.matchMode,
      conditions: aiResult.conditions,
      actions: aiResult.actions,
      priority: aiResult.priority,
      status: 'Draft',
      schedule: defaultSchedule(),
      exceptions: emptyExceptions(),
      aiGenerated: true,
    }
  }

  const aiOpenInBuilder = () => {
    const next = draftFromAi()
    if (!next) return
    setAiOpen(false)
    setDraft(next)
    setStep(0)
    setView('builder')
    showToast('AI draft loaded into the rule builder for review.')
  }

  const aiSaveDraft = () => {
    const next = draftFromAi()
    if (!next) return
    const date = todayStamp()
    const id = nextRuleId('rule')
    const created: RuleItem = {
      id,
      code: next.code,
      name: next.name.trim() || 'Untitled AI draft',
      description: next.description,
      category: next.category,
      scope: next.scope,
      matchMode: next.matchMode,
      conditions: next.conditions,
      actions: next.actions,
      priority: next.priority,
      status: 'Draft',
      schedule: next.schedule,
      exceptions: next.exceptions,
      createdBy: currentActor,
      createdDate: date,
      updatedDate: date,
      aiGenerated: true,
      versions: [makeVersion(1, 'Draft generated with AI', 'Draft')],
      audit: [
        {
          id: nextRuleId('aud'),
          ts: nowStamp(),
          actor: currentActor,
          action: 'AI draft',
          detail: `Draft generated with AI — ${next.description}`,
          ruleId: id,
          ruleName: next.name,
        },
      ],
    }
    setRules((prev) => [created, ...prev])
    closeAiModal()
    showToast(`${created.code} saved as an AI draft.`)
  }

  const applyPreset = (preset: { label: string; build: () => SimulationContext }) => {
    setSelectedSimPreset(preset.label)
    setSimContext(preset.build())
    setSimOutcome(null)
  }

  const updateSimValue = (key: ConditionFieldKey, value: string | number | boolean) => {
    setSimContext((prev) => ({ ...prev, values: { ...prev.values, [key]: value } }))
  }

  const runSimulationNow = () => {
    const outcome = runSimulation(domainRules, simContext, {
      onlyRuleId: simOnlyRuleId === '' ? undefined : simOnlyRuleId,
      includeInactive: simIncludeInactive,
    })
    setSimOutcome(outcome)
    pushAudit(
      'Simulation',
      `Simulated ${simContext.machineId} for ${simContext.customerName} — ${outcome.matches.length} rule(s) matched, ₹${outcome.totals.payableAtBooking.toLocaleString('en-IN')} payable at booking.`,
    )
  }

  const simulateThisRule = (rule: RuleItem) => {
    setSimOnlyRuleId(rule.id)
    setSimOutcome(runSimulation(domainRules, simContext, { onlyRuleId: rule.id }))
    setDetailId(null)
    setView('library')
    setTab('simulator')
  }

  const rescanConflicts = () => {
    const found = detectConflicts(domainRules)
    pushAudit(
      'Conflict scan',
      `Manual conflict scan across ${domainRules.length} ${section} rules — ${found.length} potential conflict(s) found.`,
    )
    showToast(`Scan complete — ${found.length} potential conflict(s).`)
  }

  const toggleReviewedConflict = (id: string) => {
    setReviewedConflicts((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const openRuleById = (id: string) => {
    const rule = rules.find((item) => item.id === id)
    if (rule) openDetail(rule)
  }

  return (
    <section className="re-page" aria-label={`${section} rules engine`}>
      <style>{statesPageStyles}</style>
      <style>{rulesEngineStyles}</style>

      <header className="dashboard-header">
        <div>
          <button type="button" className="re-back" onClick={onBack}>
            <span aria-hidden="true">←</span> Dashboard overview
          </button>
          <h1 className="header-title">{section}</h1>
        </div>
        <span className="chip active">Platform Configuration</span>
      </header>

      <div className="re-controls">
        <nav className="re-domain-tabs" aria-label="Platform configuration sections">
          {(['Global Rules', 'Booking Rules', 'Pricing'] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`re-domain-tab ${section === item ? 'active' : ''}`}
              aria-current={section === item ? 'page' : undefined}
              onClick={() => onNavigate(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="re-page-actions">
          <button type="button" className="btn-secondary" onClick={openAiModal}>
            Generate Rule with AI
          </button>
          <button type="button" className="btn-primary re-new-rule" onClick={openCreate}>
            New rule
          </button>
        </div>
      </div>

      <div className="re-stats" aria-label="Rules overview">
        <button
          type="button"
          className={`re-stat ${statusFilter === 'all' && tab === 'library' ? 'selected' : ''}`}
          onClick={() => filterRulesByStatus('all')}
          aria-label={`Show all ${stats.total} rules`}
          aria-pressed={statusFilter === 'all' && tab === 'library'}
        >
          <span>Total rules</span>
          <strong>{stats.total}</strong>
        </button>
        <button
          type="button"
          className={`re-stat ${statusFilter === 'Active' && tab === 'library' ? 'selected' : ''}`}
          onClick={() => filterRulesByStatus('Active')}
          aria-label={`Show ${stats.active} active rules`}
          aria-pressed={statusFilter === 'Active' && tab === 'library'}
        >
          <span>Active</span>
          <strong>{stats.active}</strong>
        </button>
        <button
          type="button"
          className={`re-stat ${statusFilter === 'Scheduled' && tab === 'library' ? 'selected' : ''}`}
          onClick={() => filterRulesByStatus('Scheduled')}
          aria-label={`Show ${stats.scheduled} scheduled rules`}
          aria-pressed={statusFilter === 'Scheduled' && tab === 'library'}
        >
          <span>Scheduled</span>
          <strong>{stats.scheduled}</strong>
        </button>
        <button
          type="button"
          className={`re-stat ${statusFilter === 'Draft' && tab === 'library' ? 'selected' : ''}`}
          onClick={() => filterRulesByStatus('Draft')}
          aria-label={`Show ${stats.drafts} draft rules`}
          aria-pressed={statusFilter === 'Draft' && tab === 'library'}
        >
          <span>Drafts</span>
          <strong>{stats.drafts}</strong>
        </button>
        <button
          type="button"
          className={`re-stat ${statusFilter === 'Paused' && tab === 'library' ? 'selected' : ''}`}
          onClick={() => filterRulesByStatus('Paused')}
          aria-label={`Show ${stats.paused} paused rules`}
          aria-pressed={statusFilter === 'Paused' && tab === 'library'}
        >
          <span>Paused</span>
          <strong>{stats.paused}</strong>
        </button>
        <button
          type="button"
          className={`re-stat warn ${tab === 'conflicts' && view === 'library' ? 'selected' : ''}`}
          onClick={openConflictsFromStat}
          aria-label={`Show ${stats.conflicts} potential conflicts`}
          aria-pressed={tab === 'conflicts' && view === 'library'}
        >
          <span>Potential conflicts</span>
          <strong>{stats.conflicts}</strong>
        </button>
      </div>

      {effectiveView === 'library' && (
        <nav className="re-tabs" aria-label="Rules engine sections">
          {tabDefs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`re-tab ${tab === item.id ? 'active' : ''}`}
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
              {item.id === 'conflicts' && conflicts.length > 0 && (
                <span className="re-tab-badge">{conflicts.length}</span>
              )}
            </button>
          ))}
        </nav>
      )}

      {effectiveView === 'library' && tab === 'library' && (
        <section className="re-panel" aria-label="Rule library">
          <div className="re-toolbar">
            <div className="states-search-box">
              <input
                type="search"
                placeholder="Search by name, code, condition or action..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search rules"
              />
            </div>
            <select
              className="bookings-filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | RuleStatus)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              {ruleStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              className="bookings-filter-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as 'all' | RuleCategory)}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {domainCategories[domain].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              className="bookings-filter-select"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as 'all' | RulePriority)}
              aria-label="Filter by priority"
            >
              <option value="all">All priorities</option>
              {rulePriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            {hasActiveFilters && (
              <button type="button" className="btn-secondary" onClick={resetFilters}>
                Reset filters
              </button>
            )}
            <div className="re-toolbar-spacer" />
            <span className="re-count">
              {filteredRules.length} of {domainRules.length} rules
            </span>
          </div>

          {filteredRules.length === 0 ? (
            <div className="empty-states-panel">
              <h4>No rules match these filters</h4>
              <p>Adjust the search or filters above, or create a new rule for {section}.</p>
              <button type="button" className="btn-primary" onClick={openCreate}>
                Create rule
              </button>
            </div>
          ) : (
            <div className="re-rule-list">
              {filteredRules.map((rule) => (
                <article className="re-rule-row" key={rule.id}>
                  <div className="re-rule-main">
                    <div className="re-rule-title">
                      <span className="re-code">{rule.code}</span>
                      <strong>{rule.name}</strong>
                      {rule.aiGenerated && <span className="re-chip ai">AI draft</span>}
                    </div>
                    <p className="re-rule-description">{rule.description}</p>
                    <div className="re-rule-meta">
                      <span className="re-chip">{rule.category}</span>
                      <span className="re-chip scope">{scopeLabel(rule.scope)}</span>
                      <span className={`re-priority ${rule.priority.toLowerCase()}`}>{rule.priority}</span>
                      <span className={`re-status ${rule.status.toLowerCase()}`}>{rule.status}</span>
                    </div>
                    <div className="re-rule-logic">
                      <div className="re-rule-logic-item">
                        <strong>If</strong>
                        <span>
                          {rule.conditions.length === 0
                            ? 'Always in scope'
                            : `${describeCondition(rule.conditions[0])}${rule.conditions.length > 1 ? ` · +${rule.conditions.length - 1} more` : ''}`}
                        </span>
                      </div>
                      <div className="re-rule-logic-item">
                        <strong>Then</strong>
                        <span>
                          {rule.actions.length === 0
                            ? 'No actions'
                            : `${describeAction(rule.actions[0])}${rule.actions.length > 1 ? ` · +${rule.actions.length - 1} more` : ''}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="re-rule-side">
                    <div className="re-rule-dates">
                      <span>{describeSchedule(rule.schedule)}</span>
                      <span>Updated {prettyDate(rule.updatedDate)}</span>
                    </div>
                    <div className="re-row-actions" aria-label={`Actions for ${rule.name}`}>
                      <button type="button" className="re-act" onClick={() => openDetail(rule)}>View</button>
                      <button type="button" className="re-act" onClick={() => openEdit(rule)}>Edit</button>
                      {rule.status === 'Active' ? (
                        <button type="button" className="re-act" onClick={() => pauseRule(rule)}>Pause</button>
                      ) : rule.status === 'Archived' ? null : (
                        <button type="button" className="re-act primary" onClick={() => activateRule(rule)}>
                          {rule.status === 'Draft' ? 'Publish' : 'Activate'}
                        </button>
                      )}
                      <button type="button" className="re-act" onClick={() => duplicateRule(rule)}>Duplicate</button>
                      {rule.status !== 'Archived' && (
                        <button type="button" className="re-act danger" onClick={() => requestArchive(rule)}>Archive</button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {effectiveView === 'builder' && draft && (
        <section className="re-panel" aria-label="Rule builder">
          <div className="re-toolbar">
            <div className="re-toolbar-title">
              <span className="re-code">{draft.code}</span>
              <strong>
                {draft.id ? `Editing ${draft.code}` : 'New rule'} · step {step + 1} of {builderSteps.length}
              </strong>
            </div>
            <div className="re-toolbar-spacer" />
            <span className="re-chip scope">{section}</span>
            <button type="button" className="btn-secondary" onClick={closeBuilder}>
              Cancel
            </button>
          </div>

          <div className="re-steps">
            {builderSteps.map((label, index) => (
              <button
                key={label}
                type="button"
                className={`re-step ${step === index ? 'active' : ''} ${step > index ? 'done' : ''}`}
                onClick={() => setStep(index)}
              >
                <span className="re-step-num">{index + 1}</span>
                {label}
              </button>
            ))}
          </div>

          <div className="re-builder-body">
            {step === 0 && (
              <div className="re-form-grid">
                <div className="re-field">
                  <label htmlFor="re-rule-name">Rule name</label>
                  <input
                    id="re-rule-name"
                    value={draft.name}
                    onChange={(event) => updateDraft({ name: event.target.value })}
                    placeholder="e.g. Long-haul excavator security deposit"
                  />
                  <span className="re-hint">Shown in audit logs and in operator-facing notifications.</span>
                </div>
                <div className="re-field">
                  <label htmlFor="re-rule-category">Category</label>
                  <select
                    id="re-rule-category"
                    value={draft.category}
                    onChange={(event) => updateDraft({ category: event.target.value as RuleCategory })}
                  >
                    {domainCategories[domain].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <span className="re-hint">
                    {categoryMeta[draft.category].group} group · category code {categoryMeta[draft.category].code}
                  </span>
                </div>
                <div className="re-field">
                  <label htmlFor="re-rule-priority">Priority</label>
                  <select
                    id="re-rule-priority"
                    value={draft.priority}
                    onChange={(event) => updateDraft({ priority: event.target.value as RulePriority })}
                  >
                    {rulePriorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                  <span className="re-hint">When two rules match one booking, the higher priority wins.</span>
                </div>
                <div className="re-field full">
                  <label htmlFor="re-rule-desc">Description</label>
                  <textarea
                    id="re-rule-desc"
                    value={draft.description}
                    onChange={(event) => updateDraft({ description: event.target.value })}
                    placeholder="What does this rule do, and why does it exist?"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="re-form-grid">
                <div className="re-field">
                  <label htmlFor="re-scope-level">Scope level</label>
                  <select
                    id="re-scope-level"
                    value={draft.scope.level}
                    onChange={(event) => setScopeLevel(event.target.value as RuleScopeLevel)}
                  >
                    {scopeLevels.map((item) => (
                      <option key={item.level} value={item.level}>
                        {item.level}
                      </option>
                    ))}
                  </select>
                  <span className="re-hint">
                    {scopeLevels.find((item) => item.level === draft.scope.level)?.hint}
                  </span>
                </div>
                <div className="re-field">
                  <label htmlFor="re-scope-target">Scope target</label>
                  <select
                    id="re-scope-target"
                    value={draft.scope.target}
                    disabled={draft.scope.level === 'Global'}
                    onChange={(event) => updateDraft({ scope: { ...draft.scope, target: event.target.value } })}
                  >
                    {draft.scope.level === 'Global' && <option value="">Applies platform-wide</option>}
                    {scopeTargetOptions(draft.scope.level).map((target) => (
                      <option key={target} value={target}>
                        {target}
                      </option>
                    ))}
                  </select>
                  <span className="re-hint">
                    {draft.scope.level === 'Global'
                      ? 'Global rules evaluate on every booking in the platform.'
                      : 'Only bookings inside this target evaluate the rule.'}
                  </span>
                </div>
                <div className="re-field">
                  <label htmlFor="re-match-mode">Condition matching</label>
                  <select
                    id="re-match-mode"
                    value={draft.matchMode}
                    onChange={(event) => updateDraft({ matchMode: event.target.value as 'all' | 'any' })}
                  >
                    <option value="all">Match ALL conditions (and)</option>
                    <option value="any">Match ANY condition (or)</option>
                  </select>
                  <span className="re-hint">Applies to the conditions on the next step.</span>
                </div>
                <div className="re-field">
                  <span className="re-label">Effective window</span>
                  <span className="re-hint">
                    {describeSchedule(draft.schedule)} · exceptions: {exceptionSummary(draft.exceptions)}
                  </span>
                </div>
              </div>
            )}

            {step === 2 && (
              <>
                <div className="re-section-title">
                  <div>
                    <h4>Conditions</h4>
                    <p>The rule fires when these conditions match. Leave the list empty to match on scope alone.</p>
                  </div>
                  <div className="re-doc-chips">
                    <button
                      type="button"
                      className={`re-doc-chip ${draft.matchMode === 'all' ? 'on' : ''}`}
                      onClick={() => updateDraft({ matchMode: 'all' })}
                    >
                      Match ALL
                    </button>
                    <button
                      type="button"
                      className={`re-doc-chip ${draft.matchMode === 'any' ? 'on' : ''}`}
                      onClick={() => updateDraft({ matchMode: 'any' })}
                    >
                      Match ANY
                    </button>
                  </div>
                </div>
                {draft.conditions.length === 0 && (
                  <p className="re-empty-inline">
                    No conditions yet — the rule will match every booking that falls inside its scope.
                  </p>
                )}
                {draft.conditions.map((condition) => {
                  const field = conditionFieldMap[condition.field]
                  const listOperator = condition.operator === 'in' || condition.operator === 'not_in'
                  return (
                    <div className="re-cond-row" key={condition.id}>
                      <div className="re-field">
                        <label htmlFor={`cond-field-${condition.id}`}>Field</label>
                        <select
                          id={`cond-field-${condition.id}`}
                          value={condition.field}
                          onChange={(event) => changeConditionField(condition.id, event.target.value as ConditionFieldKey)}
                        >
                          {fieldGroups.map((group) => (
                            <optgroup key={group} label={group}>
                              {conditionFields
                                .filter((item) => item.group === group)
                                .map((item) => (
                                  <option key={item.key} value={item.key}>
                                    {item.label}
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div className="re-field">
                        <label htmlFor={`cond-op-${condition.id}`}>Operator</label>
                        <select
                          id={`cond-op-${condition.id}`}
                          value={condition.operator}
                          onChange={(event) =>
                            updateCondition(condition.id, { operator: event.target.value as ConditionOperator })
                          }
                        >
                          {operatorsForType(field.type).map((operator) => (
                            <option key={operator} value={operator}>
                              {operatorLabels[operator]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="re-field">
                        <label htmlFor={`cond-value-${condition.id}`}>
                          Value{field.unit ? ` (${field.unit})` : ''}
                        </label>
                        {field.type === 'boolean' ? (
                          <input id={`cond-value-${condition.id}`} readOnly value={condition.operator === 'is_true' ? 'true' : 'false'} />
                        ) : field.type === 'number' && !listOperator ? (
                          <input
                            id={`cond-value-${condition.id}`}
                            type="number"
                            value={condition.value}
                            onChange={(event) => updateCondition(condition.id, { value: event.target.value })}
                          />
                        ) : field.type === 'select' && !listOperator ? (
                          <select
                            id={`cond-value-${condition.id}`}
                            value={condition.value}
                            onChange={(event) => updateCondition(condition.id, { value: event.target.value })}
                          >
                            {(field.options ?? []).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={`cond-value-${condition.id}`}
                            value={condition.value}
                            placeholder="Comma separated values"
                            onChange={(event) => updateCondition(condition.id, { value: event.target.value })}
                          />
                        )}
                      </div>
                      <button type="button" className="re-act danger" onClick={() => removeCondition(condition.id)}>
                        Remove
                      </button>
                    </div>
                  )
                })}
                <div>
                  <button type="button" className="btn-secondary" onClick={addCondition}>
                    Add condition
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="re-section-title">
                  <div>
                    <h4>Actions</h4>
                    <p>What happens when the rule matches. A rule needs at least one action before it can be saved.</p>
                  </div>
                  <span className="re-chip then">{draft.actions.length} configured</span>
                </div>
                {draft.actions.length === 0 && (
                  <p className="re-empty-inline">No actions yet — pick one from the palette below to get started.</p>
                )}
                <div className="re-action-list">
                  {draft.actions.map((action) => (
                    <div className="re-action-card" key={action.id}>
                      <div className="re-action-card-head">
                        <strong>{actionLabel(action.type)}</strong>
                        <button type="button" className="re-act danger" onClick={() => removeAction(action.id)}>
                          Remove
                        </button>
                      </div>
                      {moneyActionTypes.includes(action.type) && (
                        <div className="re-action-config">
                          <div className="re-field">
                            <label htmlFor={`act-unit-${action.id}`}>Unit</label>
                            <select
                              id={`act-unit-${action.id}`}
                              value={action.unit ?? 'flat'}
                              onChange={(event) =>
                                updateAction(action.id, { unit: event.target.value as 'percent' | 'flat' })
                              }
                            >
                              <option value="flat">Flat amount (₹)</option>
                              <option value="percent">Percent of rental (%)</option>
                            </select>
                          </div>
                          <div className="re-field">
                            <label htmlFor={`act-amount-${action.id}`}>Amount</label>
                            <input
                              id={`act-amount-${action.id}`}
                              type="number"
                              min={0}
                              value={action.amount ?? 0}
                              onChange={(event) => updateAction(action.id, { amount: Number(event.target.value) })}
                            />
                          </div>
                          <div className="re-field">
                            <label htmlFor={`act-label-${action.id}`}>Label on invoice</label>
                            <input
                              id={`act-label-${action.id}`}
                              value={action.label ?? ''}
                              onChange={(event) => updateAction(action.id, { label: event.target.value })}
                            />
                          </div>
                        </div>
                      )}
                      {action.type === 'block_booking' && (
                        <p className="re-action-card-note">
                          This action rejects the matching booking immediately and records the rule name as the reason
                          in the booking timeline.
                        </p>
                      )}
                      {action.type === 'require_approval' && (
                        <div className="re-action-config">
                          <div className="re-field">
                            <label htmlFor={`act-level-${action.id}`}>Approval level</label>
                            <select
                              id={`act-level-${action.id}`}
                              value={action.approvalLevel ?? 'State Admin'}
                              onChange={(event) => updateAction(action.id, { approvalLevel: event.target.value })}
                            >
                              {approvalLevels.map((level) => (
                                <option key={level} value={level}>
                                  {level}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                      {action.type === 'require_documents' && (
                        <div className="re-field">
                          <span className="re-label">Required documents</span>
                          <div className="re-doc-chips">
                            {documentOptions.map((document) => {
                              const selected = (action.documents ?? []).includes(document)
                              return (
                                <button
                                  key={document}
                                  type="button"
                                  className={`re-doc-chip ${selected ? 'on' : ''}`}
                                  onClick={() => toggleDocument(action, document)}
                                >
                                  {document}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      {action.type === 'send_notification' && (
                        <div className="re-action-config">
                          <div className="re-field">
                            <label htmlFor={`act-channel-${action.id}`}>Channel</label>
                            <select
                              id={`act-channel-${action.id}`}
                              value={action.channel ?? 'In-app'}
                              onChange={(event) => updateAction(action.id, { channel: event.target.value })}
                            >
                              {notifyChannels.map((channel) => (
                                <option key={channel} value={channel}>
                                  {channel}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="re-field">
                            <label htmlFor={`act-audience-${action.id}`}>Audience</label>
                            <select
                              id={`act-audience-${action.id}`}
                              value={action.audience ?? 'Customer'}
                              onChange={(event) => updateAction(action.id, { audience: event.target.value })}
                            >
                              {notifyAudiences.map((audience) => (
                                <option key={audience} value={audience}>
                                  {audience}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <h5 className="re-subheading" style={{ marginBottom: 9 }}>
                    Add an action
                  </h5>
                  <div className="re-action-palette">
                    {actionCatalog.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        className="re-palette-card"
                        onClick={() => addAction(item.type)}
                      >
                        <strong>{item.label}</strong>
                        <span>{item.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <div className="re-form-grid">
                <div className="re-field full">
                  <label htmlFor="re-sched-mode">Start mode</label>
                  <select
                    id="re-sched-mode"
                    value={draft.schedule.mode}
                    onChange={(event) =>
                      updateDraft({
                        schedule: { ...draft.schedule, mode: event.target.value as RuleDraft['schedule']['mode'] },
                      })
                    }
                  >
                    <option value="Immediate">Immediate — starts as soon as it is published</option>
                    <option value="Scheduled">Scheduled — starts and ends on set dates</option>
                    <option value="Recurring">Recurring — runs on selected days and hours</option>
                  </select>
                </div>
                {draft.schedule.mode === 'Scheduled' && (
                  <>
                    <div className="re-field">
                      <label htmlFor="re-sched-start">Effective from</label>
                      <input
                        id="re-sched-start"
                        type="date"
                        value={draft.schedule.startDate}
                        onChange={(event) =>
                          updateDraft({ schedule: { ...draft.schedule, startDate: event.target.value } })
                        }
                      />
                    </div>
                    <div className="re-field">
                      <label htmlFor="re-sched-end">Effective until</label>
                      <input
                        id="re-sched-end"
                        type="date"
                        value={draft.schedule.endDate}
                        onChange={(event) =>
                          updateDraft({ schedule: { ...draft.schedule, endDate: event.target.value } })
                        }
                      />
                      <span className="re-hint">Leave empty to keep the rule running until it is paused or archived.</span>
                    </div>
                  </>
                )}
                {draft.schedule.mode === 'Recurring' && (
                  <>
                    <div className="re-field full">
                      <span className="re-label">Active days</span>
                      <div className="re-day-row">
                        {dayLabels.map((label, index) => (
                          <button
                            key={label}
                            type="button"
                            className={`re-day ${draft.schedule.days.includes(index) ? 'on' : ''}`}
                            onClick={() => toggleDay(index)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <span className="re-hint">{describeSchedule(draft.schedule)}</span>
                    </div>
                    <div className="re-field">
                      <label htmlFor="re-sched-start-time">Start time</label>
                      <input
                        id="re-sched-start-time"
                        type="time"
                        value={draft.schedule.startTime}
                        onChange={(event) =>
                          updateDraft({ schedule: { ...draft.schedule, startTime: event.target.value } })
                        }
                      />
                    </div>
                    <div className="re-field">
                      <label htmlFor="re-sched-end-time">End time</label>
                      <input
                        id="re-sched-end-time"
                        type="time"
                        value={draft.schedule.endTime}
                        onChange={(event) =>
                          updateDraft({ schedule: { ...draft.schedule, endTime: event.target.value } })
                        }
                      />
                    </div>
                  </>
                )}
                <div className="re-field">
                  <label htmlFor="re-exc-customers">Excluded customers</label>
                  <input
                    id="re-exc-customers"
                    value={draft.exceptions.customers.join(', ')}
                    placeholder="Comma separated names or types"
                    onChange={(event) => updateExceptions('customers', event.target.value)}
                  />
                </div>
                <div className="re-field">
                  <label htmlFor="re-exc-owners">Excluded owners</label>
                  <input
                    id="re-exc-owners"
                    value={draft.exceptions.owners.join(', ')}
                    placeholder="Comma separated owner names"
                    onChange={(event) => updateExceptions('owners', event.target.value)}
                  />
                </div>
                <div className="re-field">
                  <label htmlFor="re-exc-machines">Excluded machines</label>
                  <input
                    id="re-exc-machines"
                    value={draft.exceptions.machines.join(', ')}
                    placeholder="Comma separated machine IDs"
                    onChange={(event) => updateExceptions('machines', event.target.value)}
                  />
                </div>
                <div className="re-field">
                  <label htmlFor="re-exc-locations">Excluded locations</label>
                  <input
                    id="re-exc-locations"
                    value={draft.exceptions.locations.join(', ')}
                    placeholder="Comma separated cities or zones"
                    onChange={(event) => updateExceptions('locations', event.target.value)}
                  />
                </div>
                <div className="re-field full">
                  <span className="re-label">Exception summary</span>
                  <span className="re-hint">{exceptionSummary(draft.exceptions)}</span>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="re-summary-grid">
                <div className="re-summary-card">
                  <h5>Identity</h5>
                  <ul className="re-bullets">
                    <li>
                      <strong>{draft.name.trim() || 'Untitled rule'}</strong>
                    </li>
                    <li>Code {draft.code}</li>
                    <li>
                      {draft.category} · {categoryMeta[draft.category].group} group
                    </li>
                    <li>
                      {draft.priority} priority{draft.aiGenerated ? ' · AI generated' : ''}
                    </li>
                  </ul>
                </div>
                <div className="re-summary-card">
                  <h5>Scope &amp; schedule</h5>
                  <ul className="re-bullets">
                    <li>Scope: {scopeLabel(draft.scope)}</li>
                    <li>{draft.matchMode === 'all' ? 'Match all conditions' : 'Match any condition'}</li>
                    <li>{describeSchedule(draft.schedule)}</li>
                    <li>{exceptionSummary(draft.exceptions)}</li>
                  </ul>
                </div>
                <div className="re-summary-card">
                  <h5>Readiness checks</h5>
                  <ul className="re-bullets">
                    <li>{draft.name.trim() ? 'Name is set' : 'Name is still missing'}</li>
                    <li>
                      {draft.scope.level === 'Global' || draft.scope.target
                        ? 'Scope target confirmed'
                        : 'Scope target still missing'}
                    </li>
                    <li>{draft.conditions.length} condition(s) configured</li>
                    <li>
                      {draft.actions.length > 0
                        ? `${draft.actions.length} action(s) configured`
                        : 'No actions configured yet'}
                    </li>
                  </ul>
                </div>
                <div className="re-summary-card wide">
                  <h5>Conditions</h5>
                  {draft.conditions.length === 0 ? (
                    <span className="re-sub">No conditions — the rule matches every booking inside its scope.</span>
                  ) : (
                    <div className="re-chip-stack" style={{ maxWidth: 'none' }}>
                      {draft.conditions.map((condition) => (
                        <span key={condition.id} className="re-chip if">
                          {describeCondition(condition)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="re-summary-card wide">
                  <h5>Actions</h5>
                  <div className="re-chip-stack" style={{ maxWidth: 'none' }}>
                    {draft.actions.map((action) => (
                      <span key={action.id} className="re-chip then">
                        {describeAction(action)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="re-summary-card wide">
                  <h5>Publishing</h5>
                  <p className="re-sub" style={{ margin: 0 }}>
                    Use "Save as draft" to keep editing later, or "Publish rule" to activate it right away — rules with
                    a future start date are scheduled instead of going live immediately.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="re-builder-footer">
            <button
              type="button"
              className="btn-secondary"
              disabled={step === 0}
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            >
              Back
            </button>
            <div className="re-builder-footer-group">
              <button type="button" className="btn-secondary" onClick={() => commitDraft('Draft')}>
                Save as draft
              </button>
              {step < builderSteps.length - 1 ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setStep((prev) => Math.min(builderSteps.length - 1, prev + 1))}
                >
                  Continue
                </button>
              ) : (
                <button type="button" className="btn-primary" onClick={publishDraft}>
                  Publish rule
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {effectiveView === 'detail' && detailRule && (
        <section className="re-panel" aria-label={`Rule ${detailRule.code}`}>
          <div className="re-detail-head">
            <div>
              <div className="re-detail-meta">
                <span className="re-code">{detailRule.code}</span>
                <span className={`re-status ${detailRule.status.toLowerCase()}`}>{detailRule.status}</span>
                <span className={`re-priority ${detailRule.priority.toLowerCase()}`}>{detailRule.priority}</span>
                <span className="re-chip scope">{scopeLabel(detailRule.scope)}</span>
                {detailRule.aiGenerated && <span className="re-chip ai">AI draft</span>}
              </div>
              <h3>{detailRule.name}</h3>
              <p className="re-detail-desc">{detailRule.description}</p>
            </div>
            <div className="re-header-actions">
              <button type="button" className="btn-secondary" onClick={closeDetail}>
                Back to library
              </button>
              <button type="button" className="btn-secondary" onClick={() => openEdit(detailRule)}>
                Edit rule
              </button>
              <button type="button" className="btn-secondary" onClick={() => simulateThisRule(detailRule)}>
                Simulate
              </button>
              {detailRule.status === 'Active' ? (
                <button type="button" className="btn-secondary" onClick={() => pauseRule(detailRule)}>
                  Pause
                </button>
              ) : detailRule.status === 'Archived' ? null : (
                <button type="button" className="btn-primary" onClick={() => activateRule(detailRule)}>
                  {detailRule.status === 'Draft' ? 'Publish' : 'Activate'}
                </button>
              )}
              {detailRule.status !== 'Archived' && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ color: '#b91c1c', borderColor: 'rgba(239,68,68,0.3)' }}
                  onClick={() => requestArchive(detailRule)}
                >
                  Archive
                </button>
              )}
            </div>
          </div>

          <nav className="re-tabs" aria-label="Rule detail sections">
            {(['overview', 'versions', 'audit'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={`re-tab ${detailTab === item ? 'active' : ''}`}
                onClick={() => setDetailTab(item)}
              >
                {item === 'overview' ? 'Overview' : item === 'versions' ? 'Version history' : 'Audit trail'}
              </button>
            ))}
          </nav>

          {detailTab === 'overview' && (
            <div className="re-detail-body">
              <div className="re-detail-grid">
                <div style={{ display: 'grid', gap: 14 }}>
                  <div className="re-detail-block">
                    <h5>
                      If — conditions ({detailRule.matchMode === 'all' ? 'all must match' : 'any may match'})
                    </h5>
                    {detailRule.conditions.length === 0 ? (
                      <span className="re-sub">No conditions — matches every booking inside the scope.</span>
                    ) : (
                      <div className="re-chip-stack" style={{ maxWidth: 'none' }}>
                        {detailRule.conditions.map((condition) => (
                          <span key={condition.id} className="re-chip if">
                            {describeCondition(condition)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="re-detail-block">
                    <h5>Then — actions</h5>
                    <ul className="re-bullets">
                      {detailRule.actions.map((action) => (
                        <li key={action.id}>{describeAction(action)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="re-detail-block">
                  <h5>Rule metadata</h5>
                  <dl className="re-kv">
                    <dt>Category</dt>
                    <dd>
                      {detailRule.category} · {categoryMeta[detailRule.category].group} group
                    </dd>
                    <dt>Scope</dt>
                    <dd>{scopeLabel(detailRule.scope)}</dd>
                    <dt>Priority</dt>
                    <dd>
                      <span className={`re-priority ${detailRule.priority.toLowerCase()}`}>
                        {detailRule.priority}
                      </span>
                    </dd>
                    <dt>Schedule</dt>
                    <dd>{describeSchedule(detailRule.schedule)}</dd>
                    <dt>Exceptions</dt>
                    <dd>{exceptionSummary(detailRule.exceptions)}</dd>
                    <dt>Created by</dt>
                    <dd>
                      {detailRule.createdBy} on {prettyDate(detailRule.createdDate)}
                    </dd>
                    <dt>Last updated</dt>
                    <dd>{prettyDate(detailRule.updatedDate)}</dd>
                    <dt>Versions</dt>
                    <dd>{detailRule.versions.length} recorded version(s)</dd>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {detailTab === 'versions' && (
            <div className="re-detail-body">
              <div className="re-timeline">
                {[...detailRule.versions].reverse().map((item) => (
                  <div className="re-version" key={`${detailRule.id}-v${item.version}`}>
                    <span className="re-version-dot" />
                    <div className="re-version-body">
                      <strong>
                        Version {item.version} — {item.summary}
                      </strong>
                      <div className="re-version-meta">
                        <span>{prettyDate(item.date)}</span>
                        <span>·</span>
                        <span>{item.actor}</span>
                        <span className={`re-status ${item.status.toLowerCase()}`}>{item.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detailTab === 'audit' && (
            <div className="re-audit-wrap">
              <table className="re-audit-table">
                <thead>
                  <tr>
                    <th scope="col">Timestamp</th>
                    <th scope="col">Actor</th>
                    <th scope="col">Action</th>
                    <th scope="col">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {detailRule.audit.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.ts}</td>
                      <td>{entry.actor}</td>
                      <td>
                        <span className="re-audit-action">{entry.action}</span>
                      </td>
                      <td>{entry.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {effectiveView === 'library' && tab === 'simulator' && (
        <section className="re-panel" aria-label="Rule simulator">
          <div className="re-toolbar">
            <div className="re-toolbar-title">
              <strong>Rule simulator</strong>
              <span className="re-sub">
                Evaluate a hypothetical booking against the {section} rule set before publishing changes.
              </span>
            </div>
            <div className="re-toolbar-spacer" />
            <label className="re-check">
              <input
                type="checkbox"
                checked={simIncludeInactive}
                onChange={(event) => setSimIncludeInactive(event.target.checked)}
              />
              Include paused &amp; draft rules
            </label>
            <select
              className="bookings-filter-select"
              value={simOnlyRuleId}
              onChange={(event) => setSimOnlyRuleId(event.target.value)}
              aria-label="Limit simulation to one rule"
            >
              <option value="">All rules in this section</option>
              {domainRules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.code} · {rule.name}
                </option>
              ))}
            </select>
            <button type="button" className="btn-primary" onClick={runSimulationNow}>
              Run simulation
            </button>
          </div>

          <div className="re-sim-layout">
            <aside className="re-sim-side" aria-label="Scenario inputs">
              <div>
                <label className="re-sim-field">
                  <span>Preset scenario</span>
                  <select
                    className="re-preset-select"
                    value={selectedSimPreset}
                    onChange={(event) => {
                      const preset = simPresets.find((item) => item.label === event.target.value)
                      if (preset) applyPreset(preset)
                    }}
                  >
                    <option value="">Choose a scenario...</option>
                    {simPresets.map((preset) => (
                      <option key={preset.label} value={preset.label}>{preset.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="re-sim-fields">
                <label className="re-sim-field">
                  <span>Customer</span>
                  <input
                    value={simContext.customerName}
                    onChange={(event) => setSimContext((prev) => ({ ...prev, customerName: event.target.value }))}
                  />
                </label>
                <label className="re-sim-field">
                  <span>Fleet owner</span>
                  <input
                    value={simContext.ownerName}
                    onChange={(event) => setSimContext((prev) => ({ ...prev, ownerName: event.target.value }))}
                  />
                </label>
                <label className="re-sim-field">
                  <span>Machine ID</span>
                  <input
                    value={simContext.machineId}
                    onChange={(event) => setSimContext((prev) => ({ ...prev, machineId: event.target.value }))}
                  />
                </label>
              </div>
              {fieldGroups.map((group) => (
                <div className="re-sim-group" key={group}>
                  <h5>{group}</h5>
                  <div className="re-sim-fields">
                    {conditionFields
                      .filter((field) => field.group === group)
                      .map((field) => {
                        const value = simContext.values[field.key]
                        return (
                          <label className="re-sim-field" key={field.key}>
                            <span>
                              {field.label}
                              {field.unit ? ` (${field.unit})` : ''}
                            </span>
                            {field.type === 'boolean' ? (
                              <select
                                value={String(value)}
                                onChange={(event) => updateSimValue(field.key, event.target.value === 'true')}
                              >
                                <option value="true">true</option>
                                <option value="false">false</option>
                              </select>
                            ) : field.type === 'number' ? (
                              <input
                                type="number"
                                value={typeof value === 'number' ? value : Number(value) || 0}
                                onChange={(event) => updateSimValue(field.key, Number(event.target.value))}
                              />
                            ) : (
                              <select
                                value={String(value)}
                                onChange={(event) => updateSimValue(field.key, event.target.value)}
                              >
                                {(field.options ?? []).map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            )}
                          </label>
                        )
                      })}
                  </div>
                </div>
              ))}
            </aside>

            <div className="re-sim-main">
              {!simOutcome ? (
                <div className="empty-states-panel">
                  <h4>Run the simulator to see rule outcomes</h4>
                  <p>
                    Adjust the scenario on the left, then run the simulation to see matched rules, money totals,
                    blocks, approvals and notifications.
                  </p>
                </div>
              ) : (
                <>
                  <div className="re-totals">
                    <div className="re-total">
                      <span>Base rental</span>
                      <strong>₹{simOutcome.totals.base.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="re-total">
                      <span>Fees</span>
                      <strong>₹{simOutcome.totals.fees.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="re-total">
                      <span>Deposits</span>
                      <strong>₹{simOutcome.totals.deposits.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="re-total">
                      <span>Discounts</span>
                      <strong>−₹{simOutcome.totals.discounts.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="re-total">
                      <span>Penalties</span>
                      <strong>₹{simOutcome.totals.penalties.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="re-total payable">
                      <span>Payable now</span>
                      <strong>₹{simOutcome.totals.payableAtBooking.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="re-outcome-flags">
                    <span className="re-chip then">{simOutcome.matches.length} matched</span>
                    <span className="re-chip muted">{simOutcome.skipped.length} skipped</span>
                    {simOutcome.blocked.length > 0 && (
                      <span className="re-chip warn">{simOutcome.blocked.length} block(s)</span>
                    )}
                    {simOutcome.approvals.length > 0 && (
                      <span className="re-chip if">{simOutcome.approvals.length} approval(s)</span>
                    )}
                    {simOutcome.documents.length > 0 && (
                      <span className="re-chip">{simOutcome.documents.length} document check(s)</span>
                    )}
                    {simOutcome.notifications.length > 0 && (
                      <span className="re-chip">{simOutcome.notifications.length} notification(s)</span>
                    )}
                  </div>

                  <div className="re-outcome-list">
                    {simOutcome.matches.length === 0 && (
                      <p className="re-empty-inline">No rules matched this scenario.</p>
                    )}
                    {simOutcome.matches.map((match) => (
                      <article className="re-outcome" key={match.ruleId}>
                        <div className="re-outcome-head">
                          <strong>
                            {match.code} · {match.ruleName}
                          </strong>
                          <span className={`re-priority ${match.priority.toLowerCase()}`}>{match.priority}</span>
                        </div>
                        <ul className="re-reason-list">
                          {match.reasons.map((reason, index) => (
                            <li key={`${match.ruleId}-reason-${index}`}>{reason}</li>
                          ))}
                        </ul>
                        <div className="re-chip-stack" style={{ maxWidth: 'none' }}>
                          {match.actions.map((action) => (
                            <span key={action.id} className="re-chip then">
                              {describeAction(action)}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>

                  {simOutcome.blocked.length > 0 && (
                    <div className="re-outcome blocked">
                      <div className="re-outcome-head">
                        <strong>Booking would be blocked</strong>
                      </div>
                      <ul className="re-reason-list">
                        {simOutcome.blocked.map((item, index) => (
                          <li key={`${item.ruleName}-block-${index}`}>
                            {item.ruleName} ({item.priority}) — {item.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {simOutcome.approvals.length > 0 && (
                    <div className="re-outcome">
                      <div className="re-outcome-head">
                        <strong>Approval required before confirmation</strong>
                      </div>
                      <ul className="re-reason-list">
                        {simOutcome.approvals.map((item, index) => (
                          <li key={`${item.ruleName}-approval-${index}`}>
                            {item.ruleName} → {item.level} approval
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {simOutcome.documents.length > 0 && (
                    <div className="re-outcome">
                      <div className="re-outcome-head">
                        <strong>Documents required</strong>
                      </div>
                      <ul className="re-reason-list">
                        {simOutcome.documents.map((item, index) => (
                          <li key={`${item.ruleName}-docs-${index}`}>
                            {item.ruleName} → {item.items.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {simOutcome.notifications.length > 0 && (
                    <div className="re-outcome">
                      <div className="re-outcome-head">
                        <strong>Notifications triggered</strong>
                      </div>
                      <ul className="re-reason-list">
                        {simOutcome.notifications.map((item, index) => (
                          <li key={`${item.ruleName}-notify-${index}`}>
                            {item.ruleName} → {item.detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <details className="re-skipped">
                    <summary>Skipped rules ({simOutcome.skipped.length})</summary>
                    <ul className="re-skip-list">
                      {simOutcome.skipped.map((item) => (
                        <li key={item.ruleId}>
                          <strong>{item.ruleName}</strong> — {item.reason}
                        </li>
                      ))}
                    </ul>
                  </details>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {effectiveView === 'library' && tab === 'conflicts' && (
        <section className="re-panel" aria-label="Conflict detection">
          <div className="re-toolbar">
            <div className="re-toolbar-title">
              <strong>Conflict detection</strong>
              <span className="re-sub">
                Overlapping, contradictory and duplicate rules found across {domainRules.length} active and scheduled
                rules.
              </span>
            </div>
            <div className="re-toolbar-spacer" />
            <span className="re-chip warn">{conflicts.length} open</span>
            <span className="re-chip then">{reviewedConflicts.length} reviewed</span>
            <button type="button" className="btn-secondary" onClick={rescanConflicts}>
              Rescan now
            </button>
          </div>

          {conflicts.length === 0 ? (
            <div className="empty-states-panel">
              <h4>No conflicts detected</h4>
              <p>Every active and scheduled rule in {section} has a clear, non-overlapping decision path.</p>
            </div>
          ) : (
            <div className="re-conflict-list">
              {conflicts.map((conflict) => {
                const reviewed = reviewedConflicts.includes(conflict.id)
                return (
                  <article
                    className={`re-conflict sev-${conflict.severity.toLowerCase()} ${reviewed ? 'is-reviewed' : ''}`}
                    key={conflict.id}
                  >
                    <header className="re-conflict-head">
                      <div className="re-conflict-meta">
                        <span
                          className={`re-chip ${conflict.severity === 'High' ? 'warn' : conflict.severity === 'Low' ? 'muted' : 'if'}`}
                        >
                          {conflict.severity} severity
                        </span>
                        <span className="re-chip">{conflict.kind}</span>
                        {reviewed && <span className="re-chip then">Reviewed</span>}
                      </div>
                      <button
                        type="button"
                        className="re-act"
                        onClick={() => toggleReviewedConflict(conflict.id)}
                      >
                        {reviewed ? 'Un-mark reviewed' : 'Mark reviewed'}
                      </button>
                    </header>
                    <p className="re-conflict-summary">{conflict.summary}</p>
                    <div className="re-conflict-rules">
                      <div className="re-conflict-rule">
                        <strong>{conflict.ruleAName}</strong>
                        <button type="button" className="re-link" onClick={() => openRuleById(conflict.ruleAId)}>
                          Open rule
                        </button>
                      </div>
                      <div className="re-conflict-rule">
                        <strong>{conflict.ruleBName}</strong>
                        <button type="button" className="re-link" onClick={() => openRuleById(conflict.ruleBId)}>
                          Open rule
                        </button>
                      </div>
                    </div>
                    <div className="re-chip-stack">
                      {conflict.sharedFields.map((field) => (
                        <span className="re-chip if" key={field}>
                          {field}
                        </span>
                      ))}
                    </div>
                    <p className="re-conflict-suggestion">
                      <strong>Suggested fix:</strong> {conflict.suggestion}
                    </p>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {effectiveView === 'library' && tab === 'audit' && (
        <section className="re-panel" aria-label="Audit log">
          <div className="re-toolbar">
            <div className="re-toolbar-title">
              <strong>Audit log</strong>
              <span className="re-sub">Every rule change, simulation, AI draft and conflict scan, newest first.</span>
            </div>
            <div className="re-toolbar-spacer" />
            <div className="states-search-box">
              <input
                type="search"
                placeholder="Search actor, rule or detail..."
                value={auditQuery}
                onChange={(event) => setAuditQuery(event.target.value)}
                aria-label="Search audit log"
              />
            </div>
            <select
              className="bookings-filter-select"
              value={auditActionFilter}
              onChange={(event) => setAuditActionFilter(event.target.value as 'all' | RuleAuditAction)}
              aria-label="Filter audit actions"
            >
              <option value="all">All actions</option>
              {auditActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
            <span className="re-count">{filteredAuditRows.length} entries</span>
          </div>

          {filteredAuditRows.length === 0 ? (
            <div className="empty-states-panel">
              <h4>No audit entries match</h4>
              <p>Try a different action filter or clear the search to see the full history.</p>
            </div>
          ) : (
            <div className="re-audit-wrap">
              <table className="re-audit-table">
                <thead>
                  <tr>
                    <th scope="col">Timestamp</th>
                    <th scope="col">Actor</th>
                    <th scope="col">Action</th>
                    <th scope="col">Rule</th>
                    <th scope="col">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditRows.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.ts}</td>
                      <td>{entry.actor}</td>
                      <td>
                        <span className="re-audit-action">{entry.action}</span>
                      </td>
                      <td>{entry.ruleName ? `${entry.ruleId ?? ''} · ${entry.ruleName}` : 'Platform'}</td>
                      <td>{entry.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {aiOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Generate rule with AI">
          <div className="modal-card re-ai-modal">
            <div className="modal-header">
              <div className="modal-header-info">
                <h3>Generate Rule with AI</h3>
                <p>
                  Describe the policy in plain language — the engine drafts conditions, actions, scope and priority for
                  you to review before publishing.
                </p>
              </div>
              <button type="button" className="modal-close-btn" onClick={closeAiModal} aria-label="Close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="re-field">
                <label htmlFor="re-ai-prompt">Describe the rule</label>
                <textarea
                  id="re-ai-prompt"
                  value={aiPrompt}
                  onChange={(event) => setAiPrompt(event.target.value)}
                  placeholder="e.g. For excavators rented for more than 7 days, require a 15% security deposit and valid insurance."
                />
              </div>
              <div className="re-ai-examples">
                <span className="re-label">Try an example</span>
                {aiExamplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="re-ai-example"
                    onClick={() => setAiPrompt(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              {aiResult && (
                <div className="re-ai-result">
                  <div className="re-confidence">
                    <div className="re-confidence-head">
                      <strong>Parse confidence</strong>
                      <span>{aiResult.confidence}%</span>
                    </div>
                    <div className="re-confidence-bar">
                      <div className="re-confidence-fill" style={{ width: `${aiResult.confidence}%` }} />
                    </div>
                  </div>
                  <div className="re-section-title">
                    <div>
                      <h4>{aiResult.name}</h4>
                      <p>{aiResult.description}</p>
                    </div>
                    <span className={`re-priority ${aiResult.priority.toLowerCase()}`}>{aiResult.priority}</span>
                  </div>
                  <div className="re-detected">
                    {aiResult.detected.map((item) => (
                      <span className="re-chip if" key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                  <div>
                    <h5 className="re-subheading" style={{ marginBottom: 7 }}>
                      Conditions
                    </h5>
                    <div className="re-chip-stack" style={{ maxWidth: 'none' }}>
                      {aiResult.conditions.map((condition) => (
                        <span className="re-chip if" key={condition.id}>
                          {describeCondition(condition)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="re-subheading" style={{ marginBottom: 7 }}>
                      Actions
                    </h5>
                    <div className="re-chip-stack" style={{ maxWidth: 'none' }}>
                      {aiResult.actions.map((action) => (
                        <span className="re-chip then" key={action.id}>
                          {describeAction(action)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {aiResult.notes.map((note) => (
                    <p className="re-ai-note" key={note}>
                      {note}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={closeAiModal}>
                Cancel
              </button>
              {aiResult && (
                <button type="button" className="btn-secondary" onClick={aiSaveDraft}>
                  Save as draft
                </button>
              )}
              {aiResult ? (
                <button type="button" className="btn-primary" onClick={aiOpenInBuilder}>
                  Review in rule builder
                </button>
              ) : (
                <button type="button" className="btn-primary" onClick={generateAiRule}>
                  Generate draft
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={confirm.title}>
          <div className="modal-card re-confirm-modal">
            <div className="modal-header">
              <div className="modal-header-info">
                <h3>{confirm.title}</h3>
                <p>{confirm.body}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={confirm.tone === 'danger' ? 're-btn-danger' : 're-btn-warn'}
                onClick={() => {
                  confirm.run()
                  setConfirm(null)
                }}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="states-toast" role="status">
          <span>{toastMessage}</span>
        </div>
      )}
    </section>
  )
}
