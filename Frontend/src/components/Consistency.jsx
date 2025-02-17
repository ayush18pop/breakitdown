import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Tooltip from './ToolTip'; // Import the Tooltip component

const Consistency = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [activityData, setActivityData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCardsStudied = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('https://breakitdown-psi.vercel.app/api/cardsStudied', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cards studied');
        }

        const cardsStudiedData = await response.json();
        setActivityData(cardsStudiedData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching cards studied:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardsStudied();
  }, [getAccessTokenSilently]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Generate the grid for the past year (52 weeks)
  const totalDays = 39; // Total columns for 52 weeks
  const today = new Date();
  const grid = [];

  // Create 7 rows
  for (let row = 0; row < 7; row++) {
    const weekRow = [];
    for (let col = 0; col < totalDays; col++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (col * 7 + row)); // Adjust date for each column and row
      const dateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      const studiedCount = activityData[dateString]?.numberOfCards || 0;

      weekRow.push(
        <Tooltip key={`${dateString}-${row}`} content={`${dateString}: ${studiedCount} card(s) studied`}>
          <div
            className={`w-4 h-4  border ${studiedCount > 0 ? 'bg-green-500' : 'bg-gray-300'} m-0.5 rounded-sm`} // Adjusted Tailwind classes
          ></div>
        </Tooltip>
      );
    }
    grid.push(
      <div key={row} className="flex flex-row"> {/* Each row is a flex row */}
        {weekRow}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <h3 className="text-lg font-semibold mb-4">Activity</h3>
      <div className="flex flex-col">
        {grid}
      </div>
    </div>
  );
};

export default Consistency;
