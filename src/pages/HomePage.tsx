import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  Loader2,
  X,
  Clock,
  MessageSquare,
  FileText,
  Play,
  CheckCircle2,
  BookOpen,
  Plus,
  Trash2,
  LogOut,
  Camera,
  User,
  BarChart3,
  ShieldCheck,
} from 'lucide-react'
import ScenarioCard from '../components/ScenarioCard'
import { fetchScenarios, fetchSessions, createSession, createScenario, deleteSession, apiUploadAvatar } from '../api/client'
import { getUser, clearAuth, updateUser, isAdmin } from '../stores/user'
import type { ScenarioInfo, SessionListItem } from '../types'

const DIFFICULTIES = [
  { value: 'easy', label: '简单', desc: '客户较为友好，容易引导' },
  { value: 'normal', label: '普通', desc: '客户有一定戒备，需要技巧' },
  { value: 'hard', label: '困难', desc: '客户非常挑剔，挑战极大' },
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
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

type Tab = 'history' | 'scenarios'

interface SemanticPointForm {
  name: string
  description: string
  match_examples: string
  non_match_examples: string
}

const emptyPoint = (): SemanticPointForm => ({
  name: '',
  description: '',
  match_examples: '',
  non_match_examples: '',
})

export default function HomePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(getUser())
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<Tab>('scenarios')
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([])
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ScenarioInfo | null>(null)
  const [difficulty, setDifficulty] = useState('normal')
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Create scenario form state
  const [formName, setFormName] = useState('')
  const [formCustomerName, setFormCustomerName] = useState('')
  const [formCustomerRole, setFormCustomerRole] = useState('')
  const [formCustomerHospital, setFormCustomerHospital] = useState('')
  const [formCustomerBackground, setFormCustomerBackground] = useState('')
  const [formCustomerConcerns, setFormCustomerConcerns] = useState('')
  const [formCustomerStyle, setFormCustomerStyle] = useState('')
  const [formProductName, setFormProductName] = useState('')
  const [formProductPoints, setFormProductPoints] = useState('')
  const [formSemanticPoints, setFormSemanticPoints] = useState<SemanticPointForm[]>([emptyPoint()])
  const [formOpening, setFormOpening] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const updatedUser = await apiUploadAvatar(file)
      updateUser(updatedUser)
      setUser(updatedUser)
    } catch (err) {
      console.error('Avatar upload failed:', err)
    }
  }

  const loadData = () => {
    setLoading(true)
    Promise.all([fetchScenarios(), fetchSessions()])
      .then(([s, sess]) => {
        setScenarios(s)
        setSessions(sess)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStart = async () => {
    if (!selected) return
    setCreating(true)
    try {
      const session = await createSession(selected.id, difficulty)
      navigate(`/chat/${session.session_id}`, {
        state: {
          scenario: session.scenario,
          openingMessage: session.opening_message,
          semanticCoverage: session.semantic_coverage,
        },
      })
    } catch (err) {
      console.error(err)
      setCreating(false)
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm('确定要删除这条训练记录吗？')) return
    try {
      await deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleResume = (session: SessionListItem) => {
    if (session.status === 'completed') {
      navigate(`/report/${session.session_id}`)
    } else {
      navigate(`/chat/${session.session_id}`)
    }
  }

  const addSemanticPoint = () => {
    setFormSemanticPoints((prev) => [...prev, emptyPoint()])
  }

  const removeSemanticPoint = (index: number) => {
    setFormSemanticPoints((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSemanticPoint = (index: number, field: keyof SemanticPointForm, value: string) => {
    setFormSemanticPoints((prev) =>
      prev.map((sp, i) => (i === index ? { ...sp, [field]: value } : sp))
    )
  }

  const resetForm = () => {
    setFormName('')
    setFormCustomerName('')
    setFormCustomerRole('')
    setFormCustomerHospital('')
    setFormCustomerBackground('')
    setFormCustomerConcerns('')
    setFormCustomerStyle('')
    setFormProductName('')
    setFormProductPoints('')
    setFormSemanticPoints([emptyPoint()])
    setFormOpening('')
    setFormError('')
  }

  const handleCreateScenario = async () => {
    if (!formName || !formCustomerName || !formCustomerRole || !formProductName || !formOpening) {
      setFormError('请填写所有必填项')
      return
    }
    if (formSemanticPoints.some((sp) => !sp.name || !sp.description)) {
      setFormError('每个语义点的名称和描述为必填')
      return
    }

    setFormSubmitting(true)
    setFormError('')
    try {
      await createScenario({
        name: formName,
        customer_name: formCustomerName,
        customer_role: formCustomerRole,
        customer_hospital: formCustomerHospital,
        customer_background: formCustomerBackground,
        customer_concerns: formCustomerConcerns
          .split(/[,，、]/)
          .map((s) => s.trim())
          .filter(Boolean),
        customer_speaking_style: formCustomerStyle,
        product_name: formProductName,
        product_selling_points: formProductPoints
          .split(/[,，、]/)
          .map((s) => s.trim())
          .filter(Boolean),
        semantic_points: formSemanticPoints.map((sp, i) => ({
          id: `SP${i + 1}`,
          name: sp.name,
          description: sp.description,
          match_examples: sp.match_examples
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
          non_match_examples: sp.non_match_examples
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        })),
        opening_message: formOpening,
      })
      setShowCreateForm(false)
      resetForm()
      loadData()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setFormSubmitting(false)
    }
  }

  const scenarioNameMap: Record<string, string> = {}
  for (const s of scenarios) {
    scenarioNameMap[s.id] = s.name
  }

  const inputClass = `w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white
                      focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                      transition-all duration-200 placeholder:text-slate-400`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <header className="glass border-b border-slate-200/60 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl
                          flex items-center justify-center shadow-md shadow-indigo-500/20">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">AI Sales Trainer</h1>
            <p className="text-xs text-slate-500">智能销售训练系统</p>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="个人看板"
              >
                <BarChart3 size={18} />
              </button>
              {isAdmin() && (
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="管理后台"
                >
                  <ShieldCheck size={18} />
                </button>
              )}
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 group flex-shrink-0"
                  title="更换头像"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                      <User size={14} className="text-indigo-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100
                                  transition-opacity flex items-center justify-center">
                    <Camera size={10} className="text-white" />
                  </div>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-medium text-slate-700 leading-tight">{user.display_name}</span>
                  {user.role && user.role !== 'user' && (
                    <span className={`text-[10px] font-medium leading-tight ${
                      user.role === 'super_admin' ? 'text-amber-600' : 'text-indigo-500'
                    }`}>
                      {user.role === 'super_admin' ? '超级管理员' : '管理员'}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => { clearAuth(); navigate('/login') }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="退出登录"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setTab('scenarios')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              tab === 'scenarios'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen size={18} />
            训练场景
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              tab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock size={18} />
            历史记录
            {sessions.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full font-medium">
                {sessions.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="text-indigo-500 animate-spin" />
          </div>
        ) : tab === 'scenarios' ? (
          /* ---- Scenarios Tab ---- */
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500">选择一个场景开始训练{isAdmin() ? '，或创建自定义场景' : ''}</p>
              {isAdmin() && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-white text-sm
                             bg-indigo-500 hover:bg-indigo-600
                             rounded-xl hover:shadow-md hover:shadow-indigo-500/25
                             transition-all duration-200 active:scale-95"
                >
                  <Plus size={16} />
                  新建场景
                </button>
              )}
            </div>
            {scenarios.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                暂无可用场景，请点击上方按钮创建
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((s) => (
                  <ScenarioCard key={s.id} scenario={s} onSelect={setSelected} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ---- History Tab ---- */
          <div>
            {sessions.length === 0 ? (
              <div className="text-center py-20">
                <Clock size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400">暂无训练记录</p>
                <button
                  onClick={() => setTab('scenarios')}
                  className="mt-4 text-indigo-500 text-sm hover:underline"
                >
                  开始第一次训练
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((sess) => (
                  <div
                    key={sess.session_id}
                    className="bg-white rounded-xl border border-slate-200 px-5 py-3.5
                               flex items-center gap-4 hover:shadow-md hover:shadow-indigo-500/5
                               hover:border-indigo-200 transition-all duration-200 group"
                  >
                    <button
                      onClick={() => handleResume(sess)}
                      className="flex items-center gap-4 flex-1 min-w-0 text-left"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          sess.status === 'completed' ? 'bg-emerald-100' : 'bg-indigo-100'
                        }`}
                      >
                        {sess.status === 'completed' ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : (
                          <MessageSquare size={18} className="text-indigo-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {scenarioNameMap[sess.scenario_id] || sess.scenario_id}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                          <span>{formatTime(sess.created_at)}</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                            {DIFFICULTY_LABELS[sess.difficulty] || sess.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {sess.status === 'completed' ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-medium">
                            <FileText size={14} />
                            查看报告
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full font-medium">
                            <Play size={14} />
                            继续训练
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(sess.session_id)
                      }}
                      className="flex-shrink-0 p-2 text-slate-300 hover:text-red-500
                                 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除记录"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Difficulty selection modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">训练配置</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="mb-2 text-sm text-slate-600">
              场景：<span className="font-medium text-slate-800">{selected.name}</span>
            </div>
            <div className="mb-4 text-sm text-slate-600">
              客户：{selected.customer_profile.name}（{selected.customer_profile.role}）
            </div>
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-700 mb-2 block">选择难度</label>
              <div className="space-y-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                      difficulty === d.value
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`text-sm font-medium ${difficulty === d.value ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {d.label}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleStart}
              disabled={creating}
              className="w-full py-3 text-white rounded-xl font-medium
                         bg-indigo-500 hover:bg-indigo-600
                         hover:shadow-lg hover:shadow-indigo-500/25
                         disabled:bg-indigo-300 disabled:shadow-none
                         transition-all duration-200 flex items-center justify-center gap-2
                         active:scale-[0.98]"
            >
              {creating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  创建中...
                </>
              ) : (
                '开始训练'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Create scenario modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
            {/* Sticky header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-slate-800">新建训练场景</h3>
              <button
                onClick={() => { setShowCreateForm(false); resetForm() }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Basic info */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  场景名称 <span className="text-red-400">*</span>
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例：心血管药物推广训练"
                  className={inputClass}
                />
              </div>

              {/* Customer profile */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700">客户画像</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      姓名 <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      placeholder="例：李主任"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      职位 <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={formCustomerRole}
                      onChange={(e) => setFormCustomerRole(e.target.value)}
                      placeholder="例：心内科副主任"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">医院</label>
                  <input
                    value={formCustomerHospital}
                    onChange={(e) => setFormCustomerHospital(e.target.value)}
                    placeholder="例：XX市人民医院"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">背景描述</label>
                  <textarea
                    value={formCustomerBackground}
                    onChange={(e) => setFormCustomerBackground(e.target.value)}
                    rows={2}
                    placeholder="客户的专业背景、工作经验、对新药的态度等"
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    关注点 <span className="text-slate-400">（用逗号分隔）</span>
                  </label>
                  <input
                    value={formCustomerConcerns}
                    onChange={(e) => setFormCustomerConcerns(e.target.value)}
                    placeholder="例：药物安全性，疗效数据，性价比"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">说话风格</label>
                  <input
                    value={formCustomerStyle}
                    onChange={(e) => setFormCustomerStyle(e.target.value)}
                    placeholder="例：言简意赅，会用临床案例提问"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Product */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-slate-700">产品信息</h4>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    产品名称 <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={formProductName}
                    onChange={(e) => setFormProductName(e.target.value)}
                    placeholder="例：某SGLT2抑制剂"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    核心卖点 <span className="text-slate-400">（用逗号分隔）</span>
                  </label>
                  <input
                    value={formProductPoints}
                    onChange={(e) => setFormProductPoints(e.target.value)}
                    placeholder="例：降低心衰住院风险，肾脏保护，降糖"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Semantic points */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700">
                    语义覆盖点 <span className="text-red-400">*</span>
                  </h4>
                  <button
                    onClick={addSemanticPoint}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Plus size={14} />
                    添加
                  </button>
                </div>
                {formSemanticPoints.map((sp, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-500">SP{i + 1}</span>
                      {formSemanticPoints.length > 1 && (
                        <button
                          onClick={() => removeSemanticPoint(i)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <input
                      value={sp.name}
                      onChange={(e) => updateSemanticPoint(i, 'name', e.target.value)}
                      placeholder="语义点名称（必填）"
                      className={inputClass}
                    />
                    <input
                      value={sp.description}
                      onChange={(e) => updateSemanticPoint(i, 'description', e.target.value)}
                      placeholder="描述：什么内容算覆盖了这个语义点（必填）"
                      className={inputClass}
                    />
                    <textarea
                      value={sp.match_examples}
                      onChange={(e) => updateSemanticPoint(i, 'match_examples', e.target.value)}
                      rows={2}
                      placeholder="匹配示例（每行一个，可选）"
                      className={`${inputClass} resize-none`}
                    />
                    <textarea
                      value={sp.non_match_examples}
                      onChange={(e) => updateSemanticPoint(i, 'non_match_examples', e.target.value)}
                      rows={2}
                      placeholder="不匹配示例（每行一个，可选）"
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                ))}
              </div>

              {/* Opening message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  客户开场白 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formOpening}
                  onChange={(e) => setFormOpening(e.target.value)}
                  rows={2}
                  placeholder="客户的第一句话，例：你好，听说你们有一款新药..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {formError && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
              )}
            </div>

            {/* Sticky footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-200 flex-shrink-0">
              <button
                onClick={() => { setShowCreateForm(false); resetForm() }}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm
                           font-medium hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateScenario}
                disabled={formSubmitting}
                className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium
                           bg-indigo-500 hover:bg-indigo-600
                           hover:shadow-md hover:shadow-indigo-500/25
                           disabled:bg-indigo-300 disabled:shadow-none
                           transition-all duration-200
                           flex items-center justify-center gap-2"
              >
                {formSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    创建中...
                  </>
                ) : (
                  '创建场景'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
