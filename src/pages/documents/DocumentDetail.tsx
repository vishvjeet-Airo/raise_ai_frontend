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
import HumanValidationRequired from "./components/document-detail/HumanValidationRequired";
import KeyObligationsAndActionPoints from "./components/document-detail/KeyObligationsAndActionPoints";
import ReportsAndExports from "./components/document-detail/ReportsAndExports";
import { API_BASE_URL } from "@/lib/config";

// Defines the shape of the data in the context
type ChatSidebarContextType = {
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPreviewOpen: boolean;
  setIsPreviewOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shouldMinimizeSidebar: boolean;
  documentId: string;
  documentName: string;
};

// Creates the context with the correct type
const ChatSidebarContext = createContext<ChatSidebarContextType | null>(null);

export const useChatSidebar = () => {
  const context = useContext(ChatSidebarContext);
  if (!context) {
    throw new Error("useChatSidebar must be used within a ChatSidebarProvider");
  }
  return context;
};

// API response types (subset)
type ApiActionPoint = {
  id: number;
  title: string;
  description?: string;
  source_page?: number;
  deadline?: string | null;
  is_relevant?: boolean;
  assigned_to_name?: string | null;
  assigned_to_department?: string | null;
};

type ApiDocument = {
  id: number;
  title?: string | null;
  file_name?: string | null;
  blob_url?: string | null;
  issuing_authority?: string | null;
  publication_date?: string | null;
  circular_type?: string | null;
  reference_number?: string | null;
  action_points?: ApiActionPoint[] | null;
};

// Normalized shape used by the UI
type NormalizedDocument = {
  id: string;
  name: string;
  publisher: string;
  publicationDate: string;
  circularType: string;
  referenceNumber: string;
  url: string;
  impactAreas: string[];
  actionPoints: ApiActionPoint[];
};

export default function DocumentDetail() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { id } = useParams<{ id: string }>();

  const [document, setDocument] = useState<NormalizedDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handlePreviewClick = () => setIsPreviewOpen((v) => !v);

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
        // Token source — adjust to your app’s storage/keys if different
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

        const normalized: NormalizedDocument = {
          id: String(raw.id),
          name: raw.title || raw.file_name || `Document ${raw.id}`,
          publisher: raw.issuing_authority || "Unknown",
          publicationDate: raw.publication_date || "",
          circularType: raw.circular_type || "",
          referenceNumber: raw.reference_number || "",
          url: raw.blob_url || "",
          impactAreas: [], // not provided by API
          actionPoints: raw.action_points ?? [],
        };

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

  // If either sidebar is open, minimize the main sidebar and stack the content
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
                  {document.name}
                </span>
              </div>

              <div className={anySidebarOpen ? "" : "flex gap-5"}>
                {anySidebarOpen ? (
                  // When ANY sidebar is open, stack content vertically
                  <div className="w-full space-y-6">
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
                    <KeyObligationsAndActionPoints
                      actionPoints={document.actionPoints || []}
                      loading={false}
                      error={null}
                    />
                    <DocumentTimeline />
                    <HumanValidationRequired />
                    <ComparativeInsights documentId={Number(document.id)} />
                    <ReportsAndExports
                      documentTitle={document.name}
                      documentUrl={document.url}
                    />
                  </div>
                ) : (
                  // When NO sidebar is open, use two columns
                  <>
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
                      <KeyObligationsAndActionPoints
                        actionPoints={document.actionPoints || []}
                        loading={false}
                        error={null}
                      />
                    </div>

                    {/* Right Column of Content */}
                    <div className="w-[361px] flex-shrink-0 space-y-6">
                      <DocumentTimeline />
                      <HumanValidationRequired />
                      <ComparativeInsights documentId={Number(document.id)} />
                      <ReportsAndExports
                        documentTitle={document.name}
                        documentUrl={document.url}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>

          {/* Preview Sidebar (Iframe Only) */}
          {isPreviewOpen && (
            <aside className="w-[45%] max-w-2xl border-l border-gray-200 bg-white flex flex-col transition-all duration-300">
              <div className="flex-1 min-h-0">
                <iframe
                  src={document.url}
                  title={document.name}
                  className="w-full h-full border-0 block"
                />
              </div>
            </aside>
          )}

          {/* Chat Sidebar */}
          {isChatOpen && (
            <aside className="transition-all duration-300 border-l-2 border-gray-300">
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