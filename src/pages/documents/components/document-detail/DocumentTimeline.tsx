import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function DocumentTimeline() {
  const timelineItems = [
    {
      title: "Document Uploaded",
      timestamp: "April 3, 2025 , 2:15 PM",
      color: "bg-blue-500",
      completed: true
    },
    {
      title: "AI Analysis Completed", 
      timestamp: "April 3, 2025 , 2:20 PM",
      color: "bg-green-500",
      completed: true
    },
    {
      title: "Sent for Verification",
      timestamp: "April 3, 2025 , 2:27 PM", 
      color: "bg-yellow-500",
      completed: true
    },
    {
      title: "Verified on",
      timestamp: "April 3, 2025 , 2:27 PM",
      color: "bg-orange-500", 
      completed: true
    },
    {
      title: "Escalated By",
      timestamp: "Expected April 5, 2025",
      color: "bg-red-500",
      completed: true
    }
  ];

  return (
    // Further reduced width from w-72 to w-68 for a more compact look
    <Card className="bg-gray-50 w-69">
      {}
      <CardHeader className="px-4 pb- pt-4">
        <CardTitle className="text-base font-medium text-gray-900">Document Timeline</CardTitle>
      </CardHeader>
      {}
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
            className="font-medium text-xs leading-none tracking-normal text-[#1691CF] h-auto p-1"
          >
            View full History & Audit Trail →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
