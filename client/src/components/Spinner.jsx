export default function Spinner({ size = 'md', text = 'Loading...' }) {
  const s = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${s[size]} rounded-full border-slate-200 dark:border-slate-700 border-t-primary-600 dark:border-t-primary-400 animate-spin`}
           style={{ borderWidth: 3 }} />
      {text && <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{text}</p>}
    </div>
  )
}
