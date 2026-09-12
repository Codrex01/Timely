'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle2, Trash2, Sparkles, ExternalLink, AlertCircle } from 'lucide-react';
import {
  getScheduledReminders,
  removeScheduledReminder,
  ScheduledReminder,
  requestNotificationPermission,
  sendBrowserNotification
} from '@/lib/notifications';

interface NotificationDropdownProps {
  onSelectTask?: (taskId: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onSelectTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);

  const loadReminders = () => {
    setReminders(getScheduledReminders());
  };

  useEffect(() => {
    loadReminders();

    const handleUpdate = () => loadReminders();
    window.addEventListener('timely_reminders_updated', handleUpdate);
    return () => window.removeEventListener('timely_reminders_updated', handleUpdate);
  }, []);

  const handleTestDemoAlert = async () => {
    await requestNotificationPermission();
    sendBrowserNotification(
      '🚨 LIVE CAMPUS ALERT: Microsoft SDE-1 Drive',
      'Reminder: Coding assessment registration window closes in 24 hours. Submit your resume on Placement ERP.'
    );

    window.dispatchEvent(
      new CustomEvent('timely_toast_notification', {
        detail: {
          title: '🚨 LIVE CAMPUS ALERT: Microsoft SDE-1 Drive',
          message: 'Coding assessment registration window closes in 24 hours. Submit resume on Placement ERP.',
        },
      })
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeScheduledReminder(id);
  };

  const activeAlertsCount = reminders.length;

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title="Deadline Notification Sender & Reminders"
        className="relative p-1.5 bg-[#1C1B17] hover:bg-[#24221E] text-[#A6A29A] hover:text-[#F2F0EA] border border-[#2B2924] hover:border-[#3D3A33] rounded-[6px] transition-colors"
      >
        <Bell className="w-3.5 h-3.5 text-[#FF5A1F]" />
        {activeAlertsCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D9402B] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {activeAlertsCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1C1B17] border border-[#2B2924] shadow-2xl rounded-[8px] overflow-hidden z-50 text-[#F2F0EA]">
          {/* Header */}
          <div className="p-3 bg-[#161512] border-b border-[#2B2924] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-[4px] bg-[#FF5A1F] text-white flex items-center justify-center">
                <Bell className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-[#F2F0EA]">Deadline Alert Sender</span>
            </div>

            <button
              onClick={handleTestDemoAlert}
              className="text-[10px] px-2 py-0.5 rounded bg-[#FF5A1F]/15 text-[#FF5A1F] hover:bg-[#FF5A1F]/25 border border-[#FF5A1F]/30 font-medium flex items-center space-x-1 transition-colors"
              title="Test browser push & toast notification"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Test Live Alert</span>
            </button>
          </div>

          {/* Body */}
          <div className="max-h-72 overflow-y-auto p-2 space-y-1.5">
            {reminders.length === 0 ? (
              <div className="p-6 text-center space-y-2 text-[#6E6A62]">
                <Clock className="w-6 h-6 mx-auto text-[#2B2924]" />
                <p className="text-xs font-medium text-[#A6A29A]">No active deadline reminders</p>
                <p className="text-[10px]">
                  Click &apos;🔔 Set Reminder&apos; on any task card to schedule an automatic alert 1 day before the deadline.
                </p>
              </div>
            ) : (
              reminders.map((rem) => (
                <div
                  key={rem.id}
                  onClick={() => {
                    if (onSelectTask && rem.taskId) onSelectTask(rem.taskId);
                    setIsOpen(false);
                  }}
                  className="p-2.5 rounded-[6px] bg-[#161512] hover:bg-[#24221E] border border-[#2B2924] transition-colors cursor-pointer text-xs space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#FF5A1F] flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{rem.reminderLabel}</span>
                    </span>
                    <button
                      onClick={(e) => handleDelete(rem.id, e)}
                      className="text-[#6E6A62] hover:text-[#D9402B] p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="font-medium text-[#F2F0EA] line-clamp-1">{rem.taskTitle}</div>
                  <div className="text-[10px] text-[#6E6A62] flex items-center justify-between">
                    <span>Deadline: {new Date(rem.deadline).toLocaleDateString()}</span>
                    <span className="text-[#0B6E4F] font-semibold">Active Scheduled</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 bg-[#161512] border-t border-[#2B2924] text-center">
            <span className="text-[10px] text-[#6E6A62]">
              Alerts trigger Web Notifications &amp; In-App Toasts
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
