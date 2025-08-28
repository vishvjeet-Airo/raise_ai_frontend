import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Download, ChevronDown, Mail } from "lucide-react";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import { pdf, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import ReactMarkdown from 'react-markdown';

interface ReportsAndExportsProps {
  documentTitle?: string;
  documentUrl?: string;
  documentId?: string;
}

// Define stakeholder interface
interface Stakeholder {
  id: string;
  name: string;
  email: string;
  department?: string;
}

// Mock stakeholders data (in real app, this would come from API)
const mockStakeholders: Stakeholder[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@company.com', department: 'Legal' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', department: 'Compliance' },
  { id: '3', name: 'Mike Chen', email: 'mike.chen@company.com', department: 'Risk Management' },
  { id: '4', name: 'Lisa Wang', email: 'lisa.wang@company.com', department: 'Operations' },
  { id: '5', name: 'David Brown', email: 'david.brown@company.com', department: 'Finance' },
  { id: '6', name: 'Emma Davis', email: 'emma.davis@company.com', department: 'HR' },
];

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    paddingTop: 80, // Add extra padding to account for fixed header
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 25,
    borderBottom: '2px solid #1f4a75',
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f4a75',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
    textAlign: 'center',
  },
  documentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#6b7280',
    marginTop: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f4a75',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 5,
  },
  overviewBox: {
    backgroundColor: '#f8fafc',
    padding: 18,
    borderRadius: 6,
    marginBottom: 25,
    border: '1px solid #e2e8f0',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: '500',
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    padding: 18,
    borderRadius: 6,
    fontSize: 12,
    lineHeight: 1.6,
    border: '1px solid #e2e8f0',
  },
  summaryText: {
    fontSize: 10  ,
    lineHeight: 1.6,
    textAlign: 'justify',
  },
  insightsBox: {
    backgroundColor: '#fef3c7',
    padding: 18,
    borderRadius: 6,
    border: '1px solid #f59e0b',
    marginBottom: 25,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#92400e',
  },
  insightItem: {
    marginBottom: 8,
    fontSize: 11,
    lineHeight: 1.5,
  },
  versionSection: {
    marginBottom: 15,
  },
  versionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#92400e',
  },
  versionList: {
    marginBottom: 10,
  },
  versionItem: {
    fontSize: 10,
    marginBottom: 4,
    color: '#92400e',
  },
  changesSection: {
    marginTop: 10,
  },
  changesTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#92400e',
  },
  changeItem: {
    fontSize: 10,
    marginBottom: 3,
    color: '#92400e',
    paddingLeft: 10,
  },
  obligationsSection: {
    marginBottom: 25,
  },
  obligationCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 8,
    borderRadius: 4,
  },
  relevantTitle: {
    fontSize: 14,
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #22c55e',
  },
  irrelevantTitle: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #ef4444',
  },
  actionPoint: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: '1px solid #e5e7eb',
  },
  actionPointTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1e293b',
  },
  actionPointDescription: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 6,
    lineHeight: 1.5,
  },
  actionPointMeta: {
    fontSize: 10,
    color: '#64748b',
    flexDirection: 'row',
    gap: 15,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineDot: {
    width: 16,
    height: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineText: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#1e293b',
  },
  timelineDate: {
    fontSize: 10,
    color: '#64748b',
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '2px solid #e5e7eb',
    textAlign: 'center',
    fontSize: 10,
    color: '#64748b',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 9,
    color: '#9ca3af',
  },
  pageHeader: {
    marginBottom: 20,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 10,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f4a75',
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  pageFooter: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center',
    fontSize: 10,
    color: '#64748b',
  },
  footerText: {
    marginBottom: 2,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderBottom: '1px solid #e5e7eb',
    zIndex: 10,
  },
  fixedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f4a75',
    textAlign: 'center',
  },
  fixedSubtitle: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 5,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,  
    right: 0,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderTop: '1px solid #e5e7eb',
    zIndex: 10,
  },
});

// PDF Document Component
const PDFDocument = ({ docData, summary, versioningInfo }: { docData: any; summary: string; versioningInfo?: any }) => {
  // Separate obligations into relevant and irrelevant
  const relevantObligations = docData.action_points?.filter((point: any) =>
    point.is_relevant
  ) || [];
  console.log(relevantObligations);
  

  const irrelevantObligations = docData.action_points?.filter((point: any) =>
    !point.is_relevant
  ) || [];
  let comparativeInsights = "";


  return (
    <Document>
      <Page 
        size="RA4" 
        style={styles.page}
        wrap={false}
      >
        {/* Fixed Header - appears on every page */}
        <View fixed style={styles.fixedHeader}>
          <Text style={styles.fixedTitle}>
            {docData.title || docData.file_name || `Document ${docData.id}`}
          </Text>
          <Text style={styles.fixedSubtitle}>Regulatory Compliance Report</Text>
        </View>

        {/* Dynamic Page Numbers - appears on every page */}
        <Text 
          fixed 
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />

        {/* Document Header - only on first page */}
        <View style={[styles.header, { marginTop: 40 }]}>
          <View style={styles.documentMeta}>
            <Text>Publication Date: {docData.publication_date || 'N/A'}</Text>
            <Text>Authority: {docData.issuing_authority || 'Unknown'}</Text>
          </View>
        </View>

        {/* Comparative Insights with Real  Data */}
        <View style={styles.insightsBox}>
          <Text style={styles.insightsTitle}>Key Insights & Comparative Analysis</Text>

          {/* Version Information */}
          {versioningInfo?.version_history && (
            <View style={styles.versionSection}>
              <Text style={styles.versionTitle}>  Document Version History</Text>
              <View style={styles.versionList}>
                {versioningInfo.version_history.versions.map((version: any, index: number) => (
                  <Text key={index} style={styles.versionItem}>
                    • Version {version.version} - {version.publication_date} ({version.reference_number})
                    {versioningInfo.version_history.current_version_number === version.version && (
                      <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}> - CURRENT</Text>
                    )}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Key Changes from Amendment Analysis */}
          {versioningInfo?.amendment_analysis?.has_analysis && versioningInfo?.amendment_analysis?.analysis_data?.key_changes && (
            <View style={styles.changesSection}>
              <Text style={styles.changesTitle}>
                Key Changes from Previous Version
              </Text>
              {versioningInfo.amendment_analysis.analysis_data.key_changes.map((change: string, index: number) => (
                <View key={index} style={styles.changeItem}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <Text style={styles.changeItem}>- {children}</Text>,
                      strong: ({ children }) => <Text style={[styles.changeItem, { fontWeight: 'bold' }]}>{children}</Text>,
                      em: ({ children }) => <Text style={[styles.changeItem, { fontStyle: 'italic' }]}>{children}</Text>,
                      code: ({ children }) => <Text style={[styles.changeItem, { fontFamily: 'Courier' }]}>{children}</Text>,
                      ul: ({ children }) => <View>{children}</View>,
                      li: ({ children }) => <Text style={styles.changeItem}>• {children}</Text>,
                    }}
                  >
                    {change}
                  </ReactMarkdown>
                </View>
              ))}
            </View>
          )}

          {/* Comparison Note */}
          {versioningInfo?.amendment_analysis?.analysis_data?.comparison_note && (
            <View style={styles.changesSection}>
              <Text style={styles.changesTitle}>Comparison Analysis</Text>
              <Text style={styles.changeItem}>
                {versioningInfo.amendment_analysis.analysis_data.summary}
              </Text>
            </View>
          )}

        </View>

        {/* Document Overview */}
        <View style={styles.overviewBox}>
          <Text style={styles.sectionTitle}>Document Overview</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Issuing Authority</Text>
              <Text style={styles.value}>{docData.issuing_authority || 'Unknown'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Issuing Date</Text>
              <Text style={styles.value}>{docData.publication_date || 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Circular Type</Text>
              <Text style={styles.value}>{docData.circular_type || 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.label}>Reference Number</Text>
              <Text style={styles.value}>{docData.reference_number || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* AI Generated Summary with orphan/widow protection */}
        <View style={[styles.section, { marginTop: 40 }]}>
          <Text style={styles.sectionTitle} break>AI Generated Summary</Text>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText} orphans={3} widows={3}>{summary}</Text>
          </View>
        </View>

        {/* Key Obligations and Action Points - Relevant First */}
        {docData.action_points && docData.action_points.length > 0 && (
          <View style={[styles.obligationsSection, { marginTop: 40 }]}>
            <Text style={styles.sectionTitle} break>Compliance Obligations & Action Points</Text>

            {/* Relevant Obligations - SHOWN FIRST */}
            {relevantObligations.length > 0 && (
              <View style={styles.obligationCategory}>
                <Text style={[styles.categoryTitle, styles.relevantTitle]}>
                  RELEVANT & HIGH PRIORITY OBLIGATIONS ({relevantObligations.length})
                </Text>
                <View style={styles.overviewBox}>
                  {relevantObligations.map((point: any, index: number) => (
                    <View key={point.id || index} style={styles.actionPoint}>
                      <Text style={styles.actionPointTitle}>{point.title || point.name || `Obligation ${index + 1}`}</Text>
                      {point.description && (
                        <Text style={styles.actionPointDescription}>{point.description}</Text>
                      )}
                      <View style={styles.actionPointMeta}>
                        {point.source_page && <Text>Page: {point.source_page}</Text>}
                        {point.deadline && <Text>Deadline: {new Date(point.deadline).toLocaleDateString()}</Text>}
                        {point.assigned_to_name && <Text> Assigned: {point.assigned_to_name}</Text>}
                        {point.priority && <Text>Priority: {point.priority.toUpperCase()}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Irrelevant Obligations - SHOWN SECOND */}
            {irrelevantObligations.length > 0 && (
              <View style={styles.obligationCategory}>
                <Text style={[styles.categoryTitle, styles.irrelevantTitle]}>
                  LOW PRIORITY / IRRELEVANT OBLIGATIONS ({irrelevantObligations.length})
                </Text>
                <View style={styles.overviewBox}>
                  {irrelevantObligations.map((point: any, index: number) => (
                    <View key={point.id || index} style={styles.actionPoint}>
                      <Text style={styles.actionPointTitle}>{point.title || point.name || `Obligation ${index + 1}`}</Text>
                      {point.description && (
                        <Text style={styles.actionPointDescription}>{point.description}</Text>
                      )}
                      <View style={styles.actionPointMeta}>
                        {point.source_page && <Text>Page: {point.source_page}</Text>}
                        {point.deadline && <Text>Deadline: {new Date(point.deadline).toLocaleDateString()}</Text>}
                        {point.assigned_to_name && <Text>Assigned: {point.assigned_to_name}</Text>}
                        {point.priority && <Text>Priority: {point.priority.toUpperCase()}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Document Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} break>Document Processing Timeline</Text>
          <View style={styles.overviewBox}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
              </View>
              <View style={styles.timelineText}>
                <Text style={styles.timelineTitle}>Document Uploaded</Text>
                <Text style={styles.timelineDate}>
                  {docData.uploaded_at ? new Date(docData.uploaded_at).toLocaleString() : 'Not available'}
                </Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
              </View>
              <View style={styles.timelineText}>
                <Text style={styles.timelineTitle}>AI Analysis Completed</Text>
                <Text style={styles.timelineDate}>
                  {docData.analysis_completed_at ? new Date(docData.analysis_completed_at).toLocaleString() : 'Not available'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default function ReportsAndExports({ documentTitle, documentUrl, documentId }: ReportsAndExportsProps) {
  const [summaryDownloading, setSummaryDownloading] = useState(false);
  const [stakeholderModalOpen, setStakeholderModalOpen] = useState(false);
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>([]);
  const [sendingToStakeholders, setSendingToStakeholders] = useState(false);

  function withAttachment(sasUrl: string, fileName: string) {
    try {
      const url = new URL(sasUrl);
      const disposition = `attachment; filename="${fileName}"`;
      url.searchParams.set("response-content-disposition", disposition);
      return url.toString();
    } catch {
      return sasUrl;
    }
  }

  async function forceDownloadViaBlob(sasUrl: string, fileName: string = "document.pdf") {
    try {
      const res = await fetch(sasUrl, { mode: "cors", credentials: "omit" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      window.location.href = withAttachment(sasUrl, fileName);
    }
  }

  /*const handleDownloadOriginal = async () => {
    if (documentUrl) {
      const fileName = (documentTitle || "document") + ".pdf";
      await forceDownloadViaBlob(documentUrl, fileName);
    }
  };*/

  // 🔹 PDF generation using @react-pdf/renderer
  const handleDownloadSummary = async () => {
    if (!documentId) {
      console.error("Document ID is required for PDF generation");
      return;
    }

    try {
      setSummaryDownloading(true);

      // Fetch document data
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

      const documentRes = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
        headers: {
          accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!documentRes.ok) {
        throw new Error(`Failed to fetch document (${documentRes.status})`);
      }

      const documentData = await documentRes.json();
      const docData = Array.isArray(documentData) ? documentData[0] : documentData;

      if (!docData) {
        throw new Error("Document not found");
      }

      // Fetch AI summary
      let summary = "Summary not available for this document.";
      try {
        const summaryRes = await fetch(`${API_BASE_URL}/api/documents/${documentId}/summary`, {
          headers: { accept: "application/json" },
        });

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          summary = summaryData.overall_summary || summary;
        }
      } catch (summaryError) {
        console.warn("Failed to fetch summary:", summaryError);
      }

      // Fetch versioning information
      let versioningInfo = null;
      try {
        const versioningRes = await fetch(`${API_BASE_URL}/api/documents/${documentId}/versioning-info`, {
          headers: { accept: "application/json" },
        });

        if (versioningRes.ok) {
          versioningInfo = await versioningRes.json();
        }
      } catch (versioningError) {
        console.warn("Failed to fetch versioning info:", versioningError);
      }

      // Generate PDF using @react-pdf/renderer
      const fileName = (documentTitle || "summary-report") + ".pdf";
      const blob = await pdf(<PDFDocument docData={docData} summary={summary} versioningInfo={versioningInfo} />).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch (e) {
      console.error("Failed to generate PDF:", e);
    } finally {
      setSummaryDownloading(false);
    }
  };

  // Handle stakeholder selection
  const handleStakeholderToggle = (stakeholderId: string) => {
    setSelectedStakeholders(prev => {
      if (prev.includes(stakeholderId)) {
        return prev.filter(id => id !== stakeholderId);
      } else {
        return [...prev, stakeholderId];
      }
    });
  };

  // Handle select all stakeholders
  const handleSelectAll = () => {
    if (selectedStakeholders.length === mockStakeholders.length) {
      setSelectedStakeholders([]);
    } else {
      setSelectedStakeholders(mockStakeholders.map(s => s.id));
    }
  };

  // Handle send to stakeholders
  const handleSendToStakeholders = async () => {
    if (!documentId || selectedStakeholders.length === 0) {
      console.error("Document ID and selected stakeholders are required");
      return;
    }

    try {
      setSendingToStakeholders(true);

      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const selectedStakeholderData = mockStakeholders.filter(s => selectedStakeholders.includes(s.id));

      // Call backend API to send to stakeholders
      const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/export-to-stakeholders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          document_id: documentId,
          document_title: documentTitle,
          stakeholders: selectedStakeholderData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to export to stakeholders (${response.status})`);
      }

      // Show success message
      console.log("Document exported to stakeholders successfully");

      // Close modal and reset selection
      setStakeholderModalOpen(false);
      setSelectedStakeholders([]);

      // You could add a toast notification here if you have a notification system
      // toast.success(`Document sent to ${selectedStakeholderData.length} stakeholder(s) successfully`);

    } catch (error) {
      console.error("Failed to export to stakeholders:", error);
      // You could add error handling/notification here
      // toast.error("Failed to export to stakeholders");
    } finally {
      setSendingToStakeholders(false);
    }
  };

  // Open stakeholder modal
  const openStakeholderModal = () => {
    setStakeholderModalOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-poppins font-normal">Export Summary Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">

          {/* Original Document */}
          {/*<div>
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              ORIGINAL DOCUMENT
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">{documentTitle || "Executive Authority"}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="h-7 bg-blue-600 hover:bg-blue-700"
                  onClick={handleDownloadOriginal}
                  disabled={!documentUrl}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>*/}

          {/* Summary Report */}
          <div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Summary Report</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="h-7 bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
                  onClick={handleDownloadSummary}
                  disabled={summaryDownloading}
                >
                  <Download className="w-3 h-3 mr-1" />
                  {summaryDownloading ? "Preparing..." : "Download"}
                </Button>
              </div>
            </div>
          </div>

          {/* Send to Stakeholders */}
          <div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-green-500 rounded flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Send to Stakeholders</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="h-7 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 flex items-center space-x-1 px-3"
                  onClick={openStakeholderModal}
                  disabled={sendingToStakeholders}
                  title="Select stakeholders and send"
                >
                  <span>{sendingToStakeholders ? "Sending..." : "Send"}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Stakeholder Selection Modal */}
      <Dialog open={stakeholderModalOpen} onOpenChange={setStakeholderModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Stakeholders</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Select All Option */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="select-all"
                checked={selectedStakeholders.length === mockStakeholders.length}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All ({mockStakeholders.length} stakeholders)
              </label>
            </div>

            {/* Individual Stakeholders */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {mockStakeholders.map((stakeholder) => (
                <div key={stakeholder.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    id={stakeholder.id}
                    checked={selectedStakeholders.includes(stakeholder.id)}
                    onCheckedChange={() => handleStakeholderToggle(stakeholder.id)}
                  />
                  <div className="flex-1 cursor-pointer" onClick={() => handleStakeholderToggle(stakeholder.id)}>
                    <p className="text-sm font-medium">{stakeholder.name}</p>
                    <p className="text-xs text-gray-500">{stakeholder.email}</p>
                    {stakeholder.department && (
                      <p className="text-xs text-blue-600">{stakeholder.department}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected count */}
            <div className="text-xs text-gray-500 text-center">
              {selectedStakeholders.length} of {mockStakeholders.length} stakeholders selected
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStakeholderModalOpen(false)}
              disabled={sendingToStakeholders}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendToStakeholders}
              disabled={selectedStakeholders.length === 0 || sendingToStakeholders}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              {sendingToStakeholders ? "Sending..." : `Send to ${selectedStakeholders.length} stakeholder${selectedStakeholders.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
