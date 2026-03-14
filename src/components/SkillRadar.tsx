import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import type { SkillRadar as SkillRadarType } from '../types'

interface Props {
  radar: SkillRadarType
}

const LABELS: Record<string, string> = {
  data_citation: '数据引用',
  customer_relevance: '客户相关性',
  fab_structure: 'FAB结构',
  interaction: '互动技巧',
}

export default function SkillRadar({ radar }: Props) {
  const data = Object.entries(radar).map(([key, value]) => ({
    dimension: LABELS[key] || key,
    score: value,
    fullMark: 10,
  }))

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-base font-semibold text-slate-700 mb-4 text-center">
        能力雷达图
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <Radar
            name="能力评分"
            dataKey="score"
            stroke="#6366f1"
            fill="url(#radarGradient)"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.15} />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
