import { useEffect, useState } from "react";
import * as Yup from "yup";

import api from "../apis/api";

import { User, CalendarDays } from "lucide-react";

import { MultiSelect } from "react-multi-select-component";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export default function AssignedProject() {
  const [projects, setProjects] = useState([]);

  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [selectedDepartments, setSelectedDepartments] = useState([]);

  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    deadline: "",
    assigned_to: [],
  });

  // ================= VALIDATION =================

  const validationSchemaForTask = Yup.object({
    title: Yup.string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title cannot exceed 100 characters")
      .required("Task title is required"),

    description: Yup.string()
      .nullable()
      .max(1000, "Description cannot exceed 1000 characters"),

    priority: Yup.string()
      .oneOf(["High", "Medium", "Low"])
      .required("Priority is required"),

    deadline: Yup.date()
      .required("Please enter valid date")
      .min(
        new Date(new Date().setHours(0, 0, 0, 0)),
        "Please enter valid date",
      ),

    assigned_to: Yup.array()
      .min(1, "Select at least one employee")
      .required("Employee selection is required"),
  });

  // ================= FETCH EMPLOYEES =================

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/users/all");

      const employeeList = res.data.filter((emp) => emp.role === "employee");

      setEmployees(employeeList);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH PROJECTS =================

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/all");

      setProjects(res.data || []);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEmployees();

    fetchProjects();
  }, []);

  // ================= HANDLE CHANGE =================

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    try {
      await validationSchemaForTask.validateAt(name, {
        ...formData,
        [name]: value,
      });

      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [name]: err.message,
      }));
    }
  };

  // ================= EMPLOYEE OPTIONS =================

  const employeeOptions = employees.map((emp) => ({
    label: emp.name,
    value: emp.id,
  }));

  const departmentOptions = [
    {
      label: "HR",
      value: "HR",
    },
    {
      label: "IT",
      value: "IT",
    },
    {
      label: "SALES",
      value: "SALES",
    },
    {
      label: "MARKETING",
      value: "MARKETING",
    },
    {
      label: "FINANCE",
      value: "FINANCE",
    },
    {
      label: "OPERATIONS",
      value: "OPERATIONS",
    },
    {
      label: "ADMIN",
      value: "ADMIN",
    },
    {
      label: "CUSTOMER SUPPORT",
      value: "CUSTOMER_SUPPORT",
    },
    {
      label: "DEVOPS",
      value: "DEVOPS",
    },
    {
      label: "MANAGEMENT",
      value: "MANAGEMENT",
    },
  ];

  const selectedEmployees = employeeOptions.filter((option) =>
    formData.assigned_to.includes(option.value),
  );

  // ================= HANDLE EMPLOYEE CHANGE =================

  const handleEmployeeChange = async (selected) => {
    const employeeIds = selected.map((item) => item.value);

    setFormData((prev) => ({
      ...prev,
      assigned_to: employeeIds,
    }));

    try {
      await validationSchemaForTask.validateAt("assigned_to", {
        ...formData,
        assigned_to: employeeIds,
      });

      setErrors((prev) => ({
        ...prev,
        assigned_to: "",
      }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        assigned_to: err.message,
      }));
    }
  };

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // VALIDATE FORM

      await validationSchemaForTask.validate(formData, {
        abortEarly: false,
      });

      setErrors({});

      const data = new FormData();

      data.append("title", formData.title.trim());

      data.append("description", formData.description || "");

      data.append("priority", formData.priority);

      data.append("status", formData.status);

      data.append("deadline", formData.deadline);

      data.append("assigned_to", JSON.stringify(formData.assigned_to));

      // FILE

      if (selectedFile) {
        data.append("file", selectedFile);
      }

      await api.post("/projects/assign-project", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Project Assigned Successfully!");

      // RESET FORM

      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        status: "Pending",
        deadline: "",
        assigned_to: [],
      });

      setSelectedDepartments([]);

      setSelectedFile(null);

      setErrors({});

      fetchProjects();
    } catch (err) {
      console.log(err);

      // YUP VALIDATION ERRORS

      if (err.inner) {
        const newErrors = {};

        err.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });

        setErrors(newErrors);

        return;
      }

      // BACKEND ERROR

      const errorMessage =
        err.response?.data?.detail || "Failed To Assign Project!";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/delete/${selectedProjectId}`);

      toast.success("Project deleted successfully!");

      fetchProjects();

      setDeleteModal(false);

      setSelectedProjectId(null);
    } catch (err) {
      toast.error("Project not deleted!");

      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-600">Create Tasks</h1>
      </div>

      {/* FORM */}

      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* TITLE */}

          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Task Title<span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
              className={`border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
            />

            {errors.title && (
              <span className="text-red-500 text-sm mt-1">{errors.title}</span>
            )}
          </div>

          {/* DEPARTMENT */}

          <div className="flex flex-col w-full">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Select Departments
            </label>

            <MultiSelect
              options={departmentOptions}
              value={selectedDepartments}
              onChange={async (selected) => {
                setSelectedDepartments(selected);

                const deptValues = selected.map((item) => item.value);

                try {
                  if (deptValues.length === 0) {
                    fetchEmployees();

                    return;
                  }

                  const res = await api.get(
                    `/projects/filter-by-department?departments=${deptValues.join(",")}`,
                  );

                  setEmployees(res.data);
                } catch (err) {
                  console.log(err);
                }
              }}
              labelledBy="Select Departments"
              hasSelectAll={true}
            />
          </div>

          {/* EMPLOYEE */}

          <div className="flex flex-col w-full">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Select Employees<span className="text-red-500">*</span>
            </label>

            <div className="custom-multiselect">
              <MultiSelect
                options={employeeOptions}
                value={selectedEmployees}
                onChange={handleEmployeeChange}
                labelledBy="Select Employees"
                hasSelectAll={true}
                disableSearch={false}
                overrideStrings={{
                  selectSomeItems: "Select Employees",
                  allItemsAreSelected: "All Employees Selected",
                  search: "Search...",
                  selectAll: "Select All",
                }}
              />

              {errors.assigned_to && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.assigned_to}
                </span>
              )}
            </div>
          </div>

          {/* PRIORITY */}

          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Priority
            </label>

            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            >
              <option value="High">High</option>

              <option value="Medium">Medium</option>

              <option value="Low">Low</option>
            </select>
          </div>

          {/* DEADLINE */}

          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Deadline<span className="text-red-500">*</span>
            </label>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Deadline"
                value={formData.deadline ? dayjs(formData.deadline) : null}
                format="DD-MM-YYYY"
                onChange={(newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    deadline: newValue ? newValue.format("YYYY-MM-DD") : "",
                  }));
                }}
                minDate={dayjs()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.deadline,
                    helperText: errors.deadline,
                  },
                }}
              />
            </LocalizationProvider>
          </div>

          {/* DESCRIPTION */}

          <div className="flex flex-col md:col-span-2">
            <label className="mb-2 text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              name="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`border rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 resize-none ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />

            {errors.description && (
              <span className="text-red-500 text-sm mt-1">
                {errors.description}
              </span>
            )}
          </div>

          {/* FILE */}

          {/*
          <div className="flex flex-col">

            <label className="mb-2 text-sm font-medium text-gray-700">
              Upload File
            </label>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.zip,.png,.txt"
              onChange={(e) =>
                setSelectedFile(
                  e.target.files[0]
                )
              }
              className="border border-gray-300 rounded-xl p-3"
            />

          </div>
          */}

          {/* BUTTON */}

          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </form>
      </div>

      {/* PROJECT LIST */}

      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          Assigned Tasks
        </h2>

        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
            No Task Assigned
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {project.title}
                </h3>

                <p className="text-gray-500 text-m mb-5">
                  {project.description}
                </p>

                <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                  <User size={16} className="mt-1" />

                  <div>
                    <p className="font-semibold">Assigned To:</p>

                    {project.employees?.map((emp) => (
                      <div key={emp.id} className="text-gray-700">
                        • {emp.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === "Pending"
                        ? "bg-red-100 text-red-600"
                        : project.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {project.status}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.priority === "High"
                        ? "bg-red-100 text-red-600"
                        : project.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {project.priority}
                  </span>
                </div>

                {/* FILE */}

                {project.file_path && (
                  <div className="mt-3 flex items-center gap-2">
                    <InsertDriveFileIcon />

                    <a
                      href={`http://localhost:8000/${project.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 font-medium hover:underline"
                    >
                      Open Attachment
                    </a>
                  </div>
                )}

                {/* DATE */}

                <div className="flex items-start gap-2 text-sm text-gray-600 mt-4">
                  <CalendarDays size={16} className="mt-1" />

                  <div className="flex flex-col gap-1 ">
                    <span className="text-green-400">
                      Start date:{" "}
                      {project.created_at
                        ? dayjs(project.created_at).format("DD-MM-YYYY")
                        : "-"}
                    </span>

                    <span className="text-red-500">
                      Deadline:{" "}
                      {project.deadline
                        ? dayjs(project.deadline).format("DD-MM-YYYY")
                        : "-"}
                    </span>
                  </div>
                </div>

                {/* DELETE */}

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedProjectId(project.id);

                      setDeleteModal(true);
                    }}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all hover:cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DELETE MODAL */}

        {deleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Delete Task
              </h2>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this task?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModal(false);

                    setSelectedProjectId(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 hover:cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 hover:cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
