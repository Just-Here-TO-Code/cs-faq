import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AccordionItem from '../components/AccordionItem'
import Spinner from '../components/Spinner'
import { fetchFAQs } from '../services/api'
import { CATEGORIES } from '../utils/constants'

const SORT_OPTIONS = [
  { value: 'latest',  label: '🕐 Latest'      },
  { value: 'helpful', label: '👍 Most Helpful' },
  { value: 'views',   label: '👁 Most Viewed'  },
]

export default function FAQPage() {
  const [faqs,    setFaqs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [debSearch, setDebSearch] = useState('')
  const [category, setCategory]  = useState('All')
  const [sort,     setSort]      = useState('latest')

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = { sort }
      if (debSearch)       params.search   = debSearch
      if (category !== 'All') params.category = category
      setFaqs(await fetchFAQs(params))
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load FAQs.')
    } finally {
      setLoading(false)
    }
  }, [debSearch, category, sort])

  useEffect(() => { load() }, [load])

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-gradient text-white py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
            Community Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
            Find Answers, Share Knowledge
          </h1>
          <p className="text-white/80 text-sm sm:text-lg mb-8 max-w-xl mx-auto">
            Browse our community-curated FAQs. Search, filter by category, and vote on what helped you.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              id="faq-search"
              type="text"
              placeholder="Search questions, answers, tags…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-4 rounded-2xl text-slate-800 placeholder-slate-400 bg-white shadow-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-16 z-40 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border ${
                    category === cat
                      ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Sort */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">Sort:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ list ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Meta bar */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {debSearch ? `Results for "${debSearch}"` : category === 'All' ? 'All FAQs' : `${category} FAQs`}
            </h2>
            {!loading && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {faqs.length} {faqs.length === 1 ? 'result' : 'results'} found
              </p>
            )}
          </div>
          <Link to="/ask" className="btn-primary text-xs sm:text-sm">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Ask Question
          </Link>
        </div>

        {loading ? (
          <Spinner text="Fetching FAQs…" />
        ) : error ? (
          <div className="text-center py-12 text-red-500 dark:text-red-400">{error}</div>
        ) : faqs.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-200">No FAQs found</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {debSearch || category !== 'All' ? 'Try a different search or category.' : 'Run npm run seed to add sample FAQs.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, i) => <AccordionItem key={faq._id} faq={faq} index={i} />)}
          </div>
        )}
      </section>
    </>
  )
}
