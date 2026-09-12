'use client';

import React from 'react';
import { X, FileText } from 'lucide-react';
import { ExtractedTaskItem } from '@/types';

interface NoticeDetailModalProps {
  task: ExtractedTaskItem | null;
  onClose: () => void;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="saas-card w-full max-w-2xl bg-[#1C1B17] border border-[#2B2924] shadow-2xl rounded-[8px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#2B2924] flex items-center justify-between bg-[#161512]">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-[4px] bg-[#24221E] border border-[#2B2924] text-[#F2F0EA] flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F2F0EA] truncate max-w-md">
                {task.title}
              </h3>
              <p className="text-[10px] text-[#A6A29A]">
                {task.category} • Source: {task.notice?.source || 'Notice'}
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

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-[#161512] p-2.5 rounded-[6px] border border-[#2B2924]">
              <span className="text-[#6E6A62] text-[10px] uppercase font-semibold block">Deadline</span>
              <span className="font-semibold text-[#F2F0EA] mt-0.5 block">
                {task.deadlineFormatted || task.deadline || 'Ongoing'}
              </span>
            </div>
            <div className="bg-[#161512] p-2.5 rounded-[6px] border border-[#2B2924]">
              <span className="text-[#6E6A62] text-[10px] uppercase font-semibold block">Priority Level</span>
              <span className="font-semibold text-[#F2F0EA] mt-0.5 block">{task.urgency}</span>
            </div>
            <div className="bg-[#161512] p-2.5 rounded-[6px] border border-[#2B2924]">
              <span className="text-[#6E6A62] text-[10px] uppercase font-semibold block">Relevance Match</span>
              <span className="font-semibold text-[#4ADE80] mt-0.5 block">{task.relevanceScore}%</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold text-[#6E6A62] uppercase tracking-wider mb-1">
              Executive Summary
            </h4>
            <div className="bg-[#161512] p-3 rounded-[6px] border border-[#2B2924] text-xs text-[#F2F0EA] leading-relaxed">
              {task.summary}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <h4 className="text-[10px] font-semibold text-[#6E6A62] uppercase tracking-wider mb-1">
                Eligibility Rules
              </h4>
              <div className="bg-[#161512] p-3 rounded-[6px] border border-[#2B2924] text-xs text-[#A6A29A]">
                {task.eligibility}
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold text-[#6E6A62] uppercase tracking-wider mb-1">
                Target Branches / Years
              </h4>
              <div className="bg-[#161512] p-3 rounded-[6px] border border-[#2B2924] text-xs text-[#A6A29A]">
                Branches: {Array.isArray(task.targetBranches) ? task.targetBranches.join(', ') : 'All'}
                <br />
                Years: {Array.isArray(task.targetYears) ? task.targetYears.join(', ') : 'All'}
              </div>
            </div>
          </div>

          {task.requiredActions && task.requiredActions.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-[#6E6A62] uppercase tracking-wider mb-1">
                Required Action Steps
              </h4>
              <div className="bg-[#161512] p-3 rounded-[6px] border border-[#2B2924] space-y-1 text-xs text-[#F2F0EA]">
                {task.requiredActions.map((action, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="text-[#FF5A1F] font-bold">{i + 1}.</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.notice?.rawContent && (
            <div>
              <h4 className="text-[10px] font-semibold text-[#6E6A62] uppercase tracking-wider mb-1">
                Original Unstructured Notice
              </h4>
              <pre className="bg-[#161512] p-3.5 rounded-[6px] border border-[#2B2924] text-[11px] text-[#A6A29A] whitespace-pre-wrap font-mono leading-relaxed max-h-52 overflow-y-auto">
                {task.notice.rawContent}
              </pre>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#2B2924] flex justify-end bg-[#161512]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-[#F2F0EA] bg-[#24221E] hover:bg-[#2D2A25] border border-[#2B2924] rounded-[6px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
