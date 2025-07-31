import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RiskAndImpactAssessment() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Risk and Impact Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Operational Risk : Medium</div>
                <div className="text-xs text-gray-500">System Update Required</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Regulatory Risk : Medium</div>
                <div className="text-xs text-gray-500">Compliance Regularly</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Reputational Risk : Medium</div>
                <div className="text-xs text-gray-500">Moderate Update</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Customer Impact : Medium</div>
                <div className="text-xs text-gray-500">Process Effected</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">AI COMPLIANCE SCORE</div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            94% Compliance
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
