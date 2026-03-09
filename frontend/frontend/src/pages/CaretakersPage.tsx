// src/pages/CaretakersPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Caretaker {
  id: number;
  bio: string | null;
  hourlyRate: number;
  availability: string;
  verificationStatus: string;
  averageRating: number | null;
  totalReviews: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const CaretakersPage = () => {
  const navigate = useNavigate();
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/caretakers")
      .then(res => setCaretakers(res.data))
      .catch(() => setError("Failed to load caretakers. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafb" }}>
      <p className="text-gray-400 text-sm">Loading caretakers...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafb" }}>
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#f8fafb" }}>

      {/* Header */}
      <div className="bg-white px-8 py-6" style={{ borderBottom: "1px solid #e8f5f4" }}>
        <p className="text-xs font-medium mb-1 text-gray-400">
          Home &nbsp;/&nbsp; <span style={{ color: "#2A9D8F" }}>Book a Service</span>
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Choose a Caretaker</h1>
        <p className="text-sm text-gray-400 mt-1">All caretakers are verified and background checked</p>
      </div>

      {/* Grid */}
      <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">

        {caretakers.length === 0 && (
          <div className="col-span-3 text-center py-20">
            <p className="text-gray-400 text-sm">No approved caretakers available yet.</p>
          </div>
        )}

        {caretakers.map((c) => {
          const name      = c.user?.name ?? "Unknown";
          const initials  = name.split(" ").map(n => n[0]).join("").toUpperCase();
          const rating    = c.averageRating ? c.averageRating.toFixed(1) : "New";
          const reviews   = c.totalReviews ?? 0;
          const available = c.availability !== "unavailable";

          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              style={{ border: "1px solid #e8f5f4", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>

              {/* Avatar banner */}
              <div className="relative h-44 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #E9F7F5 0%, #c5e8e5 100%)" }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: "#2A9D8F" }}>
                  {initials}
                </div>
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold
                  ${available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {available ? "● Available" : "● Unavailable"}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-900 text-base">{name}</h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700">{rating}</span>
                    <span className="text-xs text-gray-400">({reviews})</span>
                  </div>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-1 mb-3">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-400 capitalize">{c.availability}</span>
                </div>

                {/* Bio */}
                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">
                  {c.bio || "Experienced caretaker ready to help."}
                </p>

                {/* Hourly rate tag */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "#E9F7F5", color: "#2A9D8F" }}>
                    ₹{c.hourlyRate}/hr
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "#E9F7F5", color: "#2A9D8F" }}>
                    {c.availability}
                  </span>
                </div>

                {/* Book button */}
                <button
                  onClick={() => {
                    if (!available) return;
                    sessionStorage.setItem("selectedCaretaker", JSON.stringify({
                      id: c.id,
                      name,
                      hourlyRate: c.hourlyRate,
                      availability: c.availability,
                      bio: c.bio,
                    }));
                    navigate("/booking");
                  }}
                  disabled={!available}
                  style={available ? { background: "#2A9D8F" } : { background: "#e5e7eb" }}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${available ? "text-white hover:opacity-90" : "text-gray-400 cursor-not-allowed"}`}>
                  {available ? "Book Now →" : "Not Available"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaretakersPage;
