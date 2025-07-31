import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface ValidationChecks {
  verifyTableData: boolean;
  confirmDeadlineInterpretation: boolean;
  reviewRiskAssessment: boolean;
  approveAnalysis: boolean;
}

export default function HumanValidationRequired() {
  const [validationChecks, setValidationChecks] = useState<ValidationChecks>({
    verifyTableData: false,
    confirmDeadlineInterpretation: false,
    reviewRiskAssessment: false,
    approveAnalysis: false
  });

  const handleValidationCheck = (key: keyof ValidationChecks) => {
    setValidationChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const submitValidation = () => {
    console.log("Submitting validation:", validationChecks);
  };

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-lg">Human validation Required</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              validationChecks.verifyTableData
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300'
            }`}
            onClick={() => handleValidationCheck('verifyTableData')}>
              {validationChecks.verifyTableData && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-gray-700">Verify table data Accuracy</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              validationChecks.confirmDeadlineInterpretation
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300'
            }`}
            onClick={() => handleValidationCheck('confirmDeadlineInterpretation')}>
              {validationChecks.confirmDeadlineInterpretation && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-gray-700">Confirm Deadline interpretations</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              validationChecks.reviewRiskAssessment
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300'
            }`}
            onClick={() => handleValidationCheck('reviewRiskAssessment')}>
              {validationChecks.reviewRiskAssessment && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-gray-700">Review Risk Assessment</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              validationChecks.approveAnalysis
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300'
            }`}
            onClick={() => handleValidationCheck('approveAnalysis')}>
              {validationChecks.approveAnalysis && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm text-gray-700">Approve AI Analysis</span>
          </label>
        </div>

        <Button
          onClick={submitValidation}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Submit Validation
        </Button>
      </CardContent>
    </Card>
  );
}
