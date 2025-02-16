import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Charts = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCardsStudied = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('http://localhost:3000/api/cardsStudied', {
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
        setData(cardsStudiedData);
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
  if (!data) return <p>No data available.</p>;

  // Prepare data for the chart
  const labels = Object.keys(data); // Dates
  const dataPoints = Object.values(data).map(entry => entry.numberOfCards); // Number of cards studied

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Cards Studied',
        data: dataPoints,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
      },
    ],
  };

  return (
    <div className="w-[600px] h-[400px]">
      <h3>Cards Studied Over Time</h3>
      <Line data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 16 / 9,
      }} />
    </div>
  );
};

export default Charts;