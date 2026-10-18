import './index.css';
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google'; //

// ------------------ Context ------------------
import { PatientProvider } from './context/PatientContext';
import { DoctorProvider } from './context/DoctorContext';

// ------------------ Auth Pages ------------------
import LoginForm from './page/auth/LoginForm';
import RegistrationForm from './page/auth/RegistrationForm';
import ForgotPassword from './page/auth/ForgotPassword';
import ResetPassword from './page/auth/ResetPassword';

// ------------------ Patient Pages ------------------
import PatientLayout from './page/layout/PatientLayout';
import HomePage from './page/patient/HomePage';
import AboutPage from './page/patient/AboutPage';
import SpecialtyPage from './page/patient/SpecialtyPage';
import SpecialtyDetailPage from './page/patient/SpecialtyDetailPage';
import ContactPage from './page/patient/ContactPage';
import BookingPage from './page/patient/BookingPage';
import BookingHistoryPage from './page/patient/BookingHistoryPage'
import ConditionPage from './page/patient/ConditionPage';
import SupportPage from './page/patient/SupportPage';
import DoctorListPage from './page/patient/DoctorListPage';
import OnlinePaymentPage from './page/patient/OnlinePaymentPage';
import OnlinePaymentResultPage from './page/patient/OnlinePaymentResultPage';
import InfoPage from './page/patient/InfoPage';
import UserList from './page/UserList';
import DoctorSuggestPage from './page/patient/DoctorSuggestPage.jsx';
import AsistantAI from './page/patient/AsistantAI.jsx';

// ------------------ Doctor Pages ------------------
import DoctorLayout from './page/layout/DoctorLayout';
import DoctorDashboard from './page/doctor/DashboardPage';
import Appointment from './page/doctor/AppointmentsPage';
import AppointmentDetail from './page/doctor/AppointmentDetailPage';
import Schedule from './page/doctor/SchedulePage';
import EditSchedule from './page/doctor/EditSchedulePage';
import DoctorProfile from './page/doctor/ProfilePage';
import ChangePassword from './page/doctor/ChangePasswordPage';
import ReportsPage from './page/doctor/ReportsPage';

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {/* Đặt Provider bọc toàn bộ app */}
      <PatientProvider>
        <DoctorProvider>
          <BrowserRouter>
            <Routes>
              {/* Trang chủ mặc định chuyển hướng về /patient */}
              <Route path="/" element={<Navigate to="/patient" replace />} />

              {/* -------------------- PATIENT ROUTES -------------------- */}
              <Route path="patient" element={<PatientLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginForm role="patient" />} />
                <Route path="forgot_password" element={<ForgotPassword role="patient" />} />
                <Route path="reset_password" element={<ResetPassword role="patient" />} />
                <Route path="register" element={<RegistrationForm />} />
                <Route path="home" element={<HomePage />} />
                <Route path="booking" element={<BookingPage />} />
                <Route path="booking_history" element={<BookingHistoryPage />} />
                <Route path="condition" element={<ConditionPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="specialty" element={<SpecialtyPage />} />
                <Route path="specialty_detail" element={<SpecialtyDetailPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="doctor_list" element={<DoctorListPage />} />
                <Route path="payment" element={<OnlinePaymentPage />} />
                <Route path="payment_result" element={<OnlinePaymentResultPage />} />
                <Route path="info" element={<InfoPage />} />
                <Route path="sample-user-list" element={<UserList />} />
                <Route path="ai-suggest" element={<DoctorSuggestPage />} />
              </Route>

              {/* -------------------- DOCTOR ROUTES -------------------- */}
              <Route path="doctor">
                <Route index element={<LoginForm role="doctor" />} />
                <Route element={<DoctorLayout />}>
                  <Route path="forgot_password" element={<ForgotPassword role="doctor" />} />
                  <Route path="reset_password" element={<ResetPassword role="doctor" />} />
                  <Route path="dashboard" element={<DoctorDashboard />} />
                  <Route path="appointment" element={<Appointment />} />
                  <Route path="appointment/:id" element={<AppointmentDetail />} />
                  <Route path="schedule" element={<Schedule />} />
                  <Route path="schedule/edit/:dayKey" element={<EditSchedule />} />
                  <Route path="profile" element={<DoctorProfile />} />
                  <Route path="change_password" element={<ChangePassword />} />
                  <Route path="reports" element={<ReportsPage />} />
                </Route>
              </Route>

              {/* -------------------- 404 -------------------- */}
              <Route
                path="*"
                element={
                  <div className="p-10 text-center text-red-600 font-semibold text-xl">
                    404 - Trang không tồn tại
                  </div>
                }
              />
            </Routes>
          </BrowserRouter>
        </DoctorProvider>
      </PatientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
