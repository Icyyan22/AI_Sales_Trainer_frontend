import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  TrendingUp,
  Award,
  Target,
  CheckCircle2,
  FileText,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { fetchPersonalDashboard, fetchScenarios } from '../api/client'
import type { PersonalDashboard, ScenarioInfo } from '../types'

const TIME_RANGES = [
  { value: 0, label: '全部' },
  { value: 7, label: '7天' },
  { value: 30, label: '30天' },
  { value: 90, label: '90天' },
]

const DIFFICULTY_OPTIONS = [
  { value: '', label: '全部难度' },
  { value: 'easy', label: '简单' },
  { value: 'normal', label: '普通' },
  { value: 'hard', label: '困难' },
]

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', {
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<PersonalDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([])
  const [days, setDays] = useState(0)
  const [scenarioId, setScenarioId] = useState('')
  const [difficulty, setDifficulty] = useState('')

  useEffect(() => {
    let cancelled = false
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [d, s] = await Promise.all([
          fetchPersonalDashboard({
            days: days || undefined,
            scenario_id: scenarioId || undefined,
            difficulty: difficulty || undefined,
          }),
          fetchScenarios(),
        ])
        if (!cancelled) {
          setData(d)
          setScenarios(s)
        }
      } catch (err: any) {
        console.error('Dashboard load error:', err)
        if (!cancelled) setError(err?.message || '加载失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [days, scenarioId, difficulty])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <Loader2 size={32} className="text-indigo-500 animate-spin" />
      </div>
    )
  }

  const stats = data?.stats ?? { total_sessions: 0, completed_sessions: 0, avg_score: 0, best_score: 0, completion_rate: 0 }
  const trend = data?.skill_trend ?? []
  const weak = data?.weak_areas
  const recent = data?.recent_sessions ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <header className="glass border-b border-slate-200/60 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">个人看板</h1>
            <p className="text-xs text-slate-500">训练数据总览与趋势分析</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden">
            {TIME_RANGES.map((t) => (
              <button
                key={t.value}
                onClick={() => setDays(t.value)}
                className={`px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  days === t.value
                    ? 'bg-indigo-500 text-white'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <select
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-indigo-400"
          >
            <option value="">全部场景</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:border-indigo-400"
          >
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Target size={20} className="text-indigo-500" />}
            label="总训练数"
            value={stats?.total_sessions ?? 0}
            bg="bg-indigo-50"
          />
          <StatCard
            icon={<TrendingUp size={20} className="text-emerald-500" />}
            label="平均分"
            value={stats?.avg_score ?? 0}
            suffix="分"
            bg="bg-emerald-50"
          />
          <StatCard
            icon={<Award size={20} className="text-amber-500" />}
            label="最高分"
            value={stats?.best_score ?? 0}
            suffix="分"
            bg="bg-amber-50"
          />
          <StatCard
            icon={<CheckCircle2 size={20} className="text-blue-500" />}
            label="完成率"
            value={`${Math.round((stats?.completion_rate ?? 0) * 100)}%`}
            bg="bg-blue-50"
          />
        </div>

        {/* Skill trend chart */}
        {trend.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">技能趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                  labelFormatter={(v) => `日期: ${v}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="overall_score" name="总分" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="data_citation" name="数据引用" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="customer_relevance" name="客户关联" stroke="#10b981" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="fab_structure" name="FAB结构" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="interaction" name="互动技巧" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weak areas */}
        {weak && (weak.weak_scenarios.length > 0 || weak.weak_dimensions.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weak scenarios */}
            {weak.weak_scenarios.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">薄弱场景</h3>
                <div className="space-y-2">
                  {weak.weak_scenarios.map((ws) => (
                    <div key={ws.scenario_id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                      <div>
                        <span className="text-sm font-medium text-slate-700">{ws.name}</span>
                        <span className="text-xs text-slate-400 ml-2">{ws.session_count}次训练</span>
                      </div>
                      <span className={`text-sm font-bold ${ws.avg_score < 60 ? 'text-red-500' : ws.avg_score < 75 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {ws.avg_score}分
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weak dimensions */}
            {weak.weak_dimensions.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">薄弱维度</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weak.weak_dimensions} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" width={70} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Bar dataKey="avg_score" name="平均分" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Recent sessions */}
        {recent.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">最近训练</h3>
            <div className="space-y-2">
              {recent.map((s) => (
                <button
                  key={s.session_id}
                  onClick={() => {
                    if (s.status === 'completed') navigate(`/report/${s.session_id}`)
                    else navigate(`/chat/${s.session_id}`)
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-xl
                             hover:bg-indigo-50 hover:border-indigo-200 border border-transparent
                             transition-all duration-200 text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    s.status === 'completed' ? 'bg-emerald-100' : 'bg-indigo-100'
                  }`}>
                    {s.status === 'completed' ? (
                      <FileText size={16} className="text-emerald-500" />
                    ) : (
                      <Target size={16} className="text-indigo-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700">{s.scenario_name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {formatTime(s.created_at)}
                      <span className="ml-2 px-1.5 py-0.5 bg-slate-200/60 rounded text-slate-500">
                        {DIFFICULTY_LABELS[s.difficulty] || s.difficulty}
                      </span>
                    </div>
                  </div>
                  {s.status === 'completed' && s.overall_score > 0 && (
                    <span className={`text-lg font-bold ${
                      s.overall_score >= 80 ? 'text-emerald-500' : s.overall_score >= 60 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {s.overall_score}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {stats.total_sessions === 0 && (
          <div className="text-center py-20">
            <Target size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">暂无训练数据</p>
            <button onClick={() => navigate('/')} className="mt-4 text-indigo-500 text-sm hover:underline">
              开始第一次训练
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, suffix, bg }: {
  icon: React.ReactNode
  label: string
  value: number | string
  suffix?: string
  bg: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-xl font-bold text-slate-800">
          {value}{suffix && <span className="text-sm font-medium text-slate-500 ml-0.5">{suffix}</span>}
        </div>
      </div>
    </div>
  )
}
