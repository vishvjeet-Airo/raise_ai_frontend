import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CircularOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Circular Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">ISSUING AUTHORITY</div>
            <div className="text-sm text-gray-700">All authorised dealer Category-I<br />All category bank</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">REFERENCE NUMBER</div>
            <div className="text-sm text-gray-700">Treasury, Foreign Exchange, Investment<br />Management, Compliance</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">CIRCULAR TYPE</div>
            <div className="text-sm text-gray-700">Guideline</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">DATE OF ISSUE</div>
            <div className="text-sm text-gray-700">All authorised dealer Category-I<br />All category bank</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">EFFECTIVE DATE</div>
            <div className="text-sm text-gray-700">Treasury, Foreign Exchange, Investment<br />Management, Compliance</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">DOCUMENT TYPE</div>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Active
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
