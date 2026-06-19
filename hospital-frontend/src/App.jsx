import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminPatients from './pages/admin/AdminPatients';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import Profile from './pages/Profile';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><Layout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/doctor" element={<ProtectedRoute allowedRole="DOCTOR"><Layout /></ProtectedRoute>}>
          <Route index element={<DoctorDashboard />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="prescriptions" element={<DoctorPrescriptions />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/patient" element={<ProtectedRoute allowedRole="PATIENT"><Layout /></ProtectedRoute>}>
          <Route index element={<PatientDashboard />} />
          <Route path="appointments" element={<PatientAppointments />} />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
