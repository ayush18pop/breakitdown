
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('http://localhost:3000/api/user/history', {
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

import React from 'react';

const History = () => {
  const history = [
    { id: 1, question: 'Two Sum', date: '2023-10-01' },
    { id: 2, question: 'Reverse Linked List', date: '2023-10-02' },
    { id: 3, question: 'Binary Search', date: '2023-10-03' },
  ];

  return (
    <div className="history-section" style={{ padding: '20px', fontSize: '18px' }}>
      <h3>History</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {history.map((item) => (
          <li key={item.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            {item.question} - {item.date}
          </li>
        ))}
      </ul>

    </div>
  );
};

export default History;