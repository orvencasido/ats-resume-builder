import React from 'react';
import { ResumeData } from '../../types';
import { checkAtsReadiness } from '../../utils/atsChecker';
import { Modal } from '../ui/Modal';
import { AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
}

export const AtsCheckPanel: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const result = checkAtsReadiness(data);

  const statusColors = {
    Ready: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Needs Review': 'bg-amber-100 text-amber-800 border-amber-300',
    Incomplete: 'bg-rose-100 text-rose-800 border-rose-300',
  }[result.status];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ATS Readiness Audit" maxWidth="lg">
      <div className="space-y-5">
        {/* Status Score Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="font-semibold text-base">ATS Compatibility Rating</h4>
            </div>
            <p className="text-xs text-slate-300">
              Evaluates document structure, contact data, achievement bullets, and font compliance.
            </p>
          </div>

          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusColors} mb-1`}>
              {result.status}
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400">{result.score}%</div>
          </div>
        </div>

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1 text-rose-600" /> High Impact Issues ({result.warnings.length})
            </h5>
            <ul className="space-y-1.5">
              {result.warnings.map((warn, idx) => (
                <li key={idx} className="bg-rose-50 border border-rose-200 text-rose-900 text-xs p-3 rounded-lg flex items-start space-x-2">
                  <span className="font-bold">•</span>
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {result.suggestions.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center">
              <Info className="w-4 h-4 mr-1 text-amber-600" /> Optimization Recommendations ({result.suggestions.length})
            </h5>
            <ul className="space-y-1.5">
              {result.suggestions.map((sug, idx) => (
                <li key={idx} className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-lg flex items-start space-x-2">
                  <span className="font-bold">•</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Passed Checks */}
        {result.passes.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" /> Validated Standard Rules ({result.passes.length})
            </h5>
            <ul className="space-y-1.5">
              {result.passes.map((pas, idx) => (
                <li key={idx} className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-2.5 rounded-lg flex items-start space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{pas}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </Modal>
  );
};
