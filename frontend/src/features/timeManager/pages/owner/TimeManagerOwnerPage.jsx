import React, { useMemo, useState } from "react";
import PageShell from "../../../toolkit/components/PageShell";
import HeaderBar from "../../../toolkit/components/HeaderBar";
import "../../styles/timeManagerNew.css";
import DailyView from "../visitor/DailyView";
import WeeklyView from "../visitor/WeeklyView";
import MonthlyView from "../visitor/MonthlyView";

const VIEWS = ["daily", "weekly", "monthly"];

export default function TimeManagerOwnerPage() {
  const [active, setActive] = useState("daily");
  const renderView = useMemo(() => {
    if (active === "weekly") return <WeeklyView role="owner" />;
    if (active === "monthly") return <MonthlyView role="owner" />;
    return <DailyView role="owner" />;
  }, [active]);

  return (
    <PageShell fullWidth>
      <HeaderBar title="Owner Time Manager" subtitle="Plan your owner schedule" />
      <div className="tm-tabs">
        {VIEWS.map((view) => (
          <button
            key={view}
            type="button"
            className={`tm-tab${active === view ? " tm-tab--active" : ""}`}
            onClick={() => setActive(view)}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>
      <div className="toolkit-full-panel">{renderView}</div>
    </PageShell>
  );
}
