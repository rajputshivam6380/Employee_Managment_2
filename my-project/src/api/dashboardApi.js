import api from "../apis/api";

export const getDashboardSummary = () =>
  api.get("/attendance/analytics/dashboard");
