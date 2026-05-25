import {
  Mail,
  Phone,
  ShieldCheck,
  Layers3,
  ClipboardCheck,
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function EmployeeModal({
  employee,
}) {

  const navigate = useNavigate();

  if (!employee) return null;

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-6">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow hover:bg-gray-100 transition-all hover:cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <button
          onClick={() =>
            navigate(`/dashboard/attendance/${employee.id}`)
          }
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 shadow-md hover:shadow-lg transition-all hover:cursor-pointer"
        >
          <ClipboardCheck size={20} />
          View Attendance
        </button>

      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-3xl shadow-lg p-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center gap-8">

          {/* IMAGE */}
          <div className="flex justify-center">

            <img
              src={
                employee.photo
                  ? employee.photo.startsWith("http")
                    ? employee.photo
                    : `http://localhost:8000${employee.photo}`
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="profile"
              className="w-36 h-36 rounded-full object-cover border-4 border-indigo-500 shadow-md"
            />

          </div>

          {/* INFO */}
          <div className="flex-1">

            <h1 className="text-4xl font-bold text-gray-800">
              {employee.name}
            </h1>

            <div className="flex flex-wrap gap-3 mt-4">

              <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full text-sm font-semibold capitalize">
                {employee.role?.replace("_", " ")}
              </span>

              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  employee.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {employee.is_active
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>

          </div>

        </div>

        {/* CONTACT INFO */}
        <div className="mt-10">

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* EMAIL */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 shadow-sm">

              <Mail
                className="text-indigo-500"
                size={28}
              />

              <div>

                <p className="text-gray-400 text-sm">
                  Email
                </p>

                <p className="font-semibold text-lg break-all">
                  {employee.email || "N/A"}
                </p>

              </div>

            </div>

            {/* PHONE */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 shadow-sm">

              <Phone
                className="text-green-500"
                size={28}
              />

              <div>

                <p className="text-gray-400 text-sm">
                  Phone
                </p>

                <p className="font-semibold text-lg">
                  {employee.phone || "N/A"}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* EMPLOYEE DETAILS */}
        <div className="mt-10">

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Employee Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ROLE */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 shadow-sm">

              <ShieldCheck
                className="text-indigo-500"
                size={28}
              />

              <div>

                <p className="text-gray-400 text-sm">
                  Role
                </p>

                <p className="font-semibold text-lg capitalize">
                  {employee.role?.replace("_", " ")}
                </p>

              </div>

            </div>

            {/* DEPARTMENT */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 shadow-sm">

              <Layers3
                className="text-indigo-500"
                size={28}
              />

              <div>

                <p className="text-gray-400 text-sm">
                  Department
                </p>

                <p className="font-semibold text-lg capitalize">
                  {employee.department || "N/A"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}