import api from "../apis/api";

export const applyLeave = (payload) => api.post("/leave/apply", payload);

export const getMyLeaves = () => api.get("/leave/my-leaves");

export const getAllLeaves = (params = {}) => api.get("/leave/all", { params });

export const approveLeave = (leaveId) => api.put(`/leave/approve/${leaveId}`);

export const rejectLeave = (leaveId) => api.put(`/leave/reject/${leaveId}`);

export const getLeaveNotificationCount = () =>
  api.get("/leave/notification-count");

export const deleteLeave = (leaveId) => api.delete(`/leave/${leaveId}`);
