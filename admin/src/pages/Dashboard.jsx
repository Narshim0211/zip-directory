import React, { useEffect, useState } from 'react';
import { getOverview, listPendingBusinesses, approveBusiness, rejectBusiness } from '../services/admin';
import Button from '../components/ui/Button.jsx';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table.jsx';
import Layout from '../components/layout/Layout.jsx';
import MetricCard from '../components/ui/MetricCard.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [overview, pendingList] = await Promise.all([
          getOverview(),
          listPendingBusinesses(5),
        ]);
        if (mounted) {
          setStats(overview);
          setPending(pendingList);
        }
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load stats');
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (error) return <Layout><div className="p-6 text-red-600">{error}</div></Layout>;
  if (!stats) return <Layout><div className="p-6 text-slate-600">Loading…</div></Layout>;

  return (
    <Layout>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Users" value={stats.totalUsers} delta={'+12%'} color="indigo" icon={<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M16 14a4 4 0 1 0-8 0v1H5a3 3 0 0 0-3 3v2h20v-2a3 3 0 0 0-3-3h-3v-1Z"/><circle cx="12" cy="8" r="4"/></svg>} />
        <MetricCard label="Active Businesses" value={stats.approved} color="violet" icon={<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 21h18v-8H3v8Zm0-10h18V8l-3-4H6L3 8v3Z"/></svg>} />
        <MetricCard label="Reviews This Month" value={stats.totalReviews} color="pink" icon={<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 21 3 8h18l-9 13Zm0-8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg>} />
        <MetricCard label="Pending Today" value={stats.pending} color="orange" icon={<svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm1-10V7h-2v7h6v-2h-4Z"/></svg>} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Growth Trends</h2>
          <div className="h-52 rounded-md bg-gradient-to-br from-indigo-50 to-cyan-50" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Engagement Overview</h2>
          <div className="h-52 rounded-md bg-gradient-to-br from-pink-50 to-violet-50" />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-[var(--panel)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Pending Business Approvals</h2>
            <span className="text-xs text-slate-500">Top {Math.min(5, pending.length)} shown</span>
          </div>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-600">No pending businesses.</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Owner</TH>
                  <TH>Category</TH>
                  <TH>City</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {pending.map((b) => (
                  <TR key={b._id}>
                    <TD>{b.name}</TD>
                    <TD>{b.owner?.name || '-'}</TD>
                    <TD>{b.category || '-'}</TD>
                    <TD>{b.city || '-'}</TD>
                    <TD className="text-right space-x-2">
                      <Button onClick={async()=>{ await approveBusiness(b._id); setPending(prev=>prev.filter(x=>x._id!==b._id)); }}>Approve</Button>
                      <Button variant="danger" onClick={async()=>{ await rejectBusiness(b._id); setPending(prev=>prev.filter(x=>x._id!==b._id)); }}>Reject</Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent Signups</h2>
          <p className="text-sm text-slate-500">Coming soon</p>
        </div>
      </section>
    </Layout>
  );
}

