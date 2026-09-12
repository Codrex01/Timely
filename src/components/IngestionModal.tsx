'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  Upload,
  Mail,
  Check,
  AlertCircle,
  Loader2,
  FileUp,
  LogIn,
  Sparkles,
  FileCode2,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { StudentProfile, SampleEmailNotice } from '@/types';
import { REALISTIC_RAW_NOTICES, MOCK_EMAIL_INBOX } from '@/lib/sampleNotices';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStudent: StudentProfile | null;
  onNoticeIngested: () => void;
  initialMode?: 'paste' | 'upload' | 'email';
}

const SAMPLE_PRESET_LETTERS = [
  {
    id: 'tcs-nqt',
    badge: 'Placement',
    title: 'TCS National Qualifier Test (NQT) 2026 Campus Drive',
    sender: 'placement.director@campus.edu',
    text: `TRAINING AND PLACEMENT CELL
CIRCULAR REF: TPC/2026/TCS-NQT

To: 3rd & 4th Year B.Tech Students (CSE, IT, ECE, EE)
Date: September 15, 2026

Subject: Mandatory Registration for TCS NQT 2026 (Ninja & Digital Profiles)

Tata Consultancy Services (TCS) is opening the registration portal for on-campus hiring for the 2026-2027 batches.

ELIGIBILITY:
- Minimum 60% or 6.0 CGPA throughout 10th, 12th, and Undergraduate studies.
- Max 1 active backlog permitted at the time of test.

ACTION STEPS:
1. Register on the TCS NextStep Portal under IT category.
2. Upload 6th-semester marksheet and verified resume by September 26, 2026, 11:59 PM.
3. Online National Qualifier Test will be conducted on October 8, 2026 at Campus Lab-3.`,
  },
  {
    id: 'exam-fee',
    badge: 'Exams',
    title: 'Semester End Examination Form & Hall Ticket Release',
    sender: 'controller.exams@campus.edu',
    text: `OFFICE OF CONTROLLER OF EXAMINATIONS
NOTICE NO: COE/ODD-SEM/2026/18

Date: September 14, 2026
To: All B.Tech / M.Tech Students (All Branches & Years)

Subject: End-Semester Theory & Practical Exam Enrollment Deadline

The final semester examinations for Odd Term 2026 will start on November 2, 2026.

MANDATORY ACTIONS & CRITERIA:
1. Clear all semester tuition and lab dues before submitting the form.
2. Complete online exam enrollment on ERP by October 5, 2026 at 5:00 PM.
3. Mandatory 75% attendance criteria applies. Shortage lists will be posted on Oct 10.
4. Download stamped digital hall ticket starting October 20.`,
  },
  {
    id: 'scholarship',
    badge: 'Scholarship',
    title: 'State Merit-Cum-Means Scholarship for AY 2026-27',
    sender: 'welfare.dean@campus.edu',
    text: `STUDENT WELFARE DEANERY
NOTICE: SWD/SCHOLARSHIP/2026/09

Date: September 11, 2026
Audience: All Batches (1st to 4th Year - All Engineering Streams)

Subject: Applications for Annual Merit and Need-Based Financial Aid

Applications are open for the State Technical Education Financial Assistance Scheme.

ELIGIBILITY CRITERIA:
- Annual family income must not exceed INR 6.0 Lakhs per annum.
- Cumulative GPA of 7.5 or above with no disciplinary sanctions.

REQUIRED STEPS:
1. Complete online application on the State Scholarship Portal.
2. Submit attested Income Certificate and Grade Cards to Room 104, Admin Block by October 12, 2026, 4:00 PM.`,
  },
  {
    id: 'hackathon',
    badge: 'Events',
    title: 'HackCampus 2026 — 36-Hour National AI & IoT Hackathon',
    sender: 'coding.club@campus.edu',
    text: `CAMPUS INNOVATION COUNCIL & CODING CLUB
PRESENTS: HACKCAMPUS 2026

Date: September 14, 2026
To: All Students (Interdisciplinary Teams of 2 to 4)

Subject: Hackathon Registration & Problem Statements Release

Join 500+ student developers across India to build real-world AI, Web3, and Robotics solutions. Total prize pool: INR 2,00,000 + sponsor internship fast-tracks.

KEY DEADLINES:
1. Register team and submit 3-slide pitch deck by September 29, 2026, 11:59 PM.
2. Shortlist announcement: October 3, 2026.
3. 36-hour physical hackathon: October 18-19, 2026 at Central Tech Park.`,
  },
];

export const IngestionModal: React.FC<IngestionModalProps> = ({
  isOpen,
  onClose,
  activeStudent,
  onNoticeIngested,
  initialMode = 'paste',
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'email'>(initialMode);

  // Paste State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [sourceSender, setSourceSender] = useState('');
  const [rawText, setRawText] = useState('');

  // Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Email Scan State
  const [emailList, setEmailList] = useState<SampleEmailNotice[]>(MOCK_EMAIL_INBOX);
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>(
    MOCK_EMAIL_INBOX.map((e) => e.id)
  );
  const [isRealConnected, setIsRealConnected] = useState<boolean>(false);
  const [connectedAccountName, setConnectedAccountName] = useState<string>('');
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (isOpen && activeTab === 'email') {
      fetchInboxEmails();
    }
  }, [isOpen, activeTab]);

  const fetchInboxEmails = async () => {
    setIsLoadingEmails(true);
    try {
      const res = await fetch('/api/emails/scan');
      const data = await res.json();
      if (data.emails && data.emails.length > 0) {
        setEmailList(data.emails);
        setIsRealConnected(!!data.isRealGmailConnected);
        setConnectedAccountName(data.connectedAccount || '');
        setSelectedEmailIds(data.emails.map((e: SampleEmailNotice) => e.id));
      } else {
        // Fallback to sample inbox if empty
        setEmailList(MOCK_EMAIL_INBOX);
        setSelectedEmailIds(MOCK_EMAIL_INBOX.map((e) => e.id));
      }
    } catch (err) {
      console.error('Error loading inbox:', err);
      setEmailList(MOCK_EMAIL_INBOX);
      setSelectedEmailIds(MOCK_EMAIL_INBOX.map((e) => e.id));
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const loadSamplePreset = (presetId: string) => {
    const preset = SAMPLE_PRESET_LETTERS.find((p) => p.id === presetId);
    if (preset) {
      setNoticeTitle(preset.title);
      setSourceSender(preset.sender);
      setRawText(preset.text);
      setStatusMessage(null);
    }
  };

  const handleCreateMockDoc = (type: 'pdf' | 'docx') => {
    const sampleText = type === 'pdf'
      ? `CAMPUS CIRCULAR (PDF FORMAT)\nREF: ACAD/2026/PDF-EXAM\n\nSubject: Supplementary & Improvement Examination 2026\n\nAll B.Tech students who failed in previous semester courses must submit the Supplementary Exam Form by October 4, 2026 at 5:00 PM along with examination fee receipt of INR 1,200 per paper.\n\nController of Examinations`
      : `DEPARTMENT OF COMPUTER SCIENCE (DOCX CIRCULAR)\n\nSubject: Capstone Project Guide Allocation & Topic Approval\n\nAll 4th Year CSE Students must submit their Project Guide Preference Form by September 27, 2026 at 3:00 PM on the Department ERP. Guide meetings commence from Oct 1.\n\nHOD, Computer Science & Engineering`;

    const blob = new Blob([sampleText], { type: 'text/plain' });
    const file = new File([blob], type === 'pdf' ? 'Supplementary_Exam_Notice_2026.pdf' : 'Capstone_Guide_Allocation.docx', {
      type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    setSelectedFiles([file]);
    setStatusMessage({ type: 'success', text: `Loaded sample ${type.toUpperCase()} notice file ready for ingestion` });
  };

  if (!isOpen) return null;

  const handleConnectRealGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText || rawText.trim().length < 10) {
      setStatusMessage({ type: 'error', text: 'Please paste or select a sample notice letter.' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noticeTitle.trim() || undefined,
          sourceSender: sourceSender.trim() || undefined,
          rawText,
          source: 'PASTE',
          studentId: activeStudent?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process notice');

      setStatusMessage({ type: 'success', text: `Extracted: "${data.task.title}" (${data.task.urgency} Urgency)` });
      setTimeout(() => {
        onNoticeIngested();
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error processing notice' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please select a file or click a sample document below.' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('files', file));
      if (activeStudent) formData.append('studentId', activeStudent.id);

      const res = await fetch('/api/parse-file', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process files');

      setStatusMessage({ type: 'success', text: `Processed ${data.processedCount} notice document(s)` });
      setSelectedFiles([]);
      setTimeout(() => {
        onNoticeIngested();
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error parsing files' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailScanSubmit = async () => {
    if (selectedEmailIds.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please select at least one email to scan.' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/emails/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailIds: selectedEmailIds,
          studentId: activeStudent?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to scan inbox');

      setStatusMessage({ type: 'success', text: data.message || 'Emails converted to tasks.' });
      setTimeout(() => {
        onNoticeIngested();
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error scanning emails' });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleEmailSelect = (id: string) => {
    if (selectedEmailIds.includes(id)) {
      setSelectedEmailIds(selectedEmailIds.filter((item) => item !== id));
    } else {
      setSelectedEmailIds([...selectedEmailIds, id]);
    }
  };

  const selectAllEmails = () => {
    if (selectedEmailIds.length === emailList.length) {
      setSelectedEmailIds([]);
    } else {
      setSelectedEmailIds(emailList.map((e) => e.id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="saas-card w-full max-w-2xl bg-[#1C1B17] border border-[#2B2924] shadow-2xl rounded-[8px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#2B2924] flex items-center justify-between bg-[#161512]">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-[4px] bg-[#FF5A1F] text-white flex items-center justify-center">
              <FileUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F2F0EA]">Ingest Campus Notice</h3>
              <p className="text-[10px] text-[#A6A29A]">Parse circulars & emails into prioritized student tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6E6A62] hover:text-[#F2F0EA] rounded hover:bg-[#24221E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2B2924] bg-[#161512] px-4 pt-2">
          <button
            onClick={() => { setActiveTab('paste'); setStatusMessage(null); }}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-[#FF5A1F] text-[#F2F0EA]'
                : 'border-transparent text-[#6E6A62] hover:text-[#A6A29A]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Notice Text</span>
          </button>

          <button
            onClick={() => { setActiveTab('upload'); setStatusMessage(null); }}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-[#FF5A1F] text-[#F2F0EA]'
                : 'border-transparent text-[#6E6A62] hover:text-[#A6A29A]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Documents</span>
          </button>

          <button
            onClick={() => { setActiveTab('email'); setStatusMessage(null); }}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'email'
                ? 'border-[#FF5A1F] text-[#F2F0EA]'
                : 'border-transparent text-[#6E6A62] hover:text-[#A6A29A]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>Gmail & Campus Inbox</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3 rounded-[6px] border text-xs flex items-center space-x-2 ${
                statusMessage.type === 'success'
                  ? 'bg-[#0B6E4F]/15 border-[#0B6E4F]/40 text-[#4ADE80]'
                  : 'bg-[#D9402B]/15 border-[#D9402B]/40 text-[#F87171]'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-[#0B6E4F]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-[#D9402B]" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: PASTE TEXT */}
          {activeTab === 'paste' && (
            <form onSubmit={handlePasteSubmit} className="space-y-3.5">
              {/* Preset Sample Notice Picker */}
              <div className="p-2.5 bg-[#161512] rounded-[6px] border border-[#2B2924] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#A6A29A] flex items-center space-x-1.5">
                    <Sparkles className="w-3 h-3 text-[#FF5A1F]" />
                    <span>Quick Fill Sample Circular Letters:</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PRESET_LETTERS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => loadSamplePreset(preset.id)}
                      className="px-2 py-1 bg-[#24221E] hover:bg-[#2B2924] text-[#F2F0EA] border border-[#2B2924] rounded-[4px] text-[11px] transition-colors"
                    >
                      <span className="text-[#FF5A1F] mr-1">[{preset.badge}]</span>
                      <span>{preset.title.split(' ')[0]} {preset.title.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A6A29A] mb-1">
                  Circular Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TCS NQT Registration Drive 2026"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] rounded-[4px] px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A6A29A] mb-1">
                  Sender Authority / Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. placement.cell@campus.edu or Controller of Examinations"
                  value={sourceSender}
                  onChange={(e) => setSourceSender(e.target.value)}
                  className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] rounded-[4px] px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A6A29A] mb-1">
                  Raw Notice Content <span className="text-[#D9402B]">*</span>
                </label>
                <textarea
                  rows={7}
                  placeholder="Paste unformatted email, circular body, or WhatsApp announcement text here..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] font-mono rounded-[4px] p-3 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isProcessing || !rawText}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#FF5A1F] hover:bg-[#E04B14] disabled:opacity-50 text-white text-xs font-medium rounded-[6px] transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting with Groq AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Extract & Prioritize Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: UPLOAD DOCUMENTS */}
          {activeTab === 'upload' && (
            <form onSubmit={handleFileUploadSubmit} className="space-y-4">
              {/* Sample Document Quick Loaders */}
              <div className="p-3 bg-[#161512] rounded-[6px] border border-[#2B2924] space-y-2">
                <span className="text-[11px] font-medium text-[#A6A29A] flex items-center space-x-1.5">
                  <FileCode2 className="w-3 h-3 text-[#FF5A1F]" />
                  <span>Don&apos;t have a file ready? Click a sample document to test:</span>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCreateMockDoc('pdf')}
                    className="flex-1 px-2.5 py-1.5 bg-[#24221E] hover:bg-[#2B2924] text-[#F2F0EA] border border-[#2B2924] rounded-[4px] text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#D9402B]" />
                    <span>Supplementary_Exam_Notice.pdf</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateMockDoc('docx')}
                    className="flex-1 px-2.5 py-1.5 bg-[#24221E] hover:bg-[#2B2924] text-[#F2F0EA] border border-[#2B2924] rounded-[4px] text-xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Capstone_Guide_Allocation.docx</span>
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-[#2B2924] hover:border-[#3D3A33] rounded-[6px] p-6 text-center bg-[#161512] transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  id="file-upload-input"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedFiles(Array.from(e.target.files));
                    }
                  }}
                />
                <label
                  htmlFor="file-upload-input"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-[6px] bg-[#24221E] text-[#FF5A1F] flex items-center justify-center border border-[#2B2924]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#F2F0EA]">
                      Click to browse or drop university documents
                    </span>
                    <p className="text-[10px] text-[#6E6A62] mt-0.5">
                      Supports PDF (.pdf), Microsoft Word (.docx), Plain Text (.txt)
                    </p>
                  </div>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-medium text-[#A6A29A]">Selected Files ({selectedFiles.length}):</div>
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-[#161512] border border-[#2B2924] rounded-[4px] text-xs text-[#F2F0EA]"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span className="truncate max-w-sm">{file.name}</span>
                        <span className="text-[10px] text-[#6E6A62]">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                        className="text-[#6E6A62] hover:text-[#D9402B]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isProcessing || selectedFiles.length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#FF5A1F] hover:bg-[#E04B14] disabled:opacity-50 text-white text-xs font-medium rounded-[6px] transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing with pdf-parse & Groq...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Extract {selectedFiles.length} Document(s)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: EMAIL / GMAIL SYNC */}
          {activeTab === 'email' && (
            <div className="space-y-3.5">
              {/* Connection Status Banner */}
              <div className="p-3 bg-[#161512] border border-[#2B2924] rounded-[6px] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isRealConnected ? 'bg-[#0B6E4F]' : 'bg-[#D97706]'}`} />
                  <div>
                    <div className="text-xs font-medium text-[#F2F0EA]">
                      {isRealConnected ? 'Live Google Account Synced' : 'Simulated Campus Email Inbox'}
                    </div>
                    <div className="text-[10px] text-[#6E6A62]">
                      {connectedAccountName || 'aarav.sharma@campus.edu (Demo Mode)'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={fetchInboxEmails}
                    disabled={isLoadingEmails}
                    className="p-1.5 bg-[#24221E] hover:bg-[#2B2924] text-[#A6A29A] rounded-[4px] transition-colors"
                    title="Refresh Inbox"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEmails ? 'animate-spin' : ''}`} />
                  </button>

                  {!isRealConnected && (
                    <button
                      type="button"
                      onClick={handleConnectRealGoogle}
                      className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#24221E] hover:bg-[#2B2924] text-[#F2F0EA] border border-[#2B2924] rounded-[4px] text-xs font-medium transition-colors"
                    >
                      <LogIn className="w-3 h-3 text-[#FF5A1F]" />
                      <span>Connect Real Gmail</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Email List Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#A6A29A] px-1">
                  <span>Found {emailList.length} Campus Circular Emails</span>
                  <button
                    type="button"
                    onClick={selectAllEmails}
                    className="text-[11px] text-[#FF5A1F] hover:underline"
                  >
                    {selectedEmailIds.length === emailList.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {emailList.map((email) => {
                    const isSelected = selectedEmailIds.includes(email.id);
                    return (
                      <div
                        key={email.id}
                        onClick={() => toggleEmailSelect(email.id)}
                        className={`p-2.5 rounded-[4px] border transition-colors cursor-pointer text-xs flex items-start space-x-2.5 ${
                          isSelected
                            ? 'bg-[#24221E] border-[#FF5A1F]/50 text-[#F2F0EA]'
                            : 'bg-[#161512] border-[#2B2924] text-[#A6A29A] hover:border-[#3D3A33]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 accent-[#FF5A1F]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#F2F0EA] truncate">{email.sender}</span>
                            <span className="text-[10px] text-[#6E6A62]">{email.receivedAt}</span>
                          </div>
                          <div className="font-semibold text-xs text-[#F2F0EA] mt-0.5 truncate">{email.subject}</div>
                          <p className="text-[11px] text-[#6E6A62] line-clamp-1 mt-0.5">{email.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#2B2924]">
                <span className="text-[11px] text-[#6E6A62]">
                  {selectedEmailIds.length} email(s) selected
                </span>
                <button
                  type="button"
                  onClick={handleEmailScanSubmit}
                  disabled={isProcessing || selectedEmailIds.length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#FF5A1F] hover:bg-[#E04B14] disabled:opacity-50 text-white text-xs font-medium rounded-[6px] transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting with Groq AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Convert Selected Emails to Tasks</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
