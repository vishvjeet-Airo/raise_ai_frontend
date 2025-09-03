import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X as XIcon } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// NEW: Helper function to format the date and time
const formatDateTime = (isoString?: string) => {
  if (!isoString) return "Not available";

  // Parse as UTC
  const utcDate = new Date(isoString);

  // Convert to IST (UTC + 5:30)
  const istDate = new Date(utcDate.getTime() + (5 * 60 + 30) * 60 * 1000);

  return istDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',   
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// MODIFIED: Component now accepts 'uploadedTimestamp' and 'completionTimestamp' as props
export default function DocumentTimeline({
  uploadedTimestamp,
  completionTimestamp,
  approvalStatus,
  approvalVerifiedAt,
}: {
  uploadedTimestamp?: string;
  completionTimestamp?: string;
  approvalStatus?: string | null;
  approvalVerifiedAt?: string | null;
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const handleViewFullHistory = () => {
    navigate(`/documents/${id}/audit-trail`, {
      state: { document: location.state?.document }
    });
  };

  // MODIFIED: timelineItems now uses the dynamic timestamps and explicit status labels
  const normalizedStatus = (approvalStatus || "").toLowerCase();
  const isAccepted = normalizedStatus === "accepted" || normalizedStatus === "approved";
  const isRejected = normalizedStatus === "rejected";
  const statusTitle = isAccepted ? "Report accepted" : isRejected ? "Report rejected" : "Verification pending";
  const statusTimestamp = (isAccepted || isRejected) ? formatDateTime(approvalVerifiedAt || undefined) : "Pending";
  const statusColor = isAccepted ? "bg-emerald-500" : isRejected ? "bg-red-500" : "bg-gray-400";
  const statusCompleted = isAccepted || isRejected;
  const timelineItems = [
    {
      title: "Document Uploaded",
      timestamp: formatDateTime(uploadedTimestamp),
      color: "bg-blue-500",
      completed: true,
      icon: "check" as const,
    },
    {
      title: "AI Analysis Completed",
      timestamp: formatDateTime(completionTimestamp),
      color: "bg-green-500",
      completed: true,
      icon: "check" as const,
    },
    {
      title: statusTitle,
      timestamp: statusTimestamp,
      color: statusColor,
      completed: statusCompleted,
      icon: isRejected ? "x" as const : "check" as const,
    }
  ];

  return (
    <Card className="bg-white w-69">
      <CardHeader className="px-4 pb- pt-4">
        <CardTitle className="text-base font-poppins font-normal">Document Timeline</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-5">
        <div className="relative">
          <div className="absolute left-[9px] top-[10px] bottom-[10px] w-px bg-gray-200"></div>
          
          {timelineItems.map((item, index) => (
            <div key={index} className="flex items-start space-x-2.5 pb-4 last:pb-0 relative">
              <div className={`relative z-10 w-5 h-5 ${item.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                {item.completed && (
                  item.icon === "x" ? (
                    <XIcon className="w-2.5 h-2.5 text-white" />
                  ) : (
                    <Check className="w-2.5 h-2.5 text-white" />
                  )
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
