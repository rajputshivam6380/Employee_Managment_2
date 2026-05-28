import { useCallback, useEffect, useState, useMemo } from "react";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

import Chip from "@mui/material/Chip";
import { useParams } from "react-router-dom";
import { debounce } from "lodash";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import { CalendarCheck2, Clock3, RotateCcw } from "lucide-react";

import api from "../apis/api";
import { getStoredUser, ROLES } from "../utils/auth";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import IconButton from "@mui/material/IconButton";

export default function Attendance({
  employeeId: selectedEmployeeId,
  embedded = false,
}) {
  const { employeeId: routeEmployeeId } = useParams();
  const employeeId = selectedEmployeeId || routeEmployeeId;

  const currentUser = getStoredUser();

  const isEmployee = currentUser?.role === ROLES.EMPLOYEE && !employeeId;

  const [attendance, setAttendance] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [loading, setLoading] = useState(false);

  const [search] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  //   const [searchBox, setSearchBox] = useState("");
  // const [statusBox, setStatusBox] = useState("");
  // const [startDateBox, setStartDateBox] =
  //   useState(null);
  // const [endDateBox, setEndDateBox] =
  //   useState(null);

  // const fetchAttendenceForEmpty = async ()=>{
  //   const res=
  //   await api.get("/attendence");

  //   setAttendance(res.data);
  // };

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      let response;

      if (isEmployee || employeeId) {
        response = await api.get(
          `/attendance/employee/${employeeId || currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        const today = new Date().toISOString().split("T")[0];

        response = await api.get(`/attendance/date/${today}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setAttendance(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, employeeId, isEmployee]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleRefresh = () => {
    setStatusFilter("");
    setStartDate("");
    setEndDate("");

    setPage(0);

    fetchAttendance();
  };

  const debouncedAttendanceFilter = useMemo(
    () =>
      debounce(async (searchValue, status, start, end) => {
        try {
          const token = localStorage.getItem("token");

          const params = {};

          if (employeeId) params.employee_id = employeeId;
          if (searchValue) params.search = searchValue;
          if (status) params.status = status;
          if (start) params.start_date = start;
          if (end) params.end_date = end;

          const response = await api.get("/attendance/filter", {
            params,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setAttendance(response.data);
        } catch (err) {
          console.log(err);
        }
      }, 500),
    [employeeId],
  );

  useEffect(() => {
    if (!statusFilter && !startDate && !endDate) {
      fetchAttendance();
      return;
    }

    debouncedAttendanceFilter(search, statusFilter, startDate, endDate);

    return () => {
      debouncedAttendanceFilter.cancel();
    };
  }, [
    search,
    statusFilter,
    startDate,
    endDate,
    debouncedAttendanceFilter,
    fetchAttendance,
  ]);

  // const getStatusColor = (value) => {

  //   if (value === "Present") return "success";
  //   if (value === "Late") return "warning";
  //   if (value === "Half Day") return "info";
  //   if (value === "Leave") return "error";
  //   if (value === "Completed") return "success";

  //   return "default";
  // };

  const formatHours = (hours) => {
    if (!hours) return "0 mins";

    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hrs === 0) return `${mins} mins`;

    return `${hrs} hrs ${mins} mins`;
  };

  const convertTo12Hour = (timeStr) => {
    if (!timeStr) return "N/A";

    const [h, m] = timeStr.split(":");
    let hour = parseInt(h, 10);

    if (isNaN(hour)) return "N/A";

    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    hour = hour ? hour : 12;

    return `${hour}:${m} ${ampm}`;
  };

  return (
    <div className={embedded ? "w-full" : "w-full px-3 py-2"}>

            <div className="mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">My Attendence</h1>
        </div>
      <div className="flex flex-wrap justify-end items-end gap-4 bg-white p-4 rounded-t-2xl shadow-sm border border-gray-200">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="w-full md:w-[220px]">
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="late">Late</MenuItem>
                <MenuItem value="half_day">Half Day</MenuItem>
                <MenuItem value="leave">Leave</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
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

          <div className="w-full md:w-[220px]">
            {/* <div className="w-full md:w-[220px]">
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
        }}
      >
        <TableContainer sx={{ maxHeight: embedded ? 420 : 550 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Check In</TableCell>
                <TableCell>Check Out</TableCell>
                <TableCell>Total Hours</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {attendance
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarCheck2 size={18} className="text-indigo-500" />
                        {dayjs(row.attendance_date).format("DD-MM-YYYY")}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 ">
                        <Clock3 size={18} className="text-green-500"/>
                        {convertTo12Hour(
                          row.check_in
                            ? new Date(row.check_in).toTimeString().slice(0, 8)
                            : null,
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock3 size={18}  className="text-red-500"/>
                        {convertTo12Hour(
                          row.check_out
                            ? new Date(row.check_out).toTimeString().slice(0, 8)
                            : null,
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{formatHours(row.total_hours)}</TableCell>

                    {/* <TableCell>
                      <Chip
                        label={row.status}
                        color={
                          row.status === "Present"
                            ? "success"
                            : row.status === "Late"
                            ? "warning"
                            : "default"
                        }
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
                  <TableCell colSpan={5} align="center">
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
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
        />
      </Paper>
    </div>
  );
}
