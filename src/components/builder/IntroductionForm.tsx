import React from 'react';
import { Lightbulb } from 'lucide-react';

interface Props {
  value: string;
  onChange: (updated: string) => void;
}

export const IntroductionForm: React.FC<Props> = ({ value, onChange }) => {
  const wordCount = value.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = value.length;

  return (
    <div className="space-y-3">
      {/* Writing tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start space-x-2.5 text-amber-900 text-xs">
        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Writing Tip:</strong> Summarize your role, specialization, years of experience, and strongest professional value in 2 to 4 sentences.
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Professional Summary / Introduction
          </label>
          <div className="text-[11px] font-medium text-slate-500 space-x-2">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
            <span
              className={`ml-1 font-semibold ${
                wordCount >= 40 && wordCount <= 100
                  ? 'text-emerald-600'
                  : wordCount > 100
                  ? 'text-amber-600'
                  : 'text-slate-400'
              }`}
            >
              (Target: 40–100 words)
            </span>
          </div>
        </div>

        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Results-driven Software Engineer with 5+ years of experience in cloud infrastructure, microservices, and modern web application development..."
          className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors leading-relaxed"
        />
      </div>
    </div>
  );
};
