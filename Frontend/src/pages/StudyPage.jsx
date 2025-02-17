import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { jellyTriangle } from 'ldrs'
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

jellyTriangle.register()

// Default values shown

const API_URL = "http://localhost:3000/api/data";
const SAVE_CARD_URL = "http://localhost:3000/api/user/card";
const INCREASE_CARDS_STUDIED_URL = "http://localhost:3000/api/increase-cards-studied";
const SAVE_HISTORY_URL = "http://localhost:3000/api/user/history-save";

function StudyPage({ subject, topic, additionalReq, setSubject, setTopic, setAdditionalReq }) {
  const [data, setData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const fetchData = async (subject, topic, additionalReq) => {
    console.log('Fetching data with:', { subject, topic, additionalReq });
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'subject': subject,
          'topic': topic,
          'additionalReq': additionalReq
        }
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCard = async () => {
    if (!data || !data.sections || data.sections.length === 0) return;

    const currentSection = data.sections[currentIndex];
    const title = currentSection.type === "teaching" ? "Teaching" : "Question";
    const content = currentSection.content || currentSection.question;

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(SAVE_CARD_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content })
      });

      if (!response.ok) {
        throw new Error('Failed to save card');
      }

      const result = await response.json();
      console.log('Card saved:', result);
    } catch (err) {
      console.error('Error saving card:', err);
    }
  };
  const handleSaveToHistory = async () => {
    if (!data || !data.sections || data.sections.length === 0) return;

    const currentSection = data.sections[currentIndex];
    const title = currentSection.type === "teaching" ? "Teaching" : "Question";
    const content = currentSection.content || currentSection.question;

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(SAVE_HISTORY_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content })
      });

      if (!response.ok) {
        throw new Error('Failed to save card to history');
      }

      const result = await response.json();
      console.log('Card saved to history:', result);
    } catch (err) {
      console.error('Error saving card to history:', err);
    }
  };


  const handleIncreaseCardsStudied = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(INCREASE_CARDS_STUDIED_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error(`Failed to increase cards studied: ${await response.text()}`);
      const result = await response.json();
      console.log('Cards studied increased:', result);
    } catch (err) {
      console.error('Error increasing cards studied:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchData(subject, topic, additionalReq);
  }, [isAuthenticated, navigate, subject, topic, additionalReq]);

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

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">Error: {error}</p>;
  if (!data || !data.sections || data.sections.length === 0) return <p className="text-center text-lg">No data available.</p>;

  const currentSection = data.sections[currentIndex];

  const handleNext = async () => {
    if (!data || !data.sections || data.sections.length === 0) return;
  
    const currentSection = data.sections[currentIndex];
    const title = currentSection.type === "teaching" ? "Teaching" : "Question";
    const content = currentSection.content || currentSection.question;
  
    try {
      await handleSaveToHistory();
    } catch (err) {
      console.error('Error saving card to history:', err);
    }
  
    if (currentIndex < data.sections.length - 1) {
      setCurrentIndex(currentIndex + 1);
      handleIncreaseCardsStudied();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleAddToAnki = async () => {
    if (!data || !data.sections || data.sections.length === 0) return;
  
    const currentSection = data.sections[currentIndex];
    const front = currentSection.content || currentSection.question;
    let back = currentSection.answer || "";
  
    try {
      const token = await getAccessTokenSilently();
  
      // 🔹 Auto-generate back content if missing
      if (!back.trim()) {
        console.log("🔄 Fetching AI-generated back content...");
        const genResponse = await fetch("http://localhost:3000/api/generate-back", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ front }),
        });
  
        if (!genResponse.ok) throw new Error("Failed to generate back content");
        const genData = await genResponse.json();
        back = genData.back;
      }
  
      // 🔹 Send to Anki
      const response = await fetch("http://localhost:3000/api/anki/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ front, back }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add to Anki");
      }
  
      const result = await response.json();
      console.log("✅ Added to Anki:", result);
    } catch (err) {
      console.error("❌ Error adding to Anki:", err);
    }
  };

  
  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if(option === currentSection.answer) {
      
      console.log("Correct answer!");
    } else {
      // Handle incorrect answer
      console.log("Incorrect answer!");
    }
  };
  const handleUpcomingTopicClick = (subject,topic,additionalReq) => {
    console.log(subject,topic,additionalReq);
  };

  return (
    <div className="relative flex-1 flex justify-center items-center">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen w-full">
          <l-grid
            size="60"
            speed="1.5" 
            color="black"
          ></l-grid>
        </div>
      ) : (
        <Card className="my-40 w-[400px] min-h-[300px] max-h-[600px] text-center bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-black/90 font-newstar text-4xl">
              {currentSection?.type === "teaching" ? "Teaching" : currentSection?.type === "question" ? "Question" : "Upcoming Content"}
            </CardTitle>
            <CardDescription className="text-black/70 font-newstar text-2xl">
              {currentSection?.type === "question" ? "Quiz Time!" : currentSection?.type === "teaching" ? "Learn Something New" : "Stay Tuned!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
        
            {currentSection?.type === "teaching" && <p className="text-black/80 font-serif">{currentSection.content}</p>}

            {currentSection?.type === "question" && (
              <div>
                <p className="font-semibold text-black/90 font-serif">{currentSection.question}</p>
                <ul className="mt-2">
                  {currentSection.options.map((option, index) => (
                    <li 
                      key={index} 
                      className={`p-2 border rounded-md cursor-pointer mb-2 backdrop-blur-sm font-serif
                        ${!selectedOption 
                          ? 'bg-gray-200/30 hover:bg-gray-300/30'
                          : selectedOption === option
                            ? option === currentSection.answer
                              ? 'bg-green-200/30 hover:bg-green-300/30'
                              : 'bg-red-200/30 hover:bg-red-300/30'
                            : 'bg-gray-200/30 hover:bg-gray-300/30'
                        }`}
                      onClick={() => handleOptionClick(option)}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentSection?.type === "upcoming_content" && (
              <div>
                <p className="font-semibold">Upcoming Content</p>
                <ul className="mt-2">
                  {currentSection.upcoming_topics.map((topic, index) => (
                    <Button 
                      variant='ghost' 
                      key={index} 
                      className="p-2 border rounded-md mb-2" 
                      onClick={() =>{ setTopic(topic); setCurrentIndex(0)}}
                    >
                      {topic}
                    </Button>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full px-6 py-2">
              <Button 
                variant="outline" 
                onClick={handlePrevious} 
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
               <Button variant="outline" onClick={handleSaveCard}>
                <Bookmark className="mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleAddToAnki}>
              🃏 Add to Anki
               </Button>
              <Button 
                onClick={handleNext} 
                disabled={currentIndex === data.sections.length - 1}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default StudyPage;