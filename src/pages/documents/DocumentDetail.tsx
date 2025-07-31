import { Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { ChevronRight } from "lucide-react";
import DocumentHeader from "./components/document-detail/DocumentHeader";
import ApplicableAndRelevance from "./components/document-detail/ApplicableAndRelevance";
import CircularOverview from "./components/document-detail/CircularOverview";
import AIGeneratedSummary from "./components/document-detail/AIGeneratedSummary";
import KeyObligationsAndActionPoints from "./components/document-detail/KeyObligationsAndActionPoints";
import KeyDataAndTables from "./components/document-detail/KeyDataAndTables";
import ChartInvestmentLimits from "./components/document-detail/ChartInvestmentLimits";
import DepartmentalActionItems from "./components/document-detail/DepartmentalActionItems";
import HumanValidationRequired from "./components/document-detail/HumanValidationRequired";
import RiskAndImpactAssessment from "./components/document-detail/RiskAndImpactAssessment";
import ComparativeInsights from "./components/document-detail/ComparativeInsights";
import OriginalDocument from "./components/document-detail/OriginalDocument";
import DocumentTimeline from "./components/document-detail/DocumentTimeline";
import ReportsAndExports from "./components/document-detail/ReportsAndExports";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DocumentDetail() {
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // Mock document data - In a real application, this would be fetched from an API
  const document = {
    id: 15,
    blob_url: "https://aiacceleratorstg.blob.core.windows.net/aiacceleratorcontainer/testing/0cd23f77-cc3f-4771-b3a7-f3acd5b768b0-Q2%20Newsletter%20-%20Iteration%203.docx.pdf?sp=racwdli&st=2025-07-21T11%3A53%3A45Z&se=2026-07-20T20%3A08%3A45Z&spr=https&sv=2024-11-04&sr=c&sig=KzRSV58Hjwmnac1z6%2FuNREDQ61RGzOoNswe%2BH2VsvmY%3D",
    file_name: "Q2 Newsletter - Iteration 3.docx.pdf",
  };

  const handlePreviewClick = () => {
    setShowPdfViewer(true);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link to="/documents" className="hover:text-gray-900 transition-colors">
              All Documents
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#1F4A75] font-semibold" style={{ fontFamily: 'Poppins', fontWeight: 500, fontSize: '16px', lineHeight: '100%', letterSpacing: '0%' }}>Master Circular - Guarantees and Co-acceptances</span>
          </div>

          <div className="flex gap-6">
            {/* Left Column - Main Content */}
            <div className="w-[731px] space-y-6">
              <DocumentHeader />
              <ApplicableAndRelevance />
              <CircularOverview />
              <AIGeneratedSummary />
              <KeyObligationsAndActionPoints />
              <KeyDataAndTables />
              <ChartInvestmentLimits />
              <DepartmentalActionItems />
            </div>

            {/* Right Column - Validation & Assessment */}
            <div className="w-[361px] space-y-6">
              <HumanValidationRequired />
              <RiskAndImpactAssessment />
              <ComparativeInsights />
              <OriginalDocument 
                blob_url={document.blob_url} 
                file_name={document.file_name}
                onPreviewClick={handlePreviewClick}
              />
              <DocumentTimeline />
              <ReportsAndExports />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPdfViewer} onOpenChange={setShowPdfViewer}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{document.file_name}</DialogTitle>
          </DialogHeader>
          <iframe src={document.blob_url} width="100%" height="100%" className="border-none"></iframe>
        </DialogContent>
      </Dialog>
    </div>
  );
}