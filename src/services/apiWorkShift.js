import apiClient from './apiClient';

const workShiftApi = {

  getWorkShifts: (skip = 0, limit = 100, includeInactive = false) => {
    return apiClient.get(`/work-shifts?skip=${skip}&limit=${limit}&include_inactive=${includeInactive}`);
  },

  getWorkShiftsTrue: (skip = 0, limit = 100, includeInactive = true) => {
    return apiClient.get(`/work-shifts?skip=${skip}&limit=${limit}&include_inactive=${includeInactive}`);
  },

  getWorkShift: (shiftId) => {
    return apiClient.get(`/work-shifts/${shiftId}`);
  },

  createWorkShift: (shiftData) => {
    return apiClient.post('/work-shifts', shiftData);
  },

  updateWorkShift: (shiftId, shiftData) => {
    return apiClient.put(`/work-shifts/${shiftId}`, shiftData);
  },

  deleteWorkShift: (shiftId, permanent = false) => {
    return apiClient.delete(`/work-shifts/${shiftId}?permanent=${permanent}`);
  }
};

export default workShiftApi;