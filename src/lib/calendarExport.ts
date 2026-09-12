import { ExtractedTaskItem } from '@/types';

/**
 * Generates a 1-click Google Calendar web creation URL.
 */
export function generateGoogleCalendarUrl(task: ExtractedTaskItem): string {
  const title = encodeURIComponent(`[Smart Campus] ${task.title}`);
  const details = encodeURIComponent(
    `${task.summary}\n\nRequired Actions:\n${task.requiredActions.join('\n')}\n\nEligibility: ${task.eligibility}`
  );

  let dateParam = '';
  if (task.deadline) {
    const d = new Date(task.deadline);
    if (!isNaN(d.getTime())) {
      const startStr = d.toISOString().replace(/-|:|\.\d+/g, '');
      const end = new Date(d.getTime() + 60 * 60 * 1000); // 1 hour event
      const endStr = end.toISOString().replace(/-|:|\.\d+/g, '');
      dateParam = `&dates=${startStr}/${endStr}`;
    }
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}${dateParam}`;
}

/**
 * Triggers a download of a standard .ics calendar file.
 */
export function downloadIcsFile(task: ExtractedTaskItem) {
  const now = new Date().toISOString().replace(/-|:|\.\d+/g, '');
  let startStr = now;
  let endStr = now;

  if (task.deadline) {
    const d = new Date(task.deadline);
    if (!isNaN(d.getTime())) {
      startStr = d.toISOString().replace(/-|:|\.\d+/g, '');
      const end = new Date(d.getTime() + 60 * 60 * 1000);
      endStr = end.toISOString().replace(/-|:|\.\d+/g, '');
    }
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Smart Campus AI//Timely Task Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${task.id}@smartcampus.ai`,
    `DTSTAMP:${now}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:[${task.category}] ${task.title.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${task.summary.replace(/,/g, '\\,')}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${task.title.slice(0, 20).replace(/\s+/g, '_')}_deadline.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
