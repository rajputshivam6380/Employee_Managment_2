import { useEffect, useState } from "react";
import api from "../apis/api";
import { FolderKanban, CalendarDays, Users, Clock3 } from "lucide-react";
// import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AssignedProject() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusModal, setStatusModal] = useState(false);

  const [selectedProject, setSelectedProject] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState("");

  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      // ================= API CALL =================
      const res = await api.get("/projects/my-projects");

      setProjects(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    try {
      setStatusLoading(true);

      const data = new FormData();

      data.append("status", selectedStatus);

      await api.put(`/projects/update-status/${selectedProject.id}`, data);

      toast.success("Project status updated successfully!");

      fetchProjects();

      setStatusModal(false);

      setSelectedProject(null);

      setSelectedStatus("");
    } catch (err) {
      console.log(err);

      toast.error(err.response?.data?.detail || "Failed to update status!");
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-indigo-600">My Projects</h1>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-lg font-medium text-gray-500">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-lg font-medium text-gray-500">
          No Projects Assigned
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-6 border border-gray-100"
            >
              {/* TOP */}
              <div className="flex items-center justify-between mb-4">
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <FolderKanban className="text-indigo-600" size={28} />
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* <div className="mb-3"> */}
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
                  {/* </div> */}

                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold ${
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
              </div>

              {/* TITLE */}
              <h2 className="text-2xl font-bold text-gray-800 mb-2 line-clamp-1">
                {" "}
                {project.title}
              </h2>

              {/* DESCRIPTION */}
              <p className="text-gray-500 text-sm leading-6 mb-5 line-clamp-3">
                {" "}
                {project.description}
              </p>

              {/* DETAILS */}
              <div className="space-y-3 text-s text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span>Deadline: {project.deadline || "Not Assigned"}</span>
                </div>

                {/* <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>
                    Team: {project.assigned_to || "N/A"}
                  </span>
                </div> */}

                <div className="space-y-3 text-s text-gray-600">
                  {/* <div className="flex items-center gap-2">
                  <AttachFileIcon size={16} />
                  <span>
                    File: {project.file_path || "Not Assigned"}
                  </span>
                </div> */}

                  {project.file_path && (
                    <div className="mt-3 flex items-center gap-2">
                      <InsertDriveFileIcon
                      //  className="text-indigo-500"
                      />

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
                </div>

                <div className="flex items-start gap-2">
                  <Users size={16} className="mt-1" />

                  <div>
                    <p className="font-semibold">Assigned To:</p>

                    {project.employees?.length > 0 ? (
                      project.employees.map((emp) => (
                        <div key={emp.id} className="text-gray-700">
                          • {emp.name}
                        </div>
                      ))
                    ) : (
                      <span>N/A</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock3 size={16} />
                  <span>Priority: {project.priority || "Medium"}</span>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold text-gray-700">
                  Update Status
                </label>

                <select
                  value={
                    selectedProject?.id === project.id
                      ? selectedStatus
                      : project.status
                  }
                  onChange={(e) => {
                    setSelectedProject(project);

                    setSelectedStatus(e.target.value);

                    setStatusModal(true);
                  }}
                  className="w-full mt-2 border rounded-xl p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="Pending">Pending</option>

                  <option value="In Progress">In Progress</option>

                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* BUTTON */}
              {/* <button
  type="button"
  className="w-full mt-6 bg-gradient-to-r bg-indigo-500 hover:bg-indigo-600  text-white py-3 rounded-2xl transition-all font-semibold shadow-md hover:shadow-xl"
>                View Details
              </button> */}
            </div>
          ))}
        </div>
      )}

      {/* STATUS UPDATE MODAL */}

      {statusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Update Project Status
            </h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to update status to
              <span className="font-semibold text-indigo-600">
                {" "}
                {selectedStatus}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setStatusModal(false);

                  setSelectedProject(null);

                  setSelectedStatus("");
                }}
                className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={updateStatus}
                disabled={statusLoading}
                className="px-5 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-all disabled:opacity-50"
              >
                {statusLoading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
