import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  publicationDate: string;
  status: 'Processed' | 'COMPLETED' | 'PENDING' | 'FAILED';
  publisher: string;
  url: string;
  file_name: string;
}

interface DocumentViewerModalProps {
  document: Document;
  onClose: () => void;
  targetPage?: number;
  searchText?: string;
}

const DocumentViewerModal = ({ document, onClose, targetPage, searchText }: DocumentViewerModalProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastHighlightRef = useRef<string | null>(null);

  // Helper to escape regex special characters
  const escapeRegExp = (text: string) => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Function to highlight text in the iframe
  const highlightTextInIframe = (text: string) => {
    const iframe = iframeRef.current;
    if (!iframe || !text.trim()) return;

    try {
      const win = iframe.contentWindow as any;
      const doc = iframe.contentDocument;

      // Clear previous highlights first
      clearHighlights();

      // If PDF.js is available, use its find API
      if (win && win.PDFViewerApplication && win.PDFViewerApplication.eventBus) {
        // Navigate to target page first if specified
        if (targetPage && targetPage > 0) {
          try {
            win.PDFViewerApplication.page = targetPage;
          } catch (e) {
            console.warn('Could not navigate to page:', targetPage);
          }
        }

        // Use PDF.js find functionality for highlighting
        win.PDFViewerApplication.eventBus.dispatch('find', {
          source: win,
          type: 'find',
          query: text.trim(),
          highlightAll: true,
          caseSensitive: false,
          entireWord: false,
          findPrevious: false,
        });

        lastHighlightRef.current = text;
        return;
      }

      // Fallback for HTML content (same-origin)
      if (doc && doc.body) {
        const regex = new RegExp(escapeRegExp(text.trim()), 'gi');
        const walker = doc.createTreeWalker(
          doc.body,
          NodeFilter.SHOW_TEXT,
          null
        );

        const textNodes: Text[] = [];
        let node: Node | null = walker.nextNode();

        while (node) {
          if (node.nodeType === Node.TEXT_NODE &&
              node.textContent &&
              regex.test(node.textContent)) {
            textNodes.push(node as Text);
          }
          node = walker.nextNode();
        }

        textNodes.forEach((textNode) => {
          const parent = textNode.parentNode;
          if (!parent) return;

          const span = doc.createElement('span');
          span.innerHTML = (textNode.textContent || '').replace(
            regex,
            (match) => `<mark style="background-color: yellow; padding: 0; color: black;" data-highlight="custom">${match}</mark>`
          );

          parent.replaceChild(span, textNode);
        });

        lastHighlightRef.current = text;
      }
    } catch (e) {
      console.warn('Could not highlight text in iframe:', e);
    }
  };

  // Function to clear previous highlights
  const clearHighlights = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const win = iframe.contentWindow as any;
      const doc = iframe.contentDocument;

      // Clear PDF.js highlights
      if (win && win.PDFViewerApplication && win.PDFViewerApplication.eventBus) {
        win.PDFViewerApplication.eventBus.dispatch('find', {
          source: win,
          type: 'find',
          query: '',
          highlightAll: false,
        });
      }

      // Clear HTML highlights
      if (doc) {
        const highlights = doc.querySelectorAll('mark[data-highlight="custom"]');
        highlights.forEach((highlight: Element) => {
          const parent = highlight.parentNode;
          if (parent) {
            parent.replaceChild(doc.createTextNode(highlight.textContent || ''), highlight);
            parent.normalize();
          }
        });
      }

      lastHighlightRef.current = null;
    } catch (e) {
      console.warn('Could not clear highlights in iframe:', e);
    }
  };

  // Handle iframe load and highlighting
  const handleIframeLoad = () => {
    setIsLoaded(true);

    // Small delay to allow PDF.js to initialize
    setTimeout(() => {
      if (searchText && searchText.trim()) {
        highlightTextInIframe(searchText);
      } else if (targetPage && targetPage > 0) {
        // Just navigate to page without highlighting
        const iframe = iframeRef.current;
        if (iframe) {
          try {
            const win = iframe.contentWindow as any;
            if (win && win.PDFViewerApplication) {
              win.PDFViewerApplication.page = targetPage;
            }
          } catch (e) {
            console.warn('Could not navigate to page:', targetPage);
          }
        }
      }
    }, 500);
  };

  // Effect to handle highlighting when props change
  useEffect(() => {
    if (!isLoaded) return;

    // If we have new search text and it's different from the last highlight
    if (searchText && searchText.trim() && searchText !== lastHighlightRef.current) {
      setTimeout(() => {
        highlightTextInIframe(searchText);
      }, 100);
    }
    // If no search text but we had previous highlights, clear them
    else if (!searchText && lastHighlightRef.current) {
      clearHighlights();
    }
  }, [searchText, isLoaded, targetPage]);

  // Generate URL with page fragment for PDFs
  const getDocumentUrl = () => {
    let url = document.url;
    if (document.url.toLowerCase().includes('.pdf') && targetPage && targetPage > 0) {
      url += `#page=${targetPage}`;
    }
    return url;
  };

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white shadow-2xl flex flex-col transform transition-transform duration-300 animate-scale-in overflow-hidden w-[90vw] h-[90vh] max-w-4xl">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-3 bg-[#1F4A75] text-white">
          <h3 className="text-lg font-medium truncate">{document.name}</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-white/80 p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0 ml-2"
            aria-label="Close viewer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Document content */}
        <div className="flex-1 bg-white overflow-hidden relative">
          <iframe
            ref={iframeRef}
            src={getDocumentUrl()}
            title={document.name}
            className="w-full h-full border-0 block"
            onLoad={handleIframeLoad}
            key={`${document.url}-${targetPage || 0}`} // Force reload when target page changes
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
