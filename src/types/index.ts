export interface CustomerProfile {
  name: string
  role: string
  hospital: string
  background: string
  concerns: string[]
  speaking_style: string
}

export interface ProductInfo {
  name: string
  selling_points: string[]
}

export interface SemanticPoint {
  id: string
  name: string
  description: string
  match_examples: string[]
  non_match_examples: string[]
}

export interface ScenarioInfo {
  id: string
  name: string
  stage: string
  customer_profile: CustomerProfile
  product: ProductInfo
  semantic_points: SemanticPoint[]
  opening_message: string
}

export interface SessionListItem {
  session_id: string
  scenario_id: string
  status: string
  difficulty: string
  created_at: string
  completed_at: string | null
}

export interface CreateSessionResponse {
  session_id: string
  scenario: {
    name: string
    customer_profile: CustomerProfile
    product: ProductInfo
    semantic_points: SemanticPoint[]
  }
  opening_message: {
    role: string
    content: string
  }
  semantic_coverage: Record<string, boolean>
  phase: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  analysis?: ExpressionAnalysis | null
}

export interface ExpressionQuality {
  data_citation: { score: number; note?: string; comment?: string }
  customer_relevance: { score: number; note?: string; comment?: string }
  fab_structure: { score: number; note?: string; comment?: string }
  interaction: { score: number; note?: string; comment?: string }
}

export interface SemanticPointAnalysis {
  point_id: string
  newly_matched: boolean
  confidence: number
  match_level: 'full' | 'partial' | 'none'
  evidence?: string
  reasoning?: string
}

export interface ExpressionAnalysis {
  analysis?: SemanticPointAnalysis[]
  expression_quality?: ExpressionQuality
}

export interface SessionState {
  semantic_coverage: Record<string, boolean>
  coverage_rate: number
  phase: string
  customer_attitude: string
  turn_count: number
}

export interface StrategyThinking {
  target_point: string | null
  strategy: string
  attitude: string
}

export interface SSECallbacks {
  onThinking: (step: string, message: string) => void
  onAnalysis: (data: ExpressionAnalysis) => void
  onStrategy: (data: StrategyThinking) => void
  onDelta: (content: string) => void
  onMetadata: (data: {
    analysis: ExpressionAnalysis | null
    coverage: Record<string, boolean>
    coverage_rate: number
    customer_attitude: string
    phase?: string
  }) => void
  onDone: (turn: number) => void
  onError: (error: string) => void
}

export interface ReportSummary {
  total_turns: number
  coverage_rate: number
  efficiency_score: number
  overall_score: number
}

export interface SemanticDetail {
  point_id: string
  name: string
  covered: boolean
  covered_at_turn: number | null
  confidence: number | null
  evidence: string | null
}

export interface SkillRadar {
  data_citation: number
  customer_relevance: number
  fab_structure: number
  interaction: number
}

export interface ReportFeedback {
  strengths: string[]
  improvements: string[]
  overall: string
}

export interface ReportData {
  session_id: string
  summary: ReportSummary
  semantic_detail: SemanticDetail[]
  skill_radar: SkillRadar
  feedback: ReportFeedback
}

// Dashboard types
export interface DashboardStats {
  total_sessions: number
  completed_sessions: number
  avg_score: number
  best_score: number
  completion_rate: number
}

export interface SkillTrendItem {
  date: string
  session_id: string
  scenario_name: string
  overall_score: number
  data_citation: number
  customer_relevance: number
  fab_structure: number
  interaction: number
}

export interface WeakScenario {
  scenario_id: string
  name: string
  avg_score: number
  session_count: number
}

export interface WeakDimension {
  dimension: string
  label: string
  avg_score: number
}

export interface RecentSession {
  session_id: string
  scenario_id: string
  scenario_name: string
  overall_score: number
  coverage_rate: number
  difficulty: string
  status: string
  created_at: string
}

export interface PersonalDashboard {
  stats: DashboardStats
  skill_trend: SkillTrendItem[]
  weak_areas: {
    weak_scenarios: WeakScenario[]
    weak_dimensions: WeakDimension[]
  }
  recent_sessions: RecentSession[]
}

export interface AdminOverall {
  total_users: number
  total_sessions: number
  avg_score: number
  active_today: number
}

export interface AdminUserStat {
  user_id: string
  username: string
  display_name: string
  role: string
  total_sessions: number
  avg_score: number
  completion_rate: number
  last_active: string | null
}

export interface AdminScenarioStat {
  scenario_id: string
  name: string
  usage_count: number
  avg_score: number
  completion_rate: number
}

export interface AdminDashboard {
  overall: AdminOverall
  user_stats: AdminUserStat[]
  scenario_stats: AdminScenarioStat[]
}

export interface AdminUserInfo {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  role: string
  created_at: string
}
