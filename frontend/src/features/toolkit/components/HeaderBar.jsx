import React from "react";
import "../toolkit.css";

export default function HeaderBar({ title, subtitle, onBack, actions }) {
	return (
		<header className="toolkit-header">
			{onBack ? (
				<button type="button" className="toolkit-header__back" onClick={onBack}>
					<span aria-hidden="true">←</span>
					<span className="toolkit-header__back-label">Back</span>
				</button>
			) : (
				<div style={{ width: 80 }} />
			)}
			<div className="toolkit-header__titles">
				<h1>{title}</h1>
				{subtitle && <p>{subtitle}</p>}
			</div>
			<div className="toolkit-header__actions">{actions || null}</div>
		</header>
	);
}
