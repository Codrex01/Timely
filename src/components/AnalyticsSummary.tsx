'use client';

import React from 'react';
import { FileText, AlertCircle, CheckCheck, Compass } from 'lucide-react';
import { ExtractedTaskItem, StudentProfile } from '@/types';

interface AnalyticsSummaryProps {
  tasks: ExtractedTaskItem[];
  activeStudent: StudentProfile | null;
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ tasks, activeStudent }) => {
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING');
  const criticalTasks = pendingTasks.filter((t) => t.urgency === 'CRITICAL' || t.urgency === 'HIGH');
  const personalizedTasks = pendingTasks.filter((t) => t.relevanceScore >= 65);
  
  const avgRelevance = pendingTasks.length > 0
    ? Math.round(pendingTasks.reduce((acc, t) => acc + t.relevanceScore, 0) / pendingTasks.length)
    : 0;

  const stats = [
    {
      label: 'Actionable Notices',
      value: pendingTasks.length,
      subtext: `${tasks.filter((t) => t.status === 'COMPLETED').length} resolved`,
      icon: FileText,
      iconColor: '#A6A29A',
    },
    {
      label: 'Critical Deadlines',
      value: criticalTasks.length,
      subtext: 'Due within 7 days',
      icon: AlertCircle,
      iconColor: '#D9402B',
    },
    {
      label: 'Profile Matched',
      value: personalizedTasks.length,
      subtext: `Targeted to ${activeStudent?.branchCode || 'CSE'} (Yr ${activeStudent?.year || '3'})`,
      icon: Compass,
      iconColor: '#FF5A1F',
    },
    {
      label: 'Average Relevance',
      value: `${avgRelevance}%`,
      subtext: 'Relevance alignment score',
      icon: CheckCheck,
      iconColor: '#0B6E4F',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="saas-card p-3.5 flex items-center justify-between transition-colors hover:border-[#3D3A33]"
          >
            <div>
              <p className="text-[10px] font-semibold text-[#A6A29A] uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-xl font-semibold text-[#F2F0EA] mt-0.5 tracking-tight">
                {stat.value}
              </p>
              <p className="text-[11px] text-[#6E6A62] mt-0.5">{stat.subtext}</p>
            </div>
            <div className="w-8 h-8 rounded-[6px] bg-[#24221E] border border-[#2B2924] flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" style={{ color: stat.iconColor }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
