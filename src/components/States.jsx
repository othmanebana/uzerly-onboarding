import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react'

export function LoadingSpinner({ message = 'Chargement…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 size={28} className="animate-spin" style={{ color: '#EE0669' }} />
      <span className="text-[12px] text-info">{message}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle size={22} className="text-error" />
      </div>
      <div className="text-[13px] font-semibold text-text-base">Une erreur est survenue</div>
      <div className="text-[11px] text-info max-w-xs text-center">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border border-border rounded-lg bg-white hover:bg-bg transition-colors cursor-pointer"
        >
          <RefreshCw size={12} /> Réessayer
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message = 'Aucun client pour l\'instant.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="text-4xl">📋</div>
      <div className="text-[13px] font-semibold text-text-base">{message}</div>
      {action}
    </div>
  )
}
