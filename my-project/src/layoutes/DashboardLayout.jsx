import { Outlet } from "react-router-dom";

import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
import { formatRole, getStoredUser } from "../utils/auth";

export default function DashboardLayout() {
  const user = getStoredUser();
  const dashboardType = `${formatRole(user?.role) || "Employee"} Dashboard`;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar type={dashboardType} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
