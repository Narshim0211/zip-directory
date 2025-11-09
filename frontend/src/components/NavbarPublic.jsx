import React from "react";
import { Link } from "react-router-dom";
import "../styles/NavBar.css";

const NavbarPublic = () => {
  return (
    <nav className="app-navbar">
      <div className="nav-inner">
        <Link to="/" className="brand">SalonHub</Link>
        <div className="links">
          <Link to="/" className="link">Home</Link>
          <Link to="/explore" className="link">Explore</Link>
          <Link to="/register?role=owner" className="link">Join as Business</Link>
          <Link to="/login" className="link">Login</Link>
        </div>
      </div>
    </nav>
  );
};

export default NavbarPublic;
