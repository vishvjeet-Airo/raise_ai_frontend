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
// The import path for ChatSidebar was incorrect in your provided code.
// I've corrected it based on the previous context.
import ChatSidebar from "@/components/ChatSidebar"; 
import { useState, createContext, useContext } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useParams, useLocation } from "react-router-dom";

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
  
  // Get document data from location state or use mock data
  const documentFromState = location.state?.document;
  
  // Mock document data - In a real application, this would be fetched from an API using the id
  const document = documentFromState || {
    id: id || "15",
    blob_url: "https://aiacceleratorstg.blob.core.windows.net/aiacceleratorcontainer/testing/0cd23f77-cc3f-4771-b3a7-f3acd5b768b0-Q2%20Newsletter%20-%20Iteration%203.docx.pdf?sp=racwdli&st=2025-07-21T11%3A53%3A45Z&se=2026-07-20T20%3A08%3A45Z&spr=https&sv=2024-11-04&sr=c&sig=KzRSV58Hjwmnac1z6%2FuNREDQ61RGzOoNswe%2BH2VsvmY%3D",
    file_name: "Master Circular - Guarantees and Co-acceptances",
    issue_date: "14 May 2024",
    publisher: "Reserve Bank of India",
  };

  const handlePreviewClick = () => {
    setShowPdfViewer(true);
  };

  return (
    <ChatSidebarContext.Provider value={{
      isChatOpen,
      setIsChatOpen,
      documentId: id || "15",
      documentName: document.file_name
    }}>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        
        {/* This container correctly resizes by applying a margin when the chat is open */}
        <div className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${isChatOpen ? 'mr-80' : ''}`}>
          <div className="max-w-7xl">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
              <Link to="/documents" className="hover:text-gray-900 transition-colors"  style={{ font: 'poppins', fontWeight: 400, fontSize: '16px', lineHeight: '100%', letterSpacing: '0%' }}>
                All Documents
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-[#1F4A75] font-semibold" style={{ font: 'poppins', fontWeight: 400, fontSize: '16px', lineHeight: '100%', letterSpacing: '0%' }}>
                {document.file_name}
              </span>
            </div>

            <div className="flex gap-5">
              {/* Left Column - Main Content */}
              {/* FIX 1: This column is now flexible (`flex-1`) and will grow/shrink to fill available space. */}
              <div className="flex-1 space-y-6">
                <DocumentHeader
                  fileName={document.file_name}
                  issueDate={document.issue_date}
                  publisher={document.publisher}
                  documentId={id || "15"}
                  onPreviewClick={handlePreviewClick}
                />
                <CircularOverview />
                <AIGeneratedSummary />
                <KeyObligationsAndActionPoints />
              </div>

              {/* Right Column - Validation & Assessment */}
              {/* FIX 2: This column now has a fixed width and is prevented from shrinking. */}
              <div className="w-[361px] flex-shrink-0 space-y-6">
                <DocumentTimeline />
                <HumanValidationRequired />
                <ComparativeInsights />
                <ReportsAndExports />
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar: This now slides in and the main content adjusts to it. */}
        <div className={`fixed top-0 right-0 h-full transition-transform duration-300 ease-in-out z-30 ${
          isChatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <ChatSidebar
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            documentId={id || "15"}
            documentName={document.file_name}
          />
        </div>
      </div>
      
      <Dialog open={showPdfViewer} onOpenChange={setShowPdfViewer}>
        <DialogContent className="max-w-3xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{document.file_name}</DialogTitle>
          </DialogHeader>
          <iframe src={document.blob_url} width="100%" height="100%" className="border-none"></iframe>
        </DialogContent>
      </Dialog>
    </ChatSidebarContext.Provider>
  );
}
