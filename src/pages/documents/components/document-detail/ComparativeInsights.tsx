import React, { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { Link } from "react-router-dom"; // 👈 1. Import Link for navigation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { Loader2 } from "lucide-react";
import FadedTextLoader from "./FadedTextLoader";

// Reusing the same interfaces from your previous code
interface DocumentInfo {
  id: number;
  title: string;
  version: number;
  is_amendment: boolean;
  previous_version_id: number | null;
  uploaded_at: string;
  status: string;
  publication_date: string;
  issuing_authority: string;
  circular_type: string;
  reference_number: string;
  file_name: string;
}

interface VersionHistory {
  total_versions: number;
  versions: DocumentInfo[];
  current_version_number: number;
  is_latest_version: boolean;
  has_previous_version: boolean;
}

interface AmendmentAnalysis {
  has_analysis: boolean;
  analysis_data: {
    is_amendment: boolean;
    version: number;
    total_versions: number;
    summary: string;
    key_changes: string[];
    impact: string;
    comparison_note: string;
    focus: string;
  } | null;
}

interface VersioningInfoResponse {
  document_info: DocumentInfo;
  version_history: VersionHistory;
  amendment_analysis: AmendmentAnalysis;
  auto_fix_info: {
    was_applied: boolean;
    success: boolean;
    message: string;
    fixes_applied: any[];
    errors_encountered: any[];
  };
}

export default function ComparativeInsights({ documentId }: { documentId: number }) {
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const [versionHistory, setVersionHistory] = useState<DocumentInfo[]>([]);
  const [keyChanges, setKeyChanges] = useState<string[] | null>(null);
  const [comparisonNote, setComparisonNote] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showKeyChangesModal, setShowKeyChangesModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchVersioningInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(
          `/api/documents/${documentId}/versioning-info`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: VersioningInfoResponse = await response.json();

        // Sort the versions in descending order (newest first)
        const sortedVersions = data.version_history.versions.sort((a, b) => b.version - a.version);

        setDocumentInfo(data.document_info);
        setVersionHistory(sortedVersions);

        if (data.amendment_analysis.analysis_data) {
          setKeyChanges(data.amendment_analysis.analysis_data.key_changes);
          setComparisonNote(data.amendment_analysis.analysis_data.comparison_note);
        } else {
          setKeyChanges(null);
          setComparisonNote(null);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchVersioningInfo();
    }
  }, [documentId]);

  if (loading) {
    return (
      <Card className="bg-white">
        <CardHeader className="pb-">
          <CardTitle className="font-poppins font-medium text-[16px] leading-[100%] tracking-[0] text-[#3F3F3F]">
            Comparative Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FadedTextLoader/>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="font-poppins font-medium text-[16px] leading-[100%] tracking-[0] text-[#3F3F3F]">
            Comparative Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-red-500">Error fetching data: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="font-poppins font-medium text-[16px] leading-[100%] tracking-[0] text-[#3F3F3F]">
          Comparative Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documentInfo && (
          <h3 className="font-poppins font-semibold text-[14px] leading-[24px] tracking-[0] text-[#3F3F3F] mb-4">
            Document Version: {documentInfo.version}
          </h3>
        )}

        {/* If only one version, show just one point */}
        {versionHistory.length === 1 && documentInfo && (
          <div className="space-y-4">
            <h4 className="font-poppins font-semibold text-[12px] text-[#3F3F3F]">
              Version History
            </h4>
            <div className="space-y-4">
              <div
                className="border-l-4 pl-4 py-2 bg-yellow-100 border-yellow-500 transition-colors duration-200"
              >
                <div
                  className="font-poppins font-medium text-[14px] flex items-center bg-yellow-200 rounded px-1 py-0.5"
                  style={{ color: '#B7791F', display: 'inline-block' }}
                >
                  Version {documentInfo.version} - {documentInfo.publication_date}
                  <span className="ml-2 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-1 rounded-full font-semibold">
                    Current
                  </span>
                </div>
                <div
                  className="font-poppins text-[12px] text-[#5B5A5A] mt-1 bg-yellow-100 rounded px-1 py-0.5"
                  style={{ display: 'inline-block' }}
                >
                  Reference Number: {documentInfo.reference_number || "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* If more than one version, show all points */}
        {versionHistory.length > 1 && documentInfo && (
          <div className="space-y-4">
            <h4 className="font-poppins font-semibold text-[12px] text-[#3F3F3F]">
              Version History
            </h4>
            <div className="space-y-4">
              {versionHistory.map((item) => {
                const isCurrent = item.id === documentId || item.version === documentInfo.version;
                
                // 2. Conditionally render a Link or a div
                if (isCurrent) {
                  // Render the non-clickable div for the current version
                  return (
                    <div
                      key={item.id}
                      className="border-l-4 pl-4 py-2 bg-yellow-100 border-yellow-500 transition-colors duration-200"
                    >
                      <div
                        className="font-poppins font-medium text-[14px] flex items-center bg-yellow-200 rounded px-1 py-0.5"
                        style={{ color: '#B7791F', display: 'inline-block' }}
                      >
                        Version {item.version} - {item.publication_date}
                        <span className="ml-2 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-1 rounded-full font-semibold">
                          Current
                        </span>
                      </div>
                      <div
                        className="font-poppins text-[12px] text-[#5B5A5A] mt-1 bg-yellow-100 rounded px-1 py-0.5"
                        style={{ display: 'inline-block' }}
                      >
                        Reference Number: {item.reference_number || "N/A"}
                      </div>
                    </div>
                  );
                } else {
                  // Render a clickable Link for all other versions
                  return (
                    <Link
                      key={item.id}
                      to={`/documents/${item.id}`} // 3. Set the navigation path
                      className="block border-l-4 pl-4 py-2 bg-gray-50 border-[#1F4A75] hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div
                        className="font-poppins font-medium text-[14px] flex items-center"
                        style={{ color: '#3F3F3F', display: 'inline-block' }}
                      >
                        Version {item.version} - {item.publication_date}
                      </div>
                      <div
                        className="font-poppins text-[12px] text-[#5B5A5A] mt-1"
                        style={{ display: 'inline-block' }}
                      >
                        Reference Number: {item.reference_number || "N/A"}
                      </div>
                    </Link>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* Show Key Changes button only if more than one version and current version is not 1 */}
        {keyChanges && keyChanges.length > 0 && versionHistory.length > 1 && documentInfo && documentInfo.version !== 1 && (
          <div className="mt-6">
            <button
              onClick={() => setShowKeyChangesModal(true)}
              className="bg-[#1F4A75] hover:bg-[#153452] text-white font-poppins text-[12px] font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-200"
            >
              <span className="font-montserrat font-medium text-[14px] leading-[100%] tracking-[0] text-[#FFFFFF]">
                View Key Changes
              </span>
            </button>
          </div>
        )}

        {/* The Key Changes Modal */}
        {showKeyChangesModal && keyChanges && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative">
              <button
                onClick={() => setShowKeyChangesModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h4 className="font-poppins font-semibold text-[14px] text-[#3F3F3F] mb-4">
                Key Changes
              </h4>
              {comparisonNote && (
                <p className="font-poppins text-[12px] text-[#5B5A5A] mb-4">
                  {comparisonNote}
                </p>
              )}
              <div className="font-poppins text-[12px] text-[#3F3F3F]">
                <ReactMarkdown
                  components={{
                    ul: ({ node, ...props }) => <ul {...props} className="list-disc list-inside space-y-1" />,
                    li: ({ node, ...props }) => <li {...props} className="font-poppins font-normal text-[12px] text-[#3F3F3F] mb-1" />,
                    p: ({ node, ...props }) => <p {...props} className="p-0 m-0" />,
                  }}
                >
                  {keyChanges.map(change => `* ${change}`).join('\n')}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}