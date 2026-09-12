'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { AnalyticsSummary } from '@/components/AnalyticsSummary';
import { DeadlineTimeline } from '@/components/DeadlineTimeline';
import { TaskList } from '@/components/TaskList';
import { IngestionModal } from '@/components/IngestionModal';
import { ChatDrawer } from '@/components/ChatDrawer';
import { ProfileModal } from '@/components/ProfileModal';
import { NoticeDetailModal } from '@/components/NoticeDetailModal';
import { DigestModal } from '@/components/DigestModal';
import { StudentProfile, ExtractedTaskItem, TaskStatus } from '@/types';
import { MessageSquareText, Newspaper } from 'lucide-react';

export default function SmartCampusDashboard() {
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  const [activeStudent, setActiveStudent] = useState<StudentProfile | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<StudentProfile[]>([]);
  const [tasks, setTasks] = useState<ExtractedTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [ingestInitialMode, setIngestInitialMode] = useState<'paste' | 'upload' | 'email'>('paste');
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isDigestModalOpen, setIsDigestModalOpen] = useState<boolean>(false);
  const [inspectingTask, setInspectingTask] = useState<ExtractedTaskItem | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      let profileRes = await fetch('/api/profile');
      let profileData = await profileRes.json();

      if (!profileRes.ok || !profileData.activeStudent) {
        setIsSeeding(true);
        const seedRes = await fetch('/api/seed', { method: 'POST' });
        await seedRes.json();
        setIsSeeding(false);

        profileRes = await fetch('/api/profile');
        profileData = await profileRes.json();
      }

      if (profileData.activeStudent) {
        setActiveStudent(profileData.activeStudent);
        setAvailableProfiles(profileData.availableProfiles || []);
      }

      const tasksRes = await fetch('/api/tasks?status=ALL');
      const tasksData = await tasksRes.json();
      if (tasksData.tasks) {
        setTasks(tasksData.tasks);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsChatDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      loadDashboardData();
    }
  };

  const handleResetSeed = async () => {
    setIsSeeding(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      await loadDashboardData();
    } catch (err) {
      console.error('Error resetting seed:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const displayedTasks = tasks.filter((t) => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.eligibility.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedDateFilter) {
      if (!t.deadline || !t.deadline.startsWith(selectedDateFilter)) {
        return false;
      }
    }

    if (currentTab === 'deadlines') {
      return (t.urgency === 'CRITICAL' || t.urgency === 'HIGH') && t.status !== 'DISMISSED';
    } else if (currentTab !== 'all') {
      return t.category === currentTab;
    }

    return true;
  });

  const urgentTasksCount = tasks.filter(
    (t) => (t.urgency === 'CRITICAL' || t.urgency === 'HIGH') && t.status === 'PENDING'
  ).length;

  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="flex min-h-screen bg-[#161512] text-[#F2F0EA]">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSelectedDateFilter(null);
        }}
        activeStudent={activeStudent}
        onOpenIngest={() => {
          setIngestInitialMode('paste');
          setIsIngestModalOpen(true);
        }}
        onOpenChat={() => setIsChatDrawerOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenDigest={() => setIsDigestModalOpen(true)}
        onResetSeed={handleResetSeed}
        isSeeding={isSeeding}
        urgentCount={urgentTasksCount}
      />

      {/* Main Dashboard Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeStudent={activeStudent}
          onOpenIngest={() => {
            setIngestInitialMode('paste');
            setIsIngestModalOpen(true);
          }}
          onOpenChat={() => setIsChatDrawerOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenGmailConnect={() => {
            setIngestInitialMode('email');
            setIsIngestModalOpen(true);
          }}
          urgentCount={urgentTasksCount}
          completedCount={completedTasksCount}
        />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-5">
          {/* Greeting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#2B2924]">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-[#F2F0EA] tracking-tight">
                  Welcome back, {activeStudent?.name.split(' ')[0] || 'Student'}
                </h2>
                <span className="text-[10px] bg-[#24221E] text-[#F2F0EA] border border-[#2B2924] px-2 py-0.5 rounded-[4px] font-medium">
                  {activeStudent?.branchCode} • Year {activeStudent?.year}
                </span>
              </div>
              <p className="text-xs text-[#A6A29A] mt-0.5">
                {urgentTasksCount > 0
                  ? `${urgentTasksCount} high-priority deadlines requiring attention.`
                  : 'All campus circulars processed and categorized.'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsDigestModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1C1B17] hover:bg-[#24221E] border border-[#2B2924] hover:border-[#3D3A33] rounded-[6px] text-xs font-medium text-[#F2F0EA] transition-colors"
              >
                <Newspaper className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>Weekly Action Briefing</span>
              </button>

              <button
                onClick={() => setIsChatDrawerOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#FF5A1F] hover:bg-[#E04B14] rounded-[6px] text-xs font-medium text-white transition-colors"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Ask Assistant</span>
              </button>
            </div>
          </div>

          {/* Metric Tiles */}
          <AnalyticsSummary tasks={tasks} activeStudent={activeStudent} />

          {/* Upcoming 7-Day Deadline Strip */}
          <DeadlineTimeline
            tasks={tasks}
            selectedDateFilter={selectedDateFilter}
            setSelectedDateFilter={setSelectedDateFilter}
          />

          {/* Task Feed */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A6A29A]">
                {currentTab === 'deadlines'
                  ? 'Urgent Deadlines Priority Queue'
                  : currentTab === 'all'
                  ? 'All Actionable Tasks'
                  : `${currentTab} Tasks`}
              </h3>
              <span className="text-[11px] text-[#6E6A62]">
                {displayedTasks.length} task{displayedTasks.length !== 1 ? 's' : ''}
              </span>
            </div>

            <TaskList
              tasks={displayedTasks}
              isLoading={isLoading}
              activeStudent={activeStudent}
              onStatusChange={handleStatusChange}
              onViewNotice={(task) => setInspectingTask(task)}
              onOpenIngest={() => {
                setIngestInitialMode('paste');
                setIsIngestModalOpen(true);
              }}
              currentCategoryTab={currentTab}
            />
          </div>
        </main>
      </div>

      {/* Panels and Modals */}
      <IngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        activeStudent={activeStudent}
        onNoticeIngested={loadDashboardData}
        initialMode={ingestInitialMode}
      />

      <DigestModal
        isOpen={isDigestModalOpen}
        onClose={() => setIsDigestModalOpen(false)}
        activeStudent={activeStudent}
      />

      <ChatDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        activeStudent={activeStudent}
        tasks={tasks}
        onSelectTask={(taskId) => {
          const t = tasks.find((item) => item.id === taskId);
          if (t) setInspectingTask(t);
        }}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        activeStudent={activeStudent}
        availableProfiles={availableProfiles}
        onProfileChanged={() => loadDashboardData()}
      />

      <NoticeDetailModal
        task={inspectingTask}
        onClose={() => setInspectingTask(null)}
      />
    </div>
  );
}
