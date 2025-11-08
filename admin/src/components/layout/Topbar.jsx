import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Topbar({ onSignOut }) {
  const { pathname } = useLocation();
  const title = ({ '/dashboard': 'Dashboard' }[pathname]) || 'Admin';
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-[var(--panel)]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold text-slate-800">SalonHub Admin</h1>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 md:flex">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input className="w-56 outline-none placeholder:text-slate-400" placeholder="Search" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-500 md:inline">{title}</span>
          <button className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200">
            <img alt="avatar" src="https://i.pravatar.cc/80?img=13" className="h-full w-full object-cover" />
          </div>
          <button className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-sm text-white hover:bg-[var(--brand-strong)]" onClick={onSignOut}>Logout</button>
        </div>
      </div>
    </header>
  );
}

