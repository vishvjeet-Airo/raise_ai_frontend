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
import HumanValidationRequired from "./components/document-detail/HumanValidationRequired";

type ChatSidebarContextType = {
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPreviewOpen: boolean;
  setIsPreviewOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shouldMinimizeSidebar: boolean;
  documentId: string;
  documentName: string;
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
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();

  const [document, setDocument] = useState<NormalizedDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handlePreviewClick = () => {
    setIsPreviewOpen((v) => !v);
    if (!isPreviewOpen) {
      setPreviewPage(null); // Reset page when opening preview normally
      setSearchText(null); // Reset search text
    }
  };

  // Function to handle page-specific preview opening with optional search text
  const handlePageClick = (pageNumber: number, sourceText?: string) => {
    setIsPreviewOpen(true);
    setPreviewPage(pageNumber);
    setSearchText(sourceText || null);
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

  // Function to get preview URL for iframe
  const getPreviewUrl = () => {
    if (!document?.url) return "";
    let url = `${document.url}#toolbar=1&navpanes=1&scrollbar=1`;
    if (previewPage) {
      url += `&page=${previewPage}`;
    }
    if (searchText) {
      // URL encode the search text for PDF.js search functionality
      url += `&search=${encodeURIComponent(searchText)}`;
    }
    return url;
  };

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
    };
  }, [document, isChatOpen, isPreviewOpen, shouldMinimizeSidebar]);

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
                  Document Detail
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
                    <HumanValidationRequired/>
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
                        <HumanValidationRequired/>
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
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Document Preview</h3>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="flex-1">
                <iframe
                  key={`preview-${previewPage || 'default'}-${searchText || 'no-search'}`}
                  src={getPreviewUrl()}
                  className="w-full h-full border-0"
                  title="Document Preview"
                />
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