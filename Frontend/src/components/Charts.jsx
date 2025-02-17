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
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4, // Smooth curves
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
    
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Number of Cards Studied',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="flex justify-center items-center w-full h-full p-4">
      <div className="w-full max-w-4xl h-96">
        <h3 className="text-center mb-4">Cards Studied Over Time</h3>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Charts;