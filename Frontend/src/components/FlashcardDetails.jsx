import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const FlashcardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('https://breakitdown-ruby.vercel.app/api/user/saved-cards', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flashcards');
        }

        const data = await response.json();
        setFlashcards(data.cards);
        const initialIndex = data.cards.findIndex(card => card._id === id);
        setCurrentIndex(initialIndex);
      } catch (err) {
        console.error('Error fetching flashcards:', err);
      }
    };

    fetchFlashcards();
  }, [id, getAccessTokenSilently]);

  const fetchQuestionAndAnswer = async (content) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('https://breakitdown-ruby.vercel.app/api/generate-question-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch question and answer');
      }

      const data = await response.json();
      setQuestion(data.question);
      setAnswer(data.answer);
    } catch (err) {
      console.error('Error fetching question and answer:', err);
    }
  };

  useEffect(() => {
    if (flashcards.length > 0) {
      fetchQuestionAndAnswer(flashcards[currentIndex].content);
    }
  }, [flashcards, currentIndex]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  if (flashcards.length === 0) return <div>Loading...</div>;

  return (
    <div className="flashcard-details-container">
      <div className="navigation-buttons">
        <button onClick={handlePrevious} disabled={currentIndex === 0} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
          Previous
        </button>
        <button onClick={handleNext} disabled={currentIndex === flashcards.length - 1} className="bg-gray-500 text-white px-4 py-2 rounded-lg">
          Next
        </button>
      </div>
      <div className="question-container">
        <h3 className="text-xl font-semibold mb-2">Question:</h3>
        <p className="text-lg mb-4">{question}</p>
      </div>
      <div className="answer-container">
        <button onClick={handleShowAnswer} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Show Answer
        </button>
        {showAnswer && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Answer:</h3>
            <p className="text-lg">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardDetails;