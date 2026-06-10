import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 mt-auto transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg hero-gradient flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
            </div>
            <span className="font-bold gradient-text">CrowdFAQ</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            {[['/', 'FAQ'], ['/ask', 'Ask a Question'], ['/community', 'Community']].map(([to, label]) => (
              <Link key={to} to={to} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{label}</Link>
            ))}
          </nav>
          <p className="text-sm text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} CrowdFAQ</p>
        </div>
      </div>
    </footer>
  )
}
