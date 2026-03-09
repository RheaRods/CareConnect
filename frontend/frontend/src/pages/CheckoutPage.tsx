// src/pages/CheckoutPage.tsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CheckoutPage = () => {
  const navigate  = useNavigate();
  const details   = JSON.parse(sessionStorage.getItem("bookingDetails") || "{}");
  const caretaker = details.caretaker || {};
  const duration  = details.duration || 1;
  const fee       = (caretaker.hourlyRate || 500) * 8 * duration; // 8hr day rate
  const total     = fee + 50;

  const [form, setForm]       = useState({ firstName: "", lastName: "", phone: "", email: "", notes: "" });
  const [errors, setErrors]   = useState({ firstName: "", lastName: "", phone: "", email: "" });
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const submitting = useRef(false); // hard guard against double-submit

  const update = (field: string, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = { firstName: "", lastName: "", phone: "", email: "" };
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.phone.trim())     e.phone     = "Required";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter valid 10-digit number";
    if (!form.email.trim())     e.email     = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter valid email";
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleConfirm = async () => {
    if (submitting.current) return;   // block any extra clicks
    if (!validate()) return;

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    submitting.current = true;
    setLoading(true);
    setApiError("");

    try {
      // Build startDate from selected date + time
      const startDate = new Date(`${details.date} ${details.time}`);
      if (isNaN(startDate.getTime())) throw new Error("Invalid date/time");

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration);

      await api.post("/bookings", {
        caretakerId: caretaker.id,
        startDate:   startDate.toISOString(),
        endDate:     endDate.toISOString(),
      });

      sessionStorage.removeItem("bookingDetails");
      sessionStorage.removeItem("selectedCaretaker");
      setConfirmed(true);
    } catch (err: any) {
      setApiError(err.response?.data?.error || "Booking failed. Please try again.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  // ── Confirmation screen ──
  if (confirmed) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9fafb" }}>
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl mx-4"
        style={{ border: "1px solid #e8f5f4" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "#E9F7F5" }}>
          <svg width="32" height="32" fill="none" stroke="#2A9D8F" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Booking Confirmed!</h2>
        <p className="text-sm text-gray-400 mb-6">
          We'll send confirmation to <span className="font-medium text-gray-700">{form.email}</span>
        </p>

        <div className="rounded-2xl p-4 text-left mb-4" style={{ background: "#f9fafb", border: "1px solid #e8f5f4" }}>
          {[
            ["Caretaker", caretaker.name],
            ["Date",      details.dateFormatted || details.date],
            ["Duration",  duration === 1 ? "1 day" : `${duration} days`],
            ["Time",      details.time],
            ["Total",     `₹${total}`],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid #f3f4f6" }}>
              <span className="text-xs text-gray-400">{label}</span>
              <span className="text-xs font-semibold text-gray-700">{val}</span>
            </div>
          ))}
        </div>

        <button onClick={() => navigate("/")}
          style={{ background: "#2A9D8F" }}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all mb-3">
          Back to Home
        </button>
        <button onClick={() => navigate("/bookings")}
          style={{ border: "1.5px solid #2A9D8F", color: "#2A9D8F" }}
          className="w-full py-3 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-all bg-white">
          View My Bookings
        </button>
      </div>
    </div>
  );

  // ── Main checkout screen ──
  return (
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>

      {/* Header / stepper */}
      <div className="bg-white px-8 py-5" style={{ borderBottom: "1px solid #e8f5f4" }}>
        <button onClick={() => navigate("/booking")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#2A9D8F" }}
          className="flex items-center gap-1.5 text-xs font-semibold mb-3 hover:opacity-70">
          ← Back to schedule
        </button>
        <div className="flex items-center gap-2">
          {["Caretaker", "Schedule", "Checkout"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "#2A9D8F", color: "#fff" }}>
                  {i < 2 ? "✓" : "3"}
                </div>
                <span className="text-xs font-medium" style={{ color: "#2A9D8F" }}>{s}</span>
              </div>
              {i < 2 && <div className="w-8 h-px" style={{ background: "#2A9D8F" }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 flex gap-6 max-w-4xl flex-wrap">

        {/* ── Contact form ── */}
        <div className="flex-1 min-w-0" style={{ minWidth: "280px" }}>
          <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #e8f5f4" }}>
            <h2 className="text-base font-bold text-gray-900 mb-5">Contact info</h2>

            {apiError && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: "#fee2e2", color: "#dc2626" }}>
                {apiError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              {(["firstName", "lastName"] as const).map(f => (
                <div key={f}>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    {f === "firstName" ? "First name" : "Last name"}
                  </label>
                  <input
                    type="text"
                    value={form[f]}
                    placeholder={f === "firstName" ? "First name" : "Last name"}
                    onChange={e => update(f, e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none text-gray-700"
                    style={{ border: `1.5px solid ${errors[f] ? "#C0392B" : "#e5e7eb"}` }}
                  />
                  {errors[f] && <p className="text-xs mt-1" style={{ color: "#C0392B" }}>{errors[f]}</p>}
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Phone number</label>
              <div className="flex gap-2">
                <div className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 flex-shrink-0"
                  style={{ border: "1.5px solid #e5e7eb", background: "#f9fafb" }}>
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  value={form.phone}
                  placeholder="Phone number"
                  onChange={e => update("phone", e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none text-gray-700"
                  style={{ border: `1.5px solid ${errors.phone ? "#C0392B" : "#e5e7eb"}` }}
                />
              </div>
              {errors.phone && <p className="text-xs mt-1" style={{ color: "#C0392B" }}>{errors.phone}</p>}
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                placeholder="Email address"
                onChange={e => update("email", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none text-gray-700"
                style={{ border: `1.5px solid ${errors.email ? "#C0392B" : "#e5e7eb"}` }}
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: "#C0392B" }}>{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Additional notes</label>
              <textarea
                value={form.notes}
                rows={3}
                placeholder="Any special requirements..."
                onChange={e => update("notes", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none text-gray-700 resize-none"
                style={{ border: "1.5px solid #e5e7eb" }}
              />
            </div>
          </div>
        </div>

        {/* ── Summary panel ── */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl p-5 sticky top-6" style={{ border: "1px solid #e8f5f4" }}>
            <h2 className="text-base font-bold text-gray-900 mb-4">Appointment</h2>

            {caretaker.name && (
              <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: "1px solid #f3f4f6" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "#2A9D8F" }}>
                  {caretaker.name.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{caretaker.name}</p>
                  <p className="text-xs text-gray-400">₹{caretaker.hourlyRate}/hr</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 mb-4 pb-4" style={{ borderBottom: "1px solid #f3f4f6" }}>
              {[
                ["Date",     details.dateFormatted || details.date || "—"],
                ["Duration", duration === 1 ? "1 day" : `${duration} days`],
                ["Time",     details.time || "—"],
                ["Service",  details.service || "General care"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-semibold text-gray-700">{val}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Service fee ({duration}d)</span><span>₹{fee}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Platform fee</span><span>₹50</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2"
                style={{ borderTop: "1px solid #f3f4f6" }}>
                <span>Total</span><span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{ background: loading ? "#9ca3af" : "#2A9D8F" }}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md disabled:cursor-not-allowed">
              {loading ? "Confirming..." : "Confirm Booking"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;