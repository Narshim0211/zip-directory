import React from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function Layout({ children, onSignOut }) {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex min-w-0 grow flex-col">
        <Topbar onSignOut={onSignOut} />
        <main className="min-w-0 grow overflow-y-auto bg-[var(--bg)]">
          <div className="mx-auto max-w-7xl p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

