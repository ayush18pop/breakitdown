import React, { useState } from 'react';
import Profile from '../components/Profile';
import Charts from '../components/Charts';
import Consistency from '../components/Consistency';
import History from '../components/History';
import SavedCards from '../components/SavedCards';
function AdminDashboard() {
  const [activeButton, setActiveButton] = useState('charts');

  const handleButtonClick = (button) => {
    setActiveButton(button);
  };

  return (
    <div className="min-h-screen font-newstar p-6 flex flex-col items-center border border-gray-300 rounded-lg shadow-lg bg-white">

      <div className="profile-container mb-4 border border-gray-300 p-4 rounded-lg shadow-md bg-gray-50">
        <Profile />
      </div>
      <div className="button-container mb-4 flex space-x-4 mt-5">
        <button 
          onClick={() => handleButtonClick('charts')} 
          className={`px-4 py-2 rounded-lg transition duration-300 ${activeButton === 'charts' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'}`}
        >
          {activeButton === 'charts' ? 'Analytics' : 'Analytics'}
        </button>
        
        
        <button 
          onClick={() => handleButtonClick('history')} 
          className={`px-4 py-2 rounded-lg transition duration-300 ${activeButton === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'}`}
        >
          {activeButton === 'history' ? 'History' : 'History'}
        </button>
        <button 
          onClick={() => handleButtonClick('savedCards')} 
          className={`px-4 py-2 rounded-lg transition duration-300 ${activeButton === 'savedCards' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'}`}
        >
          Saved Cards
        </button>
      </div>
      <div className="dashboard-container flex flex-col items-center border border-gray-300 p-4 rounded-lg shadow-md bg-gray-50 w-full">
        {activeButton === 'charts' && <div className="line-chart w-full"><Charts /><br/><br/><Consistency /></div>}
        {activeButton === 'activity' && <div className="h-128 w-full"></div>}
        {activeButton === 'history' && <History />}
        {activeButton === 'savedCards' && <SavedCards />}
      </div>
    </div>
  );
}

export default AdminDashboard;