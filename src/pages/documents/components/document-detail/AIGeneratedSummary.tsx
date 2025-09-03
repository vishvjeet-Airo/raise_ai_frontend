import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
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

  // Inline edit states
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [proposedSummary, setProposedSummary] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      setSummary("");

      try {
        const response = await apiClient.get(`/api/documents/${documentId}/summary`, {
          headers: { accept: "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.detail || `HTTP error! Status: ${response.status}`;
          throw new Error(errorMessage);
        }

        const data: SummaryResponse = await response.json();
        setSummary(data.overall_summary || "No summary available for this document.");
      } catch (e: any) {
        setError(e.message);
        setSummary("Failed to load summary.");
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchSummary();
    }
  }, [documentId]);

  const requestEditSuggestion = async () => {
    setSubmitting(true);
    setEditError(null);
    try {
      const res = await apiClient.post(`/api/documents/${documentId}/llm-edit`, {
        target: "summary",
        query: prompt,
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "Failed to get suggestion");
        throw new Error(msg);
      }
      const data = await res.json().catch(() => ({}));
      const text = data.proposed_text || data.text || data.suggestion || "";
      if (!text) throw new Error("Empty suggestion received");
      setProposedSummary(text);
    } catch (e: any) {
      setEditError(e.message || "Could not generate suggestion");
    } finally {
      setSubmitting(false);
    }
  };

  const acceptEdit = async () => {
    if (!proposedSummary) return;
    setSaving(true);
    setEditError(null);
    try {
      const res = await apiClient.patch(`/api/documents/${documentId}/summary`, {
        overall_summary: proposedSummary,
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "Failed to save");
        throw new Error(msg);
      }
      setSummary(proposedSummary);
      setIsEditing(false);
      setProposedSummary(null);
      setPrompt("");
    } catch (e: any) {
      setEditError(e.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setProposedSummary(null);
    setIsEditing(false);
    setPrompt("");
    setEditError(null);
  };

  // Split summary into paragraphs
  const paragraphs = (proposedSummary ?? summary).split(/\n{2,}/).filter(Boolean);
  const firstParagraph = paragraphs[0] || "";
  const restOfParagraphs = paragraphs.slice(1).join("\n\n");

  return (
    <div className="relative">
      <Card className={isEditing ? "blur-sm pointer-events-none" : ""}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-poppins font-normal">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg min-h-[84px]">
            {loading ? (
              <FadedTextLoader />
            ) : (
              <>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line justified">
                  {firstParagraph}
                </p>

                {restOfParagraphs && showAll && (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mt-4 justified">
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


    </div>
  );
}
