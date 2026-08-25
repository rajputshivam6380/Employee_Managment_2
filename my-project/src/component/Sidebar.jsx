import { Link, NavLink, useLocation } from "react-router-dom";

import {
  Building2,
  UserRound,
  Users,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  Building,
  ClipboardCheck,
  CalendarCheck,
  House,
  CalendarRange,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { getStoredUser, ROLES } from "../utils/auth";
import { getLeaveNotificationCount } from "../api/leaveApi";

export default function Sidebar({ mobileOpen = false, setMobileOpen = () => {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leaveCount, setLeaveCount] = useState(0);
  const location = useLocation();

  const user = getStoredUser();

  const role = user?.role;

  const sidebarTitle = user?.name?.trim() || "Dashboard";

  // Auto close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
      sidebarOpen ? "" : "justify-center"
    } ${
      isActive
        ? "bg-indigo-500 text-white shadow-md"
        : "text-gray-700 hover:bg-gray-100"
    }`;


  const canShowLeaveCount = [
    ROLES.EMPLOYEE,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.HR_MANAGER,
  ].includes(role);

  const fetchLeaveCount = useCallback(async () => {
    if (!canShowLeaveCount) {
      setLeaveCount(0);
      return;
    }

    try {
      const response = await getLeaveNotificationCount();
      setLeaveCount(Number(response.data?.count || 0));
    } catch (err) {
      console.log(err);
    }
  }, [canShowLeaveCount]);

  useEffect(() => {
    fetchLeaveCount();
  }, [fetchLeaveCount, location.pathname]);

  useEffect(() => {
    if (!canShowLeaveCount) return undefined;

    const handleUpdate = () => fetchLeaveCount();

    window.addEventListener("leave-notifications-updated", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("leave-notifications-updated", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [canShowLeaveCount, fetchLeaveCount]);

  const renderLeaveBadge = (isCollapsed) => {
    if (leaveCount <= 0) return null;

    if (isCollapsed) {
      return (
        <span className="absolute -top-1.5 -right-2.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white z-10">
          {leaveCount > 99 ? "99+" : leaveCount}
        </span>
      );
    }

    return (
      <span className="ml-auto flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold leading-none text-white shrink-0">
        {leaveCount > 99 ? "99+" : leaveCount}
      </span>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`fixed md:relative z-50 h-screen bg-white shadow-xl md:shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        } ${sidebarOpen ? "md:w-64" : "md:w-20"}`}
      >

      <div className="p-4 bg-gray-100 flex flex-col items-center justify-center gap-2">
        <Link
          to="/dashboard"
          className="p-4 bg-gray-100 hover:bg-indigo-50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300"
        >
          <Building className="text-orange-500 shrink-0" size={32} />

          {sidebarOpen && (
            <h1 className="text-2xl font-bold text-indigo-600 text-center">
              {sidebarTitle}
            </h1>
          )}
        </Link>
      </div>

      <nav className="flex-1 flex flex-col p-4 gap-3">
        {role === ROLES.ORGANIZATION_ADMIN && (
          <NavLink to="/dashboard/home" className={navLinkClass}>
            <House size={20} className="shrink-0" />

            {sidebarOpen && "Dashboard"}
          </NavLink>
        )}

        {role === ROLES.EMPLOYEE && (
          <NavLink to="/dashboard/employee_home" className={navLinkClass}>
            <House size={20} className="shrink-0" />

            {sidebarOpen && "Dashboard"}
          </NavLink>
        )}

        {role !== ROLES.EMPLOYEE && (
          <NavLink to="/dashboard/employees" className={navLinkClass}>
            <Users size={20} className="shrink-0" />

            {sidebarOpen && "Employees"}
          </NavLink>
        )}

        {role === ROLES.ORGANIZATION_ADMIN && (
          <NavLink to="/dashboard/assign-project" className={navLinkClass}>
            <FolderKanban size={20} className="shrink-0" />

            {sidebarOpen && "Tasks"}
          </NavLink>
        )}

        {role === ROLES.EMPLOYEE && (
          <NavLink to="/dashboard/projects" className={navLinkClass}>
            <FolderKanban size={20} className="shrink-0" />

            {sidebarOpen && "Tasks"}
          </NavLink>
        )}

        {role === ROLES.SUPER_ADMIN && (
          <NavLink to="/dashboard/organizations" className={navLinkClass}>
            <Building2 size={20} className="shrink-0" />

            {sidebarOpen && "Organizations"}
          </NavLink>
        )}

        {role === ROLES.EMPLOYEE && (
          <NavLink to="/dashboard/attendance" className={navLinkClass}>
            <ClipboardCheck size={20} className="shrink-0" />

            {sidebarOpen && "Attendence"}
          </NavLink>
        )}

        {role === ROLES.ORGANIZATION_ADMIN && (
          <NavLink to="/dashboard/attendance/all" className={navLinkClass}>
            <CalendarCheck size={20} className="shrink-0" />

            {sidebarOpen && "All Attendence"}
          </NavLink>
        )}



        {role === ROLES.EMPLOYEE && (
          <NavLink to="/dashboard/leaves" className={navLinkClass}>
            <div className="relative flex items-center justify-center">
              <CalendarRange size={20} className="shrink-0" />
              {!sidebarOpen && renderLeaveBadge(true)}
            </div>

            {sidebarOpen && <span>My Leaves</span>}
            {sidebarOpen && renderLeaveBadge(false)}
          </NavLink>
        )}

        {[ROLES.ORGANIZATION_ADMIN, ROLES.HR_MANAGER].includes(role) && (
          <NavLink to="/dashboard/admin-leaves" className={navLinkClass}>
            <div className="relative flex items-center justify-center">
              <CalendarCheck size={20} className="shrink-0" />
              {!sidebarOpen && renderLeaveBadge(true)}
            </div>

            {sidebarOpen && <span>All Leaves</span>}
            {sidebarOpen && renderLeaveBadge(false)}
          </NavLink>
        )}

        {/* ================= PROFILE ================= */}
        <NavLink to="/dashboard/profile" className={navLinkClass}>
          <UserRound size={20} className="shrink-0" />

          {sidebarOpen && "Profile"}
        </NavLink>
      </nav>

      {/* ================= FOOTER ================= */}
      <div className="p-4 border-t">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-200 text-black py-3 rounded-4xl transition-all"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </aside>
    </>
  );
}

