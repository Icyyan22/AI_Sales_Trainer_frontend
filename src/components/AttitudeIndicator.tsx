interface Props {
  attitude: string
}

const ATTITUDES: Record<string, { label: string; position: number; color: string; emoji: string }> = {
  cautious: { label: '谨慎观望', position: 15, color: '#ef4444', emoji: '🛡️' },
  interested: { label: '产生兴趣', position: 50, color: '#f59e0b', emoji: '🤔' },
  convinced: { label: '基本认可', position: 85, color: '#22c55e', emoji: '👍' },
}

export default function AttitudeIndicator({ attitude }: Props) {
  const info = ATTITUDES[attitude] || ATTITUDES.cautious

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <h4 className="text-sm font-semibold text-slate-700 mb-3">客户态度</h4>
      <div className="relative py-1">
        <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-red-300 via-amber-300 to-emerald-300" />
        <div
          className="absolute top-1/2 w-5 h-5 bg-white border-[2.5px] rounded-full shadow-md transition-all duration-700 ease-out"
          style={{
            left: `${info.position}%`,
            borderColor: info.color,
            transform: `translateX(-50%) translateY(-50%)`,
            boxShadow: `0 0 0 3px ${info.color}20, 0 2px 4px rgba(0,0,0,0.1)`,
          }}
        />
      </div>
      <div className="flex justify-between mt-2.5 text-xs text-slate-400">
        <span>谨慎</span>
        <span>感兴趣</span>
        <span>认可</span>
      </div>
      <div className="text-center mt-3 flex items-center justify-center gap-1.5">
        <span className="text-base">{info.emoji}</span>
        <span
          className="text-sm font-semibold"
          style={{ color: info.color }}
        >
          {info.label}
        </span>
      </div>
    </div>
  )
}
