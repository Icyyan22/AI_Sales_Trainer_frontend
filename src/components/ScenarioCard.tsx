import { Users, Package, Target } from 'lucide-react'
import type { ScenarioInfo } from '../types'

interface Props {
  scenario: ScenarioInfo
  onSelect: (scenario: ScenarioInfo) => void
}

export default function ScenarioCard({ scenario, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(scenario)}
      className="bg-white rounded-2xl border border-slate-200 p-6 text-left
                 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-300
                 transition-all duration-300 cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
        {scenario.name}
      </h3>
      <div className="mt-4 space-y-2.5 text-sm text-slate-600">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Users size={14} className="text-indigo-500" />
          </div>
          <span>{scenario.customer_profile.name} - {scenario.customer_profile.role}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Package size={14} className="text-emerald-500" />
          </div>
          <span>{scenario.product.name}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Target size={14} className="text-amber-500" />
          </div>
          <span>{scenario.semantic_points.length} 个语义覆盖点</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {scenario.semantic_points.map((sp) => (
          <span
            key={sp.id}
            className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full
                       font-medium group-hover:bg-indigo-100 transition-colors"
          >
            {sp.name}
          </span>
        ))}
      </div>
    </button>
  )
}
