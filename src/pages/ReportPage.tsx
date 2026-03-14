import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Loader2,
  RotateCcw,
  Trophy,
  Target,
  Zap,
  Star,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import SkillRadar from '../components/SkillRadar'
import { fetchReport } from '../api/client'
import type { ReportData } from '../types'

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) return
    fetchReport(sessionId)
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="text-center animate-fade-in">
          <Loader2 size={32} className="text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">正在生成训练报告...</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '报告生成失败'}</p>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-500 hover:underline"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  const { summary, semantic_detail, skill_radar, feedback } = report

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pb-12">
      {/* Header */}
      <header className="glass border-b border-slate-200/60 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg
                            flex items-center justify-center shadow-md shadow-amber-500/20">
              <Trophy size={18} className="text-white" />
            </div>
            训练报告
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={<Target size={18} className="text-indigo-500" />}
            label="总轮次"
            value={`${summary.total_turns}`}
            color="indigo"
          />
          <SummaryCard
            icon={<Star size={18} className="text-amber-500" />}
            label="覆盖率"
            value={`${Math.round(summary.coverage_rate * 100)}%`}
            color="amber"
          />
          <SummaryCard
            icon={<Zap size={18} className="text-orange-500" />}
            label="效率分"
            value={`${Math.round(summary.efficiency_score * 100)}`}
            color="orange"
          />
          <SummaryCard
            icon={<Trophy size={18} className="text-white" />}
            label="总分"
            value={`${summary.overall_score}`}
            highlight
          />
        </div>

        {/* Skill radar */}
        <SkillRadar radar={skill_radar} />

        {/* Semantic timeline */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold text-slate-700 mb-4">
            语义覆盖详情
          </h3>
          <div className="space-y-3">
            {semantic_detail.map((sp) => (
              <div
                key={sp.point_id}
                className={`p-4 rounded-xl border transition-colors ${
                  sp.covered
                    ? 'border-emerald-200 bg-emerald-50/60'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {sp.covered ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <XCircle size={18} className="text-slate-400" />
                  )}
                  <span className="font-medium text-slate-800">{sp.name}</span>
                  {sp.covered && sp.covered_at_turn != null && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-auto font-medium">
                      第 {sp.covered_at_turn} 轮覆盖
                    </span>
                  )}
                </div>
                {sp.covered && sp.evidence && (
                  <p className="text-sm text-slate-600 mt-1.5 ml-[26px] leading-relaxed">
                    <span className="text-slate-400">证据：</span>
                    {sp.evidence}
                  </p>
                )}
                {sp.covered && sp.confidence != null && (
                  <p className="text-xs text-slate-400 mt-1 ml-[26px]">
                    置信度：{Math.round(sp.confidence * 100)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold text-slate-700 mb-4">
            个性化反馈
          </h3>

          {feedback.strengths.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-medium text-emerald-700 flex items-center gap-1.5 mb-2.5">
                <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
                  <TrendingUp size={14} />
                </div>
                优势
              </h4>
              <ul className="space-y-2 ml-8">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-700 list-disc leading-relaxed">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.improvements.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-medium text-amber-600 flex items-center gap-1.5 mb-2.5">
                <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center">
                  <AlertTriangle size={14} />
                </div>
                改进建议
              </h4>
              <ul className="space-y-2 ml-8">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-slate-700 list-disc leading-relaxed">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feedback.overall && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-sm text-indigo-800 leading-relaxed">
                {feedback.overall}
              </p>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-8 py-3 text-white
                       bg-indigo-500
                       rounded-full font-medium
                       hover:shadow-lg hover:shadow-indigo-500/30
                       transition-all duration-300 active:scale-95"
          >
            <RotateCcw size={18} />
            再来一次
          </button>
        </div>
      </main>
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  highlight,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  highlight?: boolean
  color?: string
}) {
  if (highlight) {
    return (
      <div className="rounded-2xl p-4 bg-indigo-500 text-white
                      shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-xs text-indigo-100">{label}</span>
        </div>
        <div className="text-3xl font-bold">{value}</div>
      </div>
    )
  }

  const bgMap: Record<string, string> = {
    indigo: 'bg-indigo-50',
    amber: 'bg-amber-50',
    orange: 'bg-orange-50',
  }

  return (
    <div className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm
                    hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 ${bgMap[color || 'indigo']} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
  )
}
