import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
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
  const [showAnkiInstructions, setShowAnkiInstructions] = useState(false);


  useEffect(() => {
    localStorage.setItem('studyPageState', JSON.stringify({
      data,
      currentIndex,
      history,
      selectedOption,
    }));
  }, [data, currentIndex, history, selectedOption]);

  // Load state from local storage
  useEffect(() => {
    const savedState = localStorage.getItem('studyPageState');
    if (savedState) {
      const { data, currentIndex, history, selectedOption } = JSON.parse(savedState);
      setData(data);
      setCurrentIndex(currentIndex);
      setHistory(history);
      setSelectedOption(selectedOption);
    }
  }, []);
  
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

    setLoading(true);

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
      alert("Card saved successfully!");
    } catch (err) {
      console.error('Error saving card:', err);
    } finally {
      setLoading(false);
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
  
    setLoading(true);
  
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
      alert("Card added in Anki, please check a deck named 'Default'.");
    } catch (err) {
      console.error("❌ Error adding to Anki:", err);
    } finally {
      setLoading(false);
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
    <div className="flex justify-center items-center p-0">
      <Card className="w-full max-w-3xl h-auto shadow-lg border rounded-xl">
        {/* Card Header */}
        <CardHeader className="py-5 border-b flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-semibold">
              {currentSection.type === "teaching" ? "Teaching" : "Question"}
            </CardTitle>
            <CardDescription className="text-gray-500 text-lg">
              {currentSection.type === "question" ? "Quiz Time!" : "Learn Something New"}
            </CardDescription>
          </div>
          {/* New Button for Anki Connection Instructions */}
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => setShowAnkiInstructions(prev => !prev)}
          >
            How to Connect Anki
          </Button>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="px-6 py-24 text-3xl">
          {currentSection.type === "teaching" && (
            <p className="text-gray-800 ">{currentSection.content}</p>
          )}

          {currentSection.type === "question" && (
            <div>
              <p className="font-semibold mb-4">
                {currentSection.question}
              </p>
              <ul className="space-y-3">
                {currentSection.options.map((option, index) => (
                  <li 
                    key={index} 
                    className={`p-1 border rounded-lg cursor-pointer transition-all duration-200 
                      ${selectedOption === option 
                        ? option === currentSection.answer 
                          ? 'bg-green-100 border-green-500' 
                          : 'bg-red-100 border-red-500' 
                        : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedOption(option)}
                  >
                    <span className="font-sans text-lg">{option}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentSection.type === "upcoming_content" && (
            <div>
              <p className="font-semibold text-4xl mb-4">Upcoming Topics</p>
              <ul className="space-y-3">
                {currentSection.upcoming_topics.map((topic, index) => (
                  <Button 
                    variant='ghost' 
                    key={index} 
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-100"
                    onClick={() => setTopic(topic)}
                  >
                    {topic}
                  </Button>
                ))}
              </ul>
            </div>
          )}
        </CardContent>

        {/* Card Footer - Centered Buttons */}
        <CardFooter className="p-6 border-t">
          <div className="flex justify-center w-full space-x-3">
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={currentIndex === 0}
              className="flex items-center space-x-2 text-2xl"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </Button>

            <Button variant="outline" className="flex items-center space-x-2 text-lg" onClick={handleSaveCard}>
              <Bookmark className="w-5 h-5" />
              <span>Save</span>
            </Button>

            <Button variant="outline" className="flex items-center space-x-2 text-lg" onClick={handleAddToAnki}>
              <PlusCircle className="w-5 h-5" />
              <span>Add to Anki</span>
            </Button>

            <Button 
              onClick={handleNext} 
              disabled={currentIndex === data.sections.length - 1}
              className="flex items-center space-x-2 text-lg"
            >
              <span>Next</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Popup for Anki Instructions */}
      {showAnkiInstructions && (
        <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 shadow-lg">
          <CardHeader>
            <CardTitle>How to Connect Anki</CardTitle>
          </CardHeader>
          <CardContent>
            <p>To connect Anki manually:</p>
            <ol className="list-decimal pl-5">
              <li>Go to Tools -> Add-ons</li>
              <li>Click on 'Get Add-ons'</li>
              <li>Add code (2055492159) and press OK</li>
              <li>Restart Anki</li>
            </ol>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAnkiInstructions(false)}
            >
              OK
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default StudyPage;