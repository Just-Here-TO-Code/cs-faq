import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import { fetchMyProfile } from '../services/api'
import { CATEGORY_COLORS, STATUS_META, timeAgo } from '../utils/constants'

const LEVEL_META = {
  Beginner:    { color: 'from-slate-400 to-slate-500',    icon: '🌱', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',   pts: '0–49 pts'   },
  Contributor: { color: 'from-blue-500 to-indigo-600',    icon: '⭐', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',      pts: '50–199 pts' },
  Expert:      { color: 'from-amber-400 to-orange-500',   icon: '🏆', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', pts: '200+ pts'   },
}

const NEXT_LEVEL = { Beginner: 50, Contributor: 200, Expert: Infinity }

function StatCard({ icon, label, value, color = 'text-primary-600 dark:text-primary-400' }) {
  return (
    <div className="card p-5 flex flex-col items-center text-center gap-1 hover:shadow-md transition-shadow duration-200">
      <span className="text-2xl mb-1">{icon}</span>
      <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
        active
          ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-md shadow-primary-500/20'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [activeTab, setActiveTab] = useState('questions')

  useEffect(() => {
    if (!user) { navigate('/auth'); return }
    fetchMyProfile()
      .then(setProfile)
      .catch(e => setError(e.response?.data?.error || 'Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null
  if (loading) return <Spinner text="Loading profile…"/>
  if (error)   return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
      <Link to="/" className="btn-secondary">Go Home</Link>
    </div>
  )

  const lm          = LEVEL_META[profile.level] || LEVEL_META.Beginner
  const nextPts     = NEXT_LEVEL[profile.level]
  const prevPts     = profile.level === 'Beginner' ? 0 : profile.level === 'Contributor' ? 50 : 200
  const progressPct = nextPts === Infinity
    ? 100
    : Math.min(100, Math.round(((profile.points - prevPts) / (nextPts - prevPts)) * 100))

  const tabs = [
    { id: 'questions', label: `❓ Questions (${profile.questions?.length || 0})` },
    { id: 'answers',   label: `💬 Answers (${profile.answers?.length || 0})` },
    { id: 'saved',     label: `❤️ Saved FAQs (${profile.savedFAQs?.length || 0})` },
  ]

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] transition-colors">

      {/* ── Profile hero banner ── */}
      <div className="relative overflow-hidden">
        {/* Gradient banner */}
        <div className={`h-32 sm:h-40 bg-gradient-to-r ${lm.color} opacity-90`}/>

        {/* Profile card overlapping the banner */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="relative -mt-16 mb-6 flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${lm.color} flex items-center justify-center text-white text-3xl font-extrabold shadow-xl border-4 border-white dark:border-slate-800 flex-shrink-0`}>
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 pt-2 sm:pt-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{profile.name}</h1>
                <span className={`badge ${lm.bg} text-sm px-3 py-1 font-semibold`}>
                  {lm.icon} {profile.level}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{profile.email}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </p>
            </div>

            {/* Logout button */}
            <button
              onClick={() => { logout(); navigate('/') }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">

        {/* ── Points & Level Progress ── */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Reputation</p>
              <p className="text-3xl font-extrabold gradient-text mt-0.5">{profile.points} pts</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {nextPts === Infinity ? 'Max level reached 🏆' : `${nextPts - profile.points} pts to ${profile.level === 'Beginner' ? 'Contributor' : 'Expert'}`}
              </p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">{progressPct}%</p>
            </div>
          </div>
          <div className="confidence-bar-track">
            <div
              className={`confidence-bar-fill bg-gradient-to-r ${lm.color}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Level badges */}
          <div className="flex items-center gap-3 mt-4">
            {Object.entries(LEVEL_META).map(([lvl, meta]) => (
              <div key={lvl}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  profile.level === lvl
                    ? `bg-gradient-to-r ${meta.color} text-white border-transparent shadow-md`
                    : 'border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500'
                }`}>
                {meta.icon} {lvl} <span className="opacity-70">({meta.pts})</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon="❓" label="Questions Asked"    value={profile.stats?.questionsAsked  || 0} color="text-blue-600 dark:text-blue-400"/>
          <StatCard icon="💬" label="Answers Given"      value={profile.stats?.answersGiven     || 0} color="text-violet-600 dark:text-violet-400"/>
          <StatCard icon="✅" label="Answers Approved"   value={profile.stats?.answersApproved  || 0} color="text-emerald-600 dark:text-emerald-400"/>
          <StatCard icon="👍" label="Upvotes Received"   value={profile.stats?.upvotesReceived  || 0} color="text-amber-600 dark:text-amber-400"/>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {tabs.map(t => (
            <TabButton key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </TabButton>
          ))}
        </div>

        {/* ── Tab: Questions ── */}
        {activeTab === 'questions' && (
          <div className="space-y-3 animate-slide-up">
            {(!profile.questions || profile.questions.length === 0) ? (
              <div className="card p-10 text-center">
                <p className="text-3xl mb-3">❓</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">No questions yet</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">Ask your first question to the community.</p>
                <Link to="/ask" className="btn-primary">Ask a Question</Link>
              </div>
            ) : (
              profile.questions.map(q => {
                const sm = STATUS_META[q.status] || STATUS_META.pending
                const cc = CATEGORY_COLORS[q.category] || CATEGORY_COLORS.Other
                return (
                  <Link key={q._id} to={`/community/${q._id}`}
                    className="card-hover block p-4 sm:p-5 group">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`badge ${sm.color}`}>{sm.label}</span>
                      <span className={`badge ${cc}`}>{q.category}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{timeAgo(q.createdAt)}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                      {q.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-1">{q.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                      <span>💬 {q.answerCount} {q.answerCount === 1 ? 'answer' : 'answers'}</span>
                      {q.tags?.map(t => <span key={t} className="tag-chip">#{t}</span>)}
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        )}

        {/* ── Tab: Answers ── */}
        {activeTab === 'answers' && (
          <div className="space-y-3 animate-slide-up">
            {(!profile.answers || profile.answers.length === 0) ? (
              <div className="card p-10 text-center">
                <p className="text-3xl mb-3">💬</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">No answers yet</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">Help the community by answering questions.</p>
                <Link to="/community" className="btn-primary">Browse Questions</Link>
              </div>
            ) : (
              profile.answers.map(ans => {
                const sm   = STATUS_META[ans.status] || STATUS_META.pending
                const conf = ans.confidence
                const confColor = conf >= 70 ? 'bg-emerald-500' : conf >= 40 ? 'bg-amber-500' : 'bg-red-400'
                const confText  = conf >= 70 ? 'text-emerald-600 dark:text-emerald-400' : conf >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400'
                return (
                  <Link
                    key={ans._id}
                    to={`/community/${ans.questionId?._id || ans.questionId}`}
                    className="card-hover block p-4 sm:p-5 group"
                  >
                    {ans.questionId?.title && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 font-medium">
                        Re: <span className="text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{ans.questionId.title}</span>
                      </p>
                    )}
                    <p className="text-sm text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed">{ans.body}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className={`badge ${sm.color}`}>{sm.label}</span>
                      {conf !== null && conf !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">AI Confidence</span>
                          <div className="confidence-bar-track w-12">
                            <div className={`confidence-bar-fill ${confColor}`} style={{ width: `${conf}%` }}/>
                          </div>
                          <span className={`text-[11px] font-bold ${confText}`}>{conf}%</span>
                        </div>
                      )}
                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{timeAgo(ans.createdAt)}</span>
                      {ans.upvotes > 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">👍 {ans.upvotes}</span>
                      )}
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        )}

        {/* ── Tab: Saved FAQs ── */}
        {activeTab === 'saved' && (
          <div className="space-y-3 animate-slide-up">
            {(!profile.savedFAQs || profile.savedFAQs.length === 0) ? (
              <div className="card p-10 text-center">
                <p className="text-3xl mb-3">❤️</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">No saved FAQs yet</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">
                  Click the heart icon on any FAQ to save it here.
                </p>
                <Link to="/" className="btn-primary">Browse FAQs</Link>
              </div>
            ) : (
              profile.savedFAQs.map(faq => {
                const cc = CATEGORY_COLORS[faq.category] || CATEGORY_COLORS.Other
                const total = (faq.helpfulYes || 0) + (faq.helpfulNo || 0)
                const pct   = total > 0 ? Math.round((faq.helpfulYes / total) * 100) : null
                return (
                  <div key={faq._id} className="card-hover p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`badge ${cc}`}>{faq.category}</span>
                          {faq.tags?.map(t => <span key={t} className="tag-chip">#{t}</span>)}
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">{faq.question}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2">{faq.answer}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                          {pct !== null && <span>👍 {pct}% helpful</span>}
                          {faq.views > 0 && <span>👁 {faq.views} views</span>}
                        </div>
                      </div>
                      {/* Heart icon (filled) */}
                      <svg className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                      </svg>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
