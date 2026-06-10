import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { createQuestion, fetchSimilar } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { QUESTION_CATEGORIES } from '../utils/constants'

function TagInput({ tags, setTags }) {
  const [input, setInput] = useState('')
  function add() {
    const t = input.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t])
      setInput('')
    }
  }
  function onKey(e) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && tags.length) setTags(tags.slice(0, -1))
  }
  return (
    <div className="flex flex-wrap gap-1.5 items-center min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold px-2.5 py-1 rounded-full">
          #{t}
          <button type="button" onClick={() => setTags(tags.filter(x => x !== t))} className="ml-0.5 hover:text-red-500">×</button>
        </span>
      ))}
      <input
        type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} onBlur={add}
        placeholder={tags.length < 5 ? 'Add tag + Enter…' : ''}
        className="flex-1 min-w-[100px] text-sm outline-none bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
      />
    </div>
  )
}

function SimilarPanel({ similar }) {
  const [openId, setOpenId] = useState(null)
  if (!similar || (similar.faqs.length === 0 && similar.questions.length === 0)) return null
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 animate-fade-in">
      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        Similar questions already exist — check before submitting!
      </p>
      {similar.faqs.map(f => (
        <div key={f._id} className="mb-2">
          <button
            type="button"
            onClick={() => setOpenId(openId === f._id ? null : f._id)}
            className="text-sm font-semibold text-amber-800 dark:text-amber-300 hover:underline text-left w-full flex justify-between"
          >
            <span>📌 {f.question}</span>
            <span className="text-xs">{openId === f._id ? '▲' : '▼'}</span>
          </button>
          {openId === f._id && (
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 pl-2 border-l-2 border-amber-300 dark:border-amber-700 leading-relaxed">
              {f.answer}
            </p>
          )}
        </div>
      ))}
      {similar.questions.map(q => (
        <p key={q._id} className="text-xs text-amber-700 dark:text-amber-400">
          🔄 Already asked: <strong>{q.title}</strong> — <span className="italic">{q.status}</span>
        </p>
      ))}
    </div>
  )
}

export default function AskQuestionPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', description: '', category: 'General' })
  const [tags,    setTags]    = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState(null)
  const [similar, setSimilar] = useState(null)
  const [checking,setChecking]= useState(false)
  const debRef = useRef(null)

  function onChange(e) {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (error) setError(null)
    if (name === 'title') {
      clearTimeout(debRef.current)
      if (value.trim().length >= 5) {
        setChecking(true)
        debRef.current = setTimeout(async () => {
          try { setSimilar(await fetchSimilar(value)) }
          catch { /* silent */ }
          finally { setChecking(false) }
        }, 600)
      } else { setSimilar(null) }
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    const { title, description, category } = form
    if (!title || !description)
      return setError('Title and description are required.')
    setLoading(true); setError(null)
    try {
      await createQuestion({ title, description, category, tags })
      setSuccess(true)
      setForm({ title: '', description: '', category: 'General' })
      setTags([]); setSimilar(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-primary-50/30 to-violet-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-6">
      <div className="card p-10 text-center max-w-md w-full">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">Question Submitted!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Your question is now <span className="font-semibold text-amber-600 dark:text-amber-400">pending review</span> and will appear in the Community section once approved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => setSuccess(false)} className="btn-primary">Ask Another</button>
          <Link to="/community" className="btn-secondary">View Community</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-primary-50/30 to-violet-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 transition-colors">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl hero-gradient flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">Ask the Community</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Post your question and get answers from people who've been there.
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 mb-5">
            <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
              <select id="category" name="category" value={form.category} onChange={onChange}
                className="select-field" disabled={loading}>
                {QUESTION_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Title + duplicate detection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Question Title <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input id="title" name="title" type="text"
                  placeholder="e.g. What is the stipend amount for the internship?"
                  value={form.title} onChange={onChange} maxLength={200}
                  className="input-field pr-8" disabled={loading}/>
                {checking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary-300 border-t-primary-600 animate-spin"/>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">{form.title.length}/200</p>
              <SimilarPanel similar={similar}/>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea id="description" name="description" rows={5}
                placeholder="Provide more context so the community can give you the best answer…"
                value={form.description} onChange={onChange} maxLength={2000}
                className="input-field resize-none" disabled={loading}/>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">{form.description.length}/2000</p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tags <span className="text-slate-400 font-normal">(up to 5, press Enter)</span>
              </label>
              <TagInput tags={tags} setTags={setTags}/>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                {error}
              </div>
            )}

            {/* Tips */}
            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
              <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 mb-1.5">💡 Tips for a great question</p>
              <ul className="text-xs text-primary-600 dark:text-primary-500 space-y-1 list-disc list-inside">
                <li>Be specific — include what you've already tried</li>
                <li>Check the FAQ page first; your answer might already be there</li>
                <li>One submission per hour per account</li>
              </ul>
            </div>

            <button id="submit-question-btn" type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Submitting…</>
                : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>Submit Question</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
