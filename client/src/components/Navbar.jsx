import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { dark, toggle } = useTheme()
  const { user, logout } = useAuth()

  const linkClass = ({ isActive }) =>
    isActive
      ? 'text-primary-600 dark:text-primary-400 font-semibold border-b-2 border-primary-600 dark:border-primary-400 pb-0.5'
      : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors'

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-100 dark:border-slate-700/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">CrowdFAQ</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-8">
            <NavLink to="/" end className={linkClass}>FAQ</NavLink>
            <NavLink to="/ask" className={linkClass}>Ask Question</NavLink>
            <NavLink to="/community" className={linkClass}>Community</NavLink>
            <NavLink to="/leaderboard" className={linkClass}>🏆 Leaderboard</NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              id="theme-toggle"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button onClick={logout} className="text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 px-2 py-1 transition-colors" title="Log out">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:flex btn-secondary text-sm">
                Log In
              </Link>
            )}
            {/* CTA — desktop */}
            <Link to={user ? '/ask' : '/auth'} state={user ? undefined : { from: '/ask' }} className="hidden sm:flex btn-primary text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ask a Question
            </Link>
            {/* Hamburger — mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen
                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-slate-100 dark:border-slate-700 py-3 space-y-1 animate-fade-in">
            {[['/', 'FAQ', true], ['/ask', 'Ask Question', false], ['/community', 'Community', false], ['/leaderboard', '🏆 Leaderboard', false]].map(([to, label, end]) => (
              <NavLink key={to} to={user || to !== '/ask' ? to : '/auth'} end={end || undefined}
                state={!user && to === '/ask' ? { from: '/ask' } : undefined}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                {label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to="/profile" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  👤 My Profile
                </NavLink>
                <button onClick={() => { logout(); setMenuOpen(false) }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors">
                  Sign out ({user.name})
                </button>
              </>
            ) : (
              <NavLink to="/auth" onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-700 font-semibold transition-colors">
                Log In / Sign Up
              </NavLink>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
