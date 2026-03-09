// src/pages/caretaker/CaretakerDashboardPage.tsx
import { useState, useEffect } from "react";
import api from "../../services/api";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: BookingStatus;
  careSeeker: {
    user: { name: string; email: string };
    address: string | null;
    notes: string | null;
  };
}

const STATUS_STYLE: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Pending",   color: "#d97706", bg: "#fef3c7" },
  CONFIRMED: { label: "Confirmed", color: "#16a34a", bg: "#dcfce7" },
  CANCELLED: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2" },
  COMPLETED: { label: "Completed", color: "#6b7280", bg: "#f3f4f6" },
};

const fmt = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const CaretakerDashboardPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [filter, setFilter]     = useState<"ALL" | BookingStatus>("ALL");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings");
      setBookings(res.data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: number, status: BookingStatus) => {
    setUpdating(id);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings(prev =>
        prev.map(b => b.id === id ? { ...b, status } : b)
      );
    } catch {
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "ALL" ? bookings : bookings.filter(b => b.status === filter);

  const counts = {
    ALL:       bookings.length,
    PENDING:   bookings.filter(b => b.status === "PENDING").length,
    CONFIRMED: bookings.filter(b => b.status === "CONFIRMED").length,
    COMPLETED: bookings.filter(b => b.status === "COMPLETED").length,
    CANCELLED: bookings.filter(b => b.status === "CANCELLED").length,
  };

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>

      {/* Header */}
      <div className="bg-white px-8 py-6" style={{ borderBottom: "1px solid #e8f5f4" }}>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage and respond to booking requests</p>
      </div>

      {/* Stats bar */}
      <div className="px-8 py-5 grid grid-cols-4 gap-4 max-w-4xl">
        {(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as BookingStatus[]).map(s => {
          const cfg = STATUS_STYLE[s];
          return (
            <div key={s} className="bg-white rounded-2xl p-4 flex flex-col gap-1"
              style={{ border: "1px solid #e8f5f4" }}>
              <span className="text-2xl font-bold text-gray-900">{counts[s]}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="px-8 mb-4 flex gap-2 flex-wrap">
        {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map(f => {
          const isSel = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: isSel ? "#2A9D8F" : "#fff",
                color: isSel ? "#fff" : "#6b7280",
                border: isSel ? "none" : "1px solid #e5e7eb",
              }}>
              {f === "ALL" ? `All (${counts.ALL})` : `${STATUS_STYLE[f].label} (${counts[f]})`}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-8 pb-10 max-w-4xl flex flex-col gap-4">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: "#2A9D8F", borderTopColor: "transparent" }} />
          </div>
        )}

        {error && !loading && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: "#fee2e2", color: "#dc2626" }}>{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center" style={{ border: "1px solid #e8f5f4" }}>
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm font-semibold text-gray-700">No bookings found</p>
            <p className="text-xs text-gray-400 mt-1">
              {filter === "ALL" ? "You have no bookings yet." : `No ${filter.toLowerCase()} bookings.`}
            </p>
          </div>
        )}

        {!loading && filtered.map(b => {
          const cfg     = STATUS_STYLE[b.status];
          const isUpd   = updating === b.id;
          const name    = b.careSeeker?.user?.name || "Unknown";
          const email   = b.careSeeker?.user?.email || "";
          const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();

          return (
            <div key={b.id} className="bg-white rounded-2xl p-5"
              style={{ border: "1px solid #e8f5f4" }}>

              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: "#2A9D8F" }}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-400">{email}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl"
                style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}>
                {[
                  ["From",  fmt(b.startDate)],
                  ["To",    fmt(b.endDate)],
                  ["Total", `₹${b.totalCost}`],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-xs font-semibold text-gray-800">{val}</p>
                  </div>
                ))}
              </div>

              {b.careSeeker?.notes && (
                <p className="text-xs text-gray-500 mb-4 px-3 py-2 rounded-xl italic"
                  style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}>
                  📝 {b.careSeeker.notes}
                </p>
              )}

              {/* Action buttons */}
              {b.status === "PENDING" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(b.id, "CONFIRMED")}
                    disabled={isUpd}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: isUpd ? "#9ca3af" : "#2A9D8F", color: "#fff" }}>
                    {isUpd ? "Updating..." : "✓ Accept"}
                  </button>
                  <button
                    onClick={() => updateStatus(b.id, "CANCELLED")}
                    disabled={isUpd}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "#fff", color: "#dc2626", border: "1.5px solid #fecaca" }}>
                    ✕ Decline
                  </button>
                </div>
              )}

              {b.status === "CONFIRMED" && (
                <button
                  onClick={() => updateStatus(b.id, "COMPLETED")}
                  disabled={isUpd}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: isUpd ? "#9ca3af" : "#E9F7F5", color: "#21867A", border: "1.5px solid #2A9D8F" }}>
                  {isUpd ? "Updating..." : "✓ Mark as Completed"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaretakerDashboardPage;