import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layouts/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CaretakersPage from "./pages/CaretakersPage";
import BookingPage from "./pages/BookingPage";
import CheckoutPage from "./pages/CheckoutPage";
import BookingsPage from "./pages/BookingsPage";
import CaretakerDashboardPage from "./pages/caretaker/CaretakerDashboardPage";
import CaretakerProfilePage from "./pages/caretaker/CaretakerProfilePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

// Guard: only lets the given role through, redirects otherwise
const RoleRoute = ({ role, children }: { role: string; children: JSX.Element }) => {
  const token    = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  if (!token)           return <Navigate to="/login" replace />;
  if (userRole !== role) return <Navigate to="/" replace />;
  return children;
};

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Auth — no sidebar */}
      <Route path="/login" element={<LoginPage />} />

      {/* Shared layout (sidebar always shown) */}
      <Route path="/" element={<Layout />}>

        {/* ── Careseeker pages ── */}
        <Route index element={<HomePage />} />
        <Route path="services/book" element={<CaretakersPage />} />
        <Route path="booking"       element={<BookingPage />} />
        <Route path="checkout"      element={<CheckoutPage />} />
        <Route path="bookings"      element={<BookingsPage />} />

        {/* ── Caretaker pages ── */}
        <Route path="caretaker/dashboard" element={
          <RoleRoute role="CARETAKER">
            <CaretakerDashboardPage />
          </RoleRoute>
        } />
        <Route path="caretaker/profile" element={
          <RoleRoute role="CARETAKER">
            <CaretakerProfilePage />
          </RoleRoute>
        } />

        {/* ── Admin pages ── */}
        <Route path="admin/dashboard" element={
          <RoleRoute role="ADMIN">
            <AdminDashboardPage />
          </RoleRoute>
        } />

      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;