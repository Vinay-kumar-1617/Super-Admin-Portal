import DashboardShell from '../DashboardShell'

export default function FleetManagerDashboard({ onSignOut }: { onSignOut?: () => void }) {
  return (
    <DashboardShell
      title="Fleet manager"
      subtitle="Asset readiness and maintenance control"
      summary="Tracks machine condition, traffic of heavy equipment, maintenance cycles, and optimal utilization of the rental fleet."
      stats={[
        { label: 'Equipments', value: '482', tone: 'primary' },
        { label: 'Ready units', value: '89%', tone: 'success' },
        { label: 'Maintenance', value: '31', tone: 'alert' },
        { label: 'Utilization', value: '76%', tone: 'secondary' },
      ]}
      actions={[
        'Monitor maintenance schedules, downtime, and repair priorities.',
        'Optimize daily utilization for excavators, cranes, and JCBs.',
        'Coordinate movement of fleet assets between project sites and depots.',
      ]}
      scope={[
        'Owns fleet health for assigned machine categories and locations.',
        'Approves repair schedules and machine readiness windows.',
        'Tracks all equipment condition, utilization, and dispatch status.',
      ]}
      onSignOut={onSignOut}
    />
  )
}
