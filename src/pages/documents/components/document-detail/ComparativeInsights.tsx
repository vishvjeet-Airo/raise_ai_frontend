import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ComparativeInsights() {
  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="font-poppins font-medium text-[16px] leading-[100%] tracking-[0] text-[#3F3F3F]">Comparative Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 color">
            <h4 className="font-poppins font-semibold text-[12px] leading-[20px] tracking-[0] text-[#5B5A5A]">A.P. (DIR Series) Circular No. 23 - Feb 10, 2022</h4>
            <p className="font-poppins font-normal text-[11px] leading-[20px] tracking-[0] text-[#5B5A5A]">Previous CDS limits reference | 85% similarity</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-poppins font-semibold text-[12px] leading-[20px] tracking-[0] text-[#5B5A5A]">A.P. (DIR Series) Circular No. 03 - Apr 26, 2024</h4>
            <p className="font-poppins font-normal text-[11px] leading-[20px] tracking-[0] text-[#5B5A5A]">Previous CDS limits reference | 85% similarity</p>
          </div>

          <div className="bg-yellow-100 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-poppins font-semibold text-[12px] leading-[20px] tracking-[0] text-[#5B5A5A]">Key Changes:</h4>
            <p className="font-poppins font-medium text-[12px] leading-[20px] tracking-[0] text-[#5B5A5A]">Absolute limit amounts increased, percentage limits unchanged.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
