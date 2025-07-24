import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { ChevronRight, Check } from "lucide-react";

interface DocumentDetailProps {}

export default function DocumentDetail() {
  const { id } = useParams();
  const [validationChecks, setValidationChecks] = useState({
    verifyTableData: false,
    confirmDeadlineInterpretation: false,
    reviewRiskAssessment: false,
    approveAnalysis: false
  });

  const handleValidationCheck = (key: keyof typeof validationChecks) => {
    setValidationChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const submitValidation = () => {
    console.log("Submitting validation:", validationChecks);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link to="/documents" className="hover:text-gray-900 transition-colors">
              All Documents
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#1F4A75] font-semibold">Master Circular - Guarantees and Co-acceptances</span>
          </div>

          {/* Document Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h1
              style={{
                color: '#444444',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '16px',
                lineHeight: '100%',
                letterSpacing: '0%'
              }}
            >
              Document : Master Circular - Guarantees and Co-acceptances
            </h1>
            <div className="mb-2">
              <span
                style={{
                  color: '#4B8B74',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '12px',
                  lineHeight: '100%',
                  letterSpacing: '0%'
                }}
              >
                14 May 2025 | Reserve Bank of India | Reserve Bank Of India
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center text-xs font-medium"
                style={{
                  background: '#69FEC8',
                  width: '152px',
                  height: '28px',
                  borderRadius: '2px',
                
                  opacity: 1,
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start'
                }}
              >
                <Check className="w-4 h-4 mr-1 text-green-800" /> Parsed & Validated
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border" style={{ border: '0.4px solid #C9C9C9' }}>
                AP DIR Circular No.1
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border" style={{ border: '0.4px solid #C9C9C9' }}>
                Reserve Bank of India
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border" style={{ border: '0.4px solid #C9C9C9' }}>
                April, 2025
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border" style={{ border: '0.4px solid #C9C9C9' }}>
                Effective: April 3, 2025
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Document Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Applicable & Relevance */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Applicable & Relevance</h2>
                
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">APPLICABLE TO</div>
                    <div className="text-sm text-gray-700">All authorised dealer Category-I<br />All category bank</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">BUSINESS FUNCTION IMPACTED</div>
                    <div className="text-sm text-gray-700">Treasury, Foreign Exchange, Investment<br />Management, Compliance</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">AI RELEVANCE SCORE</div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        High (86%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Circular Overview */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Circular Overview</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">ISSUING AUTHORITY</div>
                      <div className="text-sm text-gray-700">All authorised dealer Category-I<br />All category bank</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">REFERENCE NUMBER</div>
                      <div className="text-sm text-gray-700">Treasury, Foreign Exchange, Investment<br />Management, Compliance</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">CIRCULAR TYPE</div>
                      <div className="text-sm text-gray-700">Guideline</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">DATE OF ISSUE</div>
                      <div className="text-sm text-gray-700">All authorised dealer Category-I<br />All category bank</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">EFFECTIVE DATE</div>
                      <div className="text-sm text-gray-700">Treasury, Foreign Exchange, Investment<br />Management, Compliance</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">DOCUMENT TYPE</div>
                      <div className="text-sm text-gray-700">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Validation & Assessment */}
            <div className="space-y-6">
              {/* Human Validation Required */}
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Human validation Required</h3>
                
                <div className="space-y-3 mb-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      validationChecks.verifyTableData 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                    }`}
                    onClick={() => handleValidationCheck('verifyTableData')}>
                      {validationChecks.verifyTableData && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700">Verify table data Accuracy</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      validationChecks.confirmDeadlineInterpretation 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                    }`}
                    onClick={() => handleValidationCheck('confirmDeadlineInterpretation')}>
                      {validationChecks.confirmDeadlineInterpretation && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700">Confirm Deadline interpretation</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      validationChecks.reviewRiskAssessment 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                    }`}
                    onClick={() => handleValidationCheck('reviewRiskAssessment')}>
                      {validationChecks.reviewRiskAssessment && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700">Review Risk Assessment</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      validationChecks.approveAnalysis 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                    }`}
                    onClick={() => handleValidationCheck('approveAnalysis')}>
                      {validationChecks.approveAnalysis && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700">Approve AI Analysis</span>
                  </label>
                </div>
                
                <button 
                  onClick={submitValidation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Submit Validation
                </button>
              </div>

              {/* Risk and Impact Assessment */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk and Impact Assessment</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Operational Risk : Medium</div>
                        <div className="text-xs text-gray-500">System Update Required</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Regulatory Risk : Medium</div>
                        <div className="text-xs text-gray-500">Compliance Regularly</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Reputational Risk : Medium</div>
                        <div className="text-xs text-gray-500">Moderate Update</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Customer Impact : Medium</div>
                        <div className="text-xs text-gray-500">Process Effected</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Compliance Score */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">AI COMPLIANCE SCORE</div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      94% Compliance
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
