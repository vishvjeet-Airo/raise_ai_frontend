import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";
import FadedTextLoader from "./FadedTextLoader";

interface SummaryResponse {
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
}

export default function AIGeneratedSummary({ documentId }: { documentId: number }) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      // Reset state for new documentId
      setLoading(true);
      setError(null);
      setSummary("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/summary`, {
          headers: { accept: "application/json" },
        });

        if (!response.ok) {
          // Try to parse error message from API if available
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.detail || `HTTP error! Status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data: SummaryResponse = await response.json();
        setSummary(data.overall_summary || "No summary available for this document.");
      } catch (e: any) {
        setError(e.message);
        setSummary("Failed to load summary."); // Set a default summary on error
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchSummary();
    }
  }, [documentId]);

  // Split summary into paragraphs
  const paragraphs = summary.split(/\n{2,}/).filter(Boolean);
  const firstParagraph = paragraphs[0] || "";
  const restOfParagraphs = paragraphs.slice(1).join('\n\n');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg min-h-[84px]">
          {loading ? (
            <FadedTextLoader />
          ) : (
            <>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {firstParagraph}
              </p>

              {restOfParagraphs && showAll && (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-4">
                  {restOfParagraphs}
                </p>
              )}

              {error && (
                 <p className="text-sm text-red-600 mt-2">Error: {error}</p>
              )}

              {paragraphs.length > 1 && (
                <button
                  className="mt-4 text-blue-600 hover:underline text-xs font-semibold"
                  onClick={() => setShowAll((v) => !v)}
                >
                  {showAll ? "- Show Less" : "+ Show More"}
                </button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}