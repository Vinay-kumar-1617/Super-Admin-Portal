export const roleKeys = [
  'super-admin',
  'state-admin',
  'city-admin',
  'zone-admin',
  'operations-manager',
  'compliance-admin',
  'finance-admin',
  'support-admin',
  'dispatcher',
  'auditor',
  'fleet-manager',
  'support-agent',
  'dispute-handler',
  'kyc-verifier',
  'moderator',
  'platform-admin',
  'operator',
  'owner',
  'customer',
] as const

export type RoleKey = (typeof roleKeys)[number]
export type ScopeType = 'national' | 'state' | 'city' | 'zone'

export const auditActionCategories = [
  'auth',
  'create',
  'update',
  'delete',
  'status_change',
  'approval',
  'financial',
  'user_management',
  'permission_change',
  'export',
] as const

export type AuditActionCategory = (typeof auditActionCategories)[number]

export const auditOutcomes = ['success', 'failure', 'denied', 'warning'] as const
export type AuditOutcome = (typeof auditOutcomes)[number]

export type AuditLogRow = {
  id: string
  created_at: string
  actor_id: string | null
  actor_email: string | null
  actor_name: string | null
  actor_role: RoleKey | string | null
  actor_scope_type: ScopeType | string | null
  actor_scope_id: string | null
  action: AuditActionCategory
  action_label: string
  entity_type: string | null
  entity_id: string | null
  entity_label: string | null
  state_id: string | null
  city_id: string | null
  zone_id: string | null
  previous_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  outcome: AuditOutcome
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown> | null
}

export type ProfileRow = {
  id: string
  email: string
  role_key: RoleKey
  scope_type: ScopeType
  scope_id: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: {
          id: string
          email: string
          role_key?: RoleKey
          scope_type?: ScopeType
          scope_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          role_key?: RoleKey
          scope_type?: ScopeType
          scope_id?: string | null
          updated_at?: string
        }
        }
        Relationships: []
      }
      audit_logs: {
        Row: AuditLogRow
        Insert: Omit<AuditLogRow, 'id' | 'created_at'>
        Update: never
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_platform_auditor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      write_audit_log: {
        Args: {
          p_action: string
          p_action_label: string
          p_entity_type?: string
          p_entity_id?: string
          p_entity_label?: string
          p_outcome?: string
          p_previous_values?: Record<string, unknown> | null
          p_new_values?: Record<string, unknown> | null
          p_state_id?: string | null
          p_city_id?: string | null
          p_zone_id?: string | null
          p_ip_address?: string | null
          p_user_agent?: string | null
          p_metadata?: Record<string, unknown> | null
        }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }

