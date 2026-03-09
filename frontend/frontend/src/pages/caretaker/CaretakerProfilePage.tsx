// src/pages/caretaker/CaretakerProfilePage.tsx
import { useState, useEffect } from "react";
import api from "../../services/api";

const AVAILABILITY_OPTIONS = [
  { value: "flexible",  label: "Flexible",   desc: "Available anytime" },
  { value: "weekdays",  label: "Weekdays",   desc: "Mon – Fri" },
  { value: "weekends",  label: "Weekends",   desc: "Sat & Sun" },
  { value: "mornings",  label: "Mornings",   desc: "7 AM – 12 PM" },
  { value: "evenings",  label: "Evenings",   desc: "5 PM – 9 PM" },
];

const CaretakerProfilePage = () => {
  const [form, setForm] = useState({
    bio:          "",
    hourlyRate:   "",
    availability: "flexible",
  });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");
  const [errors,   setErrors]   = useState({ bio: "", hourlyRate: "" });

  const userName = localStorage.getItem("userName") || "Caretaker";
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase();

  useEffect(() => {
    api.get("/auth/me")
      .then(res => {
        const ct = res.data.caretaker;
        if (ct) {
          setForm({
            bio:          ct.bio || "",
            hourlyRate:   ct.hourlyRate?.toString() || "",
            availability: ct.availability || "flexible",
          });
        }
      })
      .catch(() => setError("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const e = { bio: "", hourlyRate: "" };
    if (!form.bio.trim()) e.bio = "Bio is required";
    if (!form.hourlyRate) e.hourlyRate = "Hourly rate is required";
    else if (isNaN(Number(form.hourlyRate)) || Number(form.hourlyRate) <= 0)
      e.hourlyRate = "Enter a valid rate";
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await api.put("/caretakers/profile", {
        bio:          form.bio.trim(),
        hourlyRate:   parseFloat(form.hourlyRate),
        availability: form.availability,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9fafb" }}>
      <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: "#2A9D8F", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>

      {/* Header */}
      <div className="bg-white px-8 py-6" style={{ borderBottom: "1px solid #e8f5f4" }}>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Update your info visible to care seekers</p>
      </div>

      <div className="px-8 py-6 max-w-2xl flex flex-col gap-5">

        {/* Avatar card */}
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4"
          style={{ border: "1px solid #e8f5f4" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ background: "#2A9D8F" }}>
            {initials}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-400 mt-0.5">Caretaker</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: "#fee2e2", color: "#dc2626" }}>{error}</div>
        )}
        {success && (
          <div className="px-4 py-3 rounded-xl text-sm font-medium"
            style={{ background: "#dcfce7", color: "#16a34a" }}>
            ✓ Profile updated successfully!
          </div>
        )}

        {/* Bio */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #e8f5f4" }}>
          <h2 className="text-sm font-bold text-gray-900 mb-4">About You</h2>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Bio</label>
          <textarea
            value={form.bio}
            rows={4}
            placeholder="Describe your experience, specialties, and approach to care..."
            onChange={e => { setForm(p => ({ ...p, bio: e.target.value })); setErrors(p => ({ ...p, bio: "" })); }}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none text-gray-700 resize-none"
            style={{ border: `1.5px solid ${errors.bio ? "#C0392B" : "#e5e7eb"}` }}
          />
          {errors.bio && <p className="text-xs mt-1" style={{ color: "#C0392B" }}>{errors.bio}</p>}
          <p className="text-xs text-gray-400 mt-1">{form.bio.length}/500 characters</p>
        </div>

        {/* Hourly rate */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #e8f5f4" }}>
          <h2 className="text-sm font-bold text-gray-900 mb-4">Pricing</h2>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">Hourly Rate (₹)</label>
          <div className="flex items-center gap-2">
            <span className="px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 flex-shrink-0"
              style={{ border: "1.5px solid #e5e7eb", background: "#f9fafb" }}>₹</span>
            <input
              type="number"
              min="1"
              value={form.hourlyRate}
              placeholder="e.g. 150"
              onChange={e => { setForm(p => ({ ...p, hourlyRate: e.target.value })); setErrors(p => ({ ...p, hourlyRate: "" })); }}
              className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none text-gray-700"
              style={{ border: `1.5px solid ${errors.hourlyRate ? "#C0392B" : "#e5e7eb"}` }}
            />
            <span className="text-xs text-gray-400 flex-shrink-0">per hour</span>
          </div>
          {errors.hourlyRate && <p className="text-xs mt-1" style={{ color: "#C0392B" }}>{errors.hourlyRate}</p>}
        </div>

        {/* Availability */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #e8f5f4" }}>
          <h2 className="text-sm font-bold text-gray-900 mb-4">Availability</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AVAILABILITY_OPTIONS.map(opt => {
              const isSel = form.availability === opt.value;
              return (
                <button key={opt.value}
                  onClick={() => setForm(p => ({ ...p, availability: opt.value }))}
                  className="flex flex-col gap-0.5 p-3 rounded-xl text-left transition-all"
                  style={{
                    background: isSel ? "#E9F7F5" : "#f9fafb",
                    border: isSel ? "1.5px solid #2A9D8F" : "1px solid #e8f5f4",
                  }}>
                  <span className="text-xs font-bold" style={{ color: isSel ? "#21867A" : "#374151" }}>
                    {opt.label}
                  </span>
                  <span className="text-xs" style={{ color: isSel ? "#2A9D8F" : "#9ca3af" }}>
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all shadow-lg"
          style={{ background: saving ? "#9ca3af" : "#2A9D8F" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default CaretakerProfilePage;