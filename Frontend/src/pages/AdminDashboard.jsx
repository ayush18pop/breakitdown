import React, { useState } from 'react';
import '../dashboardcss.css';
import Profile from '../components/Profile';
import Charts from '../components/Charts';
import Consistency from '../components/Consistency';
import History from '../components/History';

function AdminDashboard() {
  const [showCharts, setShowCharts] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="min-h-screen font-newstar p-4 flex flex-col items-center border border-gray-300 rounded-lg">
      <h1 className="text-5xl mb-6 border-b border-gray-300 pb-2">Admin Dashboard</h1>
      <div className="profile-container mb-4 border border-gray-300 p-4 rounded-lg">
        <Profile />
      </div>
      <div className="button-container mb-4 flex space-x-4 mt-5">
        <button onClick={() => setShowCharts(!showCharts)}>
          {showCharts ? 'Hide Charts' : 'Show Charts'}
        </button>
        <button onClick={() => setShowActivity(!showActivity)}>
          {showActivity ? 'Hide Activity Grid' : 'Show Activity Grid'}
        </button>
        <button onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>
      <div className="dashboard-container flex flex-col items-center border border-gray-300 p-4 rounded-lg">
        {showCharts && <div className="line-chart">
          <Charts />
        </div>}
        {showActivity && <div className="h-128">
          <Consistency />
        </div>}
        {showHistory && <History />}
      </div>
    </div>
  );
}

export default AdminDashboard;