import { useState } from 'react'
import { CATEGORY_COLORS } from '../utils/constants'
import { voteFAQ } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function AccordionItem({ faq, index, relatedFAQs = [] }) {
  const { user, saveFAQ, isFAQSaved } = useAuth()
  const [open,   setOpen]   = useState(false)
  const [votes,  setVotes]  = useState({ yes: faq.helpfulYes, no: faq.helpfulNo })
  const [voted,  setVoted]  = useState(() => localStorage.getItem(`faq-vote-${faq._id}`) || null)
  const [voting, setVoting] = useState(false)
  const [saving, setSaving] = useState(false)

  const saved    = isFAQSaved(faq._id)
  const catColor = CATEGORY_COLORS[faq.category] || CATEGORY_COLORS.Other

  async function handleVote(v) {
    if (voted || voting) return
    setVoting(true)
    try {
      const updated = await voteFAQ(faq._id, v)
      setVotes({ yes: updated.helpfulYes, no: updated.helpfulNo })
      setVoted(v)
      localStorage.setItem(`faq-vote-${faq._id}`, v)
    } catch { /* silent */ }
    finally { setVoting(false) }
  }

  async function handleSave(e) {
    e.stopPropagation()
    if (!user || saving) return
    setSaving(true)
    try { await saveFAQ(faq._id) }
    catch { /* silent */ }
    finally { setSaving(false) }
  }

  const total = votes.yes + votes.no
  const pct   = total > 0 ? Math.round((votes.yes / total) * 100) : null

  return (
    <div className={`card-hover group ${open ? 'shadow-md dark:shadow-slate-900/50' : ''}`}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-4 p-5 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400 rounded-t-2xl"
        aria-expanded={open}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Number badge */}
          <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center mt-0.5 shadow-sm">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-snug group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
              {faq.question}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className={`badge ${catColor}`}>{faq.category}</span>
              {faq.tags?.map(tag => (
                <span key={tag} className="tag-chip">#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {faq.views > 0 && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              {faq.views}
            </span>
          )}

          {/* Save / Heart button */}
          {user && (
            <button
              onClick={handleSave}
              disabled={saving}
              title={saved ? 'Remove from saved' : 'Save this FAQ'}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                saved
                  ? 'text-rose-500 hover:text-rose-600 dark:text-rose-400'
                  : 'text-slate-300 hover:text-rose-400 dark:text-slate-600 dark:hover:text-rose-400'
              } ${saving ? 'opacity-50' : ''}`}
            >
              <svg
                className="w-5 h-5"
                fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          )}

          {/* Chevron */}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
            open
              ? 'bg-gradient-to-br from-primary-500 to-violet-600 text-white rotate-180 shadow-md shadow-primary-500/20'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </button>

      {/* Answer body */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 sm:px-6 pb-5 pt-1">
          <div className="ml-10 pl-4 border-l-2 border-primary-200 dark:border-primary-800">
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {faq.answer}
            </p>
          </div>

          {/* Voting */}
          <div className="ml-10 mt-5 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote('yes')}
                disabled={!!voted || voting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150
                  ${voted === 'yes'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/30'
                    : 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                  } disabled:cursor-not-allowed`}
              >
                <svg className="w-3.5 h-3.5" fill={voted === 'yes' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017a2 2 0 01-1.448-.627l-2.548-2.72A2 2 0 017 16.175V11a2 2 0 012-2h1.184A2 2 0 0012 7.131V4a1 1 0 011-1h.001a1 1 0 011 1v2.869A2 2 0 0015.184 9H16"/>
                </svg>
                Yes · {votes.yes}
              </button>
              <button
                onClick={() => handleVote('no')}
                disabled={!!voted || voting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150
                  ${voted === 'no'
                    ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-500/30'
                    : 'border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  } disabled:cursor-not-allowed`}
              >
                <svg className="w-3.5 h-3.5" fill={voted === 'no' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 011.448.627l2.548 2.72A2 2 0 0117 7.825V13a2 2 0 01-2 2h-1.184A2 2 0 0012 16.869V20a1 1 0 01-1 1h-.001a1 1 0 01-1-1v-2.869A2 2 0 008.816 15H8"/>
                </svg>
                No · {votes.no}
              </button>
            </div>

            {/* Helpful % bar */}
            {pct !== null && (
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="confidence-bar-track w-16">
                  <div className="confidence-bar-fill bg-emerald-500" style={{ width: `${pct}%` }}/>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{pct}% helpful</span>
              </div>
            )}
            {voted && <span className="text-xs text-primary-600 dark:text-primary-400 font-medium animate-fade-in">Thanks! ✓</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
