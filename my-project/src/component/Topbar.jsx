import { useEffect, useState } from "react";

import { LogOut, UserRound, LogIn, LogOut as LogoutIcon } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { clearAuth, getStoredUser, ROLES } from "../utils/auth";

import api from "../apis/api";

import { toast } from "react-toastify";
import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const [checkedIn, setCheckedIn] = useState(false);

  const [checkedOut, setCheckedOut] = useState(false);

  const currentUser = getStoredUser();

  const isEmployee = currentUser?.role === ROLES.EMPLOYEE;

  // ================= FETCH TODAY STATUS =================

  const fetchTodayStatus = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/attendance/today-status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCheckedIn(response.data.checked_in);

      setCheckedOut(response.data.checked_out);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isEmployee) {
      fetchTodayStatus();
    }
  }, []);

  // ================= CHECK IN =================

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/attendance/check-in",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Checked In Successfully");

      fetchTodayStatus();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Check In Failed");
    }
  };

  // ================= CHECK OUT =================

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        "/attendance/check-out",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Checked Out Successfully");

      fetchTodayStatus();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Check Out Failed");
    }
  };

  return (
    <>
      <header className="h-24 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600">
            Employee Management
          </h1>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          {isEmployee && (
            <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-2xl px-5 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full

                    ${
                      checkedOut
                        ? "bg-red-500"
                        : checkedIn
                          ? "bg-green-500"
                          : "bg-yellow-400"
                    }
                  `}
                />

                <span className="text-sm font-medium text-gray-700">
                  {checkedOut
                    ? "Completed"
                    : checkedIn
                      ? "Working"
                      : "Not Checked In"}
                </span>
              </div>

              <button
                onClick={handleCheckIn}
                disabled={checkedIn && !checkedOut}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:cursor-pointer

                  ${
                    checkedIn && !checkedOut
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 hover:scale-105"
                  }
                `}
              >
                <LogIn size={16} />
                Check In
              </button>

              <button
                onClick={handleCheckOut}
                disabled={!checkedIn || checkedOut}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:cursor-pointer

                  ${
                    !checkedIn || checkedOut
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 hover:scale-105"
                  }
                `}
              >
                <LogoutIcon size={16} />
                Check Out
              </button>
            </div>
          )}

          <ThemeToggle />

          <Link
            to="/dashboard/profile"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition shadow-md"
          >
            <UserRound size={20} />
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all shadow-md hover:cursor-pointer"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[320px] text-center">
            <h2 className="text-lg font-bold text-gray-800">Confirm Logout</h2>

            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-center gap-3 mt-5">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100 hover:cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  clearAuth();

                  navigate("/");
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 hover:cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
