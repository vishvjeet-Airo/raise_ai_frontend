import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ValidationChecks {
  verifyTableData: boolean;
  confirmDeadlineInterpretation: boolean;
  reviewRiskAssessment: boolean;
  approveAnalysis: boolean;
}

export default function HumanValidation() {
  const [validationChecks, setValidationChecks] = useState<ValidationChecks>({
    verifyTableData: false,
    confirmDeadlineInterpretation: false,
    reviewRiskAssessment: false,
    approveAnalysis: false
  });

  return (
    <Card className="bg-[#FFFFFF]">
      <CardHeader>
        <CardTitle className="font-poppins font-medium text-[16px] leading-[100%] tracking-[0] text-[#3F3F3F]">Human Validation Required</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Button
            className="w-full bg-[#1F4A75] hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <span className="font-montserrat font-medium text-[14px] leading-[100%] tracking-[0] text-[#FFFFFF]">Send Validation</span>
            
          </Button>

        </div>
      </CardContent>
    </Card>
  );
}
