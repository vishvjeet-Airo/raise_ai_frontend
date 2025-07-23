import { Sidebar } from "@/components/Sidebar";
import { NoRequestsChart } from "@/components/NoRequestsChart";

export default function Index() {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center lg:ml-0">
        <div className="w-full max-w-md px-4">
          <NoRequestsChart />
        </div>
      </div>
    </div>
  );
}
