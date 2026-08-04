import React from 'react';
import { AuthUser } from '../../services/authService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Plus, LogOut, User, Database, ShieldCheck } from 'lucide-react';

interface Props {
  user: AuthUser | null;
  onLogout: () => void;
  onCreateNew: () => void;
}

export const DashboardHeader: React.FC<Props> = ({ user, onLogout, onCreateNew }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Welcome Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900">
                  Welcome back, {user?.fullName || 'User'}!
                </h1>
                {isSupabaseConfigured ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Database className="w-3 h-3 mr-1" /> Cloud Sync Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    Local Storage Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {user?.email || 'Manage your professional ATS resumes'}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Resume</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
