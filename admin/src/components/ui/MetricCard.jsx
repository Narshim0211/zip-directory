import React from 'react';

export default function MetricCard({ icon, label, value, delta, color = 'indigo' }) {
  const ring = {
    indigo: 'bg-indigo-50 text-indigo-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    violet: 'bg-violet-50 text-violet-600',
    orange: 'bg-orange-50 text-orange-600',
    pink: 'bg-pink-50 text-pink-600',
  }[color] || 'bg-indigo-50 text-indigo-600';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${ring}`}>{icon}</div>
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
            {delta && <span className="text-xs font-medium text-emerald-600">{delta}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

