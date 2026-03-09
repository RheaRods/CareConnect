// src/store/bookingsStore.ts

export type BookingStatus = "confirmed" | "arriving" | "inprogress" | "completed";

export interface Booking {
  id: string;
  caretakerName: string;
  caretakerInit: string;
  caretakerLoc: string;
  date: string;
  time: string;
  duration: number;
  service: string;
  status: BookingStatus;
  total: string;
  createdAt: string;
}

const KEY = "homefixr_bookings";

export const bookingsStore = {
  getAll(): Booking[] {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || "[]");
    } catch {
      return [];
    }
  },
  add(b: Booking) {
    const all = this.getAll();
    all.unshift(b);
    sessionStorage.setItem(KEY, JSON.stringify(all));
  },
  getActive(): Booking[] {
    return this.getAll().filter(b => b.status !== "completed");
  },
};