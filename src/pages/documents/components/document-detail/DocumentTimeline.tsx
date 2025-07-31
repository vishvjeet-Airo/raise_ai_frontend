import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DocumentTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Document Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium">Document Uploaded</p>
              <p className="text-xs text-gray-500">April 5, 2025 - 2:30 PM</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium">AI Analysis Complete</p>
              <p className="text-xs text-gray-500">April 5, 2025 - 2:45 PM</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium">Assigned for Review</p>
              <p className="text-xs text-gray-500">Expected: April 7, 2025 - 5:00 PM</p>
            </div>
          </div>

          <Button size="sm" variant="outline" className="w-full mt-4">
            View Full History & Logs →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
