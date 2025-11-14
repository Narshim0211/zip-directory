import React from "react";
import "../toolkit.css";

export default function PageShell({ children, fullWidth = false }) {
	const className = `toolkit-shell${fullWidth ? " toolkit-shell--full" : ""}`;
	return (
		<div className={className}>
			<div className="toolkit-shell__inner">{children}</div>
		</div>
	);
}
