import { User, Bot } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '../types'

interface Props {
  message: ChatMessageType
  isStreaming?: boolean
}

export default function ChatMessage({ message, isStreaming }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
          ${isUser
            ? 'bg-indigo-500'
            : 'bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200'
          }`}
      >
        {isUser ? (
          <User size={15} className="text-white" />
        ) : (
          <Bot size={15} className="text-indigo-500" />
        )}
      </div>
      <div
        className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
          ${
            isUser
              ? 'bg-indigo-500 text-white rounded-2xl rounded-br-md shadow-md shadow-indigo-500/20'
              : 'bg-white text-slate-700 border border-slate-200/80 rounded-2xl rounded-bl-md shadow-sm'
          }
          ${isStreaming ? 'typing-cursor' : ''}`}
      >
        {message.content}
      </div>
    </div>
  )
}
