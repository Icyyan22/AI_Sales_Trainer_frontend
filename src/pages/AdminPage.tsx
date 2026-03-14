import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import React from 'react'
import {
  ArrowLeft,
  Loader2,
  Users,
  Target,
  TrendingUp,
  Activity,
  ShieldCheck,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  fetchAdminDashboard,
  fetchUserList,
  updateUserRole,
  fetchAdminUserDetail,
} from '../api/client'
import { isSuperAdmin } from '../stores/user'
import type { AdminDashboard, AdminUserInfo, PersonalDashboard } from '../types'

type AdminTab = 'overview' | 'users'

export default function AdminPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<AdminTab>('overview')
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [users, setUsers] = useState<AdminUserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [userDetail, setUserDetail] = useState<PersonalDashboard | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [d, u] = await Promise.all([
        fetchAdminDashboard(),
        isSuperAdmin() ? fetchUserList() : Promise.resolve([]),
      ])
      setDashboard(d)
      setUsers(u)
    } catch (err: any) {
      console.error('Admin load error:', err)
      setError(err?.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      loadData()
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : '操作失败')
    }
  }

  const handleExpandUser = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null)
      setUserDetail(null)
      return
    }
    setExpandedUser(userId)
    setDetailLoading(true)
    try {
      const detail = await fetchAdminUserDetail(userId)
      setUserDetail(detail)
    } catch (err) {
      console.error(err)
    } finally {
      setDetailLoading(false)
    }
  }

  const overall = dashboard?.overall

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <Loader2 size={32} className="text-indigo-500 animate-spin" />
      </div>
    )
  }

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
            <h1 className="text-xl font-bold text-slate-800">管理后台</h1>
            <p className="text-xs text-slate-500">用户管理与数据统计</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setTab('overview')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp size={18} />
            总览
          </button>
          {isSuperAdmin() && (
            <button
              onClick={() => setTab('users')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                tab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users size={18} />
              用户管理
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {tab === 'overview' ? (
          <>
            {/* Overall stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AdminStatCard
                icon={<Users size={20} className="text-indigo-500" />}
                label="总用户数"
                value={overall?.total_users ?? 0}
                bg="bg-indigo-50"
              />
              <AdminStatCard
                icon={<Target size={20} className="text-emerald-500" />}
                label="总训练数"
                value={overall?.total_sessions ?? 0}
                bg="bg-emerald-50"
              />
              <AdminStatCard
                icon={<TrendingUp size={20} className="text-amber-500" />}
                label="平均分"
                value={overall?.avg_score ?? 0}
                suffix="分"
                bg="bg-amber-50"
              />
              <AdminStatCard
                icon={<Activity size={20} className="text-blue-500" />}
                label="今日活跃"
                value={overall?.active_today ?? 0}
                bg="bg-blue-50"
              />
            </div>

            {/* User ranking table */}
            {dashboard?.user_stats && dashboard.user_stats.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">用户排行</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-100">
                        <th className="pb-2 font-medium">用户</th>
                        <th className="pb-2 font-medium text-center">角色</th>
                        <th className="pb-2 font-medium text-center">训练数</th>
                        <th className="pb-2 font-medium text-center">平均分</th>
                        <th className="pb-2 font-medium text-center">完成率</th>
                        <th className="pb-2 font-medium text-center">最近活跃</th>
                        <th className="pb-2 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.user_stats.map((u) => (
                        <React.Fragment key={u.user_id}>
                          <tr
                            className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => handleExpandUser(u.user_id)}
                          >
                            <td className="py-2.5">
                              <span className="font-medium text-slate-700">{u.display_name}</span>
                              <span className="text-slate-400 ml-1.5 text-xs">@{u.username}</span>
                            </td>
                            <td className="py-2.5 text-center">
                              <RoleBadge role={u.role} />
                            </td>
                            <td className="py-2.5 text-center text-slate-600">{u.total_sessions}</td>
                            <td className="py-2.5 text-center">
                              <span className={`font-semibold ${
                                u.avg_score >= 80 ? 'text-emerald-500' : u.avg_score >= 60 ? 'text-amber-500' : 'text-slate-500'
                              }`}>
                                {u.avg_score || '-'}
                              </span>
                            </td>
                            <td className="py-2.5 text-center text-slate-600">
                              {u.total_sessions ? `${Math.round(u.completion_rate * 100)}%` : '-'}
                            </td>
                            <td className="py-2.5 text-center text-xs text-slate-400">
                              {u.last_active ? new Date(u.last_active).toLocaleDateString('zh-CN') : '-'}
                            </td>
                            <td className="py-2.5 text-center">
                              {expandedUser === u.user_id ? (
                                <ChevronUp size={16} className="text-slate-400" />
                              ) : (
                                <ChevronDown size={16} className="text-slate-400" />
                              )}
                            </td>
                          </tr>
                          {expandedUser === u.user_id && (
                            <tr key={`${u.user_id}-detail`}>
                              <td colSpan={7} className="p-4 bg-slate-50">
                                {detailLoading ? (
                                  <div className="flex justify-center py-4">
                                    <Loader2 size={20} className="text-indigo-500 animate-spin" />
                                  </div>
                                ) : userDetail ? (
                                  <div className="grid grid-cols-4 gap-3">
                                    <MiniStat label="总训练" value={userDetail.stats.total_sessions} />
                                    <MiniStat label="已完成" value={userDetail.stats.completed_sessions} />
                                    <MiniStat label="平均分" value={userDetail.stats.avg_score} />
                                    <MiniStat label="最高分" value={userDetail.stats.best_score} />
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-400 text-center">无数据</p>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Scenario usage chart */}
            {dashboard?.scenario_stats && dashboard.scenario_stats.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">场景使用统计</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboard.scenario_stats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                    <Bar dataKey="usage_count" name="使用次数" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                    <Bar dataKey="avg_score" name="平均分" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          /* Users tab (super_admin only) */
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">用户列表</h3>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-4 px-4 py-3 bg-slate-50 rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">{u.display_name}</span>
                      <span className="text-xs text-slate-400">@{u.username}</span>
                      <RoleBadge role={u.role} />
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      注册于 {new Date(u.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  {u.role !== 'super_admin' && (
                    <div className="flex gap-2">
                      {u.role === 'user' ? (
                        <button
                          onClick={() => handleRoleChange(u.id, 'admin')}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50
                                     border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          设为管理员
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(u.id, 'user')}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100
                                     border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          取消管理员
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-center text-slate-400 py-8 text-sm">暂无用户</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function AdminStatCard({ icon, label, value, suffix, bg }: {
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

function RoleBadge({ role }: { role: string }) {
  if (role === 'super_admin') {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full">
        <ShieldCheck size={10} />
        超管
      </span>
    )
  }
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-medium rounded-full">
        <Shield size={10} />
        管理
      </span>
    )
  }
  return (
    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-medium rounded-full">
      用户
    </span>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg p-2.5 text-center border border-slate-100">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-lg font-bold text-slate-700">{value}</div>
    </div>
  )
}
