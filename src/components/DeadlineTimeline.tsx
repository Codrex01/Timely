'use client';

import React, { useState } from 'react';
import { CalendarClock, CalendarDays, ChevronLeft, ChevronRight, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'7d' | 'month'>('7d');
  const [currentMonthOffset, setCurrentMonthOffset] = useState<number>(0);

  // 1. Compute 7-Day Strip Days
  const sevenDays = Array.from({ length: 7 }).map((_, index) => {
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
      tasks: matchingTasks,
    };
  });

  // 2. Compute Monthly Calendar Grid Days
  const baseDate = new Date();
  baseDate.setMonth(baseDate.getMonth() + currentMonthOffset);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const monthName = baseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Convert to Mon (0) - Sun (6)

  const monthGridDays = [];

  // Padding days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    monthGridDays.push({
      dayNum,
      dateStr: '',
      isCurrentMonth: false,
      count: 0,
      hasCritical: false,
      tasks: [],
    });
  }

  // Days in current month
  const todayStr = new Date().toISOString().split('T')[0];
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    // Format YYYY-MM-DD
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const matchingTasks = tasks.filter((t) => {
      if (!t.deadline || t.status === 'COMPLETED' || t.status === 'DISMISSED') return false;
      return t.deadline.startsWith(dateStr);
    });

    const hasCritical = matchingTasks.some((t) => t.urgency === 'CRITICAL' || t.urgency === 'HIGH');

    monthGridDays.push({
      dayNum: day,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      count: matchingTasks.length,
      hasCritical,
      tasks: matchingTasks,
    });
  }

  // Padding days for next month to complete rows of 7
  const remainingCells = 35 - monthGridDays.length;
  for (let day = 1; day <= (remainingCells > 0 ? remainingCells : (42 - monthGridDays.length)); day++) {
    monthGridDays.push({
      dayNum: day,
      dateStr: '',
      isCurrentMonth: false,
      count: 0,
      hasCritical: false,
      tasks: [],
    });
  }

  return (
    <div className="saas-card p-3.5 mb-5 transition-all">
      {/* Header with Title & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <CalendarClock className="w-3.5 h-3.5 text-[#FF5A1F]" />
          <h3 className="text-xs font-semibold text-[#F2F0EA] tracking-tight">
            {viewMode === '7d' ? 'Upcoming 7-Day Deadlines' : `Monthly Calendar View — ${monthName}`}
          </h3>
          {selectedDateFilter && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#FF5A1F]/20 text-[#FF5A1F] border border-[#FF5A1F]/30 font-medium">
              Filtered: {selectedDateFilter}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Clear Filter Button */}
          {selectedDateFilter && (
            <button
              onClick={() => setSelectedDateFilter(null)}
              className="text-[11px] text-[#FF5A1F] hover:underline mr-1"
            >
              Clear Filter
            </button>
          )}

          {/* Month Navigation if in Month Mode */}
          {viewMode === 'month' && (
            <div className="flex items-center space-x-1 bg-[#161512] border border-[#2B2924] rounded-[4px] p-0.5">
              <button
                onClick={() => setCurrentMonthOffset((prev) => prev - 1)}
                className="p-1 text-[#A6A29A] hover:text-[#F2F0EA] rounded hover:bg-[#24221E] transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => setCurrentMonthOffset(0)}
                className="text-[10px] px-1.5 py-0.5 font-medium text-[#A6A29A] hover:text-[#F2F0EA]"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonthOffset((prev) => prev + 1)}
                className="p-1 text-[#A6A29A] hover:text-[#F2F0EA] rounded hover:bg-[#24221E] transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* View Mode Toggle: 7 Days vs Month */}
          <div className="flex items-center bg-[#161512] p-0.5 rounded-[4px] border border-[#2B2924] text-xs">
            <button
              onClick={() => setViewMode('7d')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-[3px] font-medium text-[11px] transition-colors ${
                viewMode === '7d'
                  ? 'bg-[#24221E] text-[#F2F0EA] shadow-sm'
                  : 'text-[#6E6A62] hover:text-[#A6A29A]'
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              <span>7 Days</span>
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-[3px] font-medium text-[11px] transition-colors ${
                viewMode === 'month'
                  ? 'bg-[#24221E] text-[#F2F0EA] shadow-sm'
                  : 'text-[#6E6A62] hover:text-[#A6A29A]'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Monthly</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. 7-DAY STRIP VIEW */}
      {viewMode === '7d' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {sevenDays.map((d) => {
            const isSelected = selectedDateFilter === d.dateStr;
            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDateFilter(isSelected ? null : d.dateStr)}
                className={`p-2 rounded-[6px] border text-left transition-all ${
                  isSelected
                    ? 'bg-[#24221E] border-[#FF5A1F] text-[#F2F0EA] ring-1 ring-[#FF5A1F]/30'
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
                          ? 'bg-[#D9402B] text-white animate-pulse'
                          : 'bg-[#FF5A1F] text-white'
                      }`}
                    >
                      {d.count}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-[#F2F0EA] mt-1">{d.monthDay}</p>
                <p className="text-[10px] text-[#6E6A62] mt-0.5 truncate">
                  {d.count === 0 ? 'No tasks' : d.tasks[0]?.title.split(' ')[0] + (d.count > 1 ? ` +${d.count - 1}` : '')}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. MONTHLY CALENDAR GRID VIEW */}
      {viewMode === 'month' && (
        <div className="space-y-1.5">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#6E6A62] pb-1 border-b border-[#2B2924]">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {monthGridDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    className="min-h-[52px] p-1.5 rounded-[4px] bg-[#161512]/40 border border-transparent text-[#3D3A33] text-[11px]"
                  >
                    <span>{cell.dayNum}</span>
                  </div>
                );
              }

              const isSelected = selectedDateFilter === cell.dateStr;

              return (
                <button
                  key={idx}
                  onClick={() => cell.dateStr && setSelectedDateFilter(isSelected ? null : cell.dateStr)}
                  className={`min-h-[52px] p-1.5 rounded-[4px] border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-[#24221E] border-[#FF5A1F] ring-1 ring-[#FF5A1F]/30 text-[#F2F0EA]'
                      : cell.isToday
                      ? 'bg-[#1C1B17] border-[#FF5A1F]/40 text-[#F2F0EA]'
                      : 'bg-[#161512] border-[#2B2924] hover:border-[#3D3A33] text-[#A6A29A]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[11px] font-medium ${cell.isToday ? 'text-[#FF5A1F] font-bold' : ''}`}>
                      {cell.dayNum}
                    </span>
                    {cell.count > 0 && (
                      <span
                        className={`text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold text-white ${
                          cell.hasCritical ? 'bg-[#D9402B]' : 'bg-[#FF5A1F]'
                        }`}
                      >
                        {cell.count}
                      </span>
                    )}
                  </div>

                  {cell.count > 0 ? (
                    <div className="w-full truncate text-[9px] text-[#A6A29A] font-medium leading-tight">
                      {cell.tasks[0]?.title}
                    </div>
                  ) : (
                    <div className="h-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
