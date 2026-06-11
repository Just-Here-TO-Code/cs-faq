import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import {
  fetchQuestion, fetchAnswers, createAnswer,
  updateAnswerStatus, updateQuestionStatus,
  fetchSuggestion, upvoteAnswer,
} from '../services/api'
import { STATUS_META, CATEGORY_COLORS, timeAgo } from '../utils/constants'

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending
  return <span className={`badge ${m.color}`}>{m.label}</span>
}

// ── AI Suggestion Panel ────────────────────────────────────────────────────────
function AISuggestionPanel({ questionTitle, questionDesc, onUse }) {
  const [suggestion,  setSuggestion]  = useState(null)
  const [basedOn,     setBasedOn]     = useState(null)
  const [confidence,  setConfidence]  = useState(0)
  const [loading,     setLoading]     = useState(false)
  const [fetched,     setFetched]     = useState(false)
  const [expanded,    setExpanded]    = useState(false)

  async function loadSuggestion() {
    if (fetched) { setExpanded(e => !e); return }
    setLoading(true)
    try {
      const query = `${questionTitle} ${questionDesc}`
      const data  = await fetchSuggestion(query)
      setSuggestion(data.suggestion)
      setBasedOn(data.basedOn)
      setConfidence(data.confidence)
      setFetched(true)
      setExpanded(true)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const pct = Math.round(confidence * 100)

  return (
    <div className="mb-5 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 overflow-hidden">
      {/* Header */}
      <button
        onClick={loadSuggestion}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="font-semibold text-violet-700 dark:text-violet-300 text-sm">
            AI-Powered Suggested Answer
          </span>
          {fetched && suggestion && (
            <span className="badge bg-violet-100 text-violet-600 dark:bg-violet-900/60 dark:text-violet-300 text-[10px]">
              {pct}% match
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-violet-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5 animate-fade-in">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 py-2">
              <div className="w-4 h-4 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin"/>
              Analysing existing FAQs…
            </div>
          ) : suggestion ? (
            <>
              {/* Confidence bar */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium w-20">Confidence</span>
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-violet-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{pct}%</span>
              </div>

              {/* Suggested text */}
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-2 whitespace-pre-line">
                {basedOn?.answer || suggestion}
              </p>

              {basedOn && (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-4">
                  Based on FAQ: &ldquo;{basedOn.question}&rdquo;
                </p>
              )}

              <button
                onClick={() => onUse(basedOn?.answer || suggestion)}
                className="btn-primary text-xs py-2 px-4"
              >
                ✏️ Use this suggestion
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-2">
              No closely matching FAQ found. Please write a custom answer.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function QuestionDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [question, setQuestion] = useState(null)
  const [answers,  setAnswers]  = useState([])
  const [loadingQ, setLoadingQ] = useState(true)
  const [loadingA, setLoadingA] = useState(true)
  const [errorQ,   setErrorQ]   = useState(null)
  const [form, setForm]         = useState({ body: '' })
  const [submitting, setSubmitting]   = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitOk,    setSubmitOk]    = useState(false)
  const [answerFilter, setAnswerFilter] = useState('all')
  const [updatingA, setUpdatingA]     = useState({})
  const [updatingQ, setUpdatingQ]     = useState(false)
  const [upvoting,  setUpvoting]      = useState({})

  useEffect(() => {
    fetchQuestion(id)
      .then(setQuestion)
      .catch(e => setErrorQ(e.response?.data?.error || 'Question not found.'))
      .finally(() => setLoadingQ(false))
  }, [id])

  useEffect(() => {
    const params = answerFilter !== 'all' ? { status: answerFilter } : {}
    setLoadingA(true)
    fetchAnswers(id, params)
      .then(setAnswers)
      .catch(console.error)
      .finally(() => setLoadingA(false))
  }, [id, answerFilter])

  async function onSubmitAnswer(e) {
    e.preventDefault()
    if (!form.body.trim()) return setSubmitError('Please write an answer.')
    setSubmitting(true); setSubmitError(null)
    try {
      const saved = await createAnswer({ questionId: id, body: form.body })
      setAnswers(a => [...a, saved])
      setQuestion(q => ({ ...q, answerCount: (q.answerCount || 0) + 1 }))
      setForm({ body: '' })
      setSubmitOk(true)
      setTimeout(() => setSubmitOk(false), 3500)
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit.')
    } finally { setSubmitting(false) }
  }

  async function changeAnswerStatus(answerId, status) {
    setUpdatingA(u => ({ ...u, [answerId]: true }))
    try {
      const updated = await updateAnswerStatus(answerId, status)
      setAnswers(as => as.map(a => a._id === answerId ? updated : a))
    } catch { /* silent */ }
    finally { setUpdatingA(u => ({ ...u, [answerId]: false })) }
  }

  async function changeQuestionStatus(status) {
    setUpdatingQ(true)
    try {
      const updated = await updateQuestionStatus(id, status)
      setQuestion(updated)
    } catch { /* silent */ }
    finally { setUpdatingQ(false) }
  }

  async function handleUpvote(answerId) {
    if (!user) return
    setUpvoting(u => ({ ...u, [answerId]: true }))
    try {
      const { upvotes, voted } = await upvoteAnswer(answerId)
      setAnswers(as => as.map(a =>
        a._id === answerId
          ? {
              ...a,
              upvotes,
              upvotedBy: voted
                ? [...(a.upvotedBy || []), user.email]
                : (a.upvotedBy || []).filter(e => e !== user.email),
            }
          : a
      ))
    } catch { /* silent */ }
    finally { setUpvoting(u => ({ ...u, [answerId]: false })) }
  }

  if (loadingQ) return <Spinner text="Loading question…"/>
  if (errorQ) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-red-500 dark:text-red-400 mb-4">{errorQ}</p>
      <Link to="/community" className="btn-secondary">← Back to Community</Link>
    </div>
  )

  const catColor = CATEGORY_COLORS[question.category] || CATEGORY_COLORS.Other
  const displayedAnswers = answers

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <Link to="/community" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Community</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          <span className="text-slate-700 dark:text-slate-200 font-medium truncate max-w-[180px]">{question.title}</span>
        </nav>

        {/* Question card */}
        <div className="card p-6 sm:p-8 mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={question.status}/>
            <span className={`badge ${catColor}`}>{question.category}</span>
            <span className={`badge ${question.answerCount > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
              {question.answerCount} {question.answerCount === 1 ? 'answer' : 'answers'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 self-center">{timeAgo(question.createdAt)}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug mb-3">{question.title}</h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-4">{question.description}</p>

          {question.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {question.tags.map(t => <span key={t} className="tag-chip">#{t}</span>)}
            </div>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500">
            By <span className="font-semibold text-slate-600 dark:text-slate-300">{question.name}</span>
            {' '}· {question.email}
          </p>

          {/* Question moderation */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs text-slate-400 dark:text-slate-500 self-center font-semibold">Moderate:</span>
            {question.status !== 'approved' && (
              <button onClick={() => changeQuestionStatus('approved')} disabled={updatingQ} className="btn-success text-xs py-1.5">
                {updatingQ ? '…' : '✓ Approve'}
              </button>
            )}
            {question.status !== 'rejected' && (
              <button onClick={() => changeQuestionStatus('rejected')} disabled={updatingQ} className="btn-danger text-xs py-1.5">
                {updatingQ ? '…' : '✕ Reject'}
              </button>
            )}
            {question.status !== 'pending' && (
              <button onClick={() => changeQuestionStatus('pending')} disabled={updatingQ}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold">
                {updatingQ ? '…' : '↺ Mark Pending'}
              </button>
            )}
          </div>
        </div>

        {/* Answers section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z"/>
              </svg>
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            {/* Answer filter */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              {['all', 'pending', 'approved', 'rejected'].map(s => (
                <button key={s} onClick={() => setAnswerFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${
                    answerFilter === s ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loadingA ? <Spinner size="sm" text="Loading answers…"/> :
           displayedAnswers.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="font-medium text-slate-600 dark:text-slate-300">No answers yet</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Be the first to help!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedAnswers.map((ans, idx) => {
                const hasUpvoted = user && (ans.upvotedBy || []).includes(user.email)
                const conf = ans.confidence
                const confColor = conf >= 70 ? 'bg-emerald-500' : conf >= 40 ? 'bg-amber-500' : 'bg-red-400'
                return (
                  <div key={ans._id} className="card p-5 sm:p-6 border-l-4 border-l-primary-400 dark:border-l-primary-600 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-sm">
                        {(ans.author || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{ans.author}</span>
                          <StatusBadge status={ans.status}/>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(ans.createdAt)}</span>
                          <span className="badge bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ml-auto">#{idx + 1}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{ans.body}</p>

                        {/* Confidence score */}
                        {conf !== null && conf !== undefined && (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">AI Confidence</span>
                            <div className="confidence-bar-track flex-1 max-w-[100px]">
                              <div className={`confidence-bar-fill ${confColor}`} style={{ width: `${conf}%` }}/>
                            </div>
                            <span className={`text-[11px] font-bold ${conf >= 70 ? 'text-emerald-600 dark:text-emerald-400' : conf >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400'}`}>
                              {conf}%
                            </span>
                          </div>
                        )}

                        {/* Upvote + moderation row */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {/* Upvote button */}
                          <button
                            onClick={() => handleUpvote(ans._id)}
                            disabled={!user || upvoting[ans._id]}
                            title={user ? (hasUpvoted ? 'Remove upvote' : 'Upvote this answer') : 'Log in to upvote'}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                              hasUpvoted
                                ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900/40 dark:border-primary-700 dark:text-primary-300'
                                : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <svg className="w-3.5 h-3.5" fill={hasUpvoted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                            </svg>
                            {upvoting[ans._id] ? '…' : ans.upvotes || 0}
                          </button>

                          {/* Moderation buttons */}
                          {ans.status !== 'approved' && (
                            <button onClick={() => changeAnswerStatus(ans._id, 'approved')} disabled={updatingA[ans._id]}
                              className="btn-success text-[11px] py-1 px-2.5">
                              {updatingA[ans._id] ? '…' : '✓ Approve'}
                            </button>
                          )}
                          {ans.status !== 'rejected' && (
                            <button onClick={() => changeAnswerStatus(ans._id, 'rejected')} disabled={updatingA[ans._id]}
                              className="btn-danger text-[11px] py-1 px-2.5">
                              {updatingA[ans._id] ? '…' : '✕ Reject'}
                            </button>
                          )}
                          {ans.status !== 'pending' && (
                            <button onClick={() => changeAnswerStatus(ans._id, 'pending')} disabled={updatingA[ans._id]}
                              className="px-2.5 py-1 text-[11px] rounded-xl border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold">
                              {updatingA[ans._id] ? '…' : '↺ Pending'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Submit answer form */}
        <div className="card p-6 sm:p-8">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Write Your Answer
          </h3>

          {!user ? (
            <div className="text-center py-6">
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                Sign in to share your answer with the community.
              </p>
              <Link to="/auth" state={{ from: `/community/${id}` }} className="btn-primary">
                Log In or Sign Up
              </Link>
            </div>
          ) : (
            <>
              {/* AI Suggestion panel — shown inside write-answer section */}
              <AISuggestionPanel
                questionTitle={question.title}
                questionDesc={question.description}
                onUse={(text) => setForm(f => ({ ...f, body: text }))}
              />

              {submitOk && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm mb-4 animate-fade-in">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  Answer submitted! It will appear after approval.
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Posting as <span className="font-semibold text-slate-700 dark:text-slate-300">{user.name}</span>
              </p>

              <form onSubmit={onSubmitAnswer} className="space-y-4">
                <div>
                  <label htmlFor="answer-body" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Answer <span className="text-red-400">*</span>
                  </label>
                  <textarea id="answer-body" rows={5} placeholder="Write a clear, helpful answer…"
                    value={form.body}
                    onChange={e => { setForm(p => ({ ...p, body: e.target.value })); if (submitError) setSubmitError(null) }}
                    className="input-field resize-none" disabled={submitting}/>
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01"/>
                    </svg>
                    {submitError}
                  </div>
                )}

                <button id="submit-answer-btn" type="submit" className="btn-primary w-full py-3" disabled={submitting}>
                  {submitting
                    ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Submitting…</>
                    : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>Submit Answer</>
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
