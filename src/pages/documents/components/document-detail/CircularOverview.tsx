import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CircularOverview() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium">Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">ISSUING AUTHORITY</div>
            <div className="text-sm text-gray-900">All authorised dealer Category</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">ISSUING DATE</div>
            <div className="text-sm text-gray-900">12 May 2024</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">CIRCULAR TYPE</div>
            <div className="text-sm text-gray-900">Guideline</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">REFERENCE NUMBER</div>
            <div className="text-sm text-gray-900">322534636</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">IMPACT AREAS</div>
            <div className="text-sm text-gray-900">Treasury, Foreign Exchange, Investment<br />Management, Compliance</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
