import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('https://breakitdown-psi.vercel.app/api/user/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setHistory(data.history);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, [getAccessTokenSilently]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Learned Cards History</h1>
      <select id="historyDropdown" className="mb-4 w-full p-2 border rounded-md">
        {history.map((card, index) => (
          <option key={index} value={card.title}>
            {card.title} - {card.content} - {new Date(card.learnedAt).toLocaleString()}
          </option>
        ))}
      </select>
    </div>
  );
};

export default History;