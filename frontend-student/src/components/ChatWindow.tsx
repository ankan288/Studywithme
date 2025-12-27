import React from 'react';
import { Message } from '@/types';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages: Message[];
  loading: boolean;
}

export const ChatWindow: React.FC<Props> = ({ messages, loading }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
      <div className="max-w-3xl mx-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="flex justify-start mb-6">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
