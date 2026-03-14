import { Bot } from 'lucide-react'

interface Props {
  message: string
}

export default function ThinkingIndicator({ message }: Props) {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                      bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 shadow-sm">
        <Bot size={15} className="text-indigo-500" />
      </div>
      <div className="glass border border-slate-200/80 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2.5 text-sm text-slate-500">
          <span>{message}</span>
          <span className="flex gap-1">
            <span className="thinking-dot w-1.5 h-1.5 bg-indigo-400 rounded-full inline-block" />
            <span className="thinking-dot w-1.5 h-1.5 bg-indigo-400 rounded-full inline-block" />
            <span className="thinking-dot w-1.5 h-1.5 bg-indigo-400 rounded-full inline-block" />
          </span>
        </div>
      </div>
    </div>
  )
}
