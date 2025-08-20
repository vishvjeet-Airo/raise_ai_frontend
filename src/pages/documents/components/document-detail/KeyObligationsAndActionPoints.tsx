import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Loader2 } from "lucide-react"; 
import FadedTextLoader from "./FadedTextLoader";

interface ActionPoint {
  id: number;
  title: string;
  description?: string; 
  source_page?: number; 
  deadline?: string | null; 
  is_relevant?: boolean; 
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
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Obligations</CardTitle>
          <Edit className="w-4 h-4 text-gray-400" />
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
            actionPoints.map((point, idx) => {
              const meta: string[] = [];
              if (typeof point.source_page === "number") {
                meta.push(`Page: ${point.source_page}`);
              }
              if (point.deadline) {
                meta.push(`Deadline: ${point.deadline}`);
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
                        <p className="text-sm text-gray-700 mb-2">
                          {point.description}
                        </p>
                      )}
                      {meta.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {meta.join(" | ")}
                        </p>
                      )}
                    </div>
                  </div>
                  {idx !== actionPoints.length - 1 && (
                    <div className="h-[2px] rounded-full bg-[#F6F6F6] mx-auto my-4" />
                  )}
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}