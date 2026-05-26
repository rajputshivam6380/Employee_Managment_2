import { useState } from "react";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

import { X } from "lucide-react";

import api from "../apis/api";

import {
  getStoredUser,
  ROLES,
} from "../utils/auth";

import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { useFormik } from "formik";

import { employeeValidationSchema } from "../component/Validation";

const departmentOptions = [
  "HR",
  "IT",
  "FINANCE",
  "SALES",
  "MARKETING",
  "OPERATIONS",
  "ADMIN",
  "CUSTOMER_SUPPORT",
  "DEVOPS",
  "MANAGEMENT",
];

export default function UpdateEmployee({
  open,
  handleClose,
  employee,
  organizations = [],
  fetchEmployees,
}) {

  const currentUser =
    getStoredUser();

  const canShowOrganization =
    currentUser?.role ===
    ROLES.SUPER_ADMIN;

  const isSuperAdmin =
    currentUser?.role ===
    ROLES.SUPER_ADMIN;

  const [loading, setLoading] =
    useState(false);

  const inputStyle =
    "w-full border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all p-3 rounded-xl";

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
  name: employee?.name || "",
  email: employee?.email || "",
  country_code:
    employee?.country_code || "+91",
  phone: employee?.phone || "",
  role:
    employee?.role || ROLES.EMPLOYEE,
  department:
    employee?.department || "",
  organization_id:
    employee?.organization_id ||
    employee?.organization?.id ||
    "",
  is_active:
    employee?.is_active ?? true,
},

    validationSchema:
  employeeValidationSchema.omit([
    "password",
  ]),

    enableReinitialize: true,

onSubmit: async (values) => {

  if (!employee) return;

  const updatedData = {};

  // NAME
  if (
    values.name !== (employee.name || "")
  ) {
    updatedData.name = values.name;
  }

  // EMAIL
  if (
    values.email !== (employee.email || "")
  ) {
    updatedData.email = values.email;
  }

  // COUNTRY CODE
  if (
    values.country_code !==
    (employee.country_code || "+91")
  ) {
    updatedData.country_code =
      values.country_code;
  }

  // PHONE
  if (
    values.phone !== (employee.phone || "")
  ) {
    updatedData.phone = values.phone;
  }

  // DEPARTMENT
  if (
    values.department !==
    (employee.department || "")
  ) {
    updatedData.department =
      values.department;
  }

  // STATUS
  if (
    values.is_active !==
    (employee.is_active ?? true)
  ) {
    updatedData.is_active =
      values.is_active;
  }

  // ROLE
  if (
    isSuperAdmin &&
    values.role !== employee.role
  ) {
    updatedData.role = values.role;
  }

  // ORGANIZATION
  if (
    isSuperAdmin &&
    Number(values.organization_id) !==
      Number(employee.organization?.id)
  ) {
    updatedData.organization_id =
      Number(values.organization_id);
  }

  // NO CHANGES
  if (
    Object.keys(updatedData).length === 0
  ) {

    toast.info("No changes detected!");

    return;

  }

  try {

    setLoading(true);

    const token =
  localStorage.getItem("token");

await api.patch(
  `/users/${employee.id}`,
  updatedData,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

    toast.success(
      "Employee updated successfully!"
    );

    if (fetchEmployees) {

      await fetchEmployees();

    }

    setTimeout(() => {

  handleClose();

}, 3000);

  } catch (err) {

    console.log(err);

    toast.error(
      err.response?.data?.detail ||
      "Failed to update employee"
    );

  } finally {

    setLoading(false);

  }
},
  });

//   // SET DATA WHEN EMPLOYEE CHANGES
//   useEffect(() => {

//   if (!employee) return;

//   formik.setValues({
//     name: employee.name || "",
//     email: employee.email || "",
//     country_code:
//       employee.country_code || "+91",
//     phone: employee.phone || "",
//     role:
//       employee.role || ROLES.EMPLOYEE,
//     department:
//       employee.department || "",
//     organization_id:
//       employee.organization_id ||
//       employee.organization?.id ||
//       "",
//     is_active:
//       employee.is_active ?? true,
//   });

// }, [employee]);

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
              Update Employee
            </h1>

            <button
              type="button"
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

           

              <label className="mb-1 text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
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
                  formik.touched
                    .name &&
                  formik.errors.name
                    ? "border-red-500"
                    : ""
                }`}
              />

              {formik.touched
                .name &&
                formik.errors
                  .name && (

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

            

              <label className="mb-1 text-sm font-medium text-gray-700">
                Email<span className="text-red-500">*</span>
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
                  formik.touched
                    .email &&
                  formik.errors.email
                    ? "border-red-500"
                    : ""
                }`}
              />

              {formik.touched
                .email &&
                formik.errors
                  .email && (

                <p className="text-red-500 text-sm mt-1">
                  {
                    formik.errors
                      .email
                  }
                </p>

              )}

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
                disabled={
                  !isSuperAdmin
                }
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

            {/* PHONE + COUNTRY CODE */}
            <div className="flex gap-3">

              {/* COUNTRY CODE */}
              <div className="w-32 flex flex-col relative">

             

                <label className="mb-1 text-sm font-medium text-gray-700">
                  Code<span className="text-red-500">*</span>
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
                    +Code
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

              

                <label className="mb-1 text-sm font-medium text-gray-700">
                  Phone<span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={
                    formik.values.phone
                  }
                  onChange={(e) => {

                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    formik.setFieldValue(
                      "phone",
                      value
                    );

                  }}
                  onBlur={
                    formik.handleBlur
                  }
                  maxLength={10}
                  className={`${inputStyle} ${
                    formik.touched
                      .phone &&
                    formik.errors.phone
                      ? "border-red-500"
                      : ""
                  }`}
                />

                {formik.touched
                  .phone &&
                  formik.errors
                    .phone && (

                  <p className="text-red-500 text-sm mt-1">
                    {
                      formik.errors
                        .phone
                    }
                  </p>

                )}

              </div>

            </div>

           

            {/* DEPARTMENT */}
            <div className="flex flex-col relative">

          

              <label className="mb-1 text-sm font-medium text-gray-700">
                Department<span className="text-red-500">*</span>
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
                  onBlur={formik.handleBlur}
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

            {/* STATUS */}
            <div className="flex flex-col">

              <label className="mb-1 text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                name="is_active"
                value={formik.values.is_active.toString()}
                onChange={(e) => {

                  formik.setFieldValue(
                    "is_active",
                    e.target.value ===
                      "true"
                  );

                }}
                className={inputStyle}
              >

                <option value="true">
                  Active
                </option>

                <option value="false">
                  Inactive
                </option>

              </select>

            </div>

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
                  ? "Updating..."
                  : "Update Employee"}

              </button>

            </div>

          </form>

        </Box>

      </Modal>

    </>
  );
}
