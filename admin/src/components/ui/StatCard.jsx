import React from 'react';

export default function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-[var(--panel)] p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
      <div className="mt-3 h-1 w-12 rounded bg-[var(--brand)]" aria-hidden />
    </div>
  );
}

