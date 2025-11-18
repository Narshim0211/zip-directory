import React from "react";
import { Outlet } from "react-router-dom";
import NavbarPublic from "../components/NavbarPublic";

export default function PublicLayout() {
  return (
    <>
      <NavbarPublic />
      <main>
        <Outlet />
      </main>
    </>
  );
}
