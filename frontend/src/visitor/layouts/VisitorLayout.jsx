import React from "react";
import { Outlet } from "react-router-dom";
import VisitorSidebar from "../components/VisitorSidebar";
import TrendingNewsSidebar from "../components/TrendingNewsSidebar";
import "../../styles/visitorLayout.css";

export default function VisitorLayout() {
  return (
    <div className="visitor-layout">
      <aside className="visitor-layout__sidebar">
        <VisitorSidebar />
      </aside>

      <main className="visitor-layout__main">
        <section className="visitor-layout__content">
          <Outlet />
        </section>

        <div className="visitor-layout__news">
          <TrendingNewsSidebar />
        </div>
      </main>
    </div>
  );
}
