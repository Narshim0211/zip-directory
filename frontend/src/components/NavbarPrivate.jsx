import React from "react";
import { Link } from "react-router-dom";
import "../styles/NavBar.css";
import { useAuth } from "../context/AuthContext";

const NavbarPrivate = () => {
  const { user, logout } = useAuth();
  const role = user?.role || "visitor";
  return (
    <nav className="app-navbar">
      <div className="nav-inner">
        <Link to="/" className="brand">SalonHub</Link>
        <div className="links">
        {role === 'owner' ? (
          <>
            <Link to="/owner/home" className="link">Dashboard</Link>
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
          <button className="link" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarPrivate;
