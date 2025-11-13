import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Home", path: "/visitor/home", icon: "H" },
  { label: "Explore", path: "/explore", icon: "E" },
  { label: "Surveys", path: "/surveys", icon: "S" },
  { label: "Notifications", path: "/notifications", icon: "N" },
  { label: "My Toolkit", path: "/visitor/toolkit", icon: "T" },
  { label: "Time Manager", path: "/visitor/time", icon: "⏱" },
  { label: "Profile", path: "/visitor/profile", icon: "P" },
];

export default function SidebarNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="sidebar-nav">
      <div className="sidebar-nav__logo">SalonHub</div>
      <nav className="sidebar-nav__links">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-nav__link${isActive ? " sidebar-nav__link--active" : ""}`
            }
          >
            <span className="sidebar-nav__link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-nav__actions">
        {user ? (
          <button type="button" className="sidebar-nav__logout" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button type="button" className="sidebar-nav__logout" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>
      <p className="sidebar-nav__help">Browse salons, follow top creators, and stay updated.</p>
    </div>
  );
}
