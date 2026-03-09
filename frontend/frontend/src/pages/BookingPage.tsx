// src/pages/BookingPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVICES = [
  "Elderly companionship", "Post-surgery recovery", "Physiotherapy assistance",
  "Medication management", "Bathing & grooming", "Mobility support",
  "Dementia care", "Newborn care",
];

const TIME_SLOTS = {
  Morning:   ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"],
  Afternoon: ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"],
  Evening:   ["5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"],
};

const getDays = () => {
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
};

const DAY_S    = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MON_S    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MON_L    = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_L    = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const DURATIONS = [{ days:1, label:"1", sub:"Day" },{ days:2, label:"2", sub:"Days" },{ days:3, label:"3", sub:"Days" },{ days:7, label:"7", sub:"Days" }];

const BookingPage = () => {
  const navigate   = useNavigate();
  const caretaker  = JSON.parse(sessionStorage.getItem("selectedCaretaker") || "{}");
  const days       = getDays();

  const [duration,     setDuration]     = useState(1);
  const [selectedDay,  setSelectedDay]  = useState(days[0]);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSvc,  setSelectedSvc]  = useState("");
  const [errors,       setErrors]       = useState({ time: "" });

  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
  const isInRange = (d: Date) => duration > 1 && d > selectedDay && d <= addDays(selectedDay, duration - 1);

  const handleNext = () => {
    if (!selectedTime) { setErrors({ time: "Please select a time slot" }); return; }
    sessionStorage.setItem("bookingDetails", JSON.stringify({
      caretaker,
      date: selectedDay.toDateString(),
      dateFormatted: `${DAY_L[selectedDay.getDay()]}, ${MON_L[selectedDay.getMonth()]} ${selectedDay.getDate()}`,
      time: selectedTime,
      service: selectedSvc,
      duration,
    }));
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>

      {/* Header */}
      <div className="bg-white px-8 py-5" style={{ borderBottom: "1px solid #e8f5f4" }}>
        <button onClick={() => navigate("/services/book")}
          style={{ background:"none", border:"none", cursor:"pointer", color:"#2A9D8F" }}
          className="flex items-center gap-1.5 text-xs font-semibold mb-3 hover:opacity-70">
          ← All caretakers
        </button>
        <div className="flex items-center gap-2 mb-3">
          {["Caretaker","Schedule","Checkout"].map((s,i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: i<=1?"#2A9D8F":"#e5e7eb", color: i<=1?"#fff":"#9ca3af" }}>
                  {i<1?"✓":i+1}
                </div>
                <span className="text-xs font-medium" style={{ color: i<=1?"#2A9D8F":"#9ca3af" }}>{s}</span>
              </div>
              {i<2 && <div className="w-8 h-px" style={{ background: i<1?"#2A9D8F":"#e5e7eb" }}/>}
            </div>
          ))}
        </div>
        {caretaker.name && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-fit"
            style={{ background:"#E9F7F5", border:"1px solid #c5e8e5" }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ background:"#2A9D8F" }}>
              {caretaker.name.split(" ").map((n:string)=>n[0]).join("")}
            </div>
            <span className="text-xs font-semibold" style={{ color:"#21867A" }}>{caretaker.name}</span>
            <span className="text-xs text-gray-400">· {caretaker.location}</span>
          </div>
        )}
      </div>

      <div className="px-8 py-6 max-w-2xl">

        {/* Duration */}
        <div className="bg-white rounded-2xl p-6 mb-5" style={{ border:"1px solid #e8f5f4" }}>
          <h2 className="text-base font-bold text-gray-900 mb-1">How many days?</h2>
          <p className="text-xs text-gray-400 mb-4">Select the duration of your booking</p>
          <div className="grid grid-cols-4 gap-3">
            {DURATIONS.map(opt => {
              const isSel = duration === opt.days;
              return (
                <button key={opt.days} onClick={() => setDuration(opt.days)}
                  className="py-3 rounded-xl text-center transition-all"
                  style={{ background: isSel?"#E9F7F5":"#f9fafb", border: isSel?"1.5px solid #2A9D8F":"1px solid #e8f5f4" }}>
                  <div className="text-lg font-bold" style={{ color: isSel?"#21867A":"#111827" }}>{opt.label}</div>
                  <div className="text-xs" style={{ color: isSel?"#2A9D8F":"#9ca3af" }}>{opt.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-2xl p-6 mb-5" style={{ border:"1px solid #e8f5f4" }}>
          <h2 className="text-base font-bold text-gray-900 mb-4">
            {MON_S[selectedDay.getMonth()]} {selectedDay.getFullYear()}
          </h2>
          {[days.slice(0,7), days.slice(7,14)].map((row,ri) => (
            <div key={ri} className="grid grid-cols-7 gap-2 mb-2">
              {row.map(day => {
                const isSel   = day.toDateString()===selectedDay.toDateString();
                const inRange = isInRange(day);
                const isToday = day.toDateString()===new Date().toDateString();
                return (
                  <button key={day.toDateString()}
                    onClick={() => { setSelectedDay(day); setSelectedTime(""); }}
                    className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all"
                    style={{
                      background: isSel?"#2A9D8F":inRange?"#E9F7F5":isToday?"#E9F7F5":"#f9fafb",
                      color: isSel?"#fff":inRange?"#21867A":"#374151",
                      border: isSel?"none":inRange?"1px solid #c5e8e5":"1px solid #e8f5f4",
                    }}>
                    <span className="text-xs font-semibold" style={{ opacity:0.7 }}>{DAY_S[day.getDay()]}</span>
                    <span className="text-sm font-bold">{day.getDate()}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Time */}
        <div className="bg-white rounded-2xl p-6 mb-5" style={{ border:"1px solid #e8f5f4" }}>
          <h2 className="text-base font-bold text-gray-900 mb-1">
            {DAY_L[selectedDay.getDay()]}, {MON_L[selectedDay.getMonth()]} {selectedDay.getDate()}
          </h2>
          <p className="text-xs text-gray-400 mb-4">Pick a start time</p>
          {Object.entries(TIME_SLOTS).map(([period, slots]) => (
            <div key={period} className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{period}</p>
              <div className="flex flex-wrap gap-2">
                {slots.map(slot => {
                  const isSel = selectedTime===slot;
                  return (
                    <button key={slot}
                      onClick={() => { setSelectedTime(slot); setErrors({time:""}); }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background:isSel?"#2A9D8F":"#f9fafb", color:isSel?"#fff":"#374151", border:isSel?"none":"1px solid #e8f5f4" }}>
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {errors.time && <p className="text-xs mt-1" style={{ color:"#C0392B" }}>{errors.time}</p>}
        </div>

        {/* Service */}
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ border:"1px solid #e8f5f4" }}>
          <h2 className="text-base font-bold text-gray-900 mb-1">Service <span className="text-xs font-normal text-gray-400">(optional)</span></h2>
          <p className="text-xs text-gray-400 mb-4">Specify what type of care you need</p>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map(s => {
              const isSel = selectedSvc===s;
              return (
                <button key={s} onClick={() => setSelectedSvc(isSel?"":s)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{ background:isSel?"#E9F7F5":"#f9fafb", color:isSel?"#21867A":"#6b7280", border:isSel?"1.5px solid #2A9D8F":"1px solid #e5e7eb" }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleNext}
          style={{ background:"#2A9D8F" }}
          className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg">
          Next — Checkout
        </button>
      </div>
    </div>
  );
};

export default BookingPage;