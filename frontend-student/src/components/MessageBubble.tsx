import React, { useState, useEffect } from 'react';
import { Message } from '@/types';
import { User, Bot, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  message: Message;
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';
  const [formattedTime, setFormattedTime] = useState<string>('');
  
  // Fix hydration error by formatting time only on client
  useEffect(() => {
    setFormattedTime(
      new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }, [message.timestamp]);
  
  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
          }`}>
            {message.role === 'assistant' ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                 <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ) : (
              message.content
            )}
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center gap-2">
            {formattedTime && <span>{formattedTime}</span>}
            {message.metadata?.mode === 'Assignment' && !isUser && (
               <span className="flex items-center text-amber-500 gap-1">
                 <AlertTriangle size={10} /> Assignment Mode
               </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;