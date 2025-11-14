import React from "react";
import "../styles/timeManagerNew.css";

export default function ReminderToggle({ enabled, onChange, time }) {
  return (
    <div className="tm-reminder-toggle">
      <label>
        <input type="checkbox" checked={enabled} onChange={(e) => onChange(e.target.checked)} />
        Set Reminder
      </label>
      {enabled && <input type="time" value={time} onChange={(e) => onChange(enabled, e.target.value)} />}
    </div>
  );
}
