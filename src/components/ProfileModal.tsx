'use client';

import React, { useState } from 'react';
import { X, User, Check, Loader2 } from 'lucide-react';
import { StudentProfile } from '@/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStudent: StudentProfile | null;
  availableProfiles: StudentProfile[];
  onProfileChanged: (updatedStudent: StudentProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  activeStudent,
  availableProfiles,
  onProfileChanged,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(activeStudent?.id || '');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<StudentProfile>(
    activeStudent || {
      id: '',
      name: '',
      email: '',
      department: '',
      branchCode: 'CSE',
      year: 3,
      semester: 6,
      gpa: 8.5,
      academicInterests: [],
      careerInterests: [],
      extracurriculars: [],
    }
  );

  React.useEffect(() => {
    if (activeStudent) {
      setSelectedStudentId(activeStudent.id);
      setFormData(activeStudent);
    }
  }, [activeStudent]);

  if (!isOpen) return null;

  const handleSelectPreset = async (profile: StudentProfile) => {
    setSelectedStudentId(profile.id);
    setFormData(profile);
    setIsSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to switch profile');

      onProfileChanged(data.student);
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');

      onProfileChanged(data.student);
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="saas-card w-full max-w-xl bg-[#1C1B17] border border-[#2B2924] shadow-2xl rounded-[8px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#2B2924] flex items-center justify-between bg-[#161512]">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-[4px] bg-[#24221E] border border-[#2B2924] text-[#F2F0EA] flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F2F0EA]">Student Profile Settings</h3>
              <p className="text-[10px] text-[#A6A29A]">Switch persona or configure custom profile parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6E6A62] hover:text-[#F2F0EA] rounded hover:bg-[#24221E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Preset Persona Switcher */}
          <div>
            <label className="block text-[10px] font-semibold text-[#6E6A62] uppercase tracking-wider mb-2">
              Preset Student Personas (Instant Feed Rescoring)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {availableProfiles.map((p) => {
                const isSelected = selectedStudentId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    disabled={isSaving}
                    className={`p-3 rounded-[6px] border text-left transition-all ${
                      isSelected
                        ? 'bg-[#24221E] border-[#FF5A1F] text-[#F2F0EA]'
                        : 'bg-[#161512] border-[#2B2924] hover:border-[#3D3A33] text-[#A6A29A]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-[#F2F0EA]">{p.name.split(' ')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#FF5A1F]" />}
                    </div>
                    <p className="text-[11px] text-[#A6A29A]">{p.branchCode} • Year {p.year}</p>
                    <p className="text-[10px] text-[#6E6A62] mt-0.5 truncate">{p.academicInterests[0] || 'Engineering'}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#2B2924] pt-4">
            <h4 className="text-xs font-semibold text-[#F2F0EA] mb-3">Custom Profile Parameters</h4>
            <form onSubmit={handleSaveCustom} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#A6A29A] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] rounded-[6px] px-3 py-1.5 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#A6A29A] mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] rounded-[6px] px-3 py-1.5 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#A6A29A] mb-1">Branch</label>
                  <select
                    value={formData.branchCode}
                    onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                    className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] rounded-[6px] px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="MBA">MBA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#A6A29A] mb-1">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] rounded-[6px] px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#A6A29A] mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
                    className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] rounded-[6px] px-3 py-1.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#A6A29A] mb-1">
                  Interests & Specializations (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.academicInterests.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      academicInterests: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. Distributed Systems, Machine Learning, SDE"
                  className="w-full bg-[#161512] border border-[#2B2924] focus:border-[#3D3A33] text-xs text-[#F2F0EA] rounded-[6px] px-3 py-1.5 focus:outline-none"
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
                  disabled={isSaving}
                  className="flex items-center space-x-1.5 px-4 py-1.5 bg-[#FF5A1F] hover:bg-[#E04B14] text-white text-xs font-medium rounded-[6px] transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <span>Save & Rescore</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
