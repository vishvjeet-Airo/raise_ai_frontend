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
      timestamp: "Expected April 5, 2025 , 2:15 PM",
      color: "bg-red-500",
      completed: true
    }
  ];

  return (
    <Card className="bg-gray-50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-gray-900">Document Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Single timeline line for all items */}
          <div className="absolute left-[12px] top-[24px] w-px bg-gray-200" style={{ height: `${(timelineItems.length - 1) * 60}px` }}></div>
          
          {timelineItems.map((item, index) => (
            <div key={index} className="flex items-start space-x-3 pb-6 last:pb-4 relative">
              {/* Timeline dot */}
              <div className={`relative z-10 w-6 h-6 ${item.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                {item.completed && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              
              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4">
          <Button 
            variant="ghost" 
            className="font-medium text-[13px] leading-[100%] tracking-[0] text-[#1691CF]"
          >
            View full History & Audit Trail →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}