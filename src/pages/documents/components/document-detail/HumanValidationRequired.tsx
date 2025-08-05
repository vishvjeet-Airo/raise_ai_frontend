import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Plus } from "lucide-react";

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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("Admin Suresh");

  const emailOptions = [
    { name: "Admin Suresh", email: "", selected: true },
    { name: "KKumar@gmail.com", email: "KKumar@gmail.com", selected: false },
    { name: "Bhushantatil@gmail.com", email: "Bhushantatil@gmail.com", selected: false },
    { name: "Advaitravel@gmail.com", email: "Advaitravel@gmail.com", selected: false }
  ];

  const submitValidation = () => {
    console.log("Submitting validation:", validationChecks);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectEmail = (name: string) => {
    setSelectedEmail(name);
    setIsDropdownOpen(false);
  };

  return (
    <Card className="bg-[#FFFFFF]">
      <CardHeader>
        <CardTitle className="font-poppins font-medium text-[16px] leading-[100%] tracking-[0] text-[#3F3F3F]">Human validation Required</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Button
            onClick={toggleDropdown}
            className="w-full bg-[#1F4A75] hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <span className="font-montserrat font-medium text-[14px] leading-[100%] tracking-[0] text-[#FFFFFF]">Send Validation</span>
            {isDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-white" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white" />
            )}
          </Button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Submit To</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs px-3 py-1 h-auto"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Email
                </Button>
              </div>

              <div className="space-y-3">
                {emailOptions.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => selectEmail(option.name)}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedEmail === option.name 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedEmail === option.name && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {option.email || option.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <Button
                  onClick={submitValidation}
                  className="w-full bg-[#1F4A75] hover:bg-blue-700"
                >
                  <span className="font-montserrat font-medium text-[14px] leading-[100%] tracking-[0] text-[#FFFFFF]">Send Validation</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
