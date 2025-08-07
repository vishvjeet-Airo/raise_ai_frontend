import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { ChevronRight } from "lucide-react";
import DocumentHeader from "./components/document-detail/DocumentHeader";
import CircularOverview from "./components/document-detail/CircularOverview";
import AIGeneratedSummary from "./components/document-detail/AIGeneratedSummary";
import KeyObligationsAndActionPoints from "./components/document-detail/KeyObligationsAndActionPoints";
import HumanValidationRequired from "./components/document-detail/HumanValidationRequired";
import ComparativeInsights from "./components/document-detail/ComparativeInsights";
import DocumentTimeline from "./components/document-detail/DocumentTimeline";
import ReportsAndExports from "./components/document-detail/ReportsAndExports";
import { useState, createContext, useContext } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useParams, useLocation } from "react-router-dom";
import ChatSidebar from "@/components/ChatSidebar";

// Create context for chat sidebar state
const ChatSidebarContext = createContext<{
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  documentId: string;
  documentName: string;
} | null>(null);

export const useChatSidebar = () => {
  const context = useContext(ChatSidebarContext);
  if (!context) {
    throw new Error('useChatSidebar must be used within ChatSidebarProvider');
  }
  return context;
};

export default function DocumentDetail() {
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { id } = useParams();
  const location = useLocation();

  // Get document data from location state
  const documentFromState = location.state?.document;

  // If no document data is passed, show an error or redirect
  if (!documentFromState) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
              <Link to="/documents" className="hover:text-gray-900 transition-colors">
                All Documents
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-red-600">Document not found</span>
            </div>
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Document data not available. Please return to the documents list.</p>
              <Link
                to="/documents"
                className="inline-flex items-center px-4 py-2 bg-[#1F4A75] text-white rounded-lg hover:bg-[#1F4A75]/90 transition-colors"
              >
                Back to Documents
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const document = documentFromState;

  const handlePreviewClick = () => {
    setShowPdfViewer(true);
  };

  return (
    <ChatSidebarContext.Provider value={{
      isChatOpen,
      setIsChatOpen,
      documentId: document.id,
      documentName: document.name
    }}>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />

        <div className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${isChatOpen ? 'mr-80' : ''}`}>
          <div className="max-w-7xl">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
              <Link to="/documents" className="hover:text-gray-900 transition-colors" style={{ font: 'poppins', fontWeight: 400, fontSize: '16px', lineHeight: '100%', letterSpacing: '0%' }}>
                All Documents
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#1F4A75] font-semibold" style={{ font: 'poppins', fontWeight: 400, fontSize: '16px', lineHeight: '100%', letterSpacing: '0%' }}>
                {document.name}
              </span>
            </div>

            <div className="flex gap-5">
              {/* Left Column - Main Content */}
              <div className={`space-y-6 transition-all duration-300 ${isChatOpen ? 'w-full max-w-[500px]' : 'w-[731px]'}`}>
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
                <AIGeneratedSummary />
                <KeyObligationsAndActionPoints />
              </div>

              {/* Right Column - Validation & Assessment */}
              <div className={`space-y-6 transition-all duration-300 ${isChatOpen ? 'w-full max-w-[300px]' : 'w-[361px]'}`}>
                <DocumentTimeline />
                <HumanValidationRequired />
                <ComparativeInsights />
                <ReportsAndExports
                  documentTitle={document.name}
                  documentUrl={document.url}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className={`fixed top-0 right-0 h-full transition-transform duration-300 ease-in-out z-30 ${isChatOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <ChatSidebar
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            documentId={document.id}
            documentName={document.name}
          />
        </div>
      </div>

      <Dialog open={showPdfViewer} onOpenChange={setShowPdfViewer}>
        <DialogContent className="max-w-3xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{document.name}</DialogTitle>
          </DialogHeader>
          <iframe src={document.url} width="100%" height="100%" className="border-none"></iframe>
        </DialogContent>
      </Dialog>
    </ChatSidebarContext.Provider>
  );
}