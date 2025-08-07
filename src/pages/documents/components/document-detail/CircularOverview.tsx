import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CircularOverviewProps {
  issuingAuthority?: string;
  issuingDate?: string;
  circularType?: string;
  referenceNumber?: string;
  impactAreas?: string;
}

export default function CircularOverview({ 
  issuingAuthority, 
  issuingDate, 
  circularType, 
  referenceNumber, 
  impactAreas 
}: CircularOverviewProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium">Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">ISSUING AUTHORITY</div>
            <div className="text-sm text-gray-900">{issuingAuthority || "All authorised dealer Category"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">ISSUING DATE</div>
            <div className="text-sm text-gray-900">{issuingDate || "12 May 2024"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">CIRCULAR TYPE</div>
            <div className="text-sm text-gray-900">{circularType || "Guideline"}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">REFERENCE NUMBER</div>
            <div className="text-sm text-gray-900">{referenceNumber || "322534636"}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">IMPACT AREAS</div>
            <div className="text-sm text-gray-900">{impactAreas || "Treasury, Foreign Exchange, Investment\nManagement, Compliance"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}