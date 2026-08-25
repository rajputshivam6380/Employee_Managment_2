import { useCallback, useEffect, useState } from "react";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import { CalendarCheck2, Clock3, RotateCcw, Search } from "lucide-react";

import api from "../apis/api";

import { getStoredUser, ROLES } from "../utils/auth";

export default function AttendenceTable() {
  const currentUser = getStoredUser();

  const canView = currentUser?.role === ROLES.ORGANIZATION_ADMIN;

  const [attendance, setAttendance] = useState([]);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchAttendance = useCallback(async () => {
    if (!canView) return;

    try {
      setLoading(true);

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      if (startDate) {
        params.start_date = startDate;
      }

      if (endDate) {
        params.end_date = endDate;
      }

      const response = await api.get("/attendance/filter/admin", { params });

      setAttendance(response.data || []);

      setPage(0);
    } catch (err) {
      console.log(err);

      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [canView, search, status, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendance();
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [search, status, startDate, endDate, canView, fetchAttendance]);

  const handleRefresh = () => {
    setSearch("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPage(0);
  };

  const formatHours = (hours) => {
    if (!hours) return "0 mins";

    const totalMinutes = Math.round(Number(hours) * 60);

    const hrs = Math.floor(totalMinutes / 60);

    const mins = totalMinutes % 60;

    if (hrs === 0) {
      return `${mins} mins`;
    }

    if (mins === 0) {
      return `${hrs} hrs`;
    }

    return `${hrs} hrs ${mins} mins`;
  };

  // const formatTime = (value) => {

  //   if (!value) return "-";

  //   return new Date(value).toLocaleTimeString(
  //     "en-IN",
  //     {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //       second: "2-digit",
  //       hour12: true,
  //     }
  //   );
  // };

  const formatTime = (value) => {
    if (!value) return "-";
    return dayjs(value).format("hh:mm A");
  };

  // const getStatusColor = (value) => {

  //   if (value === "Present") return "success";
  //   if (value === "Late") return "warning";
  //   if (value === "Half Day") return "info";
  //   if (value === "Leave") return "error";
  //   if (value === "Completed") return "success";

  //   return "default";
  // };

  if (!canView) {
    return (
      <div className="p-10 text-center font-semibold text-red-600">
        Access Denied
      </div>
    );
  }

  return (
    <div className="w-full px-3 py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-indigo-600">
          All Attendance
        </h1>
      </div>

      <div className="flex flex-col gap-4 rounded-t-2xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:flex-wrap md:items-end">
        <div className="relative w-full md:flex-1 md:min-w-[280px]">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by employee name or email..."
            className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="w-full md:w-[220px]">
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(event) => setStatus(event.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Present">Present</MenuItem>
                <MenuItem value="Late">Late</MenuItem>
                <MenuItem value="Half Day">Half Day</MenuItem>
                <MenuItem value="Leave">Leave</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Absent">Absent</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="w-full md:w-[220px]">
            <DatePicker
              label="Start Date"
              value={startDate ? dayjs(startDate) : null}
              format="DD-MM-YYYY"
              onChange={(value) =>
                setStartDate(value ? value.format("YYYY-MM-DD") : "")
              }
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </div>
          {/* 
 <div className="w-full md:w-[220px]">
  <DatePicker
    label="End Date"
    value={endDate ? dayjs(endDate) : null}
    format="DD-MM-YYYY"
    
    // ✅ NEW: restrict end date based on start date
    minDate={startDate ? dayjs(startDate) : undefined}

    onChange={(value) =>
      setEndDate(
        value ? value.format("YYYY-MM-DD") : ""
      )
    }
    
    slotProps={{
      textField: { fullWidth: true },
    }}
  />
</div> */}

          <div className="w-full md:w-[220px]">
            <DatePicker
              label="End Date"
              value={endDate ? dayjs(endDate) : null}
              format="DD-MM-YYYY"
              // ✅ NEW: disable until startDate is selected
              disabled={!startDate}
              // ✅ still keep restriction (extra safety)
              minDate={startDate ? dayjs(startDate) : undefined}
              onChange={(value) =>
                setEndDate(value ? value.format("YYYY-MM-DD") : "")
              }
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </div>
        </LocalizationProvider>

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
        <TableContainer sx={{ maxHeight: 560, overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 700 }}>

            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Check In</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Check Out</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total Hours</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {attendance
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      <span className="font-semibold text-gray-800">
                        {row.employee_name}
                      </span>
                    </TableCell>

                    <TableCell>{row.email}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarCheck2 size={18} className="text-indigo-500" />
                        {dayjs(row.attendance_date).format("DD-MM-YYYY")}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock3 size={18} className="text-green-500" />
                        {formatTime(row.check_in)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock3 size={18} className="text-red-500" />
                        {formatTime(row.check_out)}
                      </div>
                    </TableCell>

                    <TableCell>{formatHours(row.total_hours)}</TableCell>

                    {/* <TableCell>
                      <Chip
                        label={row.status}
                        color={getStatusColor(row.status)}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: "8px",
                        }}
                      />
                    </TableCell> */}

                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          borderRadius: "8px",

                          ...(row.status === "Completed" && {
                            backgroundColor: "#dcfce7", // light green
                            color: "#15803d", // dark green text
                          }),

                          ...(row.status === "Present" && {
                            backgroundColor: "#bbf7d0",
                            color: "#166534",
                          }),

                          ...(row.status === "Late" && {
                            backgroundColor: "#fef3c7",
                            color: "#92400e",
                          }),

                          ...(row.status === "Half Day" && {
                            backgroundColor: "#dbeafe",
                            color: "#1d4ed8",
                          }),

                          ...(row.status === "Leave" && {
                            backgroundColor: "#fee2e2",
                            color: "#b91c1c",
                          }),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}

              {attendance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {loading ? "Loading..." : "No attendance found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={attendance.length}
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
