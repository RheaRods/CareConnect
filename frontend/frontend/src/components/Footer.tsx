import logo from "../assets/logo.png";
const Footer = () => (
  <footer id="footer" style={{ background: "#21867A" }} className="w-full">
    <div className="w-full px-12 py-12 grid grid-cols-4 gap-12">

      {/* Brand */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {/* IMAGE SLOT 2 */}
          <div style={{ background: "#ffffff", border: "1.5px solid #e8f5f4" }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0">
            <img src={logo} className="w-7 h-7 object-contain" />
          </div>
          <span className="text-base font-bold text-white">CareConnect</span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          Trusted home services at your doorstep. Book a professional in minutes.
        </p>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">Links</h4>
        <nav className="flex flex-col gap-2">
          <a href="/" className="text-sm transition-colors" style={{ color: "rgba(255,255,255,0.65)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}>
            Home
          </a>
        </nav>
      </div>

      {/* Services */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">Services</h4>
        <nav className="flex flex-col gap-2">
          {["Book a Service", "My Bookings"].map((label) => (
            <a key={label} href="#" className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.65)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}>
              {label}
            </a>
          ))}
        </nav>
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">Contact Us</h4>
        <div className="flex flex-col gap-2">
          <a href="tel:+911234567890" className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.65)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}>
            <span>📞</span> +91 12345 67890
          </a>
          <a href="mailto:hello@homefixr.com" className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.65)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}>
            <span>✉️</span> hello@CareConnect.com
          </a>
        </div>
      </div>

    </div>
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
      className="w-full px-12 py-4 flex items-center justify-center">
      <p className="text-xs" style={{ color: "#ffff" }}>
        © {new Date().getFullYear()} CareConnect. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;