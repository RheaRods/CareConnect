import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const [userName,   setUserName]   = useState(() => localStorage.getItem("userName") || "");
  const [userRole,   setUserRole]   = useState(() => localStorage.getItem("userRole") || "");

  React.useEffect(() => {
    const sync = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setUserName(localStorage.getItem("userName") || "");
      setUserRole(localStorage.getItem("userRole") || "");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const navigate  = useNavigate();
  const location  = useLocation();

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // ── Admin nav ──
  const adminNav = [
    {
      key: "admin-dashboard",
      img: "/icons/previous.png",
      label: "Manage Caretakers",
      action: () => navigate("/admin/dashboard"),
    },
  ];

  // ── Caretaker nav ──
  const caretakerNav = [
    {
      key: "ct-dashboard",
      img: "/icons/previous.png",
      label: "My Bookings",
      action: () => navigate("/caretaker/dashboard"),
    },
    {
      key: "ct-profile",
      img: "/icons/profile.png",
      label: "My Profile",
      action: () => navigate("/caretaker/profile"),
    },
  ];

  // ── Careseeker nav ──
  const careseekerNav = [
    {
      key: "home",
      img: "/icons/home.png",
      label: "Home",
      action: () => location.pathname !== "/" ? navigate("/") : scrollTo("hero"),
    },
    {
      key: "about",
      img: "/icons/about.png",
      label: "About",
      action: () => {
        if (location.pathname !== "/") navigate("/");
        setTimeout(() => scrollTo("how-it-works"), 100);
      },
    },
    {
      key: "book",
      img: "/icons/home.png",
      label: "Book a Service",
      action: () => navigate("/services/book"),
    },
    {
      key: "bookings",
      img: "/icons/previous.png",
      label: "My Bookings",
      action: () => navigate("/bookings"),
    },
    {
      key: "contact",
      img: "/icons/contact.png",
      label: "Contact",
      action: () => {
        if (location.pathname !== "/") navigate("/");
        setTimeout(() => scrollTo("footer"), 100);
      },
    },
  ];

  const navItems = userRole === "CARETAKER" ? caretakerNav : userRole === "ADMIN" ? adminNav : careseekerNav;

  // Determine active key from current path
  const activeKey = (() => {
    const p = location.pathname;
    if (p === "/admin/dashboard")    return "admin-dashboard";
    if (p === "/caretaker/dashboard") return "ct-dashboard";
    if (p === "/caretaker/profile")   return "ct-profile";
    if (p === "/bookings")            return "bookings";
    if (p === "/services/book")       return "book";
    if (p === "/")                    return "home";
    return "";
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  return (
    <aside
      style={{ borderRight: "1px solid #e8f5f4" }}
      className={`h-screen bg-white flex flex-col transition-all duration-250 ease-in-out flex-shrink-0 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div style={{ borderBottom: "1px solid #e8f5f4" }}
        className="h-16 flex items-center gap-3 px-4 overflow-hidden flex-shrink-0">
        <div style={{ background: "#ffffff", border: "1.5px solid #e8f5f4" }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0">
          <img src={logo} className="w-7 h-7 object-contain" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-gray-900 whitespace-nowrap">CareConnect</span>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && userRole && (
        <div className="px-4 pt-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: userRole === "CARETAKER" ? "#fef3c7" : userRole === "ADMIN" ? "#fde8ff" : "#E9F7F5",
              color:      userRole === "CARETAKER" ? "#d97706"  : userRole === "ADMIN" ? "#9333ea" : "#21867A",
            }}>
            {userRole === "CARETAKER" ? "🩺 Caretaker" : userRole === "ADMIN" ? "⚙️ Admin" : "👤 Care Seeker"}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 p-2 mt-2 overflow-y-auto overflow-x-hidden">
        {navItems.map(item => {
          const isActive = activeKey === item.key;
          return (
            <button key={item.key} onClick={item.action}
              style={isActive ? { background: "#E9F7F5", color: "#2A9D8F" } : {}}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-colors whitespace-nowrap overflow-hidden w-full text-left ${
                isActive ? "" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}>
              <img src={item.img} alt={item.label} className="w-5 h-5 object-contain flex-shrink-0"/>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Auth section */}
      <div style={{ borderTop: "1px solid #e8f5f4" }} className="p-2 flex flex-col gap-1.5 flex-shrink-0">
        {isLoggedIn ? (
          <>
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg mb-1"
              style={{ background: "#E9F7F5" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: "#2A9D8F" }}>
                {userName[0]?.toUpperCase() || "U"}
              </div>
              {!collapsed && (
                <span className="text-xs font-semibold text-gray-700 truncate">{userName}</span>
              )}
            </div>
            {!collapsed ? (
              <button onClick={handleLogout}
                className="w-full py-2 rounded-lg text-xs font-semibold tracking-wide transition-all"
                style={{ background: "#fff", color: "#C0392B", border: "1.5px solid #fecaca" }}>
                Logout
              </button>
            ) : (
              <button onClick={handleLogout}
                className="mx-auto w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ background: "#fff", border: "1.5px solid #fecaca" }}
                title="Logout">
                <svg width="14" height="14" fill="none" stroke="#C0392B" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            )}
          </>
        ) : (
          <>
            {!collapsed ? (
              <button onClick={() => navigate("/login")}
                style={{ background: "#2A9D8F" }}
                className="w-full py-2 rounded-lg text-white text-xs font-semibold tracking-wide hover:opacity-90 transition-all">
                Login
              </button>
            ) : (
              <button onClick={() => navigate("/login")}
                style={{ background: "#fff" }}
                className="mx-auto w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-90 transition-all"
                title="Login">
                <img src="/icons/login.png" alt="login" className="w-6 h-6 object-contain"/>
              </button>
            )}
          </>
        )}
      </div>

      {/* Collapse toggle */}
      <div style={{ borderTop: "1px solid #e8f5f4" }} className="p-2 flex-shrink-0 pb-4">
        <button onClick={() => setCollapsed(p => !p)}
          className="flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors w-full overflow-hidden whitespace-nowrap">
          <img src="/icons/arrow.png" alt="collapse"
            className={`w-7 h-7 object-contain flex-shrink-0 transition-transform duration-250 ${collapsed ? "rotate-180" : ""}`}/>
          {!collapsed && <span className="text-sm font-medium">Close</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;