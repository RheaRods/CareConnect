import { useState } from "react";
import api from "../lib/axios";
import { useNavigate } from "react-router-dom";

type Mode = "login" | "signup";

const UserIcon = () => <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const EmailIcon = () => <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const LockIcon = () => <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

interface RowProps {
  icon: "user" | "email" | "lock";
  error: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const InputRow = ({ icon, error, ...props }: RowProps) => (
  <div className="mb-1">
    <div className="flex items-center gap-3 pb-2"
      style={{ borderBottom: `1.5px solid ${error ? "#C0392B" : "#e5e7eb"}` }}>
      {icon === "user"  && <UserIcon />}
      {icon === "email" && <EmailIcon />}
      {icon === "lock"  && <LockIcon />}
      <input {...props} className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent py-1" />
    </div>
    {error && <p className="text-xs mt-1 pl-8" style={{ color: "#C0392B" }}>{error}</p>}
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");

  // ── Login ──
  const [loginForm,   setLoginForm]   = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({ email: "", password: "" });

  const updateLogin = (field: string, value: string) => {
    setLoginForm(p => ({ ...p, [field]: value }));
    setLoginErrors(p => ({ ...p, [field]: "" }));
  };
  const validateLogin = () => {
    const e = { email: "", password: "" };
    if (!loginForm.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) e.email = "Enter a valid email";
    if (!loginForm.password.trim()) e.password = "Password is required";
    else if (loginForm.password.length < 6) e.password = "Minimum 6 characters";
    setLoginErrors(e);
    return !e.email && !e.password;
  };
  const handleLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateLogin()) return;
    try {
      const res = await api.post("/auth/login", {
        email:    loginForm.email,
        password: loginForm.password,
      });
      const { token, user } = res.data;
      localStorage.setItem("token",    token);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userRole", user.role);
      window.dispatchEvent(new Event("storage"));

      // ── Role-based redirect ──
      if (user.role === "CARETAKER") {
        navigate("/caretaker/dashboard");
      } else if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || "Login failed";
      setLoginErrors(p => ({ ...p, email: msg }));
    }
  };

  // ── Signup ──
  const [signupForm,   setSignupForm]   = useState({ name: "", email: "", password: "", confirm: "" });
  const [signupErrors, setSignupErrors] = useState({ name: "", email: "", password: "", confirm: "" });

  const updateSignup = (field: string, value: string) => {
    setSignupForm(p => ({ ...p, [field]: value }));
    setSignupErrors(p => ({ ...p, [field]: "" }));
  };
  const validateSignup = () => {
    const e = { name: "", email: "", password: "", confirm: "" };
    if (!signupForm.name.trim()) e.name = "Full name is required";
    if (!signupForm.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) e.email = "Enter a valid email";
    if (!signupForm.password.trim()) e.password = "Password is required";
    else if (signupForm.password.length < 6) e.password = "Minimum 6 characters";
    if (!signupForm.confirm.trim()) e.confirm = "Please confirm your password";
    else if (signupForm.confirm !== signupForm.password) e.confirm = "Passwords do not match";
    setSignupErrors(e);
    return !Object.values(e).some(Boolean);
  };
  const handleSignup = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateSignup()) return;
    try {
      const res = await api.post("/auth/register", {
        name:     signupForm.name,
        email:    signupForm.email,
        password: signupForm.password,
        role:     "CARESEEKER",
      });
      const { token, user } = res.data;
      localStorage.setItem("token",    token);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userRole", user.role);
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Registration failed";
      setSignupErrors(p => ({ ...p, email: msg }));
    }
  };

  const activeBtn   = { background: "#E9F7F5", color: "#21867A" };
  const inactiveBtn = { background: "rgba(233,247,245,0.15)", color: "white" };

  return (
    <div style={{ background: "#21867A" }} className="min-h-screen flex items-center justify-center p-6 relative">

      <button onClick={() => navigate("/")}
        style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
        className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/25 transition-all backdrop-blur-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
        </svg>
        Back
      </button>

      <div className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex" style={{ minHeight: "440px" }}>

        {/* LEFT — toggle */}
        <div style={{ background: "#2A9D8F" }} className="relative w-2/5 flex flex-col items-center justify-center overflow-hidden gap-5">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-52 h-52 rounded-full opacity-30" style={{ background: "#21867A" }}/>
            <div className="absolute top-10 -left-16 w-52 h-52 rounded-full opacity-15" style={{ background: "#E9F7F5" }}/>
            <div className="absolute -bottom-10 -right-10 w-52 h-52 rounded-full opacity-30" style={{ background: "#21867A" }}/>
            <div className="absolute bottom-10 -right-16 w-52 h-52 rounded-full opacity-15" style={{ background: "#E9F7F5" }}/>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <button onClick={() => setMode("login")}  style={mode==="login"  ? activeBtn : inactiveBtn} className="w-36 py-2.5 rounded-2xl font-bold text-sm tracking-widest border-0 cursor-pointer transition-all duration-200">LOGIN</button>
            <button onClick={() => setMode("signup")} style={mode==="signup" ? activeBtn : inactiveBtn} className="w-36 py-2.5 rounded-2xl font-bold text-sm tracking-widest border-0 cursor-pointer transition-all duration-200">SIGN UP</button>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="flex-1 bg-white flex flex-col items-center justify-center px-10 py-10">
          <div className="w-14 h-14 rounded-full border-4 mb-3 overflow-hidden" style={{ borderColor: "#c5e8e5" }}>
            <img src="/icons/profile.png" alt="profile" className="w-full h-full object-cover"/>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-5 tracking-widest uppercase">
            {mode === "login" ? "Login" : "Sign Up"}
          </h2>

          {mode === "login" && (
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-1" noValidate>
              <InputRow icon="user"  type="email"    placeholder="Email"    value={loginForm.email}    error={loginErrors.email}    onChange={e => updateLogin("email",    e.target.value)}/>
              <InputRow icon="lock"  type="password" placeholder="Password" value={loginForm.password} error={loginErrors.password} onChange={e => updateLogin("password", e.target.value)}/>
              <div className="flex justify-start mt-2">
                <button type="button" className="text-xs hover:underline" style={{ color: "#2A9D8F" }}>Forgot Password?</button>
              </div>
              <div className="flex justify-center mt-5">
                <button type="submit" style={{ background: "#2A9D8F" }} className="px-12 py-2.5 text-white text-sm font-semibold rounded-full shadow-md tracking-wide hover:opacity-90 transition-all">LOGIN</button>
              </div>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup} className="w-full flex flex-col gap-1" noValidate>
              <InputRow icon="user"  type="text"     placeholder="Full Name"         value={signupForm.name}     error={signupErrors.name}     onChange={e => updateSignup("name",     e.target.value)}/>
              <InputRow icon="email" type="email"    placeholder="Email"             value={signupForm.email}    error={signupErrors.email}    onChange={e => updateSignup("email",    e.target.value)}/>
              <InputRow icon="lock"  type="password" placeholder="Password"          value={signupForm.password} error={signupErrors.password} onChange={e => updateSignup("password", e.target.value)}/>
              <InputRow icon="lock"  type="password" placeholder="Confirm Password"  value={signupForm.confirm}  error={signupErrors.confirm}  onChange={e => updateSignup("confirm",  e.target.value)}/>
              <div className="flex justify-center mt-5">
                <button type="submit" style={{ background: "#2A9D8F" }} className="px-12 py-2.5 text-white text-sm font-semibold rounded-full shadow-md tracking-wide hover:opacity-90 transition-all">SIGN UP</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;