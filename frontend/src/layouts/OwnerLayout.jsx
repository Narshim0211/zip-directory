import React from "react";
import { Outlet } from "react-router-dom";
import OwnerSidebar from "../components/OwnerSidebar";
import "../styles/ownerSidebar.css";
import "../styles/ownerLayout.css";

export default function OwnerLayout() {
  return (
    <div className="owner-layout">
      <aside className="owner-layout__sidebar">
        <OwnerSidebar />
      </aside>
      <main className="owner-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
