import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Loader2 } from "lucide-react";
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
}

export default function KeyObligationsAndActionPoints({
  actionPoints = [],
  loading = false,
  error = null,
}: KeyObligationsAndActionPointsProps) {
  // 2. Add state to control visibility
  const [showAll, setShowAll] = useState(false);

  // 3. Determine which obligations to display
  const displayedPoints = showAll ? actionPoints : actionPoints.slice(0, 3);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          {/* 4. Update CardTitle to show the total count */}
          <CardTitle className="text-lg font-poppins font-normal">
            Obligations {!loading && actionPoints.length > 0 && `(${actionPoints.length})`}
          </CardTitle>
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
          {!loading && !error && actionPoints.length === 0 && (
            <div className="text-gray-500 text-sm">
              No obligations or action points found for this document.
            </div>
          )}
          {!loading &&
            !error &&
            // 5. Map over the 'displayedPoints' array instead of the full 'actionPoints'
            displayedPoints.map((point, idx) => {
              const metaItems: React.ReactNode[] = [];

              // Add page with hover popup if source_page exists
              if (typeof point.source_page === "number") {
                metaItems.push(
                  <span
                    key="page"
                    className="relative group cursor-help"
                    title={point.source_text || "No source text available"}
                  >
                    Page: {point.source_page}
                    {/* Hover popup for source text */}
                    {point.source_text && (
                      <div className="absolute bottom-full ">
                        <div className="relative">
                          
                          {/* Arrow pointing down */}
                        </div>
                      </div>
                    )}
                  </span>
                );
              }

              // Add deadline if exists
              if (point.deadline) {
                metaItems.push(
                  <span key="deadline">Deadline: {formatDateShort(point.deadline)}</span>
                );
              }

              // Add relevant status
              if (typeof point.is_relevant === "boolean") {
                metaItems.push(
                  <span
                    key="relevant"
                    className={`text-xs font-medium ${
                      point.is_relevant
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {point.is_relevant ? 'Relevant' : 'Not Relevant'}
                  </span>
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
                  {/* Adjust divider logic for the currently displayed items */}
                  {idx !== displayedPoints.length - 1 && (
                    <div className="h-[2px] rounded-full bg-[#F6F6F6] mx-auto my-4" />
                  )}
                </div>
              );
            })}
          
          {/* Show More / Show Less buttons */}
          {!loading && actionPoints.length > 3 && (
            <div className="pt-2">
              {!showAll ? (
                <button
                  onClick={() => setShowAll(true)}
                  className="text-blue-600 font-semibold text-sm hover:underline"
                >
                  + Show More ({actionPoints.length - 3} more)
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
