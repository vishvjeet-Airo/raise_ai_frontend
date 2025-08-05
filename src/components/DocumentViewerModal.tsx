import { useState } from 'react';
import { Document as PdfDocument, Page, pdfjs } from 'react-pdf';
import { X } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Document {
  id: string;
  name: string;
  publicationDate: string;
  status: 'Processed' | 'COMPLETED' | 'PENDING' | 'FAILED';
  publisher: string;
  url: string;
  file_name: string;
}

const DocumentViewerModal = ({ document, onClose }: { document: Document; onClose: () => void; }) => {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div 
        className="bg-white shadow-2xl flex flex-col transform transition-transform duration-300 animate-scale-in overflow-hidden w-[90vw] h-[90vh] max-w-4xl"
      >
        <div className="flex items-center justify-end p-2 bg-[#1F4A75]">
          <button onClick={onClose} className="text-white hover:text-white/80 p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 bg-white overflow-y-auto">
          <PdfDocument
            file={document.url}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </PdfDocument>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;