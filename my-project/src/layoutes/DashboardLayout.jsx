import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../component/Sidebar";
import Topbar from "../component/Topbar";
import { formatRole, getStoredUser } from "../utils/auth";

export default function DashboardLayout() {
  const user = getStoredUser();
  const dashboardType = `${formatRole(user?.role) || "Employee"} Dashboard`;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar type={dashboardType} onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

