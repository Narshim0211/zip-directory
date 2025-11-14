import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import HeaderBar from "../components/HeaderBar";
import "../toolkit.css";
import "./hairGoals.css";

const GOALS = [
	"Grow",
	"Maintain",
	"Cut Shorter",
	"Color Change",
	"Extensions",
	"Volume Boost",
];

const LOOKS = [
	{ id: "sunrise", label: "Sunrise Layers", time: "7 months", mood: "Light" },
	{ id: "midnight", label: "Midnight Bob", time: "3 months", mood: "Bold" },
	{ id: "aerate", label: "Aero Volume", time: "5 months", mood: "Playful" },
];

export default function HairGoalsPage() {
	const navigate = useNavigate();
	const [selectedGoal, setSelectedGoal] = useState(GOALS[0]);
	const [reminderEnabled, setReminderEnabled] = useState(true);
	const [matchingMessage, setMatchingMessage] = useState("Drag a look to the ring to see how long it takes.");
	const [progress] = useState(42);
	const [draggingLook, setDraggingLook] = useState(null);

	const ringStyle = useMemo(() => {
		const circumference = 2 * Math.PI * 40;
		const offset = circumference - (progress / 100) * circumference;
		return {
			strokeDasharray: circumference,
			strokeDashoffset: offset,
		};
	}, [progress]);

	const handleDragStart = (look) => {
		setDraggingLook(look);
		setMatchingMessage("Release over the ring to lock it.");
	};

	const handleDragEnd = () => {
		if (!draggingLook) return;
		setMatchingMessage(`Matched ${draggingLook.label}. Estimated ${draggingLook.time}.`);
		setDraggingLook(null);
	};

	return (
		<PageShell fullWidth>
			<HeaderBar
				title="Hair Goals"
				subtitle="Set it once, let AI handle the rest."
				onBack={() => navigate("/visitor/toolkit")}
			/>

			<div className="hair-goals-grid">
				<section className="hair-goals-panel hair-goals-setup">
					<div className="hair-goals-panel__header">
						<h3>Auto goal capture</h3>
						<p>Your camera is on — we read hair length, strands, thickness, and color.</p>
					</div>
					<div className="hair-goals-camera">
						<div className="hair-goals-camera__lens" />
						<div className="hair-goals-camera__text">Auto photo captured</div>
					</div>
					<select
						value={selectedGoal}
						onChange={(event) => setSelectedGoal(event.target.value)}
						className="hair-goals-select"
					>
						{GOALS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</section>

				<section className="hair-goals-panel hair-goals-progress">
					<div className="hair-goals-panel__header">
						<h3>Progress ring</h3>
						<p>{`Goal: ${selectedGoal}`}</p>
					</div>
					<div className="hair-goals-ring">
						<svg width="120" height="120">
							<circle cx="60" cy="60" r="40" />
							<circle className="hair-goals-ring__progress" cx="60" cy="60" r="40" style={ringStyle} />
						</svg>
						<div className="hair-goals-ring__label">
							<span>{`${progress}%`}</span>
							<small>toward glowy length</small>
						</div>
					</div>
					<div className="hair-goals-message">{matchingMessage}</div>
				</section>

				<section className="hair-goals-panel hair-goals-reminder">
					<div className="hair-goals-panel__header">
						<h3>Monthly reminder</h3>
						<p>Auto nudge for trims, toners, and treatments.</p>
					</div>
					<div className="hair-goals-reminder__body">
						<div>
							<p>Next nudgie: <strong>Ready for trim?</strong></p>
							<p className="hair-goals-reminder__date">{new Date().toDateString()}</p>
						</div>
						<button
							type="button"
							className={`hair-goals-toggle ${reminderEnabled ? "hair-goals-toggle--active" : ""}`}
							onClick={() => setReminderEnabled((prev) => !prev)}
						>
							{reminderEnabled ? "Reminder ON" : "Reminder OFF"}
						</button>
					</div>
					<p className="hair-goals-reminder__hint">Silent buzz. Tap to open curated salon list.</p>
				</section>

				<section className="hair-goals-panel hair-goals-inspiration">
					<div className="hair-goals-panel__header">
						<h3>Drag to match inspiration</h3>
						<p>Long-press heart to see saved AI looks.</p>
					</div>
					<div className="hair-goals-inspiration-grid">
						{LOOKS.map((look) => (
							<button
								key={look.id}
								type="button"
								className="hair-goals-inspiration-card"
								draggable
								onDragStart={() => handleDragStart(look)}
								onDragEnd={handleDragEnd}
							>
								<div className="hair-goals-inspiration-card__badge">♥</div>
								<div className="hair-goals-inspiration-card__title">{look.label}</div>
								<div className="hair-goals-inspiration-card__meta">{`${look.time} · ${look.mood}`}</div>
							</button>
						))}
					</div>
				</section>
			</div>
		</PageShell>
	);
}
