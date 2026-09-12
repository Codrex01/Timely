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
  ArrowRight
} from 'lucide-react';
import { StudentProfile, SampleEmailNotice } from '@/types';

interface IngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStudent: StudentProfile | null;
  onNoticeIngested: () => void;
  initialMode?: 'paste' | 'upload' | 'email';
}

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
  const [emailList, setEmailList] = useState<SampleEmailNotice[]>([]);
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
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
      if (data.emails) {
        setEmailList(data.emails);
        setSelectedEmailIds(data.emails.filter((e: SampleEmailNotice) => e.unread).map((e: SampleEmailNotice) => e.id));
      }
    } catch (err) {
      console.error('Error loading inbox:', err);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  if (!isOpen) return null;

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText || rawText.trim().length < 10) {
      setStatusMessage({ type: 'error', text: 'Please paste at least 10 characters of notice text.' });
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
      setRawText('');
      setNoticeTitle('');
      setSourceSender('');
      setTimeout(() => {
        onNoticeIngested();
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error processing notice' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please select at least one file (PDF, DOCX, TXT).' });
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
      }, 1200);
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
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error scanning emails' });
    } finally {
      setIsProcessing(false);
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
              <p className="text-[10px] text-[#A6A29A]">Parse raw circulars into structured tasks</p>
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
            <span>Upload Files (PDF/DOCX)</span>
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
            <span>Scan Gmail Inbox</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
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

          {/* TAB 1: Paste Text */}
          {activeTab === 'paste' && (
            <form onSubmit={handlePasteSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#A6A29A] mb-1">
                    Notice Subject (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mid-Sem Exam Fee Clearance"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] rounded-[6px] px-3 py-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#A6A29A] mb-1">
                    Department / Sender (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. dean.academics@campus.edu"
                    value={sourceSender}
                    onChange={(e) => setSourceSender(e.target.value)}
                    className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] rounded-[6px] px-3 py-1.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#A6A29A] mb-1">
                  Notice Content <span className="text-[#D9402B]">*</span>
                </label>
                <textarea
                  rows={8}
                  placeholder="Paste unstructured circular text, placement email, or registration notice..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] placeholder-[#6E6A62] rounded-[6px] p-3 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-[#A6A29A] hover:text-[#F2F0EA] bg-[#24221E] border border-[#2B2924] rounded-[6px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#FF5A1F] hover:bg-[#E04B14] text-white text-xs font-medium rounded-[6px] transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Structured Task...</span>
                    </>
                  ) : (
                    <span>Extract & Save Task</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Upload Documents */}
          {activeTab === 'upload' && (
            <form onSubmit={handleFileUploadSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-[#2B2924] hover:border-[#3D3A33] rounded-[8px] p-6 text-center bg-[#161512] transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedFiles(Array.from(e.target.files));
                    }
                  }}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-9 h-9 rounded-[6px] bg-[#24221E] text-[#A6A29A] flex items-center justify-center mb-2 border border-[#2B2924]">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-[#F2F0EA]">
                    Browse or drop PDF / DOCX / TXT circulars
                  </span>
                  <span className="text-[11px] text-[#6E6A62] mt-1">
                    Batch parse multiple documents
                  </span>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-[#A6A29A]">
                    Selected Documents ({selectedFiles.length}):
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {selectedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-[#161512] border border-[#2B2924] rounded-[6px] text-xs"
                      >
                        <span className="text-[#F2F0EA] truncate">{f.name}</span>
                        <span className="text-[10px] text-[#6E6A62]">
                          {(f.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-[#A6A29A] hover:text-[#F2F0EA] bg-[#24221E] border border-[#2B2924] rounded-[6px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || selectedFiles.length === 0}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#FF5A1F] hover:bg-[#E04B14] text-white text-xs font-medium rounded-[6px] transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing Documents...</span>
                    </>
                  ) : (
                    <span>Process {selectedFiles.length} File(s)</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Scan Gmail Inbox */}
          {activeTab === 'email' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#161512] p-3 rounded-[6px] border border-[#2B2924]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-[4px] bg-[#24221E] border border-[#2B2924] text-[#FF5A1F] flex items-center justify-center font-bold text-xs">
                    M
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#F2F0EA]">{activeStudent?.email}</p>
                    <p className="text-[10px] text-[#A6A29A]">{emailList.length} campus emails discovered</p>
                  </div>
                </div>
                <span className="text-[10px] bg-[#0B6E4F]/15 text-[#4ADE80] border border-[#0B6E4F]/30 px-2 py-0.5 rounded font-medium">
                  Connected
                </span>
              </div>

              {isLoadingEmails ? (
                <div className="py-8 text-center text-xs text-[#6E6A62]">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  <span>Scanning inbox for notice patterns...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {emailList.map((email) => {
                    const isSelected = selectedEmailIds.includes(email.id);
                    return (
                      <div
                        key={email.id}
                        onClick={() => {
                          setSelectedEmailIds((prev) =>
                            isSelected ? prev.filter((id) => id !== email.id) : [...prev, email.id]
                          );
                        }}
                        className={`p-2.5 rounded-[6px] border text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#24221E] border-[#FF5A1F]'
                            : 'bg-[#161512] border-[#2B2924] hover:border-[#3D3A33]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[#F2F0EA] truncate max-w-sm">
                            {email.subject}
                          </span>
                          <span className="text-[10px] text-[#6E6A62] shrink-0">{email.receivedAt}</span>
                        </div>
                        <p className="text-[11px] text-[#A6A29A] line-clamp-1">{email.body}</p>
                        <div className="flex items-center justify-between mt-1 text-[10px]">
                          <span className="text-[#6E6A62]">{email.sender}</span>
                          <span className="text-[#A6A29A] bg-[#24221E] px-1.5 py-0.2 rounded border border-[#2B2924]">
                            {email.tag}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#2B2924]">
                <span className="text-xs text-[#6E6A62]">
                  {selectedEmailIds.length} of {emailList.length} emails selected
                </span>
                <button
                  onClick={handleEmailScanSubmit}
                  disabled={isProcessing || selectedEmailIds.length === 0}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#FF5A1F] hover:bg-[#E04B14] text-white text-xs font-medium rounded-[6px] transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning & Structuring...</span>
                    </>
                  ) : (
                    <span>Scan Selected Emails</span>
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
