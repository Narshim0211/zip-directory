import React from "react";
import { Link } from "react-router-dom";
import "../styles/NavBar.css";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const NavbarPrivate = () => {
  const { user, logout } = useAuth();
  const role = user?.role || "visitor";
  return (
    <nav className="app-navbar">
      <div className="nav-inner">
        <Link to="/" className="brand">SalonHub</Link>
        <div className="links">
          <div className="nav-links">
            {role === "owner" ? (
              <>
                <Link to="/owner/dashboard" className="link">Dashboard</Link>
                <Link to="/owner" className="link">My Business</Link>
                <Link to="/explore" className="link">Explore</Link>
              </>
            ) : (
              <>
                <Link to="/visitor/home" className="link">Home</Link>
                <Link to="/explore" className="link">Explore</Link>
                <Link to="/profile" className="link">Profile</Link>
              </>
            )}
          </div>
          <div className="nav-actions">
            <NotificationBell />
            <button className="link" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarPrivate;
