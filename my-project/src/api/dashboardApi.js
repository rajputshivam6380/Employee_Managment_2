import api from "../apis/api";

export const getDashboardSummary = () =>
  api.get("/attendance/analytics/dashboard");

export const getEmployeeDashboardSummary = () =>
  api.get("/attendance/employee_home");
