import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

import api from "../apis/api";
import { clearAuth } from "../utils/auth";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false,
  });

  const togglePasswordVisibility = (field) => {
    setVisiblePasswords((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.new_password.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error("New password and confirm password do not match");
      return;
    }

    if (formData.old_password === formData.new_password) {
      toast.error("New password must be different from old password");
      return;
    }

    try {
      setLoading(true);

      const response = await api.put(
        "/users/change-password",
        formData,
      );

      toast.success(
        response.data.message || "Password changed successfully",
      );

      clearAuth();
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to change password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Change Password
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 font-medium">
            Old Password
          </label>

          <div className="relative">
            <input
              type={visiblePasswords.old_password ? "text" : "password"}
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 p-3 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="Enter old password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("old_password")}
              aria-label={
                visiblePasswords.old_password
                  ? "Hide old password"
                  : "Show old password"
              }
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-4 text-gray-500 transition hover:text-indigo-600 focus:outline-none"
            >
              {visiblePasswords.old_password ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            New Password
          </label>

          <div className="relative">
            <input
              type={visiblePasswords.new_password ? "text" : "password"}
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              minLength={8}
              maxLength={20}
              required
              className="w-full rounded-xl border border-gray-300 p-3 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("new_password")}
              aria-label={
                visiblePasswords.new_password
                  ? "Hide new password"
                  : "Show new password"
              }
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-4 text-gray-500 transition hover:text-indigo-600 focus:outline-none"
            >
              {visiblePasswords.new_password ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Confirm New Password
          </label>

          <div className="relative">
            <input
              type={visiblePasswords.confirm_password ? "text" : "password"}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              minLength={8}
              maxLength={20}
              required
              className="w-full rounded-xl border border-gray-300 p-3 pr-12 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirm_password")}
              aria-label={
                visiblePasswords.confirm_password
                  ? "Hide confirmed password"
                  : "Show confirmed password"
              }
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-4 text-gray-500 transition hover:text-indigo-600 focus:outline-none"
            >
              {visiblePasswords.confirm_password ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard/profile")}
            disabled={loading}
            className="flex-1 border p-3 rounded-xl"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white p-3 rounded-xl disabled:opacity-50"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
