import React, { useEffect } from 'react';
import { ResumeData } from '../../types';
import { usePDF } from '@react-pdf/renderer';
import { ResumePdfDocument } from '../pdf/ResumePdfDocument';
import { Loader2 } from 'lucide-react';

interface Props {
  data: ResumeData;
  className?: string;
}

export const ResumePreview: React.FC<Props> = ({ data, className = '' }) => {
  const [pdfInstance, updatePdf] = usePDF({
    document: <ResumePdfDocument data={data} />,
  });

  useEffect(() => {
    updatePdf(<ResumePdfDocument data={data} />);
  }, [data, updatePdf]);

  return (
    <div className={`flex flex-col h-full w-full bg-slate-100 ${className}`}>
      {pdfInstance.loading && !pdfInstance.url ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-600">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
          <span className="text-sm font-semibold">Loading PDF Preview...</span>
        </div>
      ) : pdfInstance.url ? (
        <iframe
          src={`${pdfInstance.url}#toolbar=0&navpanes=0&view=FitH`}
          title="PDF Live Preview"
          className="w-full h-full border-none flex-1 min-h-full"
        />
      ) : null}
    </div>
  );
};
