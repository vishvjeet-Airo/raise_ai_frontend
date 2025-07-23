export function NoRequestsChart() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Circular Chart */}
      <div className="relative w-32 h-32 mb-6">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="8"
          />
          
          {/* Red segment (approximately 40%) */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#ef4444"
            strokeWidth="8"
            strokeDasharray="113 169"
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          
          {/* Blue segment (approximately 35%) */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="8"
            strokeDasharray="99 183"
            strokeDashoffset="-113"
            strokeLinecap="round"
          />
          
          {/* Light blue segment (approximately 25%) */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="8"
            strokeDasharray="71 211"
            strokeDashoffset="-212"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* No Requests Text */}
      <h2 className="text-lg font-medium text-gray-600">No Requests !</h2>
    </div>
  );
}
