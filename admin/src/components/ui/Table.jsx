import React from 'react';

export function Table({ children }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-[var(--panel)]">
      <table className="min-w-full divide-y divide-slate-200">{children}</table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="bg-[var(--panel-alt)] text-left text-xs uppercase tracking-wider text-slate-500">
      {children}
    </thead>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-slate-200 text-sm text-slate-800">{children}</tbody>;
}

export function TR({ children }) { return <tr className="hover:bg-violet-50">{children}</tr>; }
export function TH({ children, className = '' }) { return <th className={`px-4 py-2 ${className}`}>{children}</th>; }
export function TD({ children, className = '' }) { return <td className={`px-4 py-2 ${className}`}>{children}</td>; }

