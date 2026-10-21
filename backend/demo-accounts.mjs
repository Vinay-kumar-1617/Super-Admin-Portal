export const demoPassword = process.env.DEMO_PASSWORD ?? 'DemoPass123!'

const accountScopes = [
  ['Super admin', 'All territories'],
  ['State admin', 'Karnataka'],
  ['State admin', 'Telangana'],
  ['State admin', 'Tamil Nadu'],
  ['City admin', 'Hyderabad'],
  ['City admin', 'Warangal'],
  ['Zone admin', 'Hyderabad / Zone A'],
  ['Zone admin', 'Hyderabad / Zone B'],
  ['Zone admin', 'Hyderabad / Zone C'],
  ['Zone admin', 'Warangal / Zone A'],
  ['Zone admin', 'Warangal / Zone B'],
  ['Operator', 'Assigned zone'],
  ['Finance admin', 'All territories'],
  ['Support agent', 'All territories'],
  ['Dispute handler', 'All territories'],
  ['KYC verifier', 'All territories'],
  ['Moderator', 'All territories'],
  ['Platform admin', 'All territories'],
  ['Operator', 'Operator dashboard'],
  ['Owner', 'Owner dashboard'],
  ['Customer', 'Customer dashboard'],
]

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')
}

export const demoAccounts = accountScopes.map(([role, scope]) => ({
  email: `${slug(role)}.${slug(scope)}@equiphub.demo`,
  role,
  scope,
}))