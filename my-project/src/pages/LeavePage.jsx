import { useCallback, useEffect, useMemo, useState } from "react";

import dayjs from "dayjs";
import {
  CalendarDays,
  ClipboardList,
  RotateCcw,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "react-toastify";

import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { applyLeave, deleteLeave, getMyLeaves } from "../api/leaveApi";
import { getStoredUser } from "../utils/auth";

const leaveTypes = [
  "Sick Leave",
  "Casual Leave",
  "Paid Leave",
  "Emergency Leave",
];

const emptyForm = {
  leave_type: "Sick Leave",
  start_date: "",
  end_date: "",
  reason: "",
};

const statusStyle = {
  Pending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  Approved: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },
  Rejected: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },
};

export default function LeavePage() {
  const user = getStoredUser();

  const [form, setForm] = useState(emptyForm);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getMyLeaves();

      setLeaves(response.data || []);
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.detail || "Failed to load leaves");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const stats = useMemo(() => {
    return leaves.reduce(
      (acc, leave) => {
        acc.total += 1;
        acc.days += Number(leave.total_days || 0);
        acc[leave.status] = (acc[leave.status] || 0) + 1;
        return acc;
      },
      {
        total: 0,
        days: 0,
        Pending: 0,
      },
    );
  }, [leaves]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleDateChange = (name, value) => {
    const nextDate = value ? value.format("YYYY-MM-DD") : "";

    setForm((current) => ({
      ...current,
      [name]: nextDate,
      ...(name === "start_date" &&
      current.end_date &&
      nextDate &&
      nextDate > current.end_date
        ? { end_date: "" }
        : {}),
      ...(name === "start_date" && !nextDate ? { end_date: "" } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.start_date || !form.end_date) {
      toast.error("Please select start and end date");
      return;
    }

    if (form.start_date > form.end_date) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      setSaving(true);

      await applyLeave({
        leave_type: form.leave_type,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason.trim() || null,
      });

      toast.success("Leave request submitted");
      window.dispatchEvent(new Event("leave-notifications-updated"));
      setForm(emptyForm);
      setPage(0);
      fetchLeaves();
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.detail || "Failed to apply leave");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    setForm(emptyForm);
    setPage(0);
    fetchLeaves();
  };

  const handleDeleteLeave = async (leaveId) => {
    try {
      setDeletingId(leaveId);

      await deleteLeave(leaveId);

      toast.success("Leave deleted");
      window.dispatchEvent(new Event("leave-notifications-updated"));
      setPage(0);
      fetchLeaves();
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.detail || "Unable to delete leave");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 px-3 py-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-600">My Leaves</h1>
        </div>

        <div className="w-fit rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
          {new Date().toDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500">Employee</p>
              <p className="mt-2 truncate text-2xl font-extrabold text-gray-900">
                {user?.name || "Employee"}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
              <UserRound className="text-indigo-600" size={26} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Total Leave Days
              </p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">
                {stats.days}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <CalendarDays className="text-emerald-600" size={26} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Pending Requests
              </p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">
                {stats.Pending}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
              <ClipboardList className="text-orange-600" size={26} />
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_220px_70px]">
            <div>
              <select
                name="leave_type"
                value={form.leave_type}
                onChange={handleChange}
                className="h-[56px] w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
              >
                {leaveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <DatePicker
                label="Start Date"
                value={form.start_date ? dayjs(form.start_date) : null}
                format="DD-MM-YYYY"
                minDate={dayjs()}
                onChange={(value) => handleDateChange("start_date", value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </div>

            <div>
              <DatePicker
                label="End Date"
                value={form.end_date ? dayjs(form.end_date) : null}
                format="DD-MM-YYYY"
                disabled={!form.start_date}
                minDate={form.start_date ? dayjs(form.start_date) : dayjs()}
                onChange={(value) => handleDateChange("end_date", value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              <Send size={18} />
              {saving ? "Submitting..." : "Apply Leave"}
            </button>

            <div className="flex justify-end">
              <IconButton
                type="button"
                onClick={handleRefresh}
                sx={{
                  backgroundColor: "#111827",
                  color: "white",
                  width: 56,
                  height: 56,
                  borderRadius: "14px",
                  "&:hover": {
                    backgroundColor: "#000",
                  },
                }}
              >
                <RotateCcw size={20} />
              </IconButton>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Reason
            </label>

            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={4}
              placeholder="Reason for leave"
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </LocalizationProvider>
      </form>

      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
        }}
      >
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Start</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>End</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Days</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {leaves
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((leave) => (
                  <TableRow hover key={leave.id}>
                    <TableCell>{leave.leave_type}</TableCell>
                    <TableCell>
                      {dayjs(leave.start_date).format("DD-MM-YYYY")}
                    </TableCell>
                    <TableCell>
                      {dayjs(leave.end_date).format("DD-MM-YYYY")}
                    </TableCell>
                    <TableCell>{leave.total_days}</TableCell>
                    <TableCell>{leave.reason || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={leave.status}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          borderRadius: "8px",
                          ...(statusStyle[leave.status] || {}),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        title="Delete leave"
                        disabled={deletingId === leave.id}
                        onClick={() => handleDeleteLeave(leave.id)}
                        sx={{
                          backgroundColor: "#fee2e2",
                          color: "#b91c1c",
                          width: 38,
                          height: 38,
                          "&:hover": {
                            backgroundColor: "#fecaca",
                          },
                        }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

              {leaves.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {loading ? "Loading..." : "No leaves found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={leaves.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(+event.target.value);
            setPage(0);
          }}
        />
      </Paper>
    </div>
  );
}
