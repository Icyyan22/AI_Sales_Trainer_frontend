import type {
  ScenarioInfo,
  CreateSessionResponse,
  SessionListItem,
  ChatMessage,
  ReportData,
  SSECallbacks,
  PersonalDashboard,
  AdminDashboard,
  AdminUserInfo,
} from '../types'
import { getToken } from '../stores/user'

const BASE = '/api/v1'

function authHeaders(): Record<string, string> {
  const token = getToken()
  if (token) return { Authorization: `Bearer ${token}` }
  return {}
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = { ...authHeaders(), ...(options?.headers as Record<string, string> || {}) }
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || res.statusText)
  }
  return res.json()
}

// ---------- Auth ----------

export interface AuthUserResponse {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  role: string
  created_at: string
}

export async function apiRegister(username: string, password: string, displayName: string) {
  return request<{ token: string; user: AuthUserResponse }>(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, display_name: displayName }),
  })
}

export async function apiLogin(username: string, password: string) {
  return request<{ token: string; user: AuthUserResponse }>(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}

export async function apiGetMe() {
  return request<AuthUserResponse>(`${BASE}/auth/me`)
}

export async function apiUploadAvatar(file: File): Promise<AuthUserResponse> {
  const formData = new FormData()
  formData.append('file', file)
  const token = getToken()
  const res = await fetch(`${BASE}/auth/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || res.statusText)
  }
  return res.json()
}

export async function apiUpdateProfile(displayName: string) {
  return request<AuthUserResponse>(`${BASE}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ display_name: displayName }),
  })
}

export async function fetchScenarios(): Promise<ScenarioInfo[]> {
  const data = await request<{ scenarios: ScenarioInfo[] }>(`${BASE}/scenarios`)
  return data.scenarios
}

export async function fetchSessions(): Promise<SessionListItem[]> {
  const data = await request<{ sessions: SessionListItem[] }>(`${BASE}/sessions`)
  return data.sessions
}

export async function fetchMessages(sessionId: string): Promise<ChatMessage[]> {
  const data = await request<{ session_id: string; messages: ChatMessage[] }>(
    `${BASE}/sessions/${sessionId}/messages`
  )
  return data.messages
}

export async function createSession(
  scenarioId: string,
  difficulty: string
): Promise<CreateSessionResponse> {
  return request<CreateSessionResponse>(`${BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario_id: scenarioId, difficulty }),
  })
}

export async function getSessionStatus(sessionId: string) {
  return request<{
    session_id: string
    scenario_id: string
    status: string
    difficulty: string
    semantic_coverage: Record<string, boolean> | null
    phase: string | null
    turn_count: number | null
    customer_attitude: string | null
    created_at: string
  }>(`${BASE}/sessions/${sessionId}`)
}

export async function completeSession(sessionId: string) {
  return request<{
    session_id: string
    status: string
    final_coverage: Record<string, boolean>
  }>(`${BASE}/sessions/${sessionId}/complete`, { method: 'POST' })
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${BASE}/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || res.statusText)
  }
}

export async function createScenario(data: {
  name: string
  customer_name: string
  customer_role: string
  customer_hospital: string
  customer_background: string
  customer_concerns: string[]
  customer_speaking_style: string
  product_name: string
  product_selling_points: string[]
  semantic_points: {
    id: string
    name: string
    description: string
    match_examples: string[]
    non_match_examples: string[]
  }[]
  opening_message: string
}): Promise<{ id: string; name: string }> {
  return request<{ id: string; name: string }>(`${BASE}/scenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function fetchReport(sessionId: string): Promise<ReportData> {
  return request<ReportData>(`${BASE}/sessions/${sessionId}/report`)
}

// ---------- Dashboard ----------

export async function fetchPersonalDashboard(filters?: {
  days?: number
  scenario_id?: string
  difficulty?: string
}): Promise<PersonalDashboard> {
  const params = new URLSearchParams()
  if (filters?.days) params.set('days', String(filters.days))
  if (filters?.scenario_id) params.set('scenario_id', filters.scenario_id)
  if (filters?.difficulty) params.set('difficulty', filters.difficulty)
  const qs = params.toString()
  return request<PersonalDashboard>(`${BASE}/dashboard/me${qs ? '?' + qs : ''}`)
}

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  return request<AdminDashboard>(`${BASE}/dashboard/admin`)
}

export async function fetchAdminUserDetail(userId: string, filters?: {
  days?: number
  scenario_id?: string
  difficulty?: string
}): Promise<PersonalDashboard> {
  const params = new URLSearchParams()
  if (filters?.days) params.set('days', String(filters.days))
  if (filters?.scenario_id) params.set('scenario_id', filters.scenario_id)
  if (filters?.difficulty) params.set('difficulty', filters.difficulty)
  const qs = params.toString()
  return request<PersonalDashboard>(`${BASE}/dashboard/admin/users/${userId}${qs ? '?' + qs : ''}`)
}

// ---------- User Management ----------

export async function fetchUserList(): Promise<AdminUserInfo[]> {
  const data = await request<{ users: AdminUserInfo[] }>(`${BASE}/auth/users`)
  return data.users
}

export async function updateUserRole(userId: string, role: string): Promise<AdminUserInfo> {
  return request<AdminUserInfo>(`${BASE}/auth/users/${userId}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
}

// ---------- SSE ----------

export async function streamChat(
  sessionId: string,
  content: string,
  callbacks: SSECallbacks
): Promise<void> {
  const res = await fetch(`${BASE}/sessions/${sessionId}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    callbacks.onError(err.detail || res.statusText)
    return
  }

  const reader = res.body?.getReader()
  if (!reader) {
    callbacks.onError('No response body')
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    let currentEvent = ''
    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEvent = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        const dataStr = line.slice(5).trim()
        if (!dataStr) continue
        try {
          const data = JSON.parse(dataStr)
          switch (currentEvent) {
            case 'thinking':
              callbacks.onThinking(data.step, data.message)
              break
            case 'analysis':
              callbacks.onAnalysis(data)
              break
            case 'strategy':
              callbacks.onStrategy(data)
              break
            case 'delta':
              callbacks.onDelta(data.content)
              break
            case 'metadata':
              callbacks.onMetadata(data)
              break
            case 'done':
              callbacks.onDone(data.turn)
              break
          }
        } catch {
          // skip malformed JSON
        }
      }
    }
  }
}
