import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import FadedTextLoader from "./FadedTextLoader";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";

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
          {!loading && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing((v) => !v)} className="h-8 px-2 text-xs">
              <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
          )}
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

      {isEditing && !proposedSummary && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 w-[min(90%,32rem)] pointer-events-auto">
            <div className="text-sm font-medium mb-2">Edit summary</div>
            <label className="text-xs text-gray-600">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe how you want the summary to be changed..."
              className="mt-1 w-full text-sm border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {editError && (
              <div className="text-xs text-red-600 mt-2">{editError}</div>
            )}
            <div className="mt-3 flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-8 px-3">
                Cancel
              </Button>
              <Button size="sm" onClick={requestEditSuggestion} disabled={submitting || !prompt.trim()} className="h-8 px-3">
                {submitting ? "Generating..." : "Generate suggestion"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isEditing && proposedSummary && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 w-[min(90%,32rem)] pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Preview changes</div>
              <div className="flex items-center gap-2">
                <Button size="icon" className="h-7 w-7" onClick={acceptEdit} disabled={saving} title="Accept">
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" className="h-7 w-7" onClick={cancelEdit} title="Discard">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-line max-h-[50vh] overflow-auto">
              {proposedSummary}
            </div>
            {editError && (
              <div className="text-xs text-red-600 mt-2">{editError}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
