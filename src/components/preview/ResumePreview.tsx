import React, { useEffect, useRef, useState } from 'react';
import { ResumeData } from '../../types';
import { pdf } from '@react-pdf/renderer';
import { ResumePdfDocument } from '../pdf/ResumePdfDocument';
import { Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface Props {
  data: ResumeData;
  className?: string;
}

interface PreviewPage {
  pageNumber: number;
  width: number;
  height: number;
  src: string;
}

export const ResumePreview: React.FC<Props> = ({ data, className = '' }) => {
  const [pages, setPages] = useState<PreviewPage[]>([]);
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const renderIdRef = useRef(0);

  useEffect(() => {
    const renderId = renderIdRef.current + 1;
    renderIdRef.current = renderId;
    setIsRendering(true);
    setRenderError(null);

    const timer = window.setTimeout(async () => {
      try {
        const blob = await pdf(<ResumePdfDocument data={data} />).toBlob();
        const buffer = await blob.arrayBuffer();
        const documentTask = pdfjsLib.getDocument({ data: buffer });
        const pdfDocument = await documentTask.promise;
        const nextPages: PreviewPage[] = [];

        for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
          if (renderIdRef.current !== renderId) {
            await documentTask.destroy?.();
            return;
          }

          const page = await pdfDocument.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error('Canvas rendering is not supported in this browser.');
          }

          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;

          nextPages.push({
            pageNumber,
            width: viewport.width,
            height: viewport.height,
            src: canvas.toDataURL('image/png'),
          });

          page.cleanup();
        }

        await documentTask.destroy?.();

        if (renderIdRef.current === renderId) {
          setPages(nextPages);
          setIsRendering(false);
        }
      } catch (error: any) {
        if (renderIdRef.current === renderId) {
          setRenderError(error?.message || 'Unable to render PDF preview.');
          setIsRendering(false);
        }
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
    };
  }, [data]);

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden bg-slate-200 ${className}`}>
      {isRendering && pages.length > 0 && (
        <div className="absolute right-4 top-4 z-10 inline-flex items-center rounded-full border border-slate-300 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-indigo-600" />
          Updating preview
        </div>
      )}

      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        {pages.length === 0 && isRendering ? (
          <div className="flex min-h-full flex-col items-center justify-center p-12 text-slate-600">
            <Loader2 className="mb-2 h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-sm font-semibold">Rendering PDF Preview...</span>
          </div>
        ) : renderError ? (
          <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center text-center text-slate-700">
            <p className="text-sm font-semibold">Preview could not be rendered.</p>
            <p className="mt-1 text-xs text-slate-500">{renderError}</p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6">
            {pages.map((page) => (
              <div
                key={page.pageNumber}
                className="w-full max-w-full"
                style={{ maxWidth: page.width / 2 }}
              >
                <img
                  src={page.src}
                  width={page.width / 2}
                  height={page.height / 2}
                  alt={`Resume preview page ${page.pageNumber}`}
                  className="block h-auto w-full bg-white shadow-xl ring-1 ring-slate-300"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
