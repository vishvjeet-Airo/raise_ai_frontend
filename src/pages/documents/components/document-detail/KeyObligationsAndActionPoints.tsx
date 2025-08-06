import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit } from "lucide-react";

export default function KeyObligationsAndActionPoints() {
  const obligations = [
    {
      title: "Ensure FPI investments stay within prescribed limits - 6% for G-Secs, 2% for SDGs, and 15% for corporate bonds",
      overview: "Implement new absolute limit amounts as specified in Table I for different half-year periods",
      reference: "Immediate implementation required | High Priority",
      responsible: "AD Category-I banks must inform constituents and customers about the circular contents",
      deadline: "Within 15 days of issue | Medium Priority"
    },
    {
      title: "Overview/Description:",
      overview: "Implement new absolute limit amounts as specified in Table I for different half-year periods",
      reference: "Immediate implementation required | High Priority",
      responsible: "AD Category-I banks must inform constituents and customers about the circular contents",
      deadline: "Within 15 days of issue | Medium Priority"
    },
    {
      title: "Reference Page Number and Section:",
      overview: "Monitor and maintain CDS sales limit at 5% of outstanding corporate bonds (₹2,93,612 crore approx.)",
      reference: "Ongoing compliance | Medium Priority",
      responsible: "AD Category-I banks must inform constituents and customers about the circular contents",
      deadline: "Within 15 days of issue | Medium Priority"
    },
    {
      title: "Responsible Party:",
      overview: "AD Category-I banks must inform constituents and customers about the circular contents",
      reference: "Within 15 days of issue | Medium Priority",
      responsible: "AD Category-I banks must inform constituents and customers about the circular contents",
      deadline: "Within 15 days of issue | Medium Priority"
    },
    {
      title: "Deadline:",
      overview: "AD Category-I banks must inform constituents and customers about the circular contents",
      reference: "Within 15 days of issue | Medium Priority",
      responsible: "AD Category-I banks must inform constituents and customers about the circular contents",
      deadline: "Within 15 days of issue | Medium Priority"
    }
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Obligations</CardTitle>
          <Edit className="w-4 h-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {obligations.map((obligation, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-3">
                  {obligation.title}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Overview/Description: {obligation.overview}</div>
                  <div>Reference Page Number and Section: {obligation.reference}</div>
                  <div>Responsible Party: {obligation.responsible}</div>
                  <div>Deadline: {obligation.deadline}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
