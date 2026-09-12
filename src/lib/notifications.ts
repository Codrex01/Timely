'use client';

export interface ScheduledReminder {
  id: string;
  taskId: string;
  taskTitle: string;
  category: string;
  urgency: string;
  deadline: string;
  reminderType: 'INSTANT_TEST' | '1_DAY_BEFORE' | '2_DAYS_BEFORE' | 'DAY_OF';
  reminderLabel: string;
  targetTimestamp: number;
  triggered: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'timely_scheduled_reminders';

export function getScheduledReminders(): ScheduledReminder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveScheduledReminders(reminders: ScheduledReminder[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  window.dispatchEvent(new CustomEvent('timely_reminders_updated'));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function sendBrowserNotification(title: string, body: string, icon?: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
      });
    } catch (e) {
      console.warn('Native notification failed, using in-app alert:', e);
    }
  }
}

export function scheduleTaskReminder(
  task: { id: string; title: string; category: string; urgency: string; deadline: string | null },
  type: 'INSTANT_TEST' | '1_DAY_BEFORE' | '2_DAYS_BEFORE' | 'DAY_OF'
): ScheduledReminder {
  const deadlineDate = task.deadline ? new Date(task.deadline) : new Date(Date.now() + 86400000);
  let targetTimestamp = Date.now();
  let reminderLabel = 'Instant Test Alert';

  if (type === '1_DAY_BEFORE') {
    targetTimestamp = deadlineDate.getTime() - 24 * 60 * 60 * 1000;
    reminderLabel = '1 Day Before Deadline';
  } else if (type === '2_DAYS_BEFORE') {
    targetTimestamp = deadlineDate.getTime() - 48 * 60 * 60 * 1000;
    reminderLabel = '2 Days Before Deadline';
  } else if (type === 'DAY_OF') {
    targetTimestamp = deadlineDate.getTime();
    reminderLabel = 'On Deadline Day (Morning 8:00 AM)';
  }

  const reminder: ScheduledReminder = {
    id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    taskId: task.id,
    taskTitle: task.title,
    category: task.category,
    urgency: task.urgency,
    deadline: deadlineDate.toISOString(),
    reminderType: type,
    reminderLabel,
    targetTimestamp,
    triggered: type === 'INSTANT_TEST',
    createdAt: new Date().toISOString(),
  };

  const existing = getScheduledReminders().filter((r) => r.taskId !== task.id || r.reminderType !== type);
  const updated = [reminder, ...existing];
  saveScheduledReminders(updated);

  // If Instant Test, dispatch browser notification and in-app event immediately!
  if (type === 'INSTANT_TEST') {
    requestNotificationPermission().then(() => {
      sendBrowserNotification(
        `🚨 DEADLINE REMINDER: ${task.title}`,
        `[${task.category}] Priority: ${task.urgency}. Urgent action required before the deadline!`
      );
    });

    window.dispatchEvent(
      new CustomEvent('timely_toast_notification', {
        detail: {
          title: `🚨 Deadline Alert: ${task.title}`,
          message: `Category: ${task.category} • Urgency: ${task.urgency}. Verification form due soon!`,
          taskId: task.id,
        },
      })
    );
  }

  return reminder;
}

export function removeScheduledReminder(reminderId: string) {
  const existing = getScheduledReminders().filter((r) => r.id !== reminderId);
  saveScheduledReminders(existing);
}
