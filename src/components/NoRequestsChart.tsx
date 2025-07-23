export function NoRequestsChart() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Not Found Image */}
      <div className="mb-6">
        <img
          src="/Not%20Found.png"
          alt="Not Found"
          className="w-32 h-32 object-contain"
        />
      </div>
      {/* No Requests Text */}
      <h2 className="text-lg font-medium text-gray-600">No Requests !</h2>
    </div>
  );
}
