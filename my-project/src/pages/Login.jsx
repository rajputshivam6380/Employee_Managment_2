import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";

import api from "../apis/api";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

import {
  clearAuth,
  getStoredUser,
  isTokenExpired,
  MANAGER_ROLES,
  ROLES,
  saveAuth,
} from "../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // ================= VALIDATION SCHEMA =================
  const loginValidationSchema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),

    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  // ================= CHECK LOGIN =================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && !isTokenExpired(token)) {
      const user = getStoredUser();

      navigate(
        user?.role === ROLES.EMPLOYEE
          ? "/dashboard/employee_home"
          : "/dashboard"
      );
    }
  }, [navigate]);

  // ================= INPUT STYLE =================
  const inputStyle =
    "w-full px-4 py-3 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500";

  // ================= FORMIK =================
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: loginValidationSchema,

    onSubmit: async (values) => {
      try {
        setError("");
        setLoading(true);

        const res = await api.post("/auth/login", {
          email: values.email,
          password: values.password,
        });

        const user = saveAuth(
          res.data.access_token,
          res.data.user
        );

        if (MANAGER_ROLES.includes(user.role)) {
          navigate("/dashboard");

        } else if (user.role === ROLES.EMPLOYEE) {
          navigate("/dashboard/employee_home");

        } else {
          clearAuth();
          setError("Unauthorized Access");
        }

      } catch (err) {

        setError(
          err.response?.data?.detail ||
            "Invalid email or password"
        );

      } finally {

        setLoading(false);

      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200 px-4">

      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md border border-gray-100">

        {/* HEADER */}
        <div className="mb-8 text-center">

          <h2 className="text-4xl font-bold text-indigo-600">
            Welcome Back
          </h2>

        
        </div>

        {/* FORM */}
        <form
          onSubmit={formik.handleSubmit}
          className="space-y-5"
        >

          {/* EMAIL */}
          <div className="flex flex-col">

            {/* <label className="mb-1 text-sm font-medium text-gray-700">
              Email Address
            </label> */}

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`${inputStyle} ${
                formik.touched.email &&
                formik.errors.email
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {formik.touched.email &&
              formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </p>
              )}

          </div>

          {/* PASSWORD */}
   {/* PASSWORD */}
<div className="flex flex-col">

<TextField
  fullWidth
  type={showPassword ? "text" : "password"}
  name="password"
  placeholder="Enter your password"
  value={formik.values.password}
  onChange={formik.handleChange}
  onBlur={formik.handleBlur}
  error={
    formik.touched.password &&
    Boolean(formik.errors.password)
  }
  slotProps={{
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              setShowPassword((prev) => !prev);
            }}
          >
            {showPassword ? (
              <VisibilityOff />
            ) : (
              <Visibility />
            )}
          </IconButton>
        </InputAdornment>
      ),
    },
  }}
  sx={{
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
    },
  }}
/>

  {formik.touched.password &&
    formik.errors.password && (
      <p className="text-red-500 text-sm mt-1">
        {formik.errors.password}
      </p>
    )}

</div>


          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-60 hover:cursor-pointer"
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;
