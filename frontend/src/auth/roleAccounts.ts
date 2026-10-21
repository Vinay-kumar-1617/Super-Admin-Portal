import type { RoleKey } from '@fieldwork/shared'

export type RoleAccount = {
  key: RoleKey
  label: string
  email: string
}

export const roleAccounts: RoleAccount[] = [
  { key: 'super-admin', label: 'Super admin', email: 'super.admin.all.territories@equiphub.demo' },
  { key: 'state-admin', label: 'State admin', email: 'state.admin.telangana@equiphub.demo' },
  { key: 'city-admin', label: 'City admin', email: 'city.admin.hyderabad@equiphub.demo' },
  { key: 'zone-admin', label: 'Zone admin', email: 'zone.admin.madhapur@equiphub.demo' },
  { key: 'operations-manager', label: 'Operations manager', email: 'operations.telangana@equiphub.demo' },
  { key: 'compliance-admin', label: 'Compliance admin', email: 'compliance.all.territories@equiphub.demo' },
  { key: 'finance-admin', label: 'Finance admin', email: 'finance.all.territories@equiphub.demo' },
  { key: 'support-admin', label: 'Support admin', email: 'support.all.territories@equiphub.demo' },
  { key: 'dispatcher', label: 'Dispatcher', email: 'dispatcher.all.territories@equiphub.demo' },
  { key: 'auditor', label: 'Auditor', email: 'auditor.all.territories@equiphub.demo' },
  { key: 'fleet-manager', label: 'Fleet manager', email: 'fleet.manager.all.territories@equiphub.demo' },
  { key: 'support-agent', label: 'Support agent', email: 'support.agent.all.territories@equiphub.demo' },
  { key: 'dispute-handler', label: 'Dispute handler', email: 'dispute.handler.all.territories@equiphub.demo' },
  { key: 'kyc-verifier', label: 'KYC verifier', email: 'kyc.verifier.all.territories@equiphub.demo' },
  { key: 'moderator', label: 'Moderator', email: 'moderator.all.territories@equiphub.demo' },
  { key: 'platform-admin', label: 'Platform admin', email: 'platform.admin.all.territories@equiphub.demo' },
  { key: 'operator', label: 'Operator', email: 'operator.assigned.zone@equiphub.demo' },
  { key: 'owner', label: 'Owner', email: 'owner.all.territories@equiphub.demo' },
  { key: 'customer', label: 'Customer', email: 'customer.all.territories@equiphub.demo' },
]

export const emailForRole = (key: RoleKey): string =>
  roleAccounts.find((account) => account.key === key)?.email ?? ''
