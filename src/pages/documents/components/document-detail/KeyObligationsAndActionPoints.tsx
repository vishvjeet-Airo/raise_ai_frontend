import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";

interface ActionPoint {
  id: number;
  title: string;
  description: string;
  source_page: number;
  deadline: string | null;
}

export default function KeyObligationsAndActionPoints({ actionPoints = [] }: { actionPoints: ActionPoint[] }) {
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
          {actionPoints.length === 0 && (
            <div className="text-gray-500 text-sm">No obligations or action points found for this document.</div>
          )}
          {actionPoints.map((point, idx) => (
            <div key={point.id}>
              <div className="flex items-start space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{point.title}</h4>
                  <p className="text-sm text-gray-700 mb-2">{point.description}</p>
                  <p className="text-xs text-gray-500">
                    {point.deadline ? `Deadline: ${point.deadline}` : "No specific deadline"}
                    {typeof point.source_page === "number" && (
                      <> | Page: {point.source_page}</>
                    )}
                  </p>
                </div>
              </div>
              {idx !== actionPoints.length - 1 && (
                <div className="h-[2px] rounded-full bg-[#F6F6F6] mx-auto my-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}