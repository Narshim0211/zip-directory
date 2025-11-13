import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import visitorTimeApi from "../../api/visitorTimeApi";
import AIAdvisorCard from "../../components/AIAdvisorCard";
import HairGoalsCard from "../../components/HairGoalsCard";
import StyleBoardCard from "../../components/StyleBoardCard";
import PersonalizedNewsFeed from "../../components/PersonalizedNewsFeed";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import "../../styles/visitorProfile.css";
import "../../shared/components/time/TaskCard.css";

export default function VisitorToolkit() {
	const [todayTasks, setTodayTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true);
				setError(null);
				const today = new Date().toISOString().split("T")[0];
				const data = await visitorTimeApi.getDailyTasks(today);
				setTodayTasks(Array.isArray(data) ? data : data?.tasks || []);
			} catch (e) {
				setError(e.response?.data?.message || e.message || "Failed to load tasks");
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	return (
		<div className="visitor-profile-page">
			<header className="visitor-profile-page__header">
				<h1>My Toolkit</h1>
				<p>Your personal tools and planners</p>
			</header>

			{/* Time Manager Section */}
			<section className="panel">
				<div className="panel-head" style={{ alignItems: "center" }}>
					<div>
						<div className="panel-title">Time Manager</div>
						<div className="panel-sub">Plan your day and week</div>
					</div>
					<div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
						<Link to="/visitor/time/daily" className="btn btn-primary">Open Daily Planner</Link>
						<Link to="/visitor/time/weekly" className="btn btn-secondary">Open Weekly Planner</Link>
					</div>
				</div>

				{loading ? (
					<LoadingSpinner message="Loading today's tasks..." />
				) : error ? (
					<div className="error-message">
						<p>{error}</p>
						<Link to="/visitor/time/daily" className="btn btn-secondary">Open Planner</Link>
					</div>
				) : todayTasks.length === 0 ? (
					<div className="empty" style={{ textAlign: "center" }}>
						No tasks scheduled for today.
						<div style={{ marginTop: 12 }}>
							<Link to="/visitor/time/daily" className="btn btn-secondary">Create your first task</Link>
						</div>
					</div>
				) : (
					<div className="cards-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
						{todayTasks.slice(0, 6).map((t) => (
							<div key={t._id || t.id} className="task-card">
								<div className="task-card-header">
									<div className="task-info">
										<h4 className="task-title">{t.title || t.name}</h4>
										{t.description && <p className="task-description">{t.description}</p>}
									</div>
								</div>
								<div className="task-card-meta">
									{t.session && (
										<div className="meta-item">
											<span className="meta-label">Session:</span>
											<span className="meta-value">{t.session}</span>
										</div>
									)}
									{t.estimatedDuration && (
										<div className="meta-item">
											<span className="meta-label">Duration:</span>
											<span className="meta-value">{t.estimatedDuration}m</span>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			{/* Existing Toolkit Modules */}
			<AIAdvisorCard />
			<HairGoalsCard />
			<StyleBoardCard />
			<PersonalizedNewsFeed />
		</div>
	);
}
