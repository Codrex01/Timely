'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Loader2,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  Command
} from 'lucide-react';
import { StudentProfile, ChatMessageItem, ExtractedTaskItem } from '@/types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeStudent: StudentProfile | null;
  tasks: ExtractedTaskItem[];
  onSelectTask: (taskId: string) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  activeStudent,
  tasks,
  onSelectTask,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'What do I need to complete this week?',
    'Which placement drives am I eligible for?',
    'Are there any scholarships available for me?',
    'Summarize mid-semester exam deadlines',
  ];

  useEffect(() => {
    if (isOpen && activeStudent) {
      fetch(`/api/chat?studentId=${activeStudent.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages) {
            setMessages(data.messages);
          }
        })
        .catch((err) => console.error('Error fetching chat history:', err));
    }
  }, [isOpen, activeStudent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query || query.trim().length === 0 || isLoading) return;

    const userMsg: ChatMessageItem = {
      id: `temp-${Date.now()}`,
      studentId: activeStudent?.id,
      role: 'user',
      content: query,
      citedNoticeIds: [],
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          studentId: activeStudent?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get answer');

      setMessages((prev) => [...prev, data.message]);
    } catch (err: any) {
      const errorMsg: ChatMessageItem = {
        id: `err-${Date.now()}`,
        studentId: activeStudent?.id,
        role: 'assistant',
        content: `Error retrieving grounded answer: ${err.message}`,
        citedNoticeIds: [],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70">
      <div className="w-full max-w-lg bg-[#161512] border-l border-[#2B2924] flex flex-col h-full shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#2B2924] flex items-center justify-between bg-[#161512]">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-[4px] bg-[#24221E] border border-[#2B2924] text-[#F2F0EA] flex items-center justify-center font-semibold text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F2F0EA]">Notice Intelligence Query</h3>
              <p className="text-[10px] text-[#A6A29A]">
                Grounded context • {activeStudent?.branchCode} Yr {activeStudent?.year}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6E6A62] hover:text-[#F2F0EA] rounded hover:bg-[#24221E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="py-6 text-center space-y-4">
              <div className="w-10 h-10 rounded-[6px] bg-[#1C1B17] border border-[#2B2924] text-[#A6A29A] flex items-center justify-center mx-auto">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#F2F0EA]">
                  Query verified campus notices
                </h4>
                <p className="text-[11px] text-[#6E6A62] max-w-xs mx-auto mt-1">
                  Answers are synthesized strictly from ingested circulars and matched against your student profile.
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="space-y-1.5 pt-2 text-left">
                <p className="text-[10px] font-semibold text-[#6E6A62] uppercase tracking-wider px-1">
                  Suggested Queries:
                </p>
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left p-2.5 bg-[#1C1B17] hover:bg-[#24221E] border border-[#2B2924] hover:border-[#3D3A33] rounded-[6px] text-xs text-[#A6A29A] hover:text-[#F2F0EA] flex items-center justify-between transition-colors group"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6E6A62] group-hover:text-[#F2F0EA] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-5 h-5 rounded-[3px] bg-[#24221E] text-[#A6A29A] border border-[#2B2924] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[9px]">
                    SC
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3 rounded-[6px] leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#FF5A1F] text-white'
                      : 'bg-[#1C1B17] border border-[#2B2924] text-[#F2F0EA]'
                  }`}
                >
                  {msg.content}

                  {/* Cited Notices Chips */}
                  {!isUser && msg.citedNoticeIds && msg.citedNoticeIds.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[#2B2924]">
                      <p className="text-[9px] font-semibold text-[#6E6A62] uppercase tracking-wider mb-1">
                        Referenced Notices:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {msg.citedNoticeIds.map((citedId, idx) => {
                          const task = tasks.find((t) => t.id === citedId || t.noticeId === citedId);
                          return (
                            <button
                              key={idx}
                              onClick={() => task && onSelectTask(task.id)}
                              className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#161512] hover:bg-[#24221E] text-[#A6A29A] hover:text-[#F2F0EA] border border-[#2B2924] rounded-[4px] text-[10px] transition-colors"
                            >
                              <span>{task ? task.title.slice(0, 24) + '...' : `Notice #${idx + 1}`}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {isUser && (
                  <div className="w-5 h-5 rounded-[3px] bg-[#24221E] text-[#A6A29A] border border-[#2B2924] flex items-center justify-center shrink-0 mt-0.5 font-semibold text-[9px]">
                    {activeStudent?.name.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 text-xs justify-start">
              <div className="w-5 h-5 rounded-[3px] bg-[#24221E] text-[#A6A29A] border border-[#2B2924] flex items-center justify-center shrink-0 font-bold text-[9px]">
                SC
              </div>
              <div className="bg-[#1C1B17] border border-[#2B2924] p-2.5 rounded-[6px] text-[#A6A29A] flex items-center space-x-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5A1F]" />
                <span>Searching notice index...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#2B2924] bg-[#161512]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask about circulars, eligibility, exams..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-[#1C1B17] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] placeholder-[#6E6A62] rounded-[6px] px-3 py-2 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-3 py-2 bg-[#FF5A1F] hover:bg-[#E04B14] text-white rounded-[6px] text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
