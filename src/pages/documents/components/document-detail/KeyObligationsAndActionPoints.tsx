import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function KeyObligationsAndActionPoints() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Key Obligations & Action Points</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Maintain FPI Investment Limits:</h4>
              <p className="text-sm text-gray-700 mb-2">Ensure FPI investments stay within prescribed limits - 6% for G-Secs, 2% for SDGs, and 15% for corporate bonds</p>
              <p className="text-xs text-gray-500">No specific deadline mentioned | High Priority</p>
            </div>
          </div>

 {/* Separator Line */}
 {<div className=" h-[2px] rounded-full bg-[#F6F6F6] mx-auto my-4" />}

          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Update Investment Tracking Systems:</h4>
              <p className="text-sm text-gray-700 mb-2">Implement new absolute limit amounts as specified in Table I for different half-year periods</p>
              <p className="text-xs text-gray-500">Immediate implementation required | High Priority</p>
            </div>
          </div>

{/* Separator Line */}
{<div className=" h-[2px] rounded-full bg-[#F6F6F6] mx-auto my-4" />}

          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Credit Default Swaps Monitoring:</h4>
              <p className="text-sm text-gray-700 mb-2">Monitor and maintain CDS sales limit at 5% of outstanding corporate bonds (₹2,93,612 crore approx.)</p>
              <p className="text-xs text-gray-500">Ongoing compliance | Medium Priority</p>
            </div>
          </div>

{/* Separator Line */}
{<div className=" h-[2px] rounded-full bg-[#F6F6F6] mx-auto my-4" />}

          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Customer Communication:</h4>
              <p className="text-sm text-gray-700 mb-2">All Category-I banks must inform constituents and customers about the circular contents</p>
              <p className="text-xs text-gray-500">Within 15 days of issue | Medium Priority</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
