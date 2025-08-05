import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ReportsAndExports() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Reports & Exports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Reports Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">SUMMARY REPORTS</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Executive Authority</p>
                    <p className="text-xs text-gray-500">CXO Ready Analysis</p>
                  </div>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>

              
            </div>
          </div>

          {/* Detail Reports Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">DETAIL REPORTS</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">PDF</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Compliance Obligation</p>
                    <p className="text-xs text-gray-500">Detailed Breakdown with deadline</p>
                  </div>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full mt-6 bg-blue-800 hover:bg-blue-900">
          Download All Report ( ZIP )
        </Button>
      </CardContent>
    </Card>
  );
}
