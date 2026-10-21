export type SuperAdminFeatureGroup = {
  title: string
  items: string[]
}

export const superAdminFeatureGroups: SuperAdminFeatureGroup[] = [
  {
    title: 'Geography and organization',
    items: [
      'Create, edit, activate and deactivate states, cities and zones.',
      'Launch a new state and hand it to a state admin after setup.',
      'Edit the full organization tree, including moving, merging and splitting zones.',
      'Set service areas and operating hours for every location.',
    ],
  },
  {
    title: 'Roles and access',
    items: [
      'Create and suspend every staff account from state admin to auditor.',
      'Grant, change and revoke roles and permissions with granular access control.',
      'Assign each account scope such as national, state, city or zone.',
      'Create custom roles, enforce approval limits and reset MFA or force sign-out.',
      'Keep at least two super admin accounts with MFA enforced for resilience.',
    ],
  },
  {
    title: 'Global rules and configuration',
    items: [
      'Write global rules that apply everywhere across the platform.',
      'Override state and city rules when local configuration conflicts with platform policies.',
      'Set booking defaults, cancellation policy and assignment mode.',
      'Toggle features by location and manage maintenance notices.',
    ],
  },
  {
    title: 'Pricing, commission and finance',
    items: [
      'Set base pricing rules and caps for states and cities.',
      'Configure platform commission, including city-level caps.',
      'Review and approve settlements, payouts and refunds above other roles limits.',
      'Require four-eyes validation on large payouts and reconciliations.',
      'Monitor revenue, commission and reconciliation reports across every location.',
    ],
  },
  {
    title: 'People and onboarding',
    items: [
      'View and manage all customers, owners, fleet managers and operators.',
      'Approve, suspend, block or remove any account.',
      'Step in on KYC and document verification cases.',
      'Approve fleet partners and activate cities directly when required.',
    ],
  },
  {
    title: 'Vehicles and fleet',
    items: [
      'View every vehicle across the platform.',
      'Approve, suspend or remove vehicles and override compliance suspensions.',
      'Oversee driver-to-vehicle assignment across all fleets.',
    ],
  },
  {
    title: 'Bookings and jobs',
    items: [
      'See every booking and status from requested to verified and closed.',
      'Define how jobs reach operators, including owner-assigned or open-zone assignment.',
      'Reassign or cancel jobs, override dispatch and resolve stuck assignments.',
      'Monitor a live map of vehicles and operators across the network.',
    ],
  },
  {
    title: 'Disputes and refunds',
    items: [
      'Review any dispute, damage claim or verification dispute.',
      'Reopen closed cases and overrule decisions.',
      'Approve refunds beyond the support admin cap and manage dispute policy.',
    ],
  },
  {
    title: 'Compliance and safety',
    items: [
      'Set required documents, permits and inspections.',
      'Review and override compliance verdicts.',
      'Blacklist drivers, owners or vehicles platform-wide.',
    ],
  },
  {
    title: 'Support and communication',
    items: [
      'View tickets and escalations across all locations.',
      'Send platform-wide or targeted notifications by state, city, zone or role.',
      'Manage templates for SMS, email and push notifications.',
    ],
  },
  {
    title: 'Reports, audit and monitoring',
    items: [
      'Track national dashboards by state, city and zone for bookings, supply, revenue and cancellations.',
      'Review the full audit log of who did what, when and from where.',
      'Export data, schedule reports and detect unusual activity such as mass role grants or large payouts.',
    ],
  },
  {
    title: 'Security and platform health',
    items: [
      'Enforce MFA, password policy and session controls.',
      'Manage device and IP restrictions for staff logins.',
      'Handle API keys, map integrations, SMS and payment providers.',
      'Maintain backups, retention rules and operational platform health.',
    ],
  },
]
