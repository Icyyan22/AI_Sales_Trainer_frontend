import { CheckCircle2, Circle } from 'lucide-react'
import type { SemanticPoint } from '../types'

interface Props {
  semanticPoints: SemanticPoint[]
  coverage: Record<string, boolean>
}

export default function CoveragePanel({ semanticPoints, coverage }: Props) {
  const total = Object.keys(coverage).length || 1
  const covered = Object.values(coverage).filter(Boolean).length
  const rate = Math.round((covered / total) * 100)

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700">语义覆盖</h4>
        <span className="text-sm font-bold gradient-text">{rate}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 relative">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-700 ease-out relative"
          style={{ width: `${rate}%` }}
        >
          {rate > 0 && <div className="absolute inset-0 score-bar-shimmer rounded-full" />}
        </div>
      </div>
      <div className="space-y-2.5">
        {semanticPoints.map((sp) => {
          const isCovered = coverage[sp.id]
          return (
            <div
              key={sp.id}
              className={`flex items-start gap-2.5 p-2 rounded-lg transition-colors duration-300
                ${isCovered ? 'bg-emerald-50/60' : ''}`}
            >
              {isCovered ? (
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle size={16} className="text-slate-300 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <span
                  className={`text-sm transition-colors duration-300
                    ${isCovered ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}
                >
                  {sp.name}
                </span>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{sp.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
