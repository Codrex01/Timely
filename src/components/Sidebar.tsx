'use client';

import React from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  Briefcase,
  GraduationCap,
  MessageSquareText,
  Plus,
  Mail,
  User,
  RotateCcw,
  Award,
  Command,
  Newspaper
} from 'lucide-react';
import { StudentProfile } from '@/types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeStudent: StudentProfile | null;
  onOpenIngest: () => void;
  onOpenChat: () => void;
  onOpenProfile: () => void;
  onOpenDigest: () => void;
  onResetSeed: () => void;
  isSeeding: boolean;
  urgentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  activeStudent,
  onOpenIngest,
  onOpenChat,
  onOpenProfile,
  onOpenDigest,
  onResetSeed,
  isSeeding,
  urgentCount,
}) => {
  const mainNavItems = [
    { id: 'all', label: 'All Tasks', icon: LayoutDashboard, count: null },
    { id: 'deadlines', label: 'Upcoming Deadlines', icon: CalendarClock, count: urgentCount > 0 ? urgentCount : null },
    { id: 'PLACEMENT', label: 'Placement & Career', icon: Briefcase, count: null },
    { id: 'ACADEMIC', label: 'Academics & Exams', icon: GraduationCap, count: null },
    { id: 'SCHOLARSHIP', label: 'Scholarships & Grants', icon: Award, count: null },
  ];

  return (
    <aside className="w-60 bg-[#161512] border-r border-[#2B2924] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Top Brand Section */}
      <div>
        <div className="p-4 border-b border-[#2B2924] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#FF5A1F] text-white flex items-center justify-center font-bold text-xs tracking-tight">
              SC
            </div>
            <div>
              <h1 className="font-semibold text-xs text-[#F2F0EA] tracking-tight">Smart Campus</h1>
              <p className="text-[10px] text-[#A6A29A]">Task Intelligence</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 space-y-1.5 border-b border-[#2B2924]">
          <button
            onClick={onOpenIngest}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-[#FF5A1F] hover:bg-[#E04B14] text-white rounded-[6px] text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Notice</span>
          </button>

          <button
            onClick={onOpenDigest}
            className="w-full flex items-center justify-between py-1.5 px-3 bg-[#1C1B17] hover:bg-[#24221E] text-[#F2F0EA] border border-[#2B2924] hover:border-[#3D3A33] rounded-[6px] text-xs font-medium transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Newspaper className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>Weekly Briefing</span>
            </div>
            <span className="text-[9px] bg-[#24221E] border border-[#2B2924] text-[#A6A29A] px-1 py-0.2 rounded font-medium">
              AI
            </span>
          </button>

          <button
            onClick={onOpenChat}
            className="w-full flex items-center justify-between py-1.5 px-3 bg-[#1C1B17] hover:bg-[#24221E] text-[#F2F0EA] border border-[#2B2924] hover:border-[#3D3A33] rounded-[6px] text-xs font-medium transition-colors"
          >
            <div className="flex items-center space-x-2">
              <MessageSquareText className="w-3.5 h-3.5 text-[#A6A29A]" />
              <span>Query Assistant</span>
            </div>
            <div className="flex items-center space-x-0.5 text-[10px] bg-[#24221E] border border-[#2B2924] text-[#A6A29A] px-1 py-0.2 rounded">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-2 py-3">
          <p className="px-2 pb-1.5 text-[10px] font-semibold tracking-wider text-[#6E6A62] uppercase">
            Workspaces
          </p>
          <nav className="space-y-0.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-xs transition-colors ${
                    isActive
                      ? 'bg-[#24221E] text-[#F2F0EA] font-medium border border-[#3D3A33]'
                      : 'text-[#A6A29A] hover:bg-[#1C1B17] hover:text-[#F2F0EA]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF5A1F]' : 'text-[#6E6A62]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count && (
                    <span className="text-[10px] bg-[#D9402B] text-white px-1.5 py-0.2 rounded-full font-bold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Profile & System Controls */}
      <div className="p-3 border-t border-[#2B2924] space-y-2">
        {activeStudent && (
          <button
            onClick={onOpenProfile}
            className="w-full text-left p-2 rounded-[6px] bg-[#1C1B17] hover:bg-[#24221E] border border-[#2B2924] transition-colors group"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-[4px] bg-[#24221E] text-[#F2F0EA] border border-[#2B2924] flex items-center justify-center font-semibold text-xs shrink-0 group-hover:border-[#FF5A1F]">
                {activeStudent.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#F2F0EA] truncate">{activeStudent.name}</p>
                <p className="text-[10px] text-[#A6A29A] truncate">
                  Yr {activeStudent.year} • {activeStudent.branchCode}
                </p>
              </div>
              <User className="w-3.5 h-3.5 text-[#6E6A62] group-hover:text-[#A6A29A]" />
            </div>
          </button>
        )}

        <button
          onClick={onResetSeed}
          disabled={isSeeding}
          className="w-full flex items-center justify-center space-x-1.5 py-1 px-2 text-[#6E6A62] hover:text-[#A6A29A] hover:bg-[#1C1B17] rounded-[6px] text-[11px] transition-colors border border-transparent hover:border-[#2B2924] disabled:opacity-50"
          title="Reset database to fresh demo dataset"
        >
          <RotateCcw className={`w-3 h-3 ${isSeeding ? 'animate-spin' : ''}`} />
          <span>{isSeeding ? 'Resetting DB...' : 'Reset Demo Data'}</span>
        </button>
      </div>
    </aside>
  );
};
