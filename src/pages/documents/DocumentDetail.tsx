import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import AIGeneratedSummary from "./components/document-detail/AIGeneratedSummary";
import ChatSidebar from "./components/document-detail/ChatSidebar";
import CircularOverview from "./components/document-detail/CircularOverview";
import ComparativeInsights from "./components/document-detail/ComparativeInsights";
import DocumentHeader from "./components/document-detail/DocumentHeader";
import DocumentTimeline from "./components/document-detail/DocumentTimeline";
import KeyObligationsAndActionPoints from "./components/document-detail/KeyObligationsAndActionPoints";
import ReportsAndExports from "./components/document-detail/ReportsAndExports";
import { API_BASE_URL } from "@/lib/config";
import { formatDateShort } from "@/lib/dateUtils";

type ChatSidebarContextType = {
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPreviewOpen: boolean;
  setIsPreviewOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shouldMinimizeSidebar: boolean;
  documentId: string;
  documentName: string;
  previewPage?: number; // Add page number for preview
  setPreviewPage: React.Dispatch<React.SetStateAction<number | undefined>>; // Setter for page
  searchText?: string; // NEW: Add search text for highlighting
  setSearchText: React.Dispatch<React.SetStateAction<string | undefined>>; // NEW: Setter for search text
};

const ChatSidebarContext = createContext<ChatSidebarContextType | null>(null);

export const useChatSidebar = () => {
  const context = useContext(ChatSidebarContext);
  if (!context) {
    throw new Error("useChatSidebar must be used within a ChatSidebarProvider");
  }
  return context;
};

type ApiDetailedActionPoint = {
  id: number;
  assigned_to_department?: string | null;
  // Add other fields as needed
};

type ApiActionPoint = {
  id: number;
  title: string;
  description?: string;
  source_page?: number;
  deadline?: string | null;
  is_relevant?: boolean;
  assigned_to_name?: string | null;
  assigned_to_department?: string | null;
  source_text?: string; // NEW: Add source_text field
  detailed_action_points?: ApiDetailedActionPoint[] | null;
};

type ApiDocument = {
  id: number;
  title?: string | null;
  file_name?: string | null;
  blob_url?: string | null;
  issuing_authority?: string | null;
  publication_date?: string | null;
  uploaded_at?: string | null; // Keep the original timestamp
  analysis_completed_at?: string | null; // completion timestamp from API
  circular_type?: string | null;
  reference_number?: string | null;
  action_points?: ApiActionPoint[] | null;
};

// MODIFIED: Added uploadedAtTimestamp and completedAtTimestamp to the normalized shape
type NormalizedDocument = {
  id: string;
  name: string;
  publisher: string;
  publicationDate: string;
  uploadedAtTimestamp?: string; // To store the full ISO string for the timeline
  completedAtTimestamp?: string; // analysis completion timestamp
  circularType: string;
  referenceNumber: string;
  url: string;
  impactAreas: string;
  actionPoints: ApiActionPoint[];
};

export default function DocumentDetail() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState<number | undefined>(undefined); // Track preview page
  const [searchText, setSearchText] = useState<string | undefined>(undefined); // NEW: Track search text for highlighting
  const { id } = useParams<{ id: string }>();

  const [document, setDocument] = useState<NormalizedDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handlePreviewClick = () => setIsPreviewOpen((v) => !v);

  // MODIFIED: Function to handle page-specific preview opening with search text
  const handlePageClick = (pageNumber: number, searchText?: string) => {
    setPreviewPage(pageNumber);
    setSearchText(searchText);
    setIsPreviewOpen(true);
  };

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!id) {
        setError("Missing document id in URL.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");

        const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
          headers: {
            accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch document (${res.status})`);
        }

        const data: ApiDocument[] | ApiDocument = await res.json();
        const raw: ApiDocument | undefined = Array.isArray(data) ? data[0] : data;

        if (!raw) {
          throw new Error("Document not found.");
        }

        // MODIFIED: Store the original 'uploaded_at' and 'analysis_completed_at' timestamps
        const normalized: NormalizedDocument = {
          id: String(raw.id),
          name: raw.title || raw.file_name || `Document ${raw.id}`,
          publisher: raw.issuing_authority || "Unknown",
          publicationDate: formatDateShort(raw.publication_date),
          uploadedAtTimestamp: raw.uploaded_at || "", // Keep the full timestamp
          completedAtTimestamp: raw.analysis_completed_at || "", 
          circularType: raw.circular_type || "",
          referenceNumber: raw.reference_number || "",
          url: raw.blob_url || "",
          impactAreas: (() => {
            const departments = Array.from(new Set(
              raw.action_points?.flatMap(ap => 
                ap.detailed_action_points?.map(dap => dap.assigned_to_department).filter((dept): dept is string => Boolean(dept)) || []
              ) || []
            ));
            return departments.length > 0 ? departments.join(", ") : "N/A";
          })(),
          actionPoints: raw.action_points ?? [],
        };
        console.log(raw.action_points);
        
        if (!ignore) setDocument(normalized);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Something went wrong.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const anySidebarOpen = isPreviewOpen || isChatOpen;
  const shouldMinimizeSidebar = anySidebarOpen;

  const contextValue = useMemo<ChatSidebarContextType | null>(() => {
    if (!document) return null;
    return {
      isChatOpen,
      setIsChatOpen,
      isPreviewOpen,
      setIsPreviewOpen,
      shouldMinimizeSidebar,
      documentId: document.id,
      documentName: document.name,
      previewPage, // Include preview page in context
      setPreviewPage, // Include setter in context
      searchText, // NEW: Include search text in context
      setSearchText, // NEW: Include setter in context
    };
  }, [document, isChatOpen, isPreviewOpen, shouldMinimizeSidebar, previewPage, searchText]);

  // MODIFIED: Generate preview URL with page parameter and search text
  const getPreviewUrl = () => {
    if (!document?.url) return '';
    
    let url = document.url;
    // For PDF files, add page fragment (viewer will usually use #page=X)
    if (document.url.toLowerCase().includes('.pdf')) {
      if (previewPage) url += `#page=${previewPage}`;
    }
    
    return url;
  };

  // Helper to escape regex
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Try to highlight `text` inside the preview iframe. If a PDF.js viewer is
  // present (same-origin), use its find API. Otherwise, if iframe is same-origin
  // and contains HTML/text, wrap matches in <mark> elements.
  const highlightInIframe = (text?: string, page?: number) => {
    if (!text && typeof page === 'undefined') return;
    const iframe = globalThis.document.getElementById('doc-preview-iframe') as HTMLIFrameElement | null;
    if (!iframe) return;

    try {
      const win = iframe.contentWindow as any | null;
      const doc = iframe.contentDocument;

      // If PDF.js is available inside the iframe, use its find API
      if (win && win.PDFViewerApplication && win.PDFViewerApplication.eventBus) {
        if (typeof page === 'number' && page > 0) {
          try { win.PDFViewerApplication.page = page; } catch (e) { /* ignore */ }
        }

        if (text) {
          win.PDFViewerApplication.eventBus.dispatch('find', {
            source: win,
            type: 'find',
            query: text,
            highlightAll: true,
            caseSensitive: false,
            entireWord: false,
            findPrevious: false,
          });
        }
        return;
      }

      // Fallback for same-origin HTML: search text nodes and wrap matches
      if (doc && doc.body && text) {
        if (typeof page === 'number' && page > 0 && win && 'page' in win) {
          try { (win as any).page = page; } catch (e) { /* ignore */ }
        }

        const regex = new RegExp(escapeRegExp(text), 'gi');
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
        const nodes: Text[] = [];
        let node: Node | null = walker.nextNode();
        while (node) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent && regex.test(node.textContent)) {
            nodes.push(node as Text);
          }
          node = walker.nextNode();
        }

        nodes.forEach((textNode) => {
          const span = doc.createElement('span');
          span.innerHTML = (textNode.textContent || '').replace(regex, (m) => `<mark style="background:yellow; padding:0">${m}</mark>`);
          textNode.parentNode?.replaceChild(span, textNode);
        });
      }
    } catch (e) {
      // Cross-origin iframe or other error — we cannot access contents
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar forceCollapsed={false} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="text-gray-600">Loading document...</div>
        </main>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar forceCollapsed={false} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="text-red-600">
            {error || "Document not found. Please go back to the list."}
          </div>
        </main>
      </div>
    );
  }

  return (
    <ChatSidebarContext.Provider value={contextValue!}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar forceCollapsed={shouldMinimizeSidebar} />

        <div className="flex flex-1 min-w-0">
          {/* Main Content Area */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-7xl">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                <Link
                  to="/documents"
                  className="hover:text-gray-900 transition-colors"
                  style={{
                    font: "poppins",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                  }}
                >
                  All Documents
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span
                  className="text-[#1F4A75] font-semibold"
                  style={{
                    font: "poppins",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                  }}
                >
                  {document.name}
                </span>
              </div>

              <div className="space-y-6">
                {anySidebarOpen ? (
                  // When ANY sidebar is open, stack content vertically
                  <>
                    <DocumentHeader
                      fileName={document.name}
                      issueDate={document.publicationDate}
                      publisher={document.publisher}
                      documentId={document.id}
                      onPreviewClick={handlePreviewClick}
                    />
                    <CircularOverview
                      issuingAuthority={document.publisher}
                      issuingDate={document.publicationDate}
                      circularType={document.circularType}
                      referenceNumber={document.referenceNumber}
                      impactAreas={document.impactAreas}
                    />
                    <AIGeneratedSummary documentId={Number(document.id)} />
                    <div className="mx-4">
                      <KeyObligationsAndActionPoints
                        actionPoints={document.actionPoints || []}
                        loading={false}
                        error={null}
                        onPageClick={handlePageClick} // Pass page click handler with search text support
                      />
                    </div>
                    {/* Pass both uploaded and completion timestamps */}
                    <DocumentTimeline
                      uploadedTimestamp={document.uploadedAtTimestamp}
                      completionTimestamp={document.completedAtTimestamp}
                    />
                    <ComparativeInsights documentId={Number(document.id)} />
                    <ReportsAndExports
                      documentTitle={document.name}
                      documentUrl={document.url}
                      documentId={document.id}
                    />
                  </>
                ) : (
                  // When NO sidebar is open, use two columns layout
                  <>
                    <div className="flex gap-5">
                      {/* Left Column of Content */}
                      <div className="flex-1 space-y-6">
                        <DocumentHeader
                          fileName={document.name}
                          issueDate={document.publicationDate}
                          publisher={document.publisher}
                          documentId={document.id}
                          onPreviewClick={handlePreviewClick}
                        />
                        <CircularOverview
                          issuingAuthority={document.publisher}
                          issuingDate={document.publicationDate}
                          circularType={document.circularType}
                          referenceNumber={document.referenceNumber}
                          impactAreas={document.impactAreas}
                        />
                        <AIGeneratedSummary documentId={Number(document.id)} />
                      </div>

                      {/* Right Column of Content */}
                      <div className="w-[361px] flex-shrink-0 space-y-6">
                        {/* Pass both uploaded and completion timestamps */}
                        <DocumentTimeline
                          uploadedTimestamp={document.uploadedAtTimestamp}
                          completionTimestamp={document.completedAtTimestamp}
                        />
                        <ComparativeInsights documentId={Number(document.id)} />
                        <ReportsAndExports
                          documentTitle={document.name}
                          documentUrl={document.url}
                          documentId={document.id}
                        />
                      </div>
                    </div>
                    <div className="mx-4">
                      <KeyObligationsAndActionPoints
                        actionPoints={document.actionPoints || []}
                        loading={false}
                        error={null}
                        onPageClick={handlePageClick} // Pass page click handler with search text support
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>

          {isPreviewOpen && (
            <aside className="w-1/3 border-l border-gray-200 bg-white flex flex-col transition-all duration-300">
              <div className="flex-1 min-h-0 relative">
                <iframe
                  id="doc-preview-iframe"
                  src={getPreviewUrl()} // Use dynamic URL with page parameter
                  title={document.name}
                  className="w-full h-full border-0 block"
                  key={`${document.url}-${previewPage}-${searchText}`} // Force reload when page or search changes
                  onLoad={() => {
                    // Try to highlight the search text when iframe finishes loading
                    if (searchText) {
                      // Small timeout to allow viewer to initialize
                      setTimeout(() => highlightInIframe(searchText, previewPage), 300);
                    } else if (typeof previewPage === 'number') {
                      // If only page changed, try to set page for same-origin viewer
                      setTimeout(() => highlightInIframe(undefined, previewPage), 200);
                    }
                  }}
                />
                {/* Search indicator */}
                {searchText && (
                  <div className="absolute top-2 right-2 bg-yellow-100 border border-yellow-300 rounded px-2 py-1 text-xs text-yellow-800 shadow-sm">
                    Searching: "{searchText}"
                  </div>
                )}
              </div>
            </aside>
          )}

          {isChatOpen && (
            <aside className="w-1/4 transition-all duration-300 border-l-2 border-gray-300">
              <ChatSidebar
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                documentId={document.id}
                documentName={document.name}
              />
            </aside>
          )}
        </div>
      </div>
    </ChatSidebarContext.Provider>
  );
}