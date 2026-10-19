import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Key, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { changeAdminPassword } from '../services/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg?: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMsg('');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!oldPassword.trim()) {
      setError('দয়া করে বর্তমান পাসওয়ার্ড দিন।');
      return;
    }
    if (!newPassword.trim()) {
      setError('দয়া করে নতুন পাসওয়ার্ড দিন।');
      return;
    }
    if (newPassword.length < 4) {
      setError('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await changeAdminPassword(oldPassword.trim(), newPassword.trim());
      if (res.success) {
        setSuccessMsg(res.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।');
        if (onSuccess) {
          onSuccess(res.message);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(res.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
      }
    } catch {
      setError('সার্ভারে যোগাযোগ করা যায়নি। দয়া করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#111D19] border border-[#1E332B] rounded-3xl w-full max-w-md flex flex-col shadow-2xl relative overflow-hidden text-white animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#172721] bg-[#111D19] flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#065F46]/50 border border-[#10B981]/30 flex items-center justify-center text-[#34D399]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">অ্যাডমিন পাসওয়ার্ড পরিবর্তন</h3>
              <p className="text-[11px] text-[#94A3B8]">নতুন নিরাপত্তা পাসওয়ার্ড সেট করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#162721] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="text-xs font-semibold text-[#CBD5E1] block mb-1.5">
              বর্তমান পাসওয়ার্ড <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#0D1613] border border-[#1E332B] focus:border-[#10B981] focus:outline-none text-white text-xs"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-xs font-semibold text-[#CBD5E1] block mb-1.5">
              নতুন পাসওয়ার্ড <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="কমপক্ষে ৪ অক্ষরের নতুন পাসওয়ার্ড"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#0D1613] border border-[#1E332B] focus:border-[#10B981] focus:outline-none text-white text-xs"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-semibold text-[#CBD5E1] block mb-1.5">
              নতুন পাসওয়ার্ড পুনরায় লিখুন <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="নতুন পাসওয়ার্ড নিশ্চিত করুন"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#0D1613] border border-[#1E332B] focus:border-[#10B981] focus:outline-none text-white text-xs"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-2.5 pt-3 border-t border-[#172721]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl border border-[#244237] bg-[#162822] hover:bg-[#1E3A2F] text-[#CBD5E1] text-xs font-semibold transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-black text-xs font-bold transition-all shadow-md shadow-[#10B981]/20 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'পরিবর্তন করা হচ্ছে...' : 'পাসওয়ার্ড সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
