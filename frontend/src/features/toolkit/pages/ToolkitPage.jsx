import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import ToolkitCard from "../components/ToolkitCard";
import useToolkitAccess from "../hooks/useToolkitAccess";
import "../toolkit.css";

export default function ToolkitPage() {
	const navigate = useNavigate();
	const { isSubscribed, triggerPaywall, toastMessage, loading } = useToolkitAccess();

	const openCard = (path, requiresSubscription) => {
		if (requiresSubscription && !isSubscribed) {
			triggerPaywall();
			return;
		}
		navigate(path);
	};

	return (
		<PageShell>
			{toastMessage && <div className="toolkit-paywall-toast">{toastMessage}</div>}
			<div>
				<p className="toolkit-eyebrow">My Tools</p>
				<h2 className="toolkit-eyebrow__title">Choose your studio</h2>
			</div>

			<div className="toolkit-grid">
					<ToolkitCard
					title="Time Manager"
					description="Plan your day and week with a drag-and-drop timeline."
					badge="Free"
					ctaText="Open Planner"
					onClick={() => openCard("/visitor/toolkit/time/daily", false)}
				/>

				<ToolkitCard
					title="AI Style Advisor"
					description="Hair try-ons, outfits, and chat-based beauty coaching."
					badge="Premium"
					onClick={() => openCard("/visitor/toolkit/style-advisor", true)}
					locked={!isSubscribed}
					disabled={loading}
				/>

				<ToolkitCard
					title="Hair Goals AI"
					description="Set futuristic hair goals with reminders and AI inspiration."
					badge="Premium"
					onClick={() => openCard("/visitor/toolkit/goals", true)}
					locked={!isSubscribed}
					disabled={loading}
				/>
			</div>
		</PageShell>
	);
}
