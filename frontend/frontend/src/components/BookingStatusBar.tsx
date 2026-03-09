// src/components/BookingStatusBar.tsx
import { bookingsStore, type Booking, type BookingStatus } from "../store/bookingsStore";

const STATUS_CONFIG: Record<BookingStatus, { label:string; color:string; bg:string; progress:number; step:number }> = {
  confirmed:  { label:"📋 Confirmed",   color:"#1d4ed8", bg:"#dbeafe", progress:20,  step:0 },
  arriving:   { label:"🚗 Arriving",    color:"#d97706", bg:"#fef3c7", progress:50,  step:1 },
  inprogress: { label:"⚡ In Progress", color:"#16a34a", bg:"#dcfce7", progress:75,  step:2 },
  completed:  { label:"✅ Completed",   color:"#6b7280", bg:"#f3f4f6", progress:100, step:3 },
};

const STEPS = ["Confirmed", "En route", "In progress", "Done"];

const BookingCard = ({ booking }: { booking: Booking }) => {
  const cfg    = STATUS_CONFIG[booking.status];
  const durStr = booking.duration === 1 ? "1 day" : `${booking.duration} days`;

  return (
    <div className="flex-shrink-0 rounded-2xl p-4"
      style={{ border:"1.5px solid #e8f5f4", background:"#fff", minWidth:"260px", maxWidth:"280px" }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-gray-900">{booking.caretakerName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{booking.date} · {booking.time}</p>
          {booking.service && (
            <p className="text-xs mt-0.5" style={{ color:"#2A9D8F" }}>{booking.service}</p>
          )}
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-2"
          style={{ background:cfg.bg, color:cfg.color }}>
          {cfg.label}
        </span>
      </div>
      <div className="h-1.5 rounded-full mb-2" style={{ background:"#f3f4f6" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width:`${cfg.progress}%`, background:"#2A9D8F" }}/>
      </div>
      <div className="flex justify-between">
        {STEPS.map((s,i) => (
          <span key={s} className="text-xs font-semibold"
            style={{ color: i<=cfg.step?"#2A9D8F":"#d1d5db" }}>
            {s}
          </span>
        ))}
      </div>
      {booking.duration > 1 && (
        <div className="mt-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background:"#E9F7F5", color:"#21867A" }}>
            {durStr}
          </span>
        </div>
      )}
    </div>
  );
};

const BookingStatusBar = () => {
  const active = bookingsStore.getActive();
  if (active.length === 0) return null;

  return (
    <div className="bg-white px-8 py-5" style={{ borderBottom:"1px solid #e8f5f4" }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:"#9ca3af" }}>
        Your Active Bookings
      </p>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {active.map(b => <BookingCard key={b.id} booking={b}/>)}
      </div>
    </div>
  );
};

export default BookingStatusBar;