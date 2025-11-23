import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "../styles/NavBar.css";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <header className="app-navbar">
      <div className="nav-inner">
        <NavLink to="/" className="brand" end>
          SalonHub
        </NavLink>
        <nav className="links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "link active" : "link")}>Home</NavLink>
          <NavLink to="/visitor" className={({ isActive }) => (isActive ? "link active" : "link")}>Explore</NavLink>
          <NavLink to="/recent" className={({ isActive }) => (isActive ? "link active" : "link")}>Recent Activity</NavLink>
          {user?.role === 'owner' && (
            <>
              <NavLink to="/owner" className={({ isActive }) => (isActive ? "link active" : "link")}>Add Business</NavLink>
              <NavLink to="/dashboard/owner" className={({ isActive }) => (isActive ? "link active" : "link")}>Dashboard</NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? "link active" : "link")}>Admin</NavLink>
          )}
          {!user ? (
            <>
              <Link className="link" to="/login">Login</Link>
              <Link className="link" to="/register">Register</Link>
            </>
          ) : (
            <>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? "link active" : "link")}>Hi, {user.name}</NavLink>
              <button className="link" onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
