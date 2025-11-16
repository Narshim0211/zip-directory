import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HairGoalsProvider, useHairGoals } from '../context/HairGoalsContext';
import PageShell from '../components/PageShell';
import HeaderBar from '../components/HeaderBar';
import WeeklyReportCard from '../components/WeeklyReportCard';
import '../styles/hairGoalsDiary.css';

function WeeklyReportsPageContent() {
  const navigate = useNavigate();
  const { weeklyEntries } = useHairGoals();
  
  // Sort entries by week number (newest first)
  const sortedEntries = [...weeklyEntries].sort((a, b) => b.weekNumber - a.weekNumber);
  
  const latestEntry = sortedEntries[0];
  const previousEntries = sortedEntries.slice(1);
  
  return (
    <PageShell>
      <HeaderBar
        title="Your Weekly Reports"
        onBack={() => navigate('/visitor/toolkit/goals')}
      />
      
      <div className="hgd-reports-page">
        {weeklyEntries.length === 0 ? (
          <div className="hgd-reports-empty">
            <div className="hgd-reports-empty-icon">📊</div>
            <h2>No Reports Yet</h2>
            <p>Complete your first weekly check-in to see your reports here.</p>
            <button 
              className="hgd-btn-primary"
              onClick={() => navigate('/visitor/toolkit/goals')}
            >
              Start Your First Check-In
            </button>
          </div>
        ) : (
          <>
            {/* Latest Report */}
            <div className="hgd-reports-latest">
              <h2 className="hgd-reports-section-title">Latest Report</h2>
              <WeeklyReportCard 
                entry={latestEntry}
                allEntries={weeklyEntries}
                isCompact={false}
              />
            </div>
            
            {/* Previous Reports */}
            {previousEntries.length > 0 && (
              <div className="hgd-reports-history">
                <h2 className="hgd-reports-section-title">Previous Weeks</h2>
                <div className="hgd-reports-history-list">
                  {previousEntries.map(entry => (
                    <WeeklyReportCard
                      key={entry.weekNumber}
                      entry={entry}
                      allEntries={weeklyEntries}
                      isCompact={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}

// Wrap with provider
export default function WeeklyReportsPage() {
  return (
    <HairGoalsProvider>
      <WeeklyReportsPageContent />
    </HairGoalsProvider>
  );
}
