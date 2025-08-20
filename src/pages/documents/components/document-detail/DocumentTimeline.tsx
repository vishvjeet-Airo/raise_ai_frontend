import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// NEW: Helper function to format the date and time
const formatDateTime = (isoString?: string) => {
  if (!isoString) return "Not available";
  return new Date(isoString).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// MODIFIED: Component now accepts 'uploadedTimestamp' as a prop
export default function DocumentTimeline({ uploadedTimestamp }: { uploadedTimestamp?: string }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const handleViewFullHistory = () => {
    navigate(`/documents/${id}/audit-trail`, {
      state: { document: location.state?.document }
    });
  };

  // MODIFIED: timelineItems now uses the dynamic timestamp
  const timelineItems = [
    {
      title: "Document Uploaded",
      timestamp: formatDateTime(uploadedTimestamp),
      color: "bg-blue-500",
      completed: true
    },
    {
      title: "AI Analysis Completed", 
      timestamp: "A few moments later", // This could also be a prop if available
      color: "bg-blue-500",
      completed: true
    }
  ];

  return (
    <Card className="bg-white w-69">
      <CardHeader className="px-4 pb- pt-4">
        <CardTitle className="text-base font-poppins font-normal">Document Timeline</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-5">
        <div className="relative">
          <div className="absolute left-[9px] top-[10px] w-px bg-gray-200" style={{ height: `${(timelineItems.length - 1) * 44}px` }}></div>
          
          {timelineItems.map((item, index) => (
            <div key={index} className="flex items-start space-x-2.5 pb-4 last:pb-0 relative">
              <div className={`relative z-10 w-5 h-5 ${item.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                {item.completed && (
                  <Check className="w-2.5 h-2.5 text-white" />
                )}
              </div>
              
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-xs font-medium text-gray-800">{item.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-3">
          <Button
            variant="ghost"
            onClick={handleViewFullHistory}
            className="font-medium text-xs leading-none tracking-normal text-[#1691CF] h-auto p-1"
          >
            View full History & Audit Trail →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}