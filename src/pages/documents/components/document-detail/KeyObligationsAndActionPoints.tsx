import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import FadedTextLoader from "./FadedTextLoader";
import { formatDateShort } from "@/lib/dateUtils";

interface ActionPoint {
  id: number;
  title: string;
  description?: string;
  source_page?: number;
  deadline?: string | null;
  source_text?: string;
  is_relevant?: boolean;
  relevance_justification?: string;
  assigned_to_name?: string | null;
  assigned_to_department?: string | null;
}

interface KeyObligationsAndActionPointsProps {
  actionPoints?: ActionPoint[];
  loading?: boolean;
  error?: string | null;
  onPageClick?: (pageNumber: number, sourceText?: string) => void; // Updated to accept source text
}

export default function KeyObligationsAndActionPoints({
  actionPoints = [],
  loading = false,
  error = null,
  onPageClick, // NEW: Destructure onPageClick
}: KeyObligationsAndActionPointsProps) {
  // Show more/less
  const [showAll, setShowAll] = useState(false);

  // Relevance filter: relevant | irrelevant
  const [relFilter, setRelFilter] = useState<"relevant" | "irrelevant">("relevant");

  // Apply relevance filter
  const filteredPoints = useMemo(() => {
    if (relFilter === "relevant") return actionPoints.filter((p) => p.is_relevant === true);
    return actionPoints.filter((p) => p.is_relevant !== true);
  }, [actionPoints, relFilter]);

  // Determine which obligations to display after filtering
  const displayedPoints = showAll ? filteredPoints : filteredPoints.slice(0, 3);

  // Handle page number click
  const handlePageClick = (pageNumber: number | undefined, sourceText?: string) => {
    if (pageNumber && onPageClick) {
      onPageClick(pageNumber, sourceText);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg font-poppins font-normal">
            Obligations {!loading && filteredPoints.length > 0 && `(${filteredPoints.length})`}
          </CardTitle>

          {/* Relevance dropdown (only 2 options) */}
          <div>
            <select
              id="rel-filter"
              value={relFilter}
              onChange={(e) => setRelFilter(e.target.value as typeof relFilter)}
              className="h-8 px-2 rounded-md border border-slate-300 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Filter obligations by relevance"
              disabled={loading}
            >
              <option value="relevant">Relevant</option>
              <option value="irrelevant">Not Relevant</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading && (
            <>
              <div className="flex items-center gap-2 py-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading obligations...</span>
              </div>
              <FadedTextLoader />
            </>
          )}
          {error && (
            <div className="flex items-center py-4">
              <p className="text-sm text-red-600">Error: {error}</p>
            </div>
          )}
          {!loading && !error && filteredPoints.length === 0 && (
            <div className="text-gray-500 text-sm">
              {relFilter === "relevant"
                ? "No relevant obligations found."
                : "No not relevant obligations found."}
            </div>
          )}
          {!loading &&
            !error &&
            displayedPoints.map((point, idx) => {
              const metaItems: React.ReactNode[] = [];

              if (typeof point.source_page === "number") {
                metaItems.push(
                  <button
                    key="page"
                    onClick={() => handlePageClick(point.source_page, point.source_text)}
                    className="relative group cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
                    title={point.source_text || "Click to view page in document"}
                  >
                    Page: {point.source_page}
                  </button>
                );
              }

              if (point.deadline) {
                metaItems.push(
                  <span key="deadline">Deadline: {formatDateShort(point.deadline)}</span>
                );
              }

              return (
                <div key={point.id}>
                  <div className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {point.title}
                      </h4>
                      {point.description && (
                        <p className="text-sm text-gray-700 mb-2 justified">
                          {point.description}
                        </p>
                      )}
                      {metaItems.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {metaItems.map((item, itemIdx) => (
                            <span key={itemIdx}>
                              {item}
                              {itemIdx < metaItems.length - 1 && <span className="mx-1">|</span>}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {idx !== displayedPoints.length - 1 && (
                    <div className="h-[2px] rounded-full bg-[#F6F6F6] mx-auto my-4" />
                  )}
                </div>
              );
            })}

          {!loading && filteredPoints.length > 3 && (
            <div className="pt-2">
              {!showAll ? (
                <button
                  onClick={() => setShowAll(true)}
                  className="text-blue-600 font-semibold text-sm hover:underline"
                >
                  + Show More ({filteredPoints.length - 3} more)
                </button>
              ) : (
                <button
                  onClick={() => setShowAll(false)}
                  className="text-blue-600 font-semibold text-sm hover:underline"
                >
                  - Show Less
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}