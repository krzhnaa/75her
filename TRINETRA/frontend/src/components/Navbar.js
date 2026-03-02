import { NavLink } from "react-router-dom";

export default function Navbar() {
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/deepfake", label: "Deepfake" },
    { to: "/safe-route", label: "Safe Route" },
    { to: "/harassment", label: "Harassment AI" },
  ];

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <div className="brand">TRINETRA</div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
