import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Charts = () => {
    const activityData = JSON.parse(localStorage.getItem('activityData')) || [];
    const labels = activityData.map(item => item.date);
    const dataPoints = activityData.map(item => item.count);
    
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Questions Solved',
          data: dataPoints,
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false,
        },
      ],
  };

  return (
    <div className="w-[600px] h-[400px]">
      <h3>Questions Solved Over Time</h3>
      <Line data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 16/9,
      }}
      />
    </div>
  );
};

export default Charts;