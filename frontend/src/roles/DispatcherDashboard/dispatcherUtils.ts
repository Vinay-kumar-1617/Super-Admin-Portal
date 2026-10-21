import type { DispatcherOperator, DispatchJob, Suitability } from './dispatcherData'

export function sortJobsByUrgency(jobs: DispatchJob[]): DispatchJob[] {
  return [...jobs].sort((a, b) => {
    const rank = (job: DispatchJob) => (job.priority === 'Urgent' ? 0 : 1)
    return rank(a) - rank(b) || b.waiting - a.waiting
  })
}

export function suitabilityFor(job: DispatchJob, operator: DispatcherOperator): Suitability {
  if (job.requiredType === operator.vehicleType) return 'Match'
  const related: Record<string, string[]> = {
    Crane: ['Excavator'],
    Excavator: ['Crane', 'Backhoe Loader'],
    'Backhoe Loader': ['Excavator'],
    Tipper: ['Concrete Mixer', 'Concrete Pump'],
    'Concrete Mixer': ['Tipper', 'Concrete Pump'],
    'Concrete Pump': ['Concrete Mixer', 'Tipper'],
    'Motor Grader': ['Compactor'],
    Compactor: ['Motor Grader'],
  }
  return (related[job.requiredType] ?? []).includes(operator.vehicleType) ? 'Partial' : 'Not suitable'
}
