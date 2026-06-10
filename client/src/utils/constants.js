export const CATEGORIES = [
  'All',
  'Applications',
  'Stipend',
  'Timeline',
  'Certificates',
  'Projects',
  'Eligibility',
  'General',
  'Other',
]

export const QUESTION_CATEGORIES = CATEGORIES.filter(c => c !== 'All')

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60)   return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60)   return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)   return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export const STATUS_META = {
  pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-700  dark:bg-amber-900/40 dark:text-amber-300' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700   dark:bg-red-900/40 dark:text-red-300' },
}

export const CATEGORY_COLORS = {
  Applications: 'bg-blue-50   text-blue-700   dark:bg-blue-900/30  dark:text-blue-300',
  Stipend:      'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Timeline:     'bg-violet-50  text-violet-700  dark:bg-violet-900/30 dark:text-violet-300',
  Certificates: 'bg-amber-50  text-amber-700  dark:bg-amber-900/30  dark:text-amber-300',
  Projects:     'bg-pink-50   text-pink-700   dark:bg-pink-900/30   dark:text-pink-300',
  Eligibility:  'bg-cyan-50   text-cyan-700   dark:bg-cyan-900/30   dark:text-cyan-300',
  General:      'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  Other:        'bg-slate-100 text-slate-600  dark:bg-slate-700    dark:text-slate-300',
}
