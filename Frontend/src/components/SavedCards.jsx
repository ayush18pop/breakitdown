import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const SavedCards = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedCards = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('https://breakitdown-psi.vercel.app/api/user/saved-cards', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch saved cards');
        }

        const data = await response.json();
        setCards(data.cards);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedCards();
  }, [getAccessTokenSilently]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!cards.length) return <div>No saved cards available.</div>;

  return (
    <div className="saved-cards-container">
      {cards.map((card, index) => (
        <div key={index} className="flashcard border p-4 rounded-lg shadow-md mb-4">
          <h3 className="font-bold text-lg">{card.title}</h3>
          <p>{card.content}</p>
        </div>
      ))}
    </div>
  );
};

export default SavedCards;