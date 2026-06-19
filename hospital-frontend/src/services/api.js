import axios from 'axios';

const API_BASE = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// We extract res.data.data because the backend wraps everything in ApiResponse
export const authAPI = {
  login: (data) => api.post('/auth/login', data).then(res => res.data), // login returns token in root of data
  register: (data) => api.post('/auth/register', data).then(res => res.data),
  updateProfile: (data) => api.put('/auth/profile', data).then(res => res.data.data),
  updatePhoto: (data) => api.put('/auth/profile/photo', data).then(res => res.data.data),
};

export const adminAPI = {
  getDoctors: () => api.get('/admin/doctors').then(res => res.data.data),
  getPatients: () => api.get('/admin/patients').then(res => res.data.data),
  getAppointments: () => api.get('/admin/appointments').then(res => res.data.data),
  updateAppointmentStatus: (id, status) => api.put(`/admin/appointments/${id}/status`, { status }).then(res => res.data.data),
  updateAppointment: (id, data) => api.put(`/admin/appointments/${id}`, data).then(res => res.data.data),
  deleteAppointment: (id) => api.delete(`/admin/appointments/${id}`).then(res => res.data.data),
  getPrescriptions: () => api.get('/admin/prescriptions').then(res => res.data.data),
};

export const doctorAPI = {
  getProfile: () => api.get('/doctor/profile').then(res => res.data.data),
  updateProfile: (id, data) => api.put(`/doctor/profile/${id}`, data).then(res => res.data.data),
  getAppointments: () => api.get('/doctor/appointments').then(res => res.data.data),
  updateAppointmentStatus: (id, status) => api.put(`/doctor/appointments/${id}/status`, { status }).then(res => res.data.data),
  updateAppointment: (id, data) => api.put(`/doctor/appointments/${id}`, data).then(res => res.data.data),
  deleteAppointment: (id) => api.delete(`/doctor/appointments/${id}`).then(res => res.data.data),
  createPrescription: (data) => api.post('/doctor/prescriptions', data).then(res => res.data.data),
  updatePrescription: (id, data) => api.put(`/doctor/prescriptions/${id}`, data).then(res => res.data.data),
  getPrescriptions: () => api.get('/doctor/prescriptions').then(res => res.data.data),
};

export const patientAPI = {
  getProfile: () => api.get('/patient/profile').then(res => res.data.data),
  updateProfile: (id, data) => api.put(`/patient/profile/${id}`, data).then(res => res.data.data),
  getAvailableDoctors: () => api.get('/doctors/available').then(res => res.data.data),
  bookAppointment: (data) => api.post('/patient/appointments', data).then(res => res.data.data),
  getAppointments: () => api.get('/patient/appointments').then(res => res.data.data),
  updateAppointmentStatus: (id, status) => api.put(`/patient/appointments/${id}/status`, { status }).then(res => res.data.data),
  updateAppointment: (id, data) => api.put(`/patient/appointments/${id}`, data).then(res => res.data.data),
  deleteAppointment: (id) => api.delete(`/patient/appointments/${id}`).then(res => res.data.data),
  getPrescriptions: () => api.get('/patient/prescriptions').then(res => res.data.data),
  getPrescriptionByAppointment: (appId) => api.get(`/patient/prescriptions/appointment/${appId}`).then(res => res.data.data),
};

export default api;
