import { useState } from "react";

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

import api from "../apis/api";

import AddOrganization from "../pages/AddOrganization";
import UpdateOrganization from "../pages/UpdateOrganization";

import { Eye } from "lucide-react";
import { FilePenLine } from "lucide-react";
import { Trash } from "lucide-react";

export default function OrgTable({ organizations = [], fetchOrganizations }) {
  const navigate = useNavigate();

  // ================= PAGINATION =================
  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ================= MENU =================
  const [anchorEl, setAnchorEl] = useState(null);

  const [selectedId, setSelectedId] = useState(null);

  const open = Boolean(anchorEl);

  // ================= MODALS =================
  const [openAddModal, setOpenAddModal] = useState(false);

  const [openEditModal, setOpenEditModal] = useState(false);

  // ================= SELECTED ORGANIZATION =================
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  // ================= PAGINATION =================
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);

    setPage(0);
  };

  // ================= MENU OPEN =================
  const handleClick = (event, id) => {
    event.stopPropagation();

    setAnchorEl(event.currentTarget);

    setSelectedId(id);
  };

  // ================= MENU CLOSE =================
  const handleClose = () => {
    setAnchorEl(null);
  };

  // ================= VIEW =================
  const handleView = () => {
    navigate(`/dashboard/organizations/view/${selectedId}`);

    handleClose();
  };

  // ================= EDIT =================
  const handleEdit = () => {
    const org = organizations.find((o) => o.id === selectedId);

    setSelectedOrganization(org);

    setOpenEditModal(true);

    handleClose();
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/organizations/${selectedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Organization Deleted Successfully");

      fetchOrganizations();
    } catch (err) {
      console.log(err);

      alert(err.response?.data?.detail || "Delete Failed");
    }

    handleClose();
  };

  return (
    <div className="w-full">
      {/* ADD BUTTON */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setOpenAddModal(true)}
          className="bg-indigo-500 text-white px-5 py-2 rounded-lg hover:bg-indigo-600 transition"
        >
          + Add Organization
        </button>
      </div>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleView}>
          <Eye className="w-4.5 mr-2" />
          View
        </MenuItem>

        <MenuItem onClick={handleEdit}>
          <FilePenLine className="w-4.5 mr-2" />
          Edit
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: "red" }}>
          <Trash className="w-4.5 mr-2" />
          Delete
        </MenuItem>
      </Menu>

      {/* TABLE */}
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "12px",
        }}
      >
        <TableContainer sx={{ maxHeight: 500, overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 700 }}>

            {/* TABLE HEAD */}
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>
                  Organization Name
                </TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>Address</TableCell>

                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            {/* TABLE BODY */}
            <TableBody>
              {organizations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((org, index) => (
                  <TableRow hover key={org.id || index}>
                    {/* ID */}
                    <TableCell>{org.id}</TableCell>

                    {/* NAME */}
                    <TableCell>{org.name}</TableCell>

                    {/* EMAIL */}
                    <TableCell>{org.email}</TableCell>

                    {/* ADDRESS */}
                    <TableCell>{org.address || "N/A"}</TableCell>

                    {/* ACTIONS */}
                    <TableCell align="center">
                      <IconButton onClick={(e) => handleClick(e, org.id)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={organizations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* ADD MODAL */}
      <AddOrganization
        open={openAddModal}
        handleClose={() => setOpenAddModal(false)}
        fetchOrganizations={fetchOrganizations}
      />

      {/* UPDATE MODAL */}
      <UpdateOrganization
        open={openEditModal}
        handleClose={() => setOpenEditModal(false)}
        organization={selectedOrganization}
        fetchOrganizations={fetchOrganizations}
      />
    </div>
  );
}
