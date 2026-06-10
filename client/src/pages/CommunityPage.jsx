import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { fetchQuestions, updateQuestionStatus } from '../services/api'
import { QUESTION_CATEGORIES, STATUS_META, CATEGORY_COLORS, timeAgo } from '../utils/constants'

const TABS = [
  { value: 'all',      label: 'All' },
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default function CommunityPage() {
  const [questions, setQuestions] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [tab,       setTab]       = useState('all')
  const [search,    setSearch]    = useState('')
  const [debSearch, setDebSearch] = useState('')
  const [category,  setCategory]  = useState('All')
  const [updating,  setUpdating]  = useState({})   // { [id]: true }

  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = {}
      if (tab !== 'all') params.status = tab
      if (debSearch)     params.search = debSearch
      if (category !== 'All') params.category = category
      setQuestions(await fetchQuestions(params))
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load questions.')
    } finally { setLoading(false) }
  }, [tab, debSearch, category])

  useEffect(() => { load() }, [load])

  async function changeStatus(id, status) {
    setUpdating(u => ({ ...u, [id]: true }))
    try {
      const updated = await updateQuestionStatus(id, status)
      setQuestions(qs => qs.map(q => q._id === id ? updated : q))
    } catch { /* silent */ }
    finally { setUpdating(u => ({ ...u, [id]: false })) }
  }

  const pendingCount = questions.filter(q => q.status === 'pending').length

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] transition-colors">
      {/* Page header */}
      <div className="page-header">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">Community Questions</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Browse, answer, and moderate community-submitted questions.
              </p>
            </div>
            <Link to="/ask" className="btn-primary self-start sm:self-auto">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Ask a Question
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Controls */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Search questions…" value={search} onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"/>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Status tabs */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 w-fit">
              {TABS.map(t => {
                const count = t.value === 'pending' ? pendingCount : undefined
                return (
                  <button key={t.value} onClick={() => setTab(t.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                      tab === t.value
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}>
                    {t.label}
                    {count > 0 && <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5">{count}</span>}
                  </button>
                )
              })}
            </div>

            {/* Category filter */}
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="select-field text-sm max-w-[180px]">
              {['All', ...QUESTION_CATEGORIES].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? <Spinner text="Loading questions…"/> : error ? (
          <div className="text-center py-12 text-red-500 dark:text-red-400">{error}</div>
        ) : questions.length === 0 ? (
          <div className="card p-14 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-300 dark:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-200">No questions found</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-5">
              {search || category !== 'All' ? 'Try different filters.' : 'Be the first to ask!'}
            </p>
            <Link to="/ask" className="btn-primary">Ask the First Question</Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'}
            </p>
            <div className="space-y-4">
              {questions.map(q => {
                const sm = STATUS_META[q.status] || STATUS_META.pending
                const cc = CATEGORY_COLORS[q.category] || CATEGORY_COLORS.Other
                const isUpdating = updating[q._id]
                return (
                  <div key={q._id} className="card p-5 sm:p-6 hover:shadow-md transition-shadow duration-200 group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`badge ${sm.color}`}>{sm.label}</span>
                          <span className={`badge ${cc}`}>{q.category}</span>
                          <span className={`badge ${q.answerCount > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                            {q.answerCount} {q.answerCount === 1 ? 'answer' : 'answers'}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(q.createdAt)}</span>
                        </div>
                        <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-snug group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                          {q.title}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 line-clamp-2">{q.description}</p>
                        {/* Submitter info */}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                          By <span className="font-medium text-slate-600 dark:text-slate-300">{q.name}</span>
                          {' '}·{' '}<span className="italic">{q.email}</span>
                        </p>
                        {/* Tags */}
                        {q.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {q.tags.map(t => <span key={t} className="tag-chip">#{t}</span>)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Link to={`/community/${q._id}`} className="btn-secondary text-xs">
                          View
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                          </svg>
                        </Link>
                        {/* Status actions */}
                        <div className="flex gap-1.5">
                          {q.status !== 'approved' && (
                            <button onClick={() => changeStatus(q._id, 'approved')} disabled={isUpdating}
                              className="btn-success py-1 px-2.5 text-[11px]">
                              {isUpdating ? '…' : '✓ Approve'}
                            </button>
                          )}
                          {q.status !== 'rejected' && (
                            <button onClick={() => changeStatus(q._id, 'rejected')} disabled={isUpdating}
                              className="btn-danger py-1 px-2.5 text-[11px]">
                              {isUpdating ? '…' : '✕ Reject'}
                            </button>
                          )}
                          {q.status !== 'pending' && (
                            <button onClick={() => changeStatus(q._id, 'pending')} disabled={isUpdating}
                              className="px-2.5 py-1 text-[11px] rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold">
                              {isUpdating ? '…' : '↺ Pending'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
