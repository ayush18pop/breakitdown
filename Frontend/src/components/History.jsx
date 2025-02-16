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