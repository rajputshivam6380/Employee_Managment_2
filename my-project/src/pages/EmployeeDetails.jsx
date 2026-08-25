import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  ClipboardCheck,
  Layers3,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

import Attendance from "./Attendance";

import api, { API_BASE_URL } from "../apis/api";
import { formatRole } from "../utils/auth";

const profileImage = (photo) => {
  if (!photo) {
    return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  }

  return photo.startsWith("http") ? photo : `${API_BASE_URL}${photo}`;
};


const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      <Icon size={22} />
    </div>

    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 break-words text-base font-semibold text-gray-800">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}`);
      setEmployee(response.data);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to fetch employee");
      navigate("/dashboard/employees");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const phoneNumber = useMemo(() => {
    if (!employee?.phone) return "N/A";

    return `${employee.country_code || ""} ${employee.phone}`.trim();
  }, [employee]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <h1 className="text-2xl font-semibold text-gray-500">
          Loading Employee Details...
        </h1>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* <button
          type="button"
          onClick={() => navigate("/dashboard/employees")}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:cursor-pointer"
        >
          <ArrowLeft size={18} />
          Back to Employees
        </button> */}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-md transition-all hover:cursor-pointer ${
              activeTab === "details"
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ShieldCheck size={20} />
            Employee Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("attendance")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold shadow-md transition-all hover:cursor-pointer ${
              activeTab === "attendance"
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ClipboardCheck size={20} />
            Attendance
          </button>
        </div>
      </div>

      {activeTab === "details" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <img
                src={profileImage(employee.photo)}
                alt={employee.name}
                className="h-32 w-32 rounded-2xl border-4 border-indigo-100 object-cover shadow-sm"
              />

              <div>
                <p className="text-sm font-semibold uppercase text-indigo-500">
                  Employee Profile
                </p>
                <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
                  {employee.name}
                </h1>

                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
                    <ShieldCheck size={16} />
                    {formatRole(employee.role)}
                  </span>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                      employee.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <BadgeCheck size={16} />
                    {employee.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 rounded-xl bg-gray-50 p-4 text-center sm:min-w-40">
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="text-xl font-bold text-gray-900">{employee.id}</p>
              </div>

              {/* <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="text-xl font-bold text-gray-900">
                {employee.department || "N/A"}
              </p>
            </div> */}
            </div>
          </div>
        </section>
      )}

      {activeTab === "details" && (
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <DetailCard icon={Mail} label="Email" value={employee.email} />
          <DetailCard icon={Phone} label="Phone" value={phoneNumber} />
          <DetailCard
            icon={Layers3}
            label="Department"
            value={employee.department}
          />
          {/* <DetailCard
          icon={UserRound}
          label="Reports To"
          value={employee.parent?.name}
        /> */}
          {/* <DetailCard
          icon={Building2}
          label="Parent ID"
          value={employee.parent_id}
        /> */}
          {/* <DetailCard
          icon={CalendarDays}
          label="Attendance Scope"
          value={`Attendance shown here belongs only to ${employee.name}`}
        /> */}
        </section>
      )}

      {activeTab === "attendance" && (
        <Attendance employeeId={employee.id} embedded={true} />
      )}
    </div>
  );
}
