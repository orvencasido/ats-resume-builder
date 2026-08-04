import React from 'react';
import { Modal } from '../ui/Modal';
import { FileText, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SampleDataModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Load Sample Resume Content" maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start space-x-3 bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-semibold text-amber-950 text-sm">Replace Current Content?</h4>
            <p>
              Loading sample resume data will overwrite any text currently entered in this form. This is useful for first-time testing or exploring the format.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
          <strong>The sample includes:</strong>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            <li>Orven Casido personal contact information</li>
            <li>Cloud & DevOps Engineer professional introduction</li>
            <li>2 detailed work experiences with achievement bullets</li>
            <li>4 technical skill categories</li>
            <li>1 education entry & 2 engineering projects & certifications</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors inline-flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Load Sample Data</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
