import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AccordionItem from '../components/AccordionItem'
import Spinner from '../components/Spinner'
import { fetchFAQs, fetchRelatedFAQs } from '../services/api'
import { CATEGORIES } from '../utils/constants'
import { useAuth } from '../context/AuthContext'

const SORT_OPTIONS = [
  { value: 'latest',  label: '🕐 Latest'      },
  { value: 'helpful', label: '👍 Most Helpful' },
  { value: 'views',   label: '👁 Most Viewed'  },
]

/** "People like you also asked" sidebar rail */
function RelatedFAQs({ openFaq, allFaqs }) {
  const [related, setRelated] = useState([])

  useEffect(() => {
    if (!openFaq) { setRelated([]); return }
    fetchRelatedFAQs({
      category: openFaq.category,
      tags: openFaq.tags?.join(',') || '',
      exclude: openFaq._id,
    }).then(setRelated).catch(() => setRelated([]))
  }, [openFaq?._id])

  if (!related.length) return null

  return (
    <div className="card p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">People like you also asked</h3>
      </div>
      <ul className="space-y-3">
        {related.map(r => (
          <li key={r._id}>
            <button
              className="w-full text-left group"
              onClick={() => {
                const el = document.getElementById(`faq-${r._id}`)
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
            >
              <p className="text-xs text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 leading-relaxed">
                {r.question}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {r.helpfulYes > 0 && `👍 ${r.helpfulYes}`}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FAQPage() {
  const { user } = useAuth()
  const [faqs,      setFaqs]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [search,    setSearch]    = useState('')
  const [debSearch, setDebSearch] = useState('')
  const [category,  setCategory]  = useState('All')
  const [sort,      setSort]      = useState('latest')
  const [openFaq,   setOpenFaq]   = useState(null) // track which FAQ is expanded

  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = { sort }
      if (debSearch)          params.search   = debSearch
      if (category !== 'All') params.category = category
      setFaqs(await fetchFAQs(params))
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load FAQs.')
    } finally {
      setLoading(false)
    }
  }, [debSearch, category, sort])

  useEffect(() => { load() }, [load])

  const hasMeta = (faq) => faq.tags?.length > 0 || faq.category !== 'General'

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-gradient text-white py-16 sm:py-24 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none"/>
        <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-violet-400/20 rounded-full blur-2xl pointer-events-none"/>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-5 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
            Community Knowledge Base
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
            Find Answers,{' '}
            <span className="text-violet-200">Share Knowledge</span>
          </h1>
          <p className="text-white/75 text-sm sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Browse our community-curated FAQs. Search, filter by category, and vote on what helped.
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
              className="w-full pl-12 pr-10 py-4 rounded-2xl text-slate-800 placeholder-slate-400 bg-white shadow-xl shadow-black/20 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/50"
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

          {/* Quick stats */}
          {!loading && faqs.length > 0 && (
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/70 animate-fade-in">
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-white">{faqs.length}</span> FAQs
              </span>
              <span className="w-px h-4 bg-white/20"/>
              <span className="flex items-center gap-1.5">
                <span className="font-bold text-white">{faqs.reduce((s, f) => s + (f.helpfulYes || 0), 0)}</span> helpful votes
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-16 z-40 transition-colors shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border ${
                    category === cat
                      ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white border-transparent shadow-md shadow-primary-500/20'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6">
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

        {/* Two-column layout: FAQs + Related sidebar */}
        <div className="flex gap-6">
          {/* Main FAQ list */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <Spinner text="Fetching FAQs…"/>
            ) : error ? (
              <div className="text-center py-12 text-red-500 dark:text-red-400">{error}</div>
            ) : faqs.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
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
                {faqs.map((faq, i) => (
                  <div
                    key={faq._id}
                    id={`faq-${faq._id}`}
                    onClick={() => setOpenFaq(f => f?._id === faq._id ? null : faq)}
                  >
                    <AccordionItem faq={faq} index={i}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: People like you also asked */}
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
            <RelatedFAQs openFaq={openFaq} allFaqs={faqs}/>

            {/* Login CTA for saving */}
            {!user && (
              <div className="card p-5 text-center animate-slide-up">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Save FAQs</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Sign in to bookmark FAQs to your profile.</p>
                <Link to="/auth" className="btn-primary text-xs w-full">Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
