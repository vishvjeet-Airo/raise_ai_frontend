import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ApplicableAndRelevance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Applicable & Relevance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">APPLICABLE TO</div>
            <div className="text-sm text-gray-700">All authorised dealer Category-I<br />All category bank</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">BUSINESS FUNCTION IMPACTED</div>
            <div className="text-sm text-gray-700">Treasury, Foreign Exchange, Investment<br />Management, Compliance</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">AI RELEVANCE SCORE</div>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              High (92%)
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
