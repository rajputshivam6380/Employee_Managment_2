import { useCallback, useEffect, useMemo, useState } from "react";

import dayjs from "dayjs";
import { debounce } from "lodash";
import {
  CalendarDays,
  Check,
  ClipboardList,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";

import { approveLeave, getAllLeaves, rejectLeave } from "../api/leaveApi";

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

export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchLeaves = useCallback(async (searchValue = "", statusValue = "") => {
    try {
      setLoading(true);

      const params = {};

      if (searchValue.trim()) params.search = searchValue.trim();
      if (statusValue) params.status = statusValue;

      const response = await getAllLeaves(params);

      setLeaves(response.data || []);
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.detail || "Failed to load leaves");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debouncedFetch = debounce((searchValue, statusValue) => {
      fetchLeaves(searchValue, statusValue);
    }, 500);

    debouncedFetch(search, status);

    return () => debouncedFetch.cancel();
  }, [fetchLeaves, search, status]);

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

  const handleRefresh = () => {
    setSearch("");
    setStatus("");
    setPage(0);
    fetchLeaves("", "");
  };

  const handleDecision = async (leaveId, action) => {
    try {
      setProcessingId(leaveId);

      if (action === "approve") {
        await approveLeave(leaveId);
        toast.success("Leave approved");
      } else {
        await rejectLeave(leaveId);
        toast.success("Leave rejected");
      }

      window.dispatchEvent(new Event("leave-notifications-updated"));
      fetchLeaves(search, status);
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.detail || "Failed to update leave");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 px-3 py-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-600">
            Leave Requests
          </h1>
        </div>

        <div className="w-fit rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
          {new Date().toDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Total Requests
              </p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">
                {stats.total}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
              <ClipboardList className="text-indigo-600" size={26} />
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
              <CalendarDays className="text-orange-600" size={26} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Requested Days
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
      </div>

      <div className="flex flex-col gap-4 rounded-t-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-end">
        <div className="relative w-full md:min-w-[280px] md:flex-1">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Search by employee, email, or leave type..."
            className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="w-full md:w-[220px]">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <IconButton
          onClick={handleRefresh}
          sx={{
            backgroundColor: "#111827",
            color: "white",
            width: 46,
            height: 46,
            "&:hover": {
              backgroundColor: "#000",
            },
          }}
        >
          <RotateCcw size={18} />
        </IconButton>
      </div>

      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "0 0 16px 16px",
          border: "1px solid #e5e7eb",
          borderTop: 0,
        }}
      >
        <TableContainer sx={{ maxHeight: 560 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
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
                    <TableCell>
                      <span className="font-semibold text-gray-800">
                        {leave.employee?.name || "Employee"}
                      </span>
                    </TableCell>
                    <TableCell>{leave.employee?.email || "-"}</TableCell>
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
                      {leave.status === "Pending" ? (
                        <div className="flex items-center gap-2">
                          <IconButton
                            title="Approve"
                            disabled={processingId === leave.id}
                            onClick={() => handleDecision(leave.id, "approve")}
                            sx={{
                              backgroundColor: "#dcfce7",
                              color: "#15803d",
                              width: 38,
                              height: 38,
                              "&:hover": {
                                backgroundColor: "#bbf7d0",
                              },
                            }}
                          >
                            <Check size={18} />
                          </IconButton>
                          <IconButton
                            title="Reject"
                            disabled={processingId === leave.id}
                            onClick={() => handleDecision(leave.id, "reject")}
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
                            <X size={18} />
                          </IconButton>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-gray-500">
                          Done
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

              {leaves.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
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
