import React from "react";
import "../toolkit.css";

export default function ToolkitCard({
	title,
	description,
	badge,
	ctaText = "Open",
	onClick,
	locked,
	disabled,
}) {
	const className = `toolkit-card${locked ? " toolkit-card--locked" : ""}${disabled ? " toolkit-card--disabled" : ""}`;
	return (
		<button
			type="button"
			className={className}
			disabled={disabled}
			onClick={onClick}
		>
			<div className="toolkit-card__head">
				<div className="toolkit-card__badge">{badge}</div>
				{locked && <span className="toolkit-card__lock">Premium</span>}
			</div>
			<div className="toolkit-card__body">
				<h3>{title}</h3>
				<p>{description}</p>
			</div>
			<div className="toolkit-card__cta">
				<span>{locked ? "Unlock" : ctaText}</span>
				<span aria-hidden="true">→</span>
			</div>
		</button>
	);
}
