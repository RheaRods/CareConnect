// src/pages/BookingsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalCost: number | null;
  caretaker: {
    user: { name: string; email: string };
    hourlyRate: number;
    availability: string;
  };
  careSeeker: {
    user: { name: string; email: string };
  };
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string; step: number }> = {
  PENDING:   { label: "📋 Pending",     color: "#1d4ed8", bg: "#dbeafe", step: 0 },
  CONFIRMED: { label: "✅ Confirmed",   color: "#16a34a", bg: "#dcfce7", step: 1 },
  COMPLETED: { label: "🏁 Completed",   color: "#6b7280", bg: "#f3f4f6", step: 3 },
  CANCELLED: { label: "❌ Cancelled",   color: "#dc2626", bg: "#fee2e2", step: 0 },
};

const STEPS = ["Pending", "Confirmed", "In Progress", "Done"];

const BookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    api.get("/bookings")
      .then(res => setBookings(res.data))
      .catch(() => {
        setError("Failed to load bookings. Please login again.");
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, []);

  const getDuration = (start: string, end: string) => {
    const hours = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    return hours < 24 ? `${hours}h` : `${Math.round(hours / 24)} days`;
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9fafb" }}>
      <p className="text-gray-400 text-sm">Loading bookings...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9fafb" }}>
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  if (bookings.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#f9fafb" }}>
      <div className="text-5xl mb-4">📋</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h2>
      <p className="text-sm text-gray-400 mb-6">Book a caretaker to get started</p>
      <button
        onClick={() => navigate("/services/book")}
        style={{ background: "#2A9D8F" }}
        className="px-8 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all">
        Book a Service
      </button>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>

      {/* Header */}
      <div className="bg-white px-8 py-6" style={{ borderBottom: "1px solid #e8f5f4" }}>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-sm text-gray-400 mt-1">Track and manage all your appointments</p>
      </div>

      {/* Booking Cards */}
      <div className="px-8 py-6 max-w-3xl flex flex-col gap-4">
        {bookings.map(b => {
          const cfg     = STATUS_CONFIG[b.status] ?? STATUS_CONFIG["PENDING"];
          const name    = b.caretaker?.user?.name ?? "Unknown";
          const initials = getInitials(name);
          const start   = new Date(b.startDate);
          const durStr  = getDuration(b.startDate, b.endDate);
          const total   = b.totalCost ? `₹${b.totalCost.toFixed(0)}` : "—";

          return (
            <div key={b.id} className="bg-white rounded-2xl p-5" style={{ border: "1px solid #e8f5f4" }}>

              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: "#2A9D8F" }}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">
                      {start.toDateString()} · {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {durStr}
                    </p>
                  </div>
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>

              {/* Progress tracker */}
              <div className="relative flex items-center mb-2">
                {STEPS.map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: i <= cfg.step ? "#2A9D8F" : "#e5e7eb",
                          color: i <= cfg.step ? "#fff" : "#9ca3af",
                          boxShadow: i === cfg.step ? "0 0 0 3px rgba(42,157,143,0.2)" : "none",
                        }}>
                        {i < cfg.step ? "✓" : i + 1}
                      </div>
                      <span
                        className="text-xs font-semibold whitespace-nowrap"
                        style={{ color: i <= cfg.step ? "#2A9D8F" : "#9ca3af" }}>
                        {step}
                      </span>
                    </div>
                    {i < 3 && (
                      <div
                        className="flex-1 h-0.5 mx-1 mb-4"
                        style={{ background: i < cfg.step ? "#2A9D8F" : "#e5e7eb" }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Footer tags */}
              <div className="flex gap-2 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px solid #f3f4f6" }}>
                <span className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: "#E9F7F5", color: "#21867A" }}>
                  General Care
                </span>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                  {total}
                </span>
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                  {durStr}
                </span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingsPage;
