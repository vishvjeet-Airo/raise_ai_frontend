import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, MessageSquare } from "lucide-react";
import { useChatSidebar } from "../../DocumentDetail";

interface DocumentHeaderProps {
  fileName: string;
  issueDate: string;
  publisher: string;
  documentId: string;
  onPreviewClick?: () => void;
}

export default function DocumentHeader({ fileName, issueDate, publisher, documentId, onPreviewClick }: DocumentHeaderProps) {
  const { isChatOpen, setIsChatOpen, isPreviewOpen } = useChatSidebar();

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };


  return (
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
              variant={isPreviewOpen ? "default" : "default"}
              className={isPreviewOpen
                ? "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
                : "text-white px-4 py-2 text-sm font-medium"
              }
              style={!isPreviewOpen ? { backgroundColor: "#1F4A75" } : {}}
              onClick={onPreviewClick}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewOpen ? "Close Preview" : "Preview Document"}
            </Button>

            <Button
                  variant={isChatOpen ? "default" : "outline"}
                  className={isChatOpen
                    ? "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                  }
                  onClick={toggleChat}
                >
                  <img 
                    src="/chatbot.png" 
                    alt="Chatbot Icon" 
                    className="w-4 h-4 mr-2" 
                  />
                  {isChatOpen ? "Close Chat" : "Chat"}
                </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
