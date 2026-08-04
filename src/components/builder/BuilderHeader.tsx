import React, { useState } from 'react';
import { ResumeData, SaveStatus } from '../../types';
import { pdf } from '@react-pdf/renderer';
import { ResumePdfDocument } from '../pdf/ResumePdfDocument';
import {
  ArrowLeft,
  Check,
  Cloud,
  Download,
  Edit3,
  Loader2,
  Sliders,
} from 'lucide-react';

interface Props {
  data: ResumeData;
  saveStatus: SaveStatus;
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onOpenSectionOrder: () => void;
  onOpenAtsCheck?: () => void;
  onOpenSampleData?: () => void;
  activeMobileTab: 'editor' | 'preview';
  onMobileTabChange: (tab: 'editor' | 'preview') => void;
  completionPercentage: number;
}

export const BuilderHeader: React.FC<Props> = ({
  data,
  saveStatus,
  onBack,
  onTitleChange,
  onOpenSectionOrder,
  activeMobileTab,
  onMobileTabChange,
  completionPercentage,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(data.title);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== data.title) {
      onTitleChange(titleInput.trim());
    } else {
      setTitleInput(data.title);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);

      // Generate PDF blob using @react-pdf/renderer
      const blob = await pdf(<ResumePdfDocument data={data} />).toBlob();

      // Formulate sanitized filename based on candidate name or fallback
      const candidateName = data.personalInfo?.fullName?.trim();
      let filename = 'ATS-Resume.pdf';
      if (candidateName) {
        const sanitized = candidateName
          .replace(/[^a-zA-Z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        filename = `${sanitized}-Resume.pdf`;
      }

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: Back & Title & Save Indicator */}
          <div className="flex items-center space-x-3 overflow-hidden">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                {isEditingTitle ? (
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onBlur={handleTitleSubmit}
                      onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                      autoFocus
                      className="px-2 py-1 text-sm bg-slate-800 text-white rounded border border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-white"
                    />
                    <button
                      onClick={handleTitleSubmit}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="flex items-center space-x-1.5 group text-left truncate"
                  >
                    <span className="font-semibold text-base sm:text-lg text-white group-hover:text-slate-200 truncate">
                      {data.title}
                    </span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                )}
              </div>

              {/* Save status & Progress bar */}
              <div className="flex items-center space-x-3 text-xs mt-0.5">
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>
                    {saveStatus === 'saving' && 'Saving...'}
                    {saveStatus === 'saved' && 'Saved'}
                    {saveStatus === 'unsaved' && 'Unsaved changes'}
                    {saveStatus === 'error' && 'Save failed'}
                  </span>
                </div>

                <span className="text-slate-600">•</span>

                <div className="flex items-center space-x-1.5 text-slate-300">
                  <span className="text-[11px] font-medium">{completionPercentage}% Completed</span>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions & Tools */}
          <div className="flex items-center space-x-2 shrink-0 flex-wrap justify-end gap-y-2">
            {/* Layout & Section Settings */}
            <button
              onClick={onOpenSectionOrder}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors inline-flex items-center space-x-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Sections & Layout</span>
            </button>

            {/* PDF Export Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-all shadow-sm inline-flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden mt-3 border-t border-slate-800 pt-2">
          <div className="grid grid-cols-2 w-full p-0.5 bg-slate-800 rounded-lg">
            <button
              onClick={() => onMobileTabChange('editor')}
              className={`py-1.5 text-xs font-medium rounded-md text-center transition-colors ${
                activeMobileTab === 'editor'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Resume Editor
            </button>
            <button
              onClick={() => onMobileTabChange('preview')}
              className={`py-1.5 text-xs font-medium rounded-md text-center transition-colors ${
                activeMobileTab === 'preview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live PDF Preview
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
