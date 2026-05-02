import { timeAgo } from '../../utils/helpers'
import { Check, CheckCheck } from 'lucide-react'

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
        isOwn
          ? 'bg-teal-500 text-navy-950 rounded-br-sm'
          : 'bg-navy-800 text-white rounded-bl-sm'
      }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] ${isOwn ? 'text-navy-700' : 'text-navy-400'}`}>
            {timeAgo(message.createdAt)}
          </span>
          {isOwn && (
            message.read
              ? <CheckCheck size={10} className="text-navy-700" />
              : <Check size={10} className="text-navy-700" />
          )}
        </div>
      </div>
    </div>
  )
}
