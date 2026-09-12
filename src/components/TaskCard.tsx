'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Check,
  Eye,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BellOff,
  Trash2,
  CheckSquare,
  Square,
  FileText,
  Mail,
  Upload,
  CalendarPlus,
  Download
} from 'lucide-react';
import { ExtractedTaskItem, TaskStatus } from '@/types';
import { generateGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendarExport';

interface TaskCardProps {
  task: ExtractedTaskItem;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onViewNotice: (task: ExtractedTaskItem) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onViewNotice,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});

  const toggleActionCheck = (index: number) => {
    setCheckedActions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const urgencyConfig = {
    CRITICAL: {
      borderLeft: 'border-l-[#D9402B]',
      badge: 'bg-[#D9402B]/15 text-[#F87171] border-[#D9402B]/30',
      label: 'Critical Priority',
    },
    HIGH: {
      borderLeft: 'border-l-[#FF5A1F]',
      badge: 'bg-[#FF5A1F]/15 text-[#FF5A1F] border-[#FF5A1F]/30',
      label: 'High Priority',
    },
    MEDIUM: {
      borderLeft: 'border-l-[#3D3A33]',
      badge: 'bg-[#24221E] text-[#A6A29A] border-[#2B2924]',
      label: 'Medium',
    },
    LOW: {
      borderLeft: 'border-l-[#2B2924]',
      badge: 'bg-[#1C1B17] text-[#6E6A62] border-[#2B2924]',
      label: 'Standard',
    },
  }[task.urgency] || {
    borderLeft: 'border-l-[#2B2924]',
    badge: 'bg-[#1C1B17] text-[#6E6A62] border-[#2B2924]',
    label: 'Standard',
  };

  const categoryDotColor = {
    PLACEMENT: '#FF5A1F',
    ACADEMIC: '#3B82F6',
    EXAM: '#D9402B',
    SCHOLARSHIP: '#0B6E4F',
    EVENT: '#A855F7',
    CLUB: '#06B6D4',
    REGISTRATION: '#F59E0B',
  }[task.category] || '#A6A29A';

  const SourceIcon = task.notice?.source === 'EMAIL' ? Mail : task.notice?.source === 'UPLOAD' ? Upload : FileText;

  const isCompleted = task.status === 'COMPLETED';
  const isSnoozed = task.status === 'SNOOZED';

  return (
    <div
      className={`saas-card border-l-4 ${urgencyConfig.borderLeft} p-4 transition-colors relative ${
        isCompleted ? 'opacity-50 bg-[#161512]' : 'bg-[#1C1B17]'
      }`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[4px] bg-[#24221E] border border-[#2B2924] text-[10px] font-medium text-[#F2F0EA]">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: categoryDotColor }}
            />
            <span>{task.category}</span>
          </div>

          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border ${urgencyConfig.badge}`}>
            {urgencyConfig.label}
          </span>

          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-[4px] border ${
              task.relevanceScore >= 80
                ? 'bg-[#0B6E4F]/15 text-[#4ADE80] border-[#0B6E4F]/30'
                : 'bg-[#24221E] text-[#A6A29A] border-[#2B2924]'
            }`}
          >
            {task.relevanceScore}% Match
          </span>
        </div>

        {/* Source info & actions */}
        <div className="flex items-center space-x-2 shrink-0 text-[#6E6A62] text-[11px]">
          <div className="flex items-center space-x-1">
            <SourceIcon className="w-3 h-3 text-[#A6A29A]" />
            <span className="capitalize">{task.notice?.source?.toLowerCase() || 'Notice'}</span>
          </div>

          {/* Calendar Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowCalendarMenu(!showCalendarMenu)}
              className="p-1 text-[#A6A29A] hover:text-[#F2F0EA] hover:bg-[#24221E] rounded transition-colors"
              title="Add deadline to Calendar"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
            </button>

            {showCalendarMenu && (
              <div className="absolute right-0 top-6 w-44 bg-[#1C1B17] border border-[#2B2924] rounded-[6px] shadow-xl p-1 z-30 space-y-0.5">
                <a
                  href={generateGoogleCalendarUrl(task)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowCalendarMenu(false)}
                  className="flex items-center space-x-1.5 px-2 py-1.5 text-[11px] text-[#F2F0EA] hover:bg-[#24221E] rounded transition-colors"
                >
                  <Calendar className="w-3 h-3 text-[#FF5A1F]" />
                  <span>Google Calendar</span>
                </a>
                <button
                  onClick={() => {
                    downloadIcsFile(task);
                    setShowCalendarMenu(false);
                  }}
                  className="w-full text-left flex items-center space-x-1.5 px-2 py-1.5 text-[11px] text-[#F2F0EA] hover:bg-[#24221E] rounded transition-colors"
                >
                  <Download className="w-3 h-3 text-[#A6A29A]" />
                  <span>Download .ics File</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onViewNotice(task)}
            className="p-1 text-[#A6A29A] hover:text-[#F2F0EA] hover:bg-[#24221E] rounded transition-colors"
            title="Inspect full circular"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h4 className={`text-sm font-semibold text-[#F2F0EA] mb-1.5 leading-snug ${isCompleted ? 'line-through text-[#6E6A62]' : ''}`}>
        {task.title}
      </h4>

      {/* Summary */}
      <p className="text-xs text-[#A6A29A] mb-3 leading-relaxed max-w-[65ch]">
        {task.summary}
      </p>

      {/* Key Metadata Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#161512] p-2.5 rounded-[6px] border border-[#2B2924] mb-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5 text-[#A6A29A] shrink-0" />
          <span className="text-[#6E6A62]">Deadline:</span>
          <span className={`font-medium ${task.urgency === 'CRITICAL' ? 'text-[#F87171]' : 'text-[#F2F0EA]'}`}>
            {task.deadlineFormatted || task.deadline || 'Ongoing'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[#6E6A62]">Eligibility:</span>
          <span className="text-[#F2F0EA] font-medium truncate" title={task.eligibility}>
            {task.eligibility}
          </span>
        </div>
      </div>

      {/* Action Steps Checklist */}
      {task.requiredActions && task.requiredActions.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1.5 text-xs text-[#A6A29A] hover:text-[#F2F0EA] font-medium transition-colors"
          >
            <span>{task.requiredActions.length} Action Step{task.requiredActions.length > 1 ? 's' : ''} Required</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="mt-2 pl-2 border-l-2 border-[#2B2924] space-y-1.5 pt-1">
              {task.requiredActions.map((action, idx) => {
                const isChecked = !!checkedActions[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleActionCheck(idx)}
                    className="flex items-start space-x-2 text-xs text-[#A6A29A] cursor-pointer hover:text-[#F2F0EA]"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-[#0B6E4F] mt-0.5 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-[#6E6A62] mt-0.5 shrink-0" />
                    )}
                    <span className={isChecked ? 'line-through text-[#6E6A62]' : ''}>{action}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#2B2924]">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-[#6E6A62] bg-[#161512] px-2 py-0.5 rounded-[4px] border border-[#2B2924]">
            Target: {Array.isArray(task.targetBranches) ? task.targetBranches.join(', ') : 'All'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {isCompleted ? (
            <button
              onClick={() => onStatusChange(task.id, 'PENDING')}
              className="flex items-center space-x-1 px-2.5 py-1 bg-[#24221E] hover:bg-[#2D2A25] text-[#A6A29A] hover:text-[#F2F0EA] text-xs rounded-[4px] border border-[#2B2924] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
          ) : (
            <button
              onClick={() => onStatusChange(task.id, 'COMPLETED')}
              className="flex items-center space-x-1 px-2.5 py-1 bg-[#0B6E4F] hover:bg-[#09573E] text-white text-xs font-medium rounded-[4px] transition-colors"
            >
              <Check className="w-3 h-3" />
              <span>Done</span>
            </button>
          )}

          {!isCompleted && (
            <button
              onClick={() => onStatusChange(task.id, isSnoozed ? 'PENDING' : 'SNOOZED')}
              className="p-1 text-[#6E6A62] hover:text-[#A6A29A] hover:bg-[#24221E] rounded-[4px] transition-colors"
              title={isSnoozed ? 'Unsnooze' : 'Snooze'}
            >
              <BellOff className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onStatusChange(task.id, 'DISMISSED')}
            className="p-1 text-[#6E6A62] hover:text-[#D9402B] hover:bg-[#24221E] rounded-[4px] transition-colors"
            title="Archive task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
