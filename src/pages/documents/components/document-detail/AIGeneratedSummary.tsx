import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/config";

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
  const [showSecond, setShowSecond] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/summary`, {
          headers: { accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: SummaryResponse = await response.json();
        setSummary(data.overall_summary);
      } catch (e: any) {
        setError(e.message);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-2 rounded-r-lg min-h-[60px]">
          {loading && (
            <p className="text-sm text-gray-500">Loading summary...</p>
          )}
          {error && (
            <p className="text-sm text-red-500">Error: {error}</p>
          )}
          {!loading && !error && (
            <>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {paragraphs[0]}
              </p>
              {paragraphs.length > 1 && (
                <>
                  {showSecond && (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-2">
                      {paragraphs[1]}
                    </p>
                  )}
                  <button
                    className="mt-2 text-blue-600 hover:underline text-xs font-semibold"
                    onClick={() => setShowSecond((v) => !v)}
                  >
                    {showSecond ? "- Show Less" : "+ Show More"}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}