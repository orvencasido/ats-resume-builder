import React from 'react';
import { ResumeData } from '../../types';
import { FileText, Calendar, Edit3, Copy, Trash2 } from 'lucide-react';

interface Props {
  resume: ResumeData;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ResumeCard: React.FC<Props> = ({ resume, onEdit, onDuplicate, onDelete }) => {
  // Calculate completion percentage
  let filled = 0;
  let total = 5;
  if (resume.personalInfo?.fullName) filled++;
  if (resume.introduction) filled++;
  if (resume.workExperiences?.length > 0) filled++;
  if (resume.technicalSkills?.length > 0) filled++;
  if (resume.education?.length > 0) filled++;
  const completionPercentage = Math.round((filled / total) * 100);

  const formattedDate = new Date(resume.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-indigo-600 transition-colors">
                {resume.title}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Updated {formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={() => onDuplicate(resume.id)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Duplicate Resume"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(resume.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Resume"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Badges & Stats */}
        <div className="my-4 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 text-[11px] font-medium">Completion Progress</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800">{completionPercentage}%</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onEdit(resume.id)}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2"
        >
          <Edit3 className="w-4 h-4" />
          <span>Open Resume Editor</span>
        </button>
      </div>
    </div>
  );
};
