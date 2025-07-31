import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ChartInvestmentLimits() {
  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Chart - Investment Limits for : FY 2025 - 26</h3>
          <p className="text-sm text-gray-600 mt-1">Chart I from the circular showing revised limits across different periods</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500 mb-4">Created On: Dec 16, 2024</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Legend */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Lorem Ipsum 30%</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Lorem Ipsum 25%</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Lorem Ipsum 15%</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Lorem Ipsum 20%</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Lorem Ipsum 10%</span>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="flex justify-center items-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle
                  cx="100"
                  cy="100"
                  r="60"
                  fill="transparent"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />

                {/* Purple segment - 30% */}
                <circle
                  cx="100"
                  cy="100"
                  r="60"
                  fill="transparent"
                  stroke="#a855f7"
                  strokeWidth="30"
                  strokeDasharray="113.1 377"
                  strokeDashoffset="0"
                  transform="rotate(-90 100 100)"
                />

                {/* Red segment - 25% */}
                <circle
                  cx="100"
                  cy="100"
                  r="60"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="30"
                  strokeDasharray="94.25 377"
                  strokeDashoffset="-113.1"
                  transform="rotate(-90 100 100)"
                />

                {/* Orange segment - 15% */}
                <circle
                  cx="100"
                  cy="100"
                  r="60"
                  fill="transparent"
                  stroke="#f97316"
                  strokeWidth="30"
                  strokeDasharray="56.55 377"
                  strokeDashoffset="-207.35"
                  transform="rotate(-90 100 100)"
                />

                {/* Blue segment - 20% */}
                <circle
                  cx="100"
                  cy="100"
                  r="60"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="30"
                  strokeDasharray="75.4 377"
                  strokeDashoffset="-263.9"
                  transform="rotate(-90 100 100)"
                />

                {/* Green segment - 10% */}
                <circle
                  cx="100"
                  cy="100"
                  r="60"
                  fill="transparent"
                  stroke="#22c55e"
                  strokeWidth="30"
                  strokeDasharray="37.7 377"
                  strokeDashoffset="-339.3"
                  transform="rotate(-90 100 100)"
                />
              </svg>

              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Lorem Ipsum</p>
                  <p className="text-xs text-gray-600">Lorem Ipsum</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-sm font-medium text-yellow-800">Note :</span>
            <span className="text-sm text-yellow-700">This section will dynamically display any tables, charts, or structured data found in the circular</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
