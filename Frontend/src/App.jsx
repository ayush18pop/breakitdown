import { useState, useEffect } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { Bookmark } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const API_URL = "http://localhost:3000/api/data"; // Replace with your actual API endpoint

function App() {
  const [data, setData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-lg text-red-500">Error loading data.</p>;
  if (!data) return <p className="text-center text-lg">No data available.</p>;

  const currentSection = data.sections[currentIndex];

  const handleNext = () => {
    if (currentIndex < data.sections.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <>
      <h1 className="text-5xl font-serif w-full rounded-xl py-4 text-center">
        BreakItDown
      </h1>
      <div className="h-screen flex justify-center items-center font-serif">
        <Card className="w-[400px] text-center">
          <CardHeader>
            <CardTitle>
              {currentSection.type === "teaching" ? "Teaching" : currentSection.type === "question" ? "Question" : "Upcoming Content"}
            </CardTitle>
            <CardDescription>
              {currentSection.type === "question" ? "Quiz Time!" : currentSection.type === "teaching" ? "Learn Something New" : "Stay Tuned!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentSection.type === "teaching" && <p>{currentSection.content}</p>}

            {currentSection.type === "question" && (
              <div>
                <p className="font-semibold">{currentSection.question}</p>
                <ul className="mt-2">
                  {currentSection.options.map((option, index) => (
                    <li key={index} className="p-2 border rounded-md cursor-pointer hover:bg-gray-100">
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentSection.type === "upcoming-content" && (
              <div>
                <p className="font-semibold">Upcoming Content</p>
                <ul className="mt-2">
                  {data.upcoming_topics.map((topic, index) => (
                    <li key={index} className="p-2 border rounded-md">
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full px-6 py-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
                Previous
              </Button>
              <Button variant="outline">
                <Bookmark />Save
              </Button>
              <Button onClick={handleNext} disabled={currentIndex === data.sections.length - 1}>
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default App;
