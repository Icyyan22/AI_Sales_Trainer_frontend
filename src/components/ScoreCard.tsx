import type { ExpressionQuality } from '../types'

interface Props {
  quality: ExpressionQuality | null
}

const DIMENSIONS = [
  { key: 'data_citation' as const, label: '数据引用', gradient: 'from-blue-400 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  { key: 'customer_relevance' as const, label: '客户相关性', gradient: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { key: 'fab_structure' as const, label: 'FAB结构', gradient: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600' },
  { key: 'interaction' as const, label: '互动技巧', gradient: 'from-indigo-400 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600' },
]

export default function ScoreCard({ quality }: Props) {
  if (!quality) {
    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">当轮评分</h4>
        <p className="text-xs text-slate-400">发送消息后显示评分</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <h4 className="text-sm font-semibold text-slate-700 mb-3">当轮评分</h4>
      <div className="space-y-3">
        {DIMENSIONS.map(({ key, label, gradient, bg, text }) => {
          const dim = quality[key]
          if (!dim) return null
          return (
            <div key={key} className="animate-fade-in">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className={`${bg} ${text} font-medium px-2 py-0.5 rounded-md`}>{label}</span>
                <span className="font-bold text-slate-700">{dim.score}/5</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700 ease-out relative`}
                  style={{ width: `${dim.score * 20}%` }}
                >
                  {dim.score > 0 && <div className="absolute inset-0 score-bar-shimmer rounded-full" />}
                </div>
              </div>
              {(dim.note || dim.comment) && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{dim.note || dim.comment}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
