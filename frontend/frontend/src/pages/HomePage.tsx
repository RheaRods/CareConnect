import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import BookingStatusBar from "../components/BookingStatusBar";

const steps = [
  { emoji: "📋", title: "Choose a Service",  desc: "Browse and select the home service you need" },
  { emoji: "📅", title: "Pick a Time Slot",  desc: "Select a date and time that works for you" },
  { emoji: "✅", title: "Confirm Booking",   desc: "Review details and confirm your booking instantly" },
  { emoji: "🧑‍🔧", title: "Pro Arrives",   desc: "A verified professional arrives at your doorstep" },
  { emoji: "⭐", title: "Rate & Review",     desc: "Share your experience and help others choose" },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <div id="hero" className="relative w-full h-screen flex-shrink-0">
        {/* IMAGE SLOT 3 — replace src with your own image */}
        <img
          src="/heroimage.jpg"
          alt="Home services"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 gap-2">
          <h1 className="text-white text-4xl font-bold tracking-tight drop-shadow-lg">
            Home Services, Simplified
          </h1>
          <p className="text-white/75 text-base">Trusted professionals at your doorstep</p>
          <button
            onClick={() => navigate("/services/book")}
            style={{ background: "#E9F7F5", color: "#21867A" }}
            className="mt-5 px-10 py-3.5 font-semibold rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all duration-150 text-sm">
            Book Service
          </button>
        </div>
      </div>

        <BookingStatusBar />

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-white px-8 py-16 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-gray-900 text-center">Here's how HomeFixr works</h2>
        <p className="text-gray-400 text-sm mt-2 text-center">
          Get your home service done in just a few simple steps
        </p>

        <div className="mt-10 grid grid-cols-5 gap-5 w-full max-w-5xl">
          {steps.map((_, i) => (
            <div key={i} className="flex justify-center">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2A9D8F" }}>
                Step {i + 1}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-5 gap-5 w-full max-w-5xl">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div style={{ borderColor: "#e8f5f4" }}
                className="w-full aspect-square rounded-2xl bg-gray-50 flex items-center justify-center text-5xl border hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                {step.emoji}
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-semibold text-gray-800 leading-snug">{step.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />

    </div>
  );
};

export default HomePage;