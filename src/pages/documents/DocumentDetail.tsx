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

export default function DocumentDetail() {
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
              <OriginalDocument />
              <DocumentTimeline />
              <ReportsAndExports />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}