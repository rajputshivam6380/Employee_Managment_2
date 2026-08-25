import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import MoreVertIcon from "@mui/icons-material/MoreVert";

import AddEmployee from "../pages/AddEmployee";
import UpdateEmployee from "../pages/UpdateEmployee";

import api, { API_BASE_URL } from "../apis/api";
import { getStoredUser, ROLES } from "../utils/auth";


import { Eye } from "lucide-react";
import { FilePenLine } from "lucide-react";
import { Trash } from "lucide-react";
import { Search } from "lucide-react";

import Box from "@mui/material/Box";

import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import CommonAlert from "./CommonAlert";

import { debounce } from "lodash";
import { useMemo } from "react";

export default function EmpTable({
  employee = [],
  // organizations = [],
  fetchEmployees,
}) {
  const navigate = useNavigate();
  const currentUser = getStoredUser() || {};
  const canCreate = [
    ROLES.SUPER_ADMIN,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.HR_MANAGER,
  ].includes(currentUser?.role);
  const canEditOrDelete = [
    ROLES.SUPER_ADMIN,
    ROLES.ORGANIZATION_ADMIN,
  ].includes(currentUser?.role);

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ================= PAGINATION =================
  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ================= MODALS =================
  const [openAddModal, setOpenAddModal] = useState(false);

  const [openUpdateModal, setOpenUpdateModal] = useState(false);

  // ================= DELETE CONFIRM MODAL =================
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const canShowOrganization = currentUser?.role === ROLES.SUPER_ADMIN;

  // ================= SELECTED EMPLOYEE =================
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // ================= MENU =================
  const [anchorEl, setAnchorEl] = useState(null);

  const [selectedId, setSelectedId] = useState(null);

  const open = Boolean(anchorEl);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);

    setPage(0);
  };

  const handleAdd = () => {
    setOpenAddModal(true);
  };

  const handleClick = (event, id) => {
    event.stopPropagation();

    setAnchorEl(event.currentTarget);

    setSelectedId(id);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    navigate(`/dashboard/employees/view/${selectedId}`);
    handleClose();
  };

  const handleEdit = () => {
    const emp = employee.find((e) => e.id === selectedId);

    setSelectedEmployee(emp);

    setOpenUpdateModal(true);

    handleClose();
  };

  // ================= OPEN DELETE MODAL =================
  const openDeleteModal = () => {
    setEmployeeToDelete(selectedId);

    setDeleteModalOpen(true);

    handleClose();
  };

  // ================= CONFIRM DELETE =================
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/users/${employeeToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAlert({
        open: true,
        message: "Employee deleted successfully",
        severity: "success",
      });

      fetchEmployees();
    } catch (err) {
      console.log(err);

      setAlert({
        open: true,
        message: err.response?.data?.detail || "Employee not deleted",
        severity: "error",
      });
    } finally {
      setDeleteModalOpen(false);

      setEmployeeToDelete(null);
    }
  };

  const [status, setStatus] = useState("");
  const [dept, setDept] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState(employee);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        fetchSearchEmployees(value);
      }, 500),
    [status, dept],
  );

  useEffect(() => {
    setFilteredEmployees(employee);
  }, [employee]);

  useEffect(() => {
    debouncedSearch(searchInput);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchInput, status, dept]);
  // useEffect(() => {

  //   return () => {
  //     debouncedSearch.cancel();
  //   };

  // }, [debouncedSearch]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleDeptChange = (event) => {
    setDept(event.target.value);
  };

  const fetchSearchEmployees = async (value) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(
        `/users/search?search=${value}&status=${status}&department=${dept}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setFilteredEmployees(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getAttendanceDotClass = (attendanceStatus) => {
    const normalizedStatus = attendanceStatus?.toLowerCase();

    if (normalizedStatus === "present") {
      return "bg-green-500";
    }

    if (normalizedStatus === "late") {
      return "bg-orange-500";
    }

    if (normalizedStatus === "half day") {
      return "bg-yellow-500";
    }

    if (normalizedStatus === "leave") {
      return "bg-red-300";
    }

    if (normalizedStatus === "completed") {
      return "bg-purple-500";
    }

    return "bg-red-500";
  };

  // const filteredEmployees = employee.filter((emp) => {

  //   // SEARCH FILTER
  //   const matchesSearch =

  //     emp.name?.toLowerCase().includes(search.toLowerCase()) ||

  //     emp.email?.toLowerCase().includes(search.toLowerCase()) ||

  //     emp.phone?.includes(search) ||

  //     emp.role
  //       ?.replaceAll("_", " ")
  //       .toLowerCase()
  //       .includes(search.toLowerCase()) ;

  //     //   ||

  //     // emp.department
  //     //   ?.toLowerCase()
  //     //   .includes(search.toLowerCase());

  //   // STATUS FILTER
  //   const matchesStatus =
  //     status === ""
  //       ? true
  //       : status === "active"
  //       ? emp.is_active
  //       : !emp.is_active;

  //   // DEPARTMENT FILTER
  //   const matchesDepartment =
  //     dept === ""
  //       ? true
  //       : emp.department === dept;

  //   return (
  //     matchesSearch &&
  //     matchesStatus &&
  //     matchesDepartment
  //   );
  // });

  return (
    <div className="w-full px-3 m-2">
      <div className="flex items-center justify-between mb-4">
        {/* LEFT SIDE */}
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-600">Employees</h1>
        </div>

        {/* RIGHT SIDE */}
        {canCreate && (
          <button
            onClick={handleAdd}
            className="bg-indigo-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-600 hover:cursor-pointer shadow-md transition-all duration-300"
          >
            + Add Employee
          </button>
        )}
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="w-full md:max-w-6xl relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          {/* INPUT */}
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);

              // debouncedSearch(e.target.value);
            }}
            placeholder="Search by name, email,phone, role..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* FILTER FOR DEPARTMENT */}

        <Box sx={{ minWidth: 200, ml: "auto" }}>
          <FormControl className="min-w-[220px] w-full">
            <InputLabel>Department</InputLabel>

            <Select
              value={dept}
              label="Department"
              onChange={handleDeptChange}
              className="bg-white"
              sx={{
                borderRadius: "12px",
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              <MenuItem value="">Select</MenuItem>

              <MenuItem value="IT">IT</MenuItem>

              <MenuItem value="HR">HR</MenuItem>

              <MenuItem value="SALES">SALES</MenuItem>

              <MenuItem value="FINANCE">FINANCE</MenuItem>

              <MenuItem value="MARKETING">MARKETING</MenuItem>

              <MenuItem value="OPERATIONS">OPERATIONS</MenuItem>

              <MenuItem value="DEVOPS">DEVOPS</MenuItem>

              <MenuItem value="MANAGEMENT">MANAGEMENT</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* FILTER FOR STATUS*/}
        <Box sx={{ minWidth: 180 }}>
          <FormControl fullWidth className="rounded-2xl">
            <InputLabel id="status-select-label">Status</InputLabel>

            <Select
              labelId="status-select-label"
              value={status}
              label="Status"
              onChange={handleStatusChange}
              sx={{
                borderRadius: "12px",
                backgroundColor: "white",
              }}
            >
              <MenuItem value="">All Employees</MenuItem>

              <MenuItem value="active">Active</MenuItem>

              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </div>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleView}>
          <Eye className="w-4.5 mr-2" />
          View
        </MenuItem>

        {canEditOrDelete && (
          <MenuItem onClick={handleEdit}>
            <FilePenLine className="w-4.5 mr-2" />
            Edit
          </MenuItem>
        )}

        {canEditOrDelete && currentUser?.id !== selectedId && (
          <MenuItem onClick={openDeleteModal} sx={{ color: "red" }}>
            <Trash className="w-4.5 mr-2" />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* TABLE */}
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "12px",
        }}
      >
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
            {/* TABLE HEAD */}
            <TableHead>
              <TableRow className="font-bold">
                <TableCell sx={{ fontWeight: "bold" }}>Image</TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                {/* 
                <TableCell sx={{ fontWeight: "bold" }}>
                  Role
                </TableCell> */}

                <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>Department</TableCell>

                {canShowOrganization && (
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Organization
                  </TableCell>
                )}
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>

                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            {/* TABLE BODY */}
            <TableBody>
              {filteredEmployees
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((emp, index) => (
                  <TableRow hover key={emp.id || index}>
                    {/* PHOTO */}
                    <TableCell>
                      <div className="relative w-fit">
                        <img
                          src={
                            emp.photo
                              ? emp.photo.startsWith("http")
                                ? emp.photo
                                : `${API_BASE_URL}${emp.photo}`
                              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          }

                          alt="profile"
                          className="w-11 h-11 rounded-full object-cover border"
                        />

                        {/* STATUS DOT */}
                        <span
                          className={`absolute top-0 right-0 
    w-3.5 h-3.5 
    rounded-full border-2 border-white

    ${getAttendanceDotClass(emp.attendance_status)}
  `}
                          title={emp.attendance_status || "Absent"}
                        />
                      </div>
                    </TableCell>

                    {/* ID */}
                    <TableCell>{emp.id}</TableCell>

                    {/* NAME */}
                    <TableCell>{emp.name}</TableCell>

                    {/* EMAIL */}
                    <TableCell>{emp.email}</TableCell>

                    {/* ROLE */}
                    {/* <TableCell className="capitalize">

                      {emp.role?.replaceAll("_", " ")}

                    </TableCell> */}

                    {/* PHONE */}
                    <TableCell>
                      {emp.country_code} {emp.phone || "N/A"}
                    </TableCell>

                    <TableCell>{emp.department || "N/A"}</TableCell>

                    {canShowOrganization && (
                      <TableCell>{emp.organization_name || "N/A"}</TableCell>
                    )}

                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          emp.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {emp.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>

                    {/* ACTION */}
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleClick(e, emp.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={filteredEmployees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* UPDATE MODAL */}
      <UpdateEmployee
        setAlert={setAlert}
        open={openUpdateModal}
        handleClose={() => setOpenUpdateModal(false)}
        employee={selectedEmployee}
        // organizations={organizations}
        fetchEmployees={fetchEmployees}
      />

      {/* ADD MODAL */}
      <AddEmployee
        setAlert={setAlert}
        open={openAddModal}
        handleClose={() => setOpenAddModal(false)}
        // organizations={organizations}
        fetchEmployees={fetchEmployees}
      />

      {/* ================= DELETE CONFIRMATION MODAL ================= */}

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Delete Employee
            </h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this employee?
            </p>

            <div className="flex justify-end gap-3">
              {/* CANCEL BUTTON */}
              <button
                onClick={() => {
                  setDeleteModalOpen(false);

                  setEmployeeToDelete(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all cursor-pointer hover:cursor-pointer"
              >
                Cancel
              </button>

              {/* DELETE BUTTON */}
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer hover:cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <CommonAlert
        open={alert.open}
        setOpen={(value) =>
          setAlert({
            ...alert,
            open: value,
          })
        }
        message={alert.message}
        severity={alert.severity}
      />
    </div>
  );
}
