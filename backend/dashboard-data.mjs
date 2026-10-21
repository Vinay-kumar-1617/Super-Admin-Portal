import cityAdmin from './dashboards/city-admin.mjs'
import customer from './dashboards/customer.mjs'
import disputeHandler from './dashboards/dispute-handler.mjs'
import financeAdmin from './dashboards/finance-admin.mjs'
import kycVerifier from './dashboards/kyc-verifier.mjs'
import moderator from './dashboards/moderator.mjs'
import operator from './dashboards/operator.mjs'
import owner from './dashboards/owner.mjs'
import platformAdmin from './dashboards/platform-admin.mjs'
import stateAdmin from './dashboards/state-admin.mjs'
import supportAgent from './dashboards/support-agent.mjs'
import superAdmin from './dashboards/super-admin.mjs'
import zoneAdmin from './dashboards/zone-admin.mjs'

const dashboards = new Map([
  ['Super admin', superAdmin],
  ['State admin', stateAdmin],
  ['City admin', cityAdmin],
  ['Zone admin', zoneAdmin],
  ['Operator', operator],
  ['Owner', owner],
  ['Customer', customer],
  ['Finance admin', financeAdmin],
  ['Support agent', supportAgent],
  ['Dispute handler', disputeHandler],
  ['KYC verifier', kycVerifier],
  ['Moderator', moderator],
  ['Platform admin', platformAdmin],
])

export function getDashboardData(role) {
  return dashboards.get(role) ?? null
}