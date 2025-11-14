import React from "react";
import "../styles/timeManagerNew.css";

export default function ProgressBar({ completed, total }) {
  const percent = total ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  return (
    <div className="tm-progress">
      <div className="tm-progress__bar">
        <div className="tm-progress__fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="tm-progress__text">
        {completed}/{total} ({percent}%)
      </span>
    </div>
  );
}
