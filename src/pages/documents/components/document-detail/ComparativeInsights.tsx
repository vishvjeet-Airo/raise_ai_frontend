import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { API_BASE_URL } from "@/lib/config";

interface AmendmentAnalysis {
  focus: string;
  impact: string;
  summary: string;
  key_changes: string[];
  comparison_note: string;
}

interface Version {
  id: number;
  version: number;
  file_name: string;
  uploaded_at: string;
  publication_date: string;
  is_amendment: boolean;
  amendment_analysis: AmendmentAnalysis | null;
}

interface VersioningData {
  title: string;
  total_versions: number;
  versions: Version[];
  auto_fix_info: {
    was_applied: boolean;
    success: boolean;
    message: string;
    fixes_applied: any[];
    errors_encountered: any[];
  };
}

// The component now accepts a 'documentId' prop
export default function ComparativeInsights({ documentId }: { documentId: number }) {
  const [comparativeData, setComparativeData] = useState<Version[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This function fetches the data from your API
    const fetchComparativeData = async () => {
      try {
        setLoading(true); // Start loading
        setError(null); // Clear any previous errors

        // Fetch data from the API using the documentId prop
const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}/version-history`
        );
        if (!response.ok) {
          // If the response is not successful, throw an error
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: VersioningData = await response.json();

        // Filter the versions to only show amendments with analysis
        const amendments = data.versions.filter(
          (version) => version.is_amendment && version.amendment_analysis
        );
        
        // Update the state with the filtered data
        setComparativeData(amendments);
      } catch (e: any) {
        setError(e.message); // Set the error message if something goes wrong
      } finally {
        setLoading(false); // End loading regardless of success or failure
      }
    };

    // Only run the fetch function if a documentId is provided
    if (documentId) {
      fetchComparativeData();
    }
  }, [documentId]); // Re-run the effect if documentId changes

  // Conditional rendering for different states
  if (loading) {
    return (
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="font-poppins font-medium text-[16px] leading-[100%] tracking-[0] text-[#3F3F3F]">
            Comparative Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-gray-500">Loading insights...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="font-poppins font-medium text-[16px] leading-[100%] tracking-[0] text-[#3F3F3F]">
            Comparative Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-red-500">Error fetching data: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (comparativeData.length === 0) {
    return (
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="font-poppins font-medium text-[16px] leading-[100%] tracking-[0] text-[#3F3F3F]">
            Comparative Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-gray-500">
            No amendment insights available for this document.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main component render with fetched data
  return (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="font-poppins font-medium text-[16px] leading-[100%] tracking-[0] text-[#3F3F3F]">
          Comparative Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={300}>
          <div className="space-y-4">
            {comparativeData.map((item) => (
              <Tooltip key={item.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                    <h4 className="font-poppins font-semibold text-[12px] leading-[20px] tracking-[0] text-[#5B5A5A]">
                      {/* Display publication date and version from API data */}
                      Version {item.version} - {item.publication_date}
                    </h4>
                    <p className="font-poppins font-normal text-[11px] leading-[20px] tracking-[0] text-[#5B5A5A]">
                      {/* Display the comparison note from API data */}
                      {item.amendment_analysis?.comparison_note}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="max-w-xs bg-white border border-gray-200 shadow-lg"
                  sideOffset={8}
                >
                  <div className="space-y-2 p-2">
                    <h4 className="font-poppins font-semibold text-[12px] text-[#3F3F3F]">
                      Key Changes:
                    </h4>
                    <ul className="space-y-1">
                      {/* Map through the key changes from API data */}
                      {item.amendment_analysis?.key_changes.map(
                        (change, changeIndex) => (
                          <li
                            key={changeIndex}
                            className="font-poppins font-normal text-[11px] text-[#5B5A5A] flex items-start"
                          >
                            <span className="text-blue-500 mr-1">•</span>
                            {/* Use dangerouslySetInnerHTML to render the formatted text */}
                            <div dangerouslySetInnerHTML={{ __html: change }} />
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}