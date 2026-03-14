import { useState, useRef } from 'react'
import { Send } from 'lucide-react'

interface Props {
  onSend: (content: string) => void
  disabled: boolean
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="glass border-t border-slate-200/60 px-4 py-3">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder={disabled ? '等待客户回复...' : '输入您的销售话术... (Shift+Enter 换行)'}
          disabled={disabled}
          rows={1}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none
                     focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white
                     disabled:bg-slate-100 disabled:text-slate-400
                     transition-all duration-200 placeholder:text-slate-400"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !text.trim()}
          className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0
                     bg-indigo-500 text-white
                     hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-500/25
                     disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed
                     transition-all duration-200 active:scale-95"
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  )
}
