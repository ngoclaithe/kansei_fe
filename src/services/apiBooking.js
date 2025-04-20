import apiClient from './apiClient';

const apiBooking = {
  getBookings: (params = {}) => {
    try {
      return apiClient.get('/bookings/', { params });
    } catch (error) {
      console.error('Error fetching bookings:', error.response?.data || error.message);
      throw error;
    }
  },

  getBookingStats: (params = {}) => {
    try {
      return apiClient.get('/bookings/stats', { params });
    } catch (error) {
      console.error('Error fetching booking stats:', error.response?.data || error.message);
      throw error;
    }
  },

  getBookingsByUserId: (user_id) => {
    try {
      return apiClient.get(`/bookings/user/${user_id}/details`);
    } catch (error) {
      console.error('Error fetching booking stats:', error.response?.data || error.message);
      throw error;
    }
  },

  getBookingsByAdmin: () => {
    try {
      return apiClient.get(`/bookings/lastest/details`);
    } catch (error) {
      console.error('Error fetching booking stats:', error.response?.data || error.message);
      throw error;
    }
  },

  getBooking: (bookingId) => {
    try {
      return apiClient.get(`/bookings/${bookingId}`);
    } catch (error) {
      console.error(`Error fetching booking ${bookingId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  createBooking: (bookingData) => {
    try {
      return apiClient.post('/bookings/', bookingData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error creating booking:', error.response?.data || error.message);
      throw error;
    }
  },

  updateBooking: (bookingId, bookingData) => {
    try {
      return apiClient.put(`/bookings/${bookingId}`, bookingData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error(`Error updating booking ${bookingId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  updateBookingStatus: (bookingId, statusData) => {
    try {
      return apiClient.patch(`/bookings/${bookingId}/status`, statusData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error(`Error updating booking status ${bookingId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  cancelBooking: (bookingId) => {
    try {
      return apiClient.post(`/bookings/${bookingId}/cancel`);
    } catch (error) {
      console.error(`Error cancelling booking ${bookingId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  deleteBooking: (bookingId) => {
    try {
      return apiClient.delete(`/bookings/${bookingId}`);
    } catch (error) {
      console.error(`Error deleting booking ${bookingId}:`, error.response?.data || error.message);
      throw error;
    }
  }
};

export default apiBooking;