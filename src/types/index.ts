export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type NoticeCategory = 'ACADEMIC' | 'PLACEMENT' | 'EXAM' | 'EVENT' | 'SCHOLARSHIP' | 'CLUB' | 'REGISTRATION';
export type TaskStatus = 'PENDING' | 'COMPLETED' | 'SNOOZED' | 'DISMISSED';
export type NoticeSource = 'PASTE' | 'UPLOAD' | 'EMAIL';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  rollNo?: string | null;
  department: string;
  branchCode: string; // e.g. "CSE", "MECH", "ECE", "IT", "MBA"
  year: number; // 1, 2, 3, 4
  semester: number;
  gpa: number;
  academicInterests: string[];
  careerInterests: string[];
  extracurriculars: string[];
}

export interface ExtractedTaskItem {
  id: string;
  noticeId: string;
  title: string;
  summary: string;
  category: NoticeCategory;
  deadline: string | null; // ISO string
  deadlineFormatted: string | null;
  urgency: UrgencyLevel;
  eligibility: string;
  requiredActions: string[];
  targetBranches: string[];
  targetYears: number[];
  relevanceScore: number; // 0 to 100
  status: TaskStatus;
  snoozedUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  notice?: {
    id: string;
    title: string;
    source: NoticeSource;
    sourceSender?: string | null;
    rawContent: string;
    receivedAt: string;
  };
}

export interface NoticeItem {
  id: string;
  title: string;
  rawContent: string;
  source: NoticeSource;
  sourceSender?: string | null;
  fileType?: string | null;
  receivedAt: string;
  createdAt: string;
  extractedTasks?: ExtractedTaskItem[];
}

export interface GroqExtractionResult {
  title: string;
  summary: string;
  category: NoticeCategory;
  deadline: string | null; // ISO format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss if specified
  deadlineFormatted: string | null;
  urgency: UrgencyLevel;
  eligibility: string;
  requiredActions: string[];
  targetBranches: string[]; // ["CSE", "IT", ...] or ["ALL"]
  targetYears: number[]; // [1, 2, 3, 4] or [0] for all
  keyContacts?: string[];
}

export interface ChatMessageItem {
  id: string;
  studentId?: string | null;
  role: 'user' | 'assistant';
  content: string;
  citedNoticeIds: string[];
  createdAt: string;
}

export interface SampleEmailNotice {
  id: string;
  sender: string;
  subject: string;
  receivedAt: string;
  body: string;
  tag: string;
  unread: boolean;
}
