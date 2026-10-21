import AuditLogsSection from '../AuditLogs/AuditLogsSection'

type AuditLogPageProps = {
  onBack: () => void
}

export default function AuditLogPage({ onBack }: AuditLogPageProps) {
  return (
    <AuditLogsSection
      profile={{ roleKey: 'super-admin', scopeType: 'national', scopeId: null }}
      mode="all"
      onBack={onBack}
    />
  )
}
