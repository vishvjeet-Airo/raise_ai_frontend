import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, MessageSquare } from "lucide-react";
import { useState } from "react";
import ChatPopup from "@/components/ChatPopup";

interface DocumentHeaderProps {
  fileName: string;
  issueDate: string;
  publisher: string;
  documentId: string;
  onPreviewClick?: () => void;
}

export default function DocumentHeader({ fileName, issueDate, publisher, documentId, onPreviewClick }: DocumentHeaderProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6 pb-4">
          <div className="space-y-3">
            <h1 className="text-lg font-medium text-gray-900">
              {fileName}
            </h1>
            
            <p className="text-sm text-gray-600">
              {issueDate} | {publisher}
            </p>
            
            <div className="flex gap-3 pt-2">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
                onClick={onPreviewClick}
              >
                <FileText className="w-4 h-4 mr-2" />
                Preview Document
              </Button>
              
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                onClick={toggleChat}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChatPopup
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        documentId={documentId}
        documentName={fileName}
      />
    </>
  );
}