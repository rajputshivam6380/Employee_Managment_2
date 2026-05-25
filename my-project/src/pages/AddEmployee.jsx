import { useState } from "react";

import api from "../apis/api";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

import { X } from "lucide-react";
import { getStoredUser, ROLES } from "../utils/auth";

import { useFormik } from "formik";
import { employeeValidationSchema } from "../component/Validation";

import {
  toast
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export default function AddEmployee({
  open,
  handleClose,
  organizations,
  fetchEmployees,
}) {

  const [loading, setLoading] =
    useState(false);

  const currentUser =
    getStoredUser();

  const canShowOrganization =
    currentUser?.role ===
    ROLES.SUPER_ADMIN;

  const inputStyle =
    "w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all p-3 rounded-xl";

  const departmentOptions = [
    "HR",
    "IT",
    "SALES",
    "MARKETING",
    "FINANCE",
    "OPERATIONS",
    "ADMIN",
    "CUSTOMER_SUPPORT",
    "DEVOPS",
    "MANAGEMENT",
  ];

  const roleOptions =
    currentUser?.role ===
    ROLES.SUPER_ADMIN
      ? [
          ROLES.ORGANIZATION_ADMIN,
          ROLES.HR_MANAGER,
          ROLES.DEPARTMENT_ADMIN,
          ROLES.EMPLOYEE,
        ]
      : [
          ROLES.HR_MANAGER,
          ROLES.DEPARTMENT_ADMIN,
          ROLES.EMPLOYEE,
        ];

  const formik = useFormik({

    initialValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "employee",
      department: "",
      organization_id: "",
      country_code: "+91",
    },

    validationSchema:
      employeeValidationSchema,

    onSubmit: async (
      values,
      { resetForm }
    ) => {

      try {

        setLoading(true);

        const token =
          localStorage.getItem(
            "token"
          );

        const sendData = {
          ...values,

          organization_id:
            Number(
              values.organization_id ||
              currentUser?.organization_id
            ),
        };

        await api.post(
          "/users/add-user",
          sendData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        toast.success(
          values.role === ROLES.EMPLOYEE
            ? "Employee added successfully!"
            : "User added successfully!"
        );

        if (fetchEmployees) {
          fetchEmployees();
        }

        resetForm();

        handleClose();

      } catch (err) {

        console.log(err);

        toast.error(
          err.response?.data?.detail ||
            "Failed to add employee"
        );

      } finally {

        setLoading(false);

      }
    },
  });

  return (
    <>

      <Modal
        open={open}
        onClose={handleClose}
      >

        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform:
              "translate(-50%, -50%)",
            width: {
              xs: "95%",
              sm: 700,
            },
            bgcolor: "white",
            borderRadius: 4,
            p: 4,
            outline: "none",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >

          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">

            <h1 className="text-3xl font-bold text-indigo-500">
              Add Employee
            </h1>

            <button
              onClick={() => {

                formik.resetForm();

                handleClose();

              }}
              className="text-gray-500 hover:text-red-500 transition hover:cursor-pointer"
            >
              <X size={28} />
            </button>

          </div>

          {/* FORM */}
          <form
            onSubmit={
              formik.handleSubmit
            }
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >

            {/* NAME */}
            <div className="flex flex-col relative">

              <span className="absolute right-0 top-0 text-red-500 text-lg font-bold">
                *
              </span>

              <label className="mb-1 text-sm font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={
                  formik.values.name
                }
                onChange={
                  formik.handleChange
                }
                onBlur={
                  formik.handleBlur
                }
                className={`${inputStyle} ${
                  formik.touched.name &&
                  formik.errors.name
                    ? "border-red-500"
                    : ""
                }`}
              />

              {formik.touched.name &&
                formik.errors.name && (

                <p className="text-red-500 text-sm mt-1">
                  {
                    formik.errors
                      .name
                  }
                </p>

              )}

            </div>

            {/* EMAIL */}
            <div className="flex flex-col relative">

              <span className="absolute right-0 top-0 text-red-500 text-lg font-bold">
                *
              </span>

              <label className="mb-1 text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={
                  formik.values.email
                }
                onChange={
                  formik.handleChange
                }
                onBlur={
                  formik.handleBlur
                }
                className={`${inputStyle} ${
                  formik.touched.email &&
                  formik.errors.email
                    ? "border-red-500"
                    : ""
                }`}
              />

              {formik.touched.email &&
                formik.errors.email && (

                <p className="text-red-500 text-sm mt-1">
                  {
                    formik.errors
                      .email
                  }
                </p>

              )}

            </div>

            {/* PASSWORD */}
            <div className="flex flex-col relative">

              <span className="absolute right-0 top-0 text-red-500 text-lg font-bold">
                *
              </span>

              <label className="mb-1 text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={
                  formik.values
                    .password
                }
                onChange={
                  formik.handleChange
                }
                onBlur={
                  formik.handleBlur
                }
                className={`${inputStyle} ${
                  formik.touched
                    .password &&
                  formik.errors
                    .password
                    ? "border-red-500"
                    : ""
                }`}
              />

              {formik.touched
                .password &&
                formik.errors
                  .password && (

                <p className="text-red-500 text-sm mt-1">
                  {
                    formik.errors
                      .password
                  }
                </p>

              )}

            </div>

            {/* PHONE + CODE */}
            <div className="flex gap-3">

              {/* CODE */}
              <div className="w-32 flex flex-col relative">

                <span className="absolute right-0 top-0 text-red-500 text-lg font-bold">
                  *
                </span>

                <label className="mb-1 text-sm font-medium text-gray-700">
                  Code
                </label>

                <select
                  name="country_code"
                  value={
                    formik.values
                      .country_code
                  }
                  onChange={
                    formik.handleChange
                  }
                  onBlur={
                    formik.handleBlur
                  }
                  className={`${inputStyle} ${
                    formik.touched
                      .country_code &&
                    formik.errors
                      .country_code
                      ? "border-red-500"
                      : ""
                  }`}
                >

                  <option value="">
                    Country Code
                  </option>

                  <option value="+91">
                    IND (+91)
                  </option>

                  <option value="+1">
                    USA (+1)
                  </option>

                  <option value="+44">
                    UK (+44)
                  </option>

                  <option value="+61">
                    AUS (+61)
                  </option>

                </select>

                {formik.touched
                  .country_code &&
                  formik.errors
                    .country_code && (

                  <p className="text-red-500 text-sm mt-1">
                    {
                      formik.errors
                        .country_code
                    }
                  </p>

                )}

              </div>

              {/* PHONE */}
              <div className="flex-1 flex flex-col relative">

                <span className="absolute right-0 top-0 text-red-500 text-lg font-bold">
                  *
                </span>

                <label className="mb-1 text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={
                    formik.values.phone
                  }
                  onChange={
                    formik.handleChange
                  }
                  onBlur={
                    formik.handleBlur
                  }
                  className={`${inputStyle} ${
                    formik.touched.phone &&
                    formik.errors.phone
                      ? "border-red-500"
                      : ""
                  }`}
                />

                {formik.touched.phone &&
                  formik.errors.phone && (

                  <p className="text-red-500 text-sm mt-1">
                    {
                      formik.errors
                        .phone
                    }
                  </p>

                )}

              </div>

            </div>

            {/* ROLE */}
            <div className="flex flex-col">

              <label className="mb-1 text-sm font-medium text-gray-700">
                Role
              </label>

              <select
                name="role"
                value={
                  formik.values.role
                }
                onChange={
                  formik.handleChange
                }
                className={inputStyle}
              >

                {roleOptions.map(
                  (role) => (

                    <option
                      key={role}
                      value={role}
                    >
                      {role
                        .replaceAll(
                          "_",
                          " "
                        )
                        .toUpperCase()}
                    </option>

                  )
                )}

              </select>

            </div>

            {/* DEPARTMENT */}
            <div className="flex flex-col relative">

              <span className="absolute right-0 top-0 text-red-500 text-lg font-bold">
                *
              </span>

              <label className="mb-1 text-sm font-medium text-gray-700">
                Department
              </label>

              <select
                name="department"
                value={
                  formik.values
                    .department
                }
                onChange={
                  formik.handleChange
                }
                onBlur={
                  formik.handleBlur
                }
                className={`${inputStyle} ${
                  formik.touched
                    .department &&
                  formik.errors
                    .department
                    ? "border-red-500"
                    : ""
                }`}
              >

                <option value="">
                  Select Department
                </option>

                {departmentOptions.map(
                  (dept) => (

                    <option
                      key={dept}
                      value={dept}
                    >
                      {dept}
                    </option>

                  )
                )}

              </select>

              {formik.touched
                .department &&
                formik.errors
                  .department && (

                <p className="text-red-500 text-sm mt-1">
                  {
                    formik.errors
                      .department
                  }
                </p>

              )}

            </div>

            {/* ORGANIZATION */}
            {canShowOrganization && (

              <div className="flex flex-col md:col-span-2">

                <label className="mb-1 text-sm font-medium text-gray-700">
                  Organization
                </label>

                <select
                  name="organization_id"
                  value={
                    formik.values
                      .organization_id
                  }
                  onChange={
                    formik.handleChange
                  }
                  className={inputStyle}
                >

                  <option value="">
                    Select Organization
                  </option>

                  {organizations?.map(
                    (org) => (

                      <option
                        key={org.id}
                        value={org.id}
                      >
                        {org.name}
                      </option>

                    )
                  )}

                </select>

              </div>

            )}

            {/* BUTTONS */}
            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={() => {

                  formik.resetForm();

                  handleClose();

                }}
                className="px-5 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition hover:cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 hover:cursor-pointer"
              >

                {loading
                  ? "Creating..."
                  : "Create Employee"}

              </button>

            </div>

          </form>

        </Box>

      </Modal>

     </>
  );
}
