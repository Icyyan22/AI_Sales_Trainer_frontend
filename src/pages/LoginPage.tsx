import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, Camera, Loader2, User } from 'lucide-react'
import { saveAuth } from '../stores/user'
import { apiLogin, apiRegister, apiUploadAvatar } from '../api/client'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const switchMode = (m: Mode) => {
    setMode(m)
    setError('')
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('图片大小不能超过 2MB')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('请填写用户名和密码')
      return
    }
    if (mode === 'register' && username.trim().length < 2) {
      setError('用户名至少 2 个字符')
      return
    }
    if (password.length < 4) {
      setError('密码至少 4 个字符')
      return
    }

    setLoading(true)
    setError('')

    try {
      let result
      if (mode === 'login') {
        result = await apiLogin(username.trim(), password)
      } else {
        result = await apiRegister(username.trim(), password, displayName.trim() || username.trim())
      }

      // Save auth first
      saveAuth(result.token, result.user)

      // Upload avatar if selected during registration
      if (mode === 'register' && avatarFile) {
        try {
          const updatedUser = await apiUploadAvatar(avatarFile)
          saveAuth(result.token, updatedUser)
        } catch {
          // Avatar upload failed, but account was created — continue
        }
      }

      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white
                      focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                      transition-all duration-200 placeholder:text-slate-400`

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-indigo-500 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full" />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <GraduationCap size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">AI Sales Trainer</h2>
          <p className="text-indigo-100 text-base leading-relaxed">
            智能销售训练系统，通过 AI 模拟真实客户对话，
            帮助销售人员快速提升沟通技巧与产品表达能力。
          </p>
          <div className="mt-8 flex gap-6 justify-center text-sm text-indigo-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">AI</div>
              <div>模拟客户</div>
            </div>
            <div className="w-px bg-indigo-400/40" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4D</div>
              <div>能力评估</div>
            </div>
            <div className="w-px bg-indigo-400/40" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">RT</div>
              <div>实时反馈</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3
                            shadow-lg shadow-indigo-500/20">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">AI Sales Trainer</h1>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${mode === 'login'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              登录
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${mode === 'register'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar upload (register only) */}
            {mode === 'register' && (
              <div className="flex justify-center mb-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300
                             hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200
                             flex items-center justify-center overflow-hidden group"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={28} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100
                                  transition-opacity flex items-center justify-center">
                    <Camera size={18} className="text-white" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Display name (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">昵称</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="显示名称（选填）"
                  className={inputClass}
                />
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                autoFocus
                autoComplete="username"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? '设置密码（至少4位）' : '请输入密码'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium
                         hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-500/25
                         disabled:bg-indigo-300 disabled:shadow-none
                         transition-all duration-200 active:scale-[0.98]
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === 'login' ? '登录中...' : '注册中...'}
                </>
              ) : (
                mode === 'login' ? '登录' : '注册'
              )}
            </button>
          </form>

          {/* Switch hint */}
          <p className="text-center text-xs text-slate-400 mt-5">
            {mode === 'login' ? (
              <>还没有账号？<button onClick={() => switchMode('register')} className="text-indigo-500 hover:underline font-medium">立即注册</button></>
            ) : (
              <>已有账号？<button onClick={() => switchMode('login')} className="text-indigo-500 hover:underline font-medium">去登录</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
