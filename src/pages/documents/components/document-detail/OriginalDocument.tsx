import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, FileText } from "lucide-react";

export default function OriginalDocument() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Original Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 py-2">
            <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
              <FileText className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Master Circular - Guarantees and</p>
              <p className="text-sm text-gray-600">Co-acceptances</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
