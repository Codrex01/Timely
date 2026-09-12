'use client';

import React from 'react';
import { CalendarClock } from 'lucide-react';
import { ExtractedTaskItem } from '@/types';

interface DeadlineTimelineProps {
  tasks: ExtractedTaskItem[];
  selectedDateFilter: string | null;
  setSelectedDateFilter: (date: string | null) => void;
}

export const DeadlineTimeline: React.FC<DeadlineTimelineProps> = ({
  tasks,
  selectedDateFilter,
  setSelectedDateFilter,
}) => {
  const days = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const matchingTasks = tasks.filter((t) => {
      if (!t.deadline || t.status === 'COMPLETED' || t.status === 'DISMISSED') return false;
      return t.deadline.startsWith(dateStr);
    });

    const hasCritical = matchingTasks.some((t) => t.urgency === 'CRITICAL' || t.urgency === 'HIGH');

    return {
      dateStr,
      dayName,
      monthDay,
      count: matchingTasks.length,
      hasCritical,
    };
  });

  return (
    <div className="saas-card p-3.5 mb-5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-2">
          <CalendarClock className="w-3.5 h-3.5 text-[#FF5A1F]" />
          <h3 className="text-xs font-semibold text-[#F2F0EA] tracking-tight">
            Upcoming 7-Day Deadlines
          </h3>
        </div>
        {selectedDateFilter && (
          <button
            onClick={() => setSelectedDateFilter(null)}
            className="text-[11px] text-[#FF5A1F] hover:underline"
          >
            Clear Date Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {days.map((d) => {
          const isSelected = selectedDateFilter === d.dateStr;
          return (
            <button
              key={d.dateStr}
              onClick={() => setSelectedDateFilter(isSelected ? null : d.dateStr)}
              className={`p-2 rounded-[6px] border text-left transition-all ${
                isSelected
                  ? 'bg-[#24221E] border-[#FF5A1F] text-[#F2F0EA]'
                  : 'bg-[#161512] border-[#2B2924] hover:border-[#3D3A33] text-[#A6A29A]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-medium ${isSelected ? 'text-[#FF5A1F]' : 'text-[#6E6A62]'}`}>
                  {d.dayName}
                </span>
                {d.count > 0 && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      d.hasCritical
                        ? 'bg-[#D9402B] text-white'
                        : 'bg-[#24221E] text-[#F2F0EA] border border-[#2B2924]'
                    }`}
                  >
                    {d.count}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-[#F2F0EA] mt-1">{d.monthDay}</p>
              <p className="text-[10px] text-[#6E6A62] mt-0.5">
                {d.count === 0 ? 'No tasks' : `${d.count} due`}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
