import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NavbarPublic from "../components/NavbarPublic";
import NavbarPrivate from "../components/NavbarPrivate";

export default function PublicLayout() {
  const { user } = useAuth();

  return (
    <>
      {user ? <NavbarPrivate /> : <NavbarPublic />}
      <main>
        <Outlet />
      </main>
    </>
  );
}
