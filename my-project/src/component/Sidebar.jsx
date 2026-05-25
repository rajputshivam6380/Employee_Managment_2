import { Link, NavLink } from "react-router-dom";

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
  House
} from "lucide-react";

import { useState } from "react";

import {
  getStoredUser,
  ROLES,
} from "../utils/auth";

export default function Sidebar() {

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const user = getStoredUser();

console.log(user);

  const role = user?.role;




  const sidebarTitle =
  user?.name?.trim() ||
  "Dashboard";

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
      isActive
        ? "bg-indigo-500 text-white shadow-md"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (

    <aside
      className={`h-screen bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >

      <div className="p-4 bg-gray-100 flex flex-col items-center justify-center gap-2">

        <Link
  to="/dashboard"
  className="p-4 bg-gray-100 hover:bg-indigo-50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300"
>

  <Building
    className="text-orange-500"
    size={32}
  />

  {sidebarOpen && (

    <h1 className="text-2xl font-bold text-indigo-600 text-center">
      {sidebarTitle}
    </h1>

  )}

</Link>

      </div>

      <nav className="flex-1 flex flex-col p-4 gap-3">




        {role === ROLES.ORGANIZATION_ADMIN && (

          <NavLink
            to="/dashboard/home"
            className={navLinkClass}
          >

            <House size={20} />

            {sidebarOpen && "Dashboard"}

          </NavLink>

        )}

        {role !== ROLES.EMPLOYEE && (

          <NavLink
            to="/dashboard/employees"
            className={navLinkClass}
          >

            <Users size={20} />

            {sidebarOpen && "Employees"}

          </NavLink>

        )}

        {role === ROLES.ORGANIZATION_ADMIN && (

          <NavLink
            to="/dashboard/assign-project"
            className={navLinkClass}
          >

            <FolderKanban size={20} />

            {sidebarOpen && "Tasks"}

          </NavLink>

        )}


         

        {role === ROLES.EMPLOYEE && (

          <NavLink
            to="/dashboard/projects"
            className={navLinkClass}
          >

            <FolderKanban size={20} />

            {sidebarOpen && "Tasks"}

          </NavLink>

        )}

        {role === ROLES.SUPER_ADMIN && (

          <NavLink
            to="/dashboard/organizations"
            className={navLinkClass}
          >

            <Building2 size={20} />

            {sidebarOpen && "Organizations"}

          </NavLink>

        )}




        

{role !== ROLES.ORGANIZATION_ADMIN &&(
        <NavLink 
        to="/dashboard/attendance"
        className={navLinkClass}>
          <ClipboardCheck size={20}/>

          {sidebarOpen && "Attendence"}
        </NavLink>
)}




  {role === ROLES.ORGANIZATION_ADMIN && (

          <NavLink
            to="/dashboard/attendance/all"
            className={navLinkClass}
          >

            <CalendarCheck size={20} />

            {sidebarOpen && "All Attendence"}

          </NavLink>

        )}



        {/* ================= PROFILE ================= */}
        <NavLink
          to="/dashboard/profile"
          className={navLinkClass}
        >

          <UserRound size={20} />

          {sidebarOpen && "Profile"}

        </NavLink>

      </nav>

      {/* ================= FOOTER ================= */}
      <div className="p-4 border-t">

        <button
          onClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
          className="w-full flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-200 text-black py-3 rounded-4xl transition-all"
        >

          {sidebarOpen ? (
            <ChevronLeft size={20} />
          ) : (
            <ChevronRight size={20} />
          )}

        </button>

      </div>

    </aside>
  );
}
