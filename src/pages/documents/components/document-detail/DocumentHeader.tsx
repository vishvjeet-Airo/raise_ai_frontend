import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, MessageSquare } from "lucide-react";

export default function DocumentHeader() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-6 pb-4">
        <div className="space-y-3">
          <h1 className="text-lg font-medium text-gray-900">
            Master Circular - Guarantees and Co-acceptances
          </h1>
          
          <p className="text-sm text-gray-600">
            14 May 2025 | Reserve Bank of India | Reserve Bank of India
          </p>
          
          <div className="flex gap-3 pt-2">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              Preview Document
            </Button>
            
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
