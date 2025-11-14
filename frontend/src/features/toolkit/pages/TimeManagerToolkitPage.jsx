import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import HeaderBar from "../components/HeaderBar";
import "../toolkit.css";
import "../../timeManager/styles/timeManagerNew.css";
import DailyView from "../../timeManager/pages/visitor/DailyView";
import WeeklyView from "../../timeManager/pages/visitor/WeeklyView";
import MonthlyView from "../../timeManager/pages/visitor/MonthlyView";

const VIEWS = ["daily", "weekly", "monthly"];

export default function TimeManagerToolkitPage() {
	const navigate = useNavigate();
	const [active, setActive] = useState("daily");

	const renderView = useMemo(() => {
		if (active === "weekly") return <WeeklyView />;
		if (active === "monthly") return <MonthlyView />;
		return <DailyView />;
	}, [active]);

	return (
		<PageShell fullWidth>
			<HeaderBar title="Time Manager" subtitle="Plan your week, month, and today" onBack={() => navigate("/visitor/toolkit")} />
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
