import { Brain, Target, MessageSquare } from 'lucide-react'
import type { ExpressionAnalysis, StrategyThinking } from '../types'

interface Props {
  analysis: ExpressionAnalysis | null
  strategy: StrategyThinking | null
  isStreaming: boolean
}

const STRATEGY_LABELS: Record<string, string> = {
  direct_question: '直接提问',
  clinical_scenario: '临床场景引导',
  challenge: '质疑要证据',
  acknowledge_and_pivot: '认可并转向',
  summarize_and_close: '总结收尾',
  competitor_comparison: '竞品对比',
  data_deep_dive: '追问数据',
}

export default function ThinkingPanel({ analysis, strategy, isStreaming }: Props) {
  if (!analysis && !strategy && !isStreaming) return null

  const points = analysis?.analysis

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
        <Brain size={16} className="text-purple-500" />
        思考过程
      </h4>

      {/* Analysis results */}
      {points && points.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 mb-1.5">语义分析</p>
          <div className="space-y-1">
            {points.map((p) => (
              <div key={p.point_id} className="flex items-center gap-2 text-xs">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    p.newly_matched && p.match_level === 'full'
                      ? 'bg-green-500'
                      : p.match_level === 'partial'
                        ? 'bg-yellow-500'
                        : 'bg-slate-300'
                  }`}
                />
                <span className="text-slate-600">{p.point_id}</span>
                <span className="text-slate-400">
                  {p.match_level === 'full'
                    ? '完全匹配'
                    : p.match_level === 'partial'
                      ? '部分匹配'
                      : '未匹配'}
                </span>
                {p.confidence > 0 && (
                  <span className="text-slate-400 ml-auto">
                    {Math.round(p.confidence * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategy */}
      {strategy && (
        <div>
          <p className="text-xs text-slate-400 mb-1.5">客户策略</p>
          <div className="flex flex-wrap gap-1.5">
            {strategy.target_point && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded-full">
                <Target size={12} />
                引导 {strategy.target_point}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full">
              <MessageSquare size={12} />
              {STRATEGY_LABELS[strategy.strategy] || strategy.strategy}
            </span>
          </div>
        </div>
      )}

      {/* Streaming indicator */}
      {isStreaming && !strategy && (
        <p className="text-xs text-slate-400 animate-pulse">思考中...</p>
      )}
    </div>
  )
}
