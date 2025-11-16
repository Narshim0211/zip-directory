import React from "react";

class HairGoalsErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		console.error("Hair Goals Error:", error, errorInfo);
	}

	handleReset = () => {
		// Clear localStorage and reset
		const keys = [
			"hairGoals_selectedGoal",
			"hairGoals_photos",
			"hairGoals_progress",
			"hairGoals_unlockedStickers",
			"hairGoals_streak",
			"hairGoals_lastUpdate"
		];
		keys.forEach(key => localStorage.removeItem(key));
		this.setState({ hasError: false, error: null });
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div style={{
					padding: "48px 24px",
					textAlign: "center",
					background: "#fef2f2",
					borderRadius: "16px",
					border: "1px solid #fecaca",
					margin: "24px"
				}}>
					<div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>
					<h2 style={{ color: "#991b1b", marginBottom: "12px" }}>Oops! Something went wrong</h2>
					<p style={{ color: "#7f1d1d", marginBottom: "24px" }}>
						Don't worry, your toolkit is safe. Just this feature needs a refresh.
					</p>
					<button
						onClick={this.handleReset}
						style={{
							background: "#dc2626",
							color: "white",
							border: "none",
							borderRadius: "12px",
							padding: "12px 32px",
							fontSize: "1rem",
							fontWeight: "600",
							cursor: "pointer",
							boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)"
						}}
					>
						Reset Hair Goals
					</button>
					<button
						onClick={() => window.history.back()}
						style={{
							background: "transparent",
							border: "1px solid #dc2626",
							color: "#dc2626",
							borderRadius: "12px",
							padding: "12px 32px",
							fontSize: "1rem",
							fontWeight: "600",
							cursor: "pointer",
							marginLeft: "12px"
						}}
					>
						Go Back
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export default HairGoalsErrorBoundary;
