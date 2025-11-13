import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import QuoteBanner from '../components/QuoteBanner';
import ProgressAnalytics from '../components/ProgressAnalytics';
import DailyPlanner from '../components/DailyPlanner';
import WeeklyPlanner from '../components/WeeklyPlanner';
import MonthlyPlanner from '../components/MonthlyPlanner';
import usePlannerApi from '../hooks/usePlannerApi';
import '../styles/timeManager.css';

export default function TimeManagerPage({ role = 'visitor' }) {
  const location = useLocation();
  const api = usePlannerApi({ role });
  const [tasks, setTasks] = useState([]);

  // Load tasks for analytics summary
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const data = await api.getDaily(today);
        const arr = Array.isArray(data) ? data : data?.tasks || [];
        if (mounted) setTasks(arr);
      } catch (_) {}
    })();
    return () => { mounted = false; };
  }, []);

  const activeView = location.pathname.endsWith('/daily') ? 'daily' 
    : location.pathname.endsWith('/weekly') ? 'weekly' 
    : location.pathname.endsWith('/monthly') ? 'monthly'
    : 'daily';

  return (
    <div className="tm-container">
      <QuoteBanner role={role} />
      <ProgressAnalytics tasks={tasks} />
      
      <div className="tm-nav">
        <NavLink to={`${role === 'owner' ? '/owner' : '/visitor'}/time/daily`} className={activeView === 'daily' ? 'active' : ''}>
          Daily
        </NavLink>
        <NavLink to={`${role === 'owner' ? '/owner' : '/visitor'}/time/weekly`} className={activeView === 'weekly' ? 'active' : ''}>
          Weekly
        </NavLink>
        <NavLink to={`${role === 'owner' ? '/owner' : '/visitor'}/time/monthly`} className={activeView === 'monthly' ? 'active' : ''}>
          Monthly
        </NavLink>
      </div>

      {activeView === 'daily' && <DailyPlanner role={role} />}
      {activeView === 'weekly' && <WeeklyPlanner role={role} />}
      {activeView === 'monthly' && <MonthlyPlanner role={role} />}
    </div>
  );
}
