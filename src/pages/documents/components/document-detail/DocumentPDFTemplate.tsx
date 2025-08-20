import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import { formatDateShort } from "@/lib/dateUtils";

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
  uploaded_at?: string | null;
  analysis_completed_at?: string | null;
  circular_type?: string | null;
  reference_number?: string | null;
  action_points?: ApiActionPoint[] | null;
};

type NormalizedDocument = {
  id: string;
  name: string;
  publisher: string;
  publicationDate: string;
  uploadedAtTimestamp?: string;
  completedAtTimestamp?: string;
  circularType: string;
  referenceNumber: string;
  url: string;
  impactAreas: string[];
  actionPoints: ApiActionPoint[];
};

type SummaryResponse = {
  success: boolean;
  document_id: number;
  document_title: string;
  publication_date: string;
  issuing_authority: string;
  circular_type: string;
  reference_number: string;
  overall_summary: string;
  key_policies: string[];
  key_data: any[];
  compliance_requirements: string[];
  extraction_timestamp: string;
  source: string;
};

interface DocumentPDFTemplateProps {
  documentId: string;
  onDataLoaded?: (document: NormalizedDocument) => void;
}

export default function DocumentPDFTemplate({ documentId, onDataLoaded }: DocumentPDFTemplateProps) {
  const [document, setDocument] = useState<NormalizedDocument | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!documentId) {
        setError("Missing document id.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");

        const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
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
          publicationDate: formatDateShort(raw.publication_date),
          uploadedAtTimestamp: raw.uploaded_at || "",
          completedAtTimestamp: raw.analysis_completed_at || "",
          circularType: raw.circular_type || "",
          referenceNumber: raw.reference_number || "",
          url: raw.blob_url || "",
          impactAreas: [],
          actionPoints: raw.action_points ?? [],
        };

        if (!ignore) {
          setDocument(normalized);
          onDataLoaded?.(normalized);
        }

        // Fetch AI summary
        try {
          const summaryRes = await fetch(`${API_BASE_URL}/api/documents/${documentId}/summary`, {
            headers: { accept: "application/json" },
          });

          if (summaryRes.ok) {
            const summaryData: SummaryResponse = await summaryRes.json();
            if (!ignore) {
              setSummary(summaryData.overall_summary || "No summary available for this document.");
            }
          } else {
            if (!ignore) {
              setSummary("Summary not available for this document.");
            }
          }
        } catch (summaryError) {
          if (!ignore) {
            setSummary("Summary not available for this document.");
          }
        }
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
  }, [documentId, onDataLoaded]);

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ color: '#666' }}>Loading document...</div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ color: '#dc2626' }}>
          {error || "Document not found."}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: 'white',
      color: '#1f2937'
    }}>
      {/* Document Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '10px',
          color: '#1f4a75'
        }}>
          {document.name}
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#6b7280',
          marginBottom: '20px'
        }}>
          {document.publicationDate} | {document.publisher}
        </p>
      </div>

      {/* Circular Overview */}
      <div style={{ 
        backgroundColor: '#f9fafb', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '15px',
          color: '#1f4a75'
        }}>
          Document Overview
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <strong style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
              Issuing Authority
            </strong>
            <p style={{ margin: '5px 0 0 0' }}>{document.publisher}</p>
          </div>
          <div>
            <strong style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
              Issuing Date
            </strong>
            <p style={{ margin: '5px 0 0 0' }}>{document.publicationDate}</p>
          </div>
          <div>
            <strong style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
              Circular Type
            </strong>
            <p style={{ margin: '5px 0 0 0' }}>{document.circularType}</p>
          </div>
          <div>
            <strong style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>
              Reference Number
            </strong>
            <p style={{ margin: '5px 0 0 0' }}>{document.referenceNumber}</p>
          </div>
        </div>
      </div>

      {/* AI Generated Summary */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '15px',
          color: '#1f4a75'
        }}>
          AI Generated Summary
        </h2>
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '20px', 
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <p style={{ whiteSpace: 'pre-line', margin: 0 }}>
            {summary || "This document has been analyzed by our AI system. The summary and key insights are available in the full application interface."}
          </p>
        </div>
      </div>

      {/* Key Obligations and Action Points */}
      {document.actionPoints && document.actionPoints.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '15px',
            color: '#1f4a75'
          }}>
            Key Obligations and Action Points
          </h2>
          <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
            {document.actionPoints.map((point, index) => (
              <div key={point.id} style={{ 
                marginBottom: index < document.actionPoints.length - 1 ? '15px' : '0',
                paddingBottom: index < document.actionPoints.length - 1 ? '15px' : '0',
                borderBottom: index < document.actionPoints.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: '#1f2937'
                }}>
                  {point.title}
                </h3>
                {point.description && (
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280',
                    marginBottom: '8px',
                    lineHeight: '1.5'
                  }}>
                    {point.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#6b7280' }}>
                  {point.source_page && (
                    <span>Page: {point.source_page}</span>
                  )}
                  {point.deadline && (
                    <span>Deadline: {new Date(point.deadline).toLocaleDateString()}</span>
                  )}
                  {point.assigned_to_name && (
                    <span>Assigned to: {point.assigned_to_name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Timeline */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '15px',
          color: '#1f4a75'
        }}>
          Document Timeline
        </h2>
        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#3b82f6', 
              borderRadius: '50%',
              marginRight: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ✓
            </div>
            <div>
              <p style={{ margin: '0', fontWeight: 'bold' }}>Document Uploaded</p>
              <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
                {document.uploadedAtTimestamp ? new Date(document.uploadedAtTimestamp).toLocaleString() : 'Not available'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#3b82f6', 
              borderRadius: '50%',
              marginRight: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ✓
            </div>
            <div>
              <p style={{ margin: '0', fontWeight: 'bold' }}>AI Analysis Completed</p>
              <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
                {document.completedAtTimestamp ? new Date(document.completedAtTimestamp).toLocaleString() : 'Not available'}
              </p>
            </div>
          </div>
        </div>
      </div>    

      {/* Footer */}
      <div style={{ 
        marginTop: '40px', 
        paddingTop: '20px', 
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        <p>Document ID: {document.id}</p>
      </div>
    </div>
  );
}
