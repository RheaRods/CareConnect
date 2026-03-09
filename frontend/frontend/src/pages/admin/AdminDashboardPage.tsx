// src/pages/admin/AdminDashboardPage.tsx
import { useState, useEffect } from "react";
import api from "../../services/api";

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Caretaker {
  id: number;
  bio: string;
  hourlyRate: number;
  availability: string;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  createdAt: string;
  user: { id: number; name: string; email: string };
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  caretaker: { verificationStatus: string; hourlyRate: number } | null;
  careSeeker: { address: string | null } | null;
}

const STATUS_STYLE: Record<VerificationStatus, { color: string; bg: string }> = {
  PENDING:  { color: "#d97706", bg: "#fef3c7" },
  APPROVED: { color: "#16a34a", bg: "#dcfce7" },
  REJECTED: { color: "#dc2626", bg: "#fee2e2" },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const AdminDashboardPage = () => {
  const [tab, setTab] = useState<"pending" | "all" | "users">("pending");

  const [pending,   setPending]   = useState<Caretaker[]>([]);
  const [all,       setAll]       = useState<Caretaker[]>([]);
  const [users,     setUsers]     = useState<User[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [updating,  setUpdating]  = useState<number | null>(null);
  const [deleting,  setDeleting]  = useState<number | null>(null);
  const [error,     setError]     = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [pendingRes, allRes, usersRes] = await Promise.all([
        api.get("/admin/caretakers/pending"),
        api.get("/admin/caretakers"),
        api.get("/admin/users"),
      ]);
      setPending(pendingRes.data);
      setAll(allRes.data);
      setUsers(usersRes.data);
    } catch {
      setError("Failed to load data. Make sure you're logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const verify = async (id: number, status: "APPROVED" | "REJECTED") => {
    setUpdating(id);
    try {
      await api.patch(`/admin/caretakers/${id}/verify`, { status });
      await fetchAll();
    } catch {
      alert("Failed to update. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const deleteUser = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?\nThis will also delete all their bookings and data.\nThis cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/users/${id}`);
      // Optimistically remove from UI immediately
      setUsers(prev => prev.filter(u => u.id !== id));
      setPending(prev => prev.filter(ct => ct.user.id !== id));
      setAll(prev => prev.filter(ct => ct.user.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete user. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const tabs = [
    { key: "pending", label: "Pending Approval", count: pending.length },
    { key: "all",     label: "All Caretakers",   count: all.length },
    { key: "users",   label: "All Users",         count: users.length },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>

      {/* Header */}
      <div className="bg-white px-8 py-6" style={{ borderBottom: "1px solid #e8f5f4" }}>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Manage caretakers and platform users</p>
      </div>

      {/* Stats */}
      <div className="px-8 py-5 grid grid-cols-3 gap-4 max-w-3xl">
        {[
          { label: "Pending Approval", value: pending.length, color: "#d97706", bg: "#fef3c7" },
          { label: "Total Caretakers", value: all.length,     color: "#16a34a", bg: "#dcfce7" },
          { label: "Total Users",      value: users.length,   color: "#2A9D8F", bg: "#E9F7F5" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4" style={{ border: "1px solid #e8f5f4" }}>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: s.bg, color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-8 mb-5 flex gap-2">
        {tabs.map(t => {
          const isSel = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                background: isSel ? "#2A9D8F" : "#fff",
                color:      isSel ? "#fff"    : "#6b7280",
                border:     isSel ? "none"    : "1px solid #e5e7eb",
              }}>
              {t.label}
              {t.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: isSel ? "rgba(255,255,255,0.3)" : "#f3f4f6" }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-8 pb-10 max-w-4xl">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 animate-spin"
              style={{ borderColor: "#2A9D8F", borderTopColor: "transparent" }} />
          </div>
        )}

        {error && !loading && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium mb-4"
            style={{ background: "#fee2e2", color: "#dc2626" }}>{error}</div>
        )}

        {/* ── Pending tab ── */}
        {!loading && tab === "pending" && (
          <div className="flex flex-col gap-4">
            {pending.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center" style={{ border: "1px solid #e8f5f4" }}>
                <div className="text-4xl mb-3">✅</div>
                <p className="text-sm font-semibold text-gray-700">No pending approvals</p>
                <p className="text-xs text-gray-400 mt-1">All caretakers have been reviewed</p>
              </div>
            ) : pending.map(ct => (
              <CaretakerCard key={ct.id} ct={ct} updating={updating} onVerify={verify} showActions />
            ))}
          </div>
        )}

        {/* ── All caretakers tab ── */}
        {!loading && tab === "all" && (
          <div className="flex flex-col gap-4">
            {all.map(ct => (
              <CaretakerCard key={ct.id} ct={ct} updating={updating} onVerify={verify}
                showActions={ct.verificationStatus === "PENDING"} />
            ))}
          </div>
        )}

        {/* ── Users tab ── */}
        {!loading && tab === "users" && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e8f5f4" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f9fafb" }}>
                  {["Name", "Email", "Role", "Joined", "Action"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #f3f4f6" : "none" }}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: "#2A9D8F" }}>
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: u.role === "ADMIN" ? "#fde8ff" : u.role === "CARETAKER" ? "#fef3c7" : "#E9F7F5",
                          color:      u.role === "ADMIN" ? "#9333ea" : u.role === "CARETAKER" ? "#d97706" : "#21867A",
                        }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{fmt(u.createdAt)}</td>
                    <td className="px-5 py-3">
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => deleteUser(u.id, u.name)}
                          disabled={deleting === u.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          style={{ background: "#fff", color: "#dc2626", border: "1.5px solid #fecaca" }}>
                          {deleting === u.id ? "Deleting..." : "🗑 Delete"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Caretaker card component ──
const CaretakerCard = ({
  ct, updating, onVerify, showActions,
}: {
  ct: Caretaker;
  updating: number | null;
  onVerify: (id: number, status: "APPROVED" | "REJECTED") => void;
  showActions: boolean;
}) => {
  const cfg    = STATUS_STYLE[ct.verificationStatus];
  const isUpd  = updating === ct.id;
  const initials = ct.user.name.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #e8f5f4" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: "#2A9D8F" }}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{ct.user.name}</p>
            <p className="text-xs text-gray-400">{ct.user.email}</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: cfg.bg, color: cfg.color }}>
          {ct.verificationStatus}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl"
        style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}>
        {[
          ["Rate",         `₹${ct.hourlyRate}/hr`],
          ["Availability", ct.availability],
          ["Joined",       new Date(ct.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
        ].map(([label, val]) => (
          <div key={label}>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-xs font-semibold text-gray-800 capitalize">{val}</p>
          </div>
        ))}
      </div>

      {ct.bio && (
        <p className="text-xs text-gray-500 mb-4 px-3 py-2 rounded-xl italic"
          style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}>
          "{ct.bio}"
        </p>
      )}

      {showActions && (
        <div className="flex gap-3">
          <button onClick={() => onVerify(ct.id, "APPROVED")} disabled={isUpd}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: isUpd ? "#9ca3af" : "#2A9D8F", color: "#fff" }}>
            {isUpd ? "Updating..." : "✓ Approve"}
          </button>
          <button onClick={() => onVerify(ct.id, "REJECTED")} disabled={isUpd}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#fff", color: "#dc2626", border: "1.5px solid #fecaca" }}>
            ✕ Reject
          </button>
        </div>
      )}

      {ct.verificationStatus === "APPROVED" && ct.verifiedAt && (
        <p className="text-xs text-gray-400 mt-2">
          ✅ Approved on {new Date(ct.verifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
      )}
    </div>
  );
};

export default AdminDashboardPage;