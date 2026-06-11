import { useState, useEffect } from 'react'
import { fetchLeaderboard } from '../services/api'
import Spinner from '../components/Spinner'

const LEVEL_META = {
  Beginner:    { color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',    icon: '🌱', pts: '0–49 pts'   },
  Contributor: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',      icon: '⭐', pts: '50–199 pts' },
  Expert:      { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: '🏆', pts: '200+ pts'   },
}

const RANK_STYLES = [
  'bg-amber-400  text-white shadow-amber-200 dark:shadow-amber-900',   // 1st
  'bg-slate-400  text-white shadow-slate-200 dark:shadow-slate-700',   // 2nd
  'bg-orange-400 text-white shadow-orange-200 dark:shadow-orange-900', // 3rd
]

function RankBadge({ rank }) {
  if (rank <= 3) {
    return (
      <span className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-lg flex-shrink-0 ${RANK_STYLES[rank - 1]}`}>
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
      </span>
    )
  }
  return (
    <span className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
      {rank}
    </span>
  )
}

function PointsBar({ points, max }) {
  const pct = max > 0 ? Math.min(100, (points / max) * 100) : 0
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full hero-gradient transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function LeaderboardPage() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetchLeaderboard(20)
      .then(setUsers)
      .catch(e => setError(e.response?.data?.error || 'Failed to load leaderboard.'))
      .finally(() => setLoading(false))
  }, [])

  const maxPts = users[0]?.points || 1

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] transition-colors">
      {/* Hero */}
      <div className="hero-gradient py-14 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 60% 40%, white 0%, transparent 70%)' }} />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
          🏆 Leaderboard
        </h1>
        <p className="text-indigo-100 text-base sm:text-lg max-w-xl mx-auto">
          Top contributors who help keep CrowdFAQ accurate and helpful.
        </p>

        {/* Level legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {Object.entries(LEVEL_META).map(([level, meta]) => (
            <div key={level}
              className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5 text-white text-sm font-medium">
              <span>{meta.icon}</span>
              <span>{level}</span>
              <span className="opacity-70 text-xs">({meta.pts})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {loading ? (
          <Spinner text="Loading leaderboard…" />
        ) : error ? (
          <div className="card p-8 text-center text-red-500 dark:text-red-400">{error}</div>
        ) : users.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-4">🌱</p>
            <p className="font-semibold text-slate-700 dark:text-slate-200 text-lg">No contributors yet</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              Be the first! Answer questions and earn points.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u, idx) => {
              const rank = idx + 1
              const lm   = LEVEL_META[u.level] || LEVEL_META.Beginner
              return (
                <div key={u._id}
                  className={`card p-4 sm:p-5 flex items-center gap-4 transition-all hover:shadow-md ${rank <= 3 ? 'border border-amber-200 dark:border-amber-800/50' : ''}`}>
                  <RankBadge rank={rank} />

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full hero-gradient flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm">
                    {u.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate">
                        {u.name}
                      </span>
                      <span className={`badge text-xs ${lm.color}`}>
                        {lm.icon} {u.level}
                      </span>
                    </div>

                    <PointsBar points={u.points} max={maxPts} />

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span title="Answers given">💬 {u.stats?.answersGiven || 0} answers</span>
                      <span title="Approved answers">✅ {u.stats?.answersApproved || 0} approved</span>
                      <span title="Upvotes received">👍 {u.stats?.upvotesReceived || 0} upvotes</span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-extrabold text-primary-600 dark:text-primary-400">
                      {u.points}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">pts</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Points system explanation */}
        <div className="card p-5 mt-8">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-3 text-sm">How to Earn Points</h2>
          <div className="space-y-2">
            {[
              { action: 'Submit an answer',        pts: '+5 pts',  icon: '💬' },
              { action: 'Answer gets approved',    pts: '+15 pts', icon: '✅' },
              { action: 'Answer receives an upvote', pts: '+10 pts', icon: '👍' },
            ].map(row => (
              <div key={row.action} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span>{row.icon}</span>{row.action}
                </span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{row.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
