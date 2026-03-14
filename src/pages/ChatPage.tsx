import { useEffect, useRef, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Hash, Loader2 } from 'lucide-react'
import ChatMessageComponent from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import ThinkingIndicator from '../components/ThinkingIndicator'
import CoveragePanel from '../components/CoveragePanel'
import ScoreCard from '../components/ScoreCard'
import AttitudeIndicator from '../components/AttitudeIndicator'
import {
  streamChat,
  getSessionStatus,
  fetchMessages,
  fetchScenarios,
} from '../api/client'
import type {
  ChatMessage,
  SemanticPoint,
  CustomerProfile,
  ProductInfo,
  ExpressionQuality,
} from '../types'

interface ScenarioData {
  name: string
  customer_profile: CustomerProfile
  product: ProductInfo
  semantic_points: SemanticPoint[]
}

interface LocationState {
  scenario: ScenarioData
  openingMessage: { role: string; content: string }
  semanticCoverage: Record<string, boolean>
}

export default function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const locState = location.state as LocationState | null

  const [scenarioData, setScenarioData] = useState<ScenarioData | null>(
    locState?.scenario ?? null
  )
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [coverage, setCoverage] = useState<Record<string, boolean>>(
    locState?.semanticCoverage ?? {}
  )
  const [attitude, setAttitude] = useState('cautious')
  const [turnCount, setTurnCount] = useState(0)
  const [phase, setPhase] = useState('active')
  const [isStreaming, setIsStreaming] = useState(false)
  const [thinkingMsg, setThinkingMsg] = useState('')
  const [latestScore, setLatestScore] = useState<ExpressionQuality | null>(null)
  const [restoring, setRestoring] = useState(!locState)
  const streamingMsgIdRef = useRef<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  // Initialize from location state (new session)
  useEffect(() => {
    if (locState && !initializedRef.current) {
      initializedRef.current = true
      setMessages([
        {
          id: 'opening',
          role: 'assistant',
          content: locState.openingMessage.content,
        },
      ])
    }
  }, [locState])

  // Restore session from API (returning to existing session)
  useEffect(() => {
    if (locState || !sessionId || initializedRef.current) return
    initializedRef.current = true

    async function restore() {
      try {
        const [status, msgs, scenarios] = await Promise.all([
          getSessionStatus(sessionId!),
          fetchMessages(sessionId!),
          fetchScenarios(),
        ])

        const scenario = scenarios.find((s) => s.id === status.scenario_id)
        if (scenario) {
          setScenarioData({
            name: scenario.name,
            customer_profile: scenario.customer_profile,
            product: scenario.product,
            semantic_points: scenario.semantic_points,
          })
        }

        setMessages(
          msgs.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            analysis: m.analysis,
          }))
        )

        if (status.semantic_coverage) setCoverage(status.semantic_coverage)
        if (status.customer_attitude) setAttitude(status.customer_attitude)
        if (status.turn_count != null) setTurnCount(status.turn_count)
        if (status.phase) setPhase(status.phase)
        if (status.status === 'completed') setPhase('completed')
      } catch (err) {
        console.error('Failed to restore session:', err)
      } finally {
        setRestoring(false)
      }
    }

    restore()
  }, [locState, sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinkingMsg])

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">无效的会话</p>
          <button onClick={() => navigate('/')} className="text-indigo-500 hover:underline">
            返回首页
          </button>
        </div>
      </div>
    )
  }

  if (restoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 size={32} className="text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">恢复对话中...</p>
        </div>
      </div>
    )
  }

  const handleSend = async (content: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    }
    setMessages((prev) => [...prev, userMsg])
    setIsStreaming(true)
    setThinkingMsg('正在分析您的表达...')
    streamingMsgIdRef.current = null

    await streamChat(sessionId, content, {
      onThinking: (_step, message) => {
        setThinkingMsg(message)
      },
      onAnalysis: (data) => {
        if (data.expression_quality) {
          setLatestScore(data.expression_quality)
        }
      },
      onStrategy: () => {
        // strategy received, persona will start responding
      },
      onDelta: (deltaContent) => {
        setThinkingMsg('')
        if (!streamingMsgIdRef.current) {
          const msgId = `ai-${Date.now()}`
          streamingMsgIdRef.current = msgId
          setMessages((prev) => [
            ...prev,
            { id: msgId, role: 'assistant', content: deltaContent },
          ])
        } else {
          const msgId = streamingMsgIdRef.current
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId ? { ...m, content: m.content + deltaContent } : m
            )
          )
        }
      },
      onMetadata: (data) => {
        if (data.coverage) setCoverage(data.coverage)
        if (data.customer_attitude) setAttitude(data.customer_attitude)
        if (data.phase === 'completed') {
          setPhase('completed')
        }
      },
      onDone: (turn) => {
        setTurnCount(turn)
        setIsStreaming(false)
        streamingMsgIdRef.current = null
      },
      onError: (error) => {
        console.error('SSE error:', error)
        setThinkingMsg('')
        setIsStreaming(false)
        streamingMsgIdRef.current = null
      },
    })
  }

  const isCompleted = phase === 'completed'
  const scenarioName = scenarioData?.name ?? '训练'
  const customerName = scenarioData?.customer_profile?.name ?? '客户'

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="glass border-b border-slate-200/60 px-4 py-3 flex items-center gap-3 shadow-sm z-10">
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600
                     hover:bg-slate-100 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-slate-800 truncate">{scenarioName}</h1>
          <p className="text-xs text-slate-500">与 {customerName} 对话中</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
          <Hash size={13} />
          <span className="text-xs font-semibold">第 {turnCount} 轮</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0" style={{ flex: '7 1 0%' }}>
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
            {messages.map((msg) => (
              <ChatMessageComponent
                key={msg.id}
                message={msg}
                isStreaming={isStreaming && msg.id === streamingMsgIdRef.current}
              />
            ))}
            {thinkingMsg && <ThinkingIndicator message={thinkingMsg} />}
            {isCompleted && !isStreaming && (
              <div className="flex justify-center py-6 animate-fade-in">
                <button
                  onClick={() => navigate(`/report/${sessionId}`)}
                  className="flex items-center gap-2 px-7 py-3 text-white
                             bg-indigo-500
                             rounded-full text-sm font-medium
                             hover:shadow-lg hover:shadow-indigo-500/30
                             transition-all duration-300 active:scale-95"
                >
                  <FileText size={16} />
                  查看训练报告
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            onSend={handleSend}
            disabled={isStreaming || isCompleted}
          />
        </div>

        {/* Right panel */}
        {scenarioData && (
          <div
            className="border-l border-slate-200/60 bg-slate-50/80 overflow-y-auto p-4 space-y-4 hidden lg:block"
            style={{ flex: '3 1 0%' }}
          >
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">场景信息</h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-8">客户</span>
                  <span className="font-medium">{scenarioData.customer_profile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-8">职位</span>
                  <span>{scenarioData.customer_profile.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-8">医院</span>
                  <span>{scenarioData.customer_profile.hospital}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-8">产品</span>
                  <span className="font-medium text-indigo-600">{scenarioData.product.name}</span>
                </div>
              </div>
            </div>

            <CoveragePanel
              semanticPoints={scenarioData.semantic_points}
              coverage={coverage}
            />

            <AttitudeIndicator attitude={attitude} />

            <ScoreCard quality={latestScore} />
          </div>
        )}
      </div>
    </div>
  )
}
