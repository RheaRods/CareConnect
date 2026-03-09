import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Layout = () => (
  <div className="flex h-screen overflow-hidden" style={{ background: "#f9fafb" }}>
    <Sidebar />
    <main className="flex-1 overflow-y-auto h-screen">
      <Outlet />
    </main>
  </div>
);

export default Layout;