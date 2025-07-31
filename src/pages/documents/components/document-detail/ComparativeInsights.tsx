import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComparativeInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparative Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400">
            <h4 className="font-medium text-gray-900 mb-1">A.P. (DIR Series) Circular No. 23 - Feb 10, 2022</h4>
            <p className="text-sm text-gray-600">Previous CDS limits reference | 85% similarity</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400">
            <h4 className="font-medium text-gray-900 mb-1">A.P. (DIR Series) Circular No. 03 - Apr 26, 2024</h4>
            <p className="text-sm text-gray-600">Previous CDS limits reference | 85% similarity</p>
          </div>

          <div className="bg-yellow-100 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Key Changes:</h4>
            <p className="text-sm text-gray-700">Absolute limit amounts increased, percentage limits unchanged.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
