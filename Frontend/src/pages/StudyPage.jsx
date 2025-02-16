import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { jellyTriangle } from 'ldrs';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

jellyTriangle.register();

const API_URL = "http://localhost:3000/api/data";
const SAVE_CARD_URL = "http://localhost:3000/api/user/card";
const INCREASE_CARDS_STUDIED_URL = "http://localhost:3000/api/increase-cards-studied";

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
          'Authorization': `Bearer ${token}`,
          'subject': subject,
          'topic': topic,
          'additionalReq': additionalReq
        }
      });
      if (!response.ok) throw new Error('Network response was not ok');
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="space-y-4">
        <Skeleton className="h-12 w-[400px] bg-gray-200/30" />
        <Skeleton className="h-24 w-[400px] bg-gray-200/30" />
        <Skeleton className="h-12 w-[400px] bg-gray-200/30" />
      </div>
    </div>
  );

  if (error) return (
    <div className="text-center text-lg text-red-500">
      <p>Error: {error}</p>
      <Button onClick={() => fetchData(subject, topic, additionalReq)}>Retry</Button>
    </div>
  );

  if (!data || !data.sections || data.sections.length === 0) return (
    <div className="text-center text-lg">
      <p>No data available.</p>
      <Button onClick={() => navigate('/')}>Go Back</Button>
    </div>
  );

  const currentSection = data.sections[currentIndex];

  const handleIncreaseCardsStudied = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(INCREASE_CARDS_STUDIED_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  const handleNext = () => {
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
      if (!back.trim()) {
        const genResponse = await fetch("http://localhost:3000/api/generate-back", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front }),
        });
        if (!genResponse.ok) throw new Error("Failed to generate back content");
        const genData = await genResponse.json();
        back = genData.back;
      }
      const response = await fetch("http://localhost:3000/api/anki/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ front, back }),
      });
      if (!response.ok) throw new Error("Failed to add to Anki");
      const result = await response.json();
      console.log("✅ Added to Anki:", result);
    } catch (err) {
      console.error("❌ Error adding to Anki:", err);
    }
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (option === currentSection.answer) {
      console.log("Correct answer!");
    } else {
      console.log("Incorrect answer!");
    }
  };

  return (
    <div className="relative flex-1 flex justify-center items-center p-4">
      <Card className="w-full max-w-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900">
            {currentSection?.type === "teaching" ? "Teaching" : currentSection?.type === "question" ? "Question" : "Upcoming Content"}
          </CardTitle>
          <CardDescription className="text-xl text-gray-700">
            {currentSection?.type === "question" ? "Quiz Time!" : currentSection?.type === "teaching" ? "Learn Something New" : "Stay Tuned!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentSection?.type === "teaching" && (
            <p className="text-gray-800 text-lg">{currentSection.content}</p>
          )}
          {currentSection?.type === "question" && (
            <div>
              <p className="font-semibold text-gray-900 text-xl">{currentSection.question}</p>
              <ul className="mt-4 space-y-2">
                {currentSection.options.map((option, index) => (
                  <li
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors duration-200
                      ${!selectedOption
                        ? 'bg-gray-100 hover:bg-gray-200'
                        : selectedOption === option
                          ? option === currentSection.answer
                            ? 'bg-green-100 hover:bg-green-200'
                            : 'bg-red-100 hover:bg-red-200'
                          : 'bg-gray-100 hover:bg-gray-200'
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
              <p className="font-semibold text-gray-900 text-xl">Upcoming Content</p>
              <ul className="mt-4 space-y-2">
                {currentSection.upcoming_topics.map((topic, index) => (
                  <Button
                    variant="ghost"
                    key={index}
                    className="w-full p-3 border rounded-lg text-left hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => { setTopic(topic); setCurrentIndex(0); }}
                  >
                    {topic}
                  </Button>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between mt-4">
          <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
            <ChevronLeft className="mr-2" /> Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveCard}>
              <Bookmark className="mr-2" /> Save
            </Button>
            <Button variant="outline" onClick={handleAddToAnki}>
              🃏 Add to Anki
            </Button>
          </div>
          <Button onClick={handleNext} disabled={currentIndex === data.sections.length - 1}>
            Next <ChevronRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default StudyPage;