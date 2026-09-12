'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, AlertCircle } from 'lucide-react';

interface ToastData {
  id: string;
  title: string;
  message: string;
  taskId?: string;
}

export const NotificationToast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: any) => {
      const detail = e.detail;
      if (!detail) return;

      const newToast: ToastData = {
        id: `toast-${Date.now()}`,
        title: detail.title || 'Campus Deadline Reminder',
        message: detail.message || 'Action required for upcoming notice.',
        taskId: detail.taskId,
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 2)]);

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
    };

    window.addEventListener('timely_toast_notification', handleToastEvent);
    return () => window.removeEventListener('timely_toast_notification', handleToastEvent);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto p-3.5 bg-[#1C1B17] border border-[#FF5A1F]/50 shadow-2xl rounded-[8px] text-[#F2F0EA] space-y-1 animate-in slide-in-from-top-3 fade-in duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-[4px] bg-[#FF5A1F] text-white flex items-center justify-center shrink-0">
                <Bell className="w-3 h-3" />
              </div>
              <h4 className="text-xs font-semibold text-[#F2F0EA] line-clamp-1">{t.title}</h4>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-[#6E6A62] hover:text-[#F2F0EA] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-[#A6A29A] pl-7 leading-relaxed">{t.message}</p>
        </div>
      ))}
    </div>
  );
};
