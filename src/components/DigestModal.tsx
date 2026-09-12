'use client';

import React, { useState, useEffect } from 'react';
import { X, Newspaper, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { StudentProfile } from '@/types';

interface DigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStudent: StudentProfile | null;
}

export const DigestModal: React.FC<DigestModalProps> = ({
  isOpen,
  onClose,
  activeStudent,
}) => {
  const [digest, setDigest] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      generateDigest();
    }
  }, [isOpen]);

  const generateDigest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: activeStudent?.id }),
      });
      const data = await res.json();
      setDigest(data.digest || 'No pending items to summarize.');
    } catch (err) {
      console.error('Error generating digest:', err);
      setDigest('Failed to generate briefing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(digest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="saas-card w-full max-w-xl bg-[#1C1B17] border border-[#2B2924] shadow-2xl rounded-[8px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#2B2924] flex items-center justify-between bg-[#161512]">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-[4px] bg-[#FF5A1F] text-white flex items-center justify-center">
              <Newspaper className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F2F0EA]">Weekly Executive Action Briefing</h3>
              <p className="text-[10px] text-[#A6A29A]">Synthesized AI summary for {activeStudent?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6E6A62] hover:text-[#F2F0EA] rounded hover:bg-[#24221E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#A6A29A] space-y-2">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#FF5A1F]" />
              <p>Groq AI analyzing notices and formulating your weekly briefing...</p>
            </div>
          ) : (
            <div className="bg-[#161512] p-4 rounded-[6px] border border-[#2B2924] text-xs text-[#F2F0EA] leading-relaxed whitespace-pre-wrap font-sans">
              {digest}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#2B2924] flex items-center justify-between bg-[#161512]">
          <button
            onClick={generateDigest}
            disabled={isLoading}
            className="text-xs text-[#A6A29A] hover:text-[#F2F0EA] transition-colors disabled:opacity-50"
          >
            Regenerate
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              disabled={isLoading || !digest}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#24221E] hover:bg-[#2D2A25] border border-[#2B2924] text-xs text-[#F2F0EA] rounded-[6px] transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Briefing'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-white bg-[#FF5A1F] hover:bg-[#E04B14] rounded-[6px] font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
