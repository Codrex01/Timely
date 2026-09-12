import React from 'react';
import { Search, Mail, Plus, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { StudentProfile } from '@/types';
import { NotificationDropdown } from './NotificationDropdown';

interface TopNavProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeStudent: StudentProfile | null;
  onOpenIngest: () => void;
  onOpenChat: () => void;
  onOpenProfile: () => void;
  onOpenGmailConnect: () => void;
  onResetSeed?: () => void;
  isSeeding?: boolean;
  onLockSession?: () => void;
  onSelectTask?: (taskId: string) => void;
  urgentCount: number;
  completedCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  searchQuery,
  setSearchQuery,
  activeStudent,
  onOpenIngest,
  onOpenChat,
  onOpenProfile,
  onOpenGmailConnect,
  onResetSeed,
  isSeeding,
  onLockSession,
  onSelectTask,
  urgentCount,
  completedCount,
}) => {
  return (
    <header className="h-13 bg-[#161512] border-b border-[#2B2924] px-6 py-2.5 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="flex items-center space-x-3 w-80">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A62]" />
          <input
            type="text"
            placeholder="Search notices, exams, circulars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1C1B17] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] placeholder-[#6E6A62] rounded-[6px] pl-8 pr-3 py-1.5 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Middle Status Indicator */}
      <div className="hidden md:flex items-center space-x-3 text-xs">
        {urgentCount > 0 ? (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-[4px] bg-[#D9402B]/15 border border-[#D9402B]/30 text-[#F87171]">
            <AlertCircle className="w-3.5 h-3.5 text-[#D9402B]" />
            <span className="font-medium text-[11px]">{urgentCount} Urgent Deadline{urgentCount > 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-[4px] bg-[#0B6E4F]/15 border border-[#0B6E4F]/30 text-[#4ADE80]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0B6E4F]" />
            <span className="font-medium text-[11px]">All Deadlines Caught Up</span>
          </div>
        )}

        <div className="text-[#6E6A62] text-[11px]">
          {completedCount} Completed
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        {/* Notification Bell Dropdown */}
        <NotificationDropdown onSelectTask={onSelectTask} />

        {/* Reset Demo Seed Button */}
        {onResetSeed && (
          <button
            onClick={onResetSeed}
            disabled={isSeeding}
            title="Restore all sample campus notices and tasks"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1C1B17] hover:bg-[#24221E] text-[#A6A29A] hover:text-[#F2F0EA] border border-[#2B2924] hover:border-[#3D3A33] rounded-[6px] text-xs font-medium transition-colors"
          >
            <span className={`text-[11px] ${isSeeding ? 'animate-spin' : ''}`}>🔄</span>
            <span className="hidden sm:inline">{isSeeding ? 'Restoring...' : 'Restore Demo'}</span>
          </button>
        )}

        {/* Connect Gmail Action */}
        <button
          onClick={onOpenGmailConnect}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1C1B17] hover:bg-[#24221E] text-[#F2F0EA] border border-[#2B2924] hover:border-[#3D3A33] rounded-[6px] text-xs font-medium transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-[#FF5A1F]" />
          <span>Connect Inbox</span>
        </button>

        {/* Primary CTA Ingest Notice */}
        <button
          onClick={onOpenIngest}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FF5A1F] hover:bg-[#E04B14] text-white rounded-[6px] text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ingest Notice</span>
        </button>

        {/* Profile Tag */}
        {activeStudent && (
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-1.5 pl-2 pr-2.5 py-1 bg-[#1C1B17] hover:bg-[#24221E] border border-[#2B2924] rounded-[6px] text-xs transition-colors"
          >
            <div className="w-4 h-4 rounded-[3px] bg-[#24221E] text-[#F2F0EA] flex items-center justify-center font-bold text-[9px] border border-[#2B2924]">
              {activeStudent.name.charAt(0)}
            </div>
            <span className="text-[#F2F0EA] text-xs">{activeStudent.branchCode} (Y{activeStudent.year})</span>
          </button>
        )}

        {/* Lock Session Action */}
        {onLockSession && (
          <button
            onClick={onLockSession}
            title="Lock administrative session"
            className="p-1.5 bg-[#1C1B17] hover:bg-[#24221E] text-[#A6A29A] hover:text-[#FF5A1F] border border-[#2B2924] hover:border-[#3D3A33] rounded-[6px] transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
