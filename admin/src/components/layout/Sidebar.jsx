import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const linkBase = 'block w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors';
  const active = 'bg-white text-indigo-700 font-medium shadow-sm';
  const idle = 'text-white/90 hover:bg-white/10';

  const Item = ({ to, icon, label }) => (
    <NavLink to={to} className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}>
      <span className="inline-flex h-5 w-5 items-center justify-center text-white">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="h-full w-64 shrink-0 bg-gradient-to-b from-indigo-600 via-indigo-600 to-cyan-500 text-white p-4 overflow-y-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-white/20 text-white font-bold">A</div>
        <div>
          <p className="text-xs text-white/70">SalonHub</p>
          <p className="text-base font-semibold">Super Admin</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-white/60">Overview</p>
          <div className="space-y-2">
            <Item to="/dashboard" label="Dashboard" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M3 13h8V3H3v10zM13 21h8v-8h-8v8zM13 3v8h8V3h-8zM3 21h8v-6H3v6z"/></svg>} />
          </div>
        </div>
      </div>
    </aside>
  );
}

