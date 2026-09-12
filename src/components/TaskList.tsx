'use client';

import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { ExtractedTaskItem, TaskStatus, StudentProfile } from '@/types';
import { Check, Plus, SlidersHorizontal } from 'lucide-react';

interface TaskListProps {
  tasks: ExtractedTaskItem[];
  isLoading: boolean;
  activeStudent: StudentProfile | null;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
  onViewNotice: (task: ExtractedTaskItem) => void;
  onOpenIngest: () => void;
  currentCategoryTab?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  activeStudent,
  onStatusChange,
  onViewNotice,
  onOpenIngest,
  currentCategoryTab = 'all',
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(currentCategoryTab);
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'COMPLETED' | 'SNOOZED'>('PENDING');
  const [onlyRelevant, setOnlyRelevant] = useState<boolean>(false);

  React.useEffect(() => {
    if (currentCategoryTab !== 'all' && currentCategoryTab !== 'deadlines') {
      setActiveCategory(currentCategoryTab);
    } else {
      setActiveCategory('ALL');
    }
  }, [currentCategoryTab]);

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'PLACEMENT', label: 'Placement' },
    { id: 'ACADEMIC', label: 'Academic' },
    { id: 'EXAM', label: 'Exams' },
    { id: 'SCHOLARSHIP', label: 'Scholarships' },
    { id: 'EVENT', label: 'Events' },
    { id: 'REGISTRATION', label: 'Registration' },
  ];

  const filteredTasks = tasks.filter((task) => {
    if (task.status !== statusFilter) return false;
    if (activeCategory !== 'ALL' && task.category !== activeCategory) return false;
    if (selectedUrgency !== 'ALL' && task.urgency !== selectedUrgency) return false;
    if (onlyRelevant && task.relevanceScore < 60) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter and Control Bar */}
      <div className="saas-card p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 text-xs rounded-[4px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FF5A1F] text-white'
                    : 'text-[#A6A29A] hover:bg-[#24221E] hover:text-[#F2F0EA]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right Filter Selectors */}
        <div className="flex items-center space-x-2">
          {/* Status Switcher */}
          <div className="flex items-center bg-[#161512] p-0.5 rounded-[4px] border border-[#2B2924] text-xs">
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-2 py-0.5 rounded-[3px] font-medium transition-colors ${
                statusFilter === 'PENDING' ? 'bg-[#24221E] text-[#F2F0EA]' : 'text-[#6E6A62] hover:text-[#A6A29A]'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-2 py-0.5 rounded-[3px] font-medium transition-colors ${
                statusFilter === 'COMPLETED' ? 'bg-[#24221E] text-[#F2F0EA]' : 'text-[#6E6A62] hover:text-[#A6A29A]'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('SNOOZED')}
              className={`px-2 py-0.5 rounded-[3px] font-medium transition-colors ${
                statusFilter === 'SNOOZED' ? 'bg-[#24221E] text-[#F2F0EA]' : 'text-[#6E6A62] hover:text-[#A6A29A]'
              }`}
            >
              Snoozed
            </button>
          </div>

          {/* Urgency Selector */}
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="bg-[#161512] border border-[#2B2924] text-xs text-[#F2F0EA] rounded-[4px] px-2 py-1 focus:outline-none focus:border-[#3D3A33]"
          >
            <option value="ALL">All Urgency</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Urgency</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Relevance Alignment Filter */}
          <button
            onClick={() => setOnlyRelevant(!onlyRelevant)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-[4px] border font-medium transition-colors ${
              onlyRelevant
                ? 'bg-[#0B6E4F]/20 border-[#0B6E4F] text-[#4ADE80]'
                : 'bg-[#161512] border-[#2B2924] text-[#A6A29A] hover:text-[#F2F0EA]'
            }`}
            title="Filter only circulars matched to your branch and year"
          >
            <span>Targeted ({activeStudent?.branchCode || 'CSE'})</span>
          </button>
        </div>
      </div>

      {/* Task List Feed */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="saas-card p-4 animate-pulse space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-16 h-4 bg-[#2B2924] rounded"></div>
                <div className="w-20 h-4 bg-[#2B2924] rounded"></div>
              </div>
              <div className="w-3/4 h-5 bg-[#2B2924] rounded"></div>
              <div className="w-full h-4 bg-[#2B2924] rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="saas-card p-10 text-center space-y-3">
          <div className="w-9 h-9 rounded-[6px] bg-[#24221E] text-[#A6A29A] flex items-center justify-center mx-auto border border-[#2B2924]">
            <Check className="w-4 h-4 text-[#0B6E4F]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F2F0EA]">No tasks in this view</h4>
            <p className="text-xs text-[#6E6A62] max-w-sm mx-auto mt-1">
              {statusFilter === 'COMPLETED'
                ? 'No completed tasks yet.'
                : 'All clear! Ingest new notices or adjust your filters.'}
            </p>
          </div>
          <button
            onClick={onOpenIngest}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#FF5A1F] hover:bg-[#E04B14] text-white text-xs font-medium rounded-[6px] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Notice</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onViewNotice={onViewNotice}
            />
          ))}
        </div>
      )}
    </div>
  );
};
