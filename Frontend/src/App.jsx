import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { authConfig } from './auth0-config';
import StudyPage from "./pages/StudyPage";
import AdminDashboard from "./pages/AdminDashboard";
import FlashcardDetails from "./components/FlashcardDetails";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from 'axios';
import './App.css'; // Add your CSS for modal styling
import { useNavigate } from 'react-router-dom'; // Make sure this is imported
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';

function App() {
  return (
    <Auth0Provider {...authConfig}>
      <AppContent />
    </Auth0Provider>
  );
}

function AppContent() {
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading, getAccessTokenSilently } = useAuth0();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [additionalReq, setAdditionalReq] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const updateUserInDB = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          console.log('Updating user with data:', {
            email: user.email,
            name: user.name,
            picture: user.picture
          });

          const response = await fetch('http://localhost:3000/api/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              picture: user.picture
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update user');
          }

          const result = await response.json();
          console.log('User updated successfully:', result);
        } catch (error) {
          console.error('Error updating user:', error);
        }
      }
    };

    updateUserInDB();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleStartLearning = () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    navigate('/study');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? 'http://localhost:3000/api/login' : 'http://localhost:3000/api/signup';
    try {
      const response = await axios.post(url, { username, password });
      const token = response.data.token;
      localStorage.setItem('token', token); // Store token
      setShowModal(false); // Close modal
      navigate('/study'); // Redirect to study page
    } catch (error) {
      console.error('Error during authentication', error);
      alert(error.response?.data?.error || 'An error occurred');
    }
  };
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage = { sender: "user", text: chatInput };
    setChatMessages([...chatMessages, newMessage]);

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.post('http://localhost:3000/api/chatbot', { message: chatInput }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const botMessage = { sender: "bot", text: response.data.response };
      setChatMessages([...chatMessages, newMessage, botMessage]);
    } catch (error) {
      console.error('Error during chatbot interaction', error);
      const errorMessage = { sender: "bot", text: "Sorry, something went wrong. Please try again later." };
      setChatMessages([...chatMessages, newMessage, errorMessage]);
    }

    setChatInput("");
  };
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const clearChatMessages = () => {
    setChatMessages([]);
  };
  return (
    <div className="min-h-screen font-newstar">
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white/20 backdrop-blur-sm border-b border-white/30 shadow-sm">
          <div className="container mx-auto">
            <ul className="flex gap-6 justify-center items-center p-4">
              <li>
                <Link to="/" className="text-black/80 hover:text-black transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/study" className="text-black/80 hover:text-black transition-colors">
                  Study
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-black/80 hover:text-black transition-colors">
                  Dashboard
                </Link>
              </li>
              

              {isAuthenticated ? (
                <li>
                <button 
                 onClick={() => {
                    localStorage.removeItem('studyPageState'); // Clear the study page state from local storage
                    logout({ returnTo: window.location.origin });
                  }}
               className="text-black/80 hover:text-black transition-colors"
                >
                Logout
                </button>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-16">
        <Routes>
          <Route path="/" element={
            <Home 
              subject={subject} 
              setSubject={setSubject} 
              topic={topic} 
              setTopic={setTopic} 
              additionalReq={additionalReq} 
              setAdditionalReq={setAdditionalReq} 
              onStartLearning={handleStartLearning}
            />
          } />
          <Route 
            path="/study" 
            element={
              isAuthenticated ? (
                <StudyPage 
                  subject={subject}
                  topic={topic}
                  additionalReq={additionalReq}
                  setSubject={setSubject}
                  setTopic={setTopic}
                  setAdditionalReq={setAdditionalReq}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={
              isAuthenticated ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/flashcard/:id" 
            element={
              isAuthenticated ? (
                <FlashcardDetails />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
        
      </main>
      <div className="fixed bottom-4 right-4">
        <button
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg"
          onClick={toggleChat}
        >
          <FontAwesomeIcon icon={isChatOpen ? faTimes : faComments} />
        </button>
        {isChatOpen && (
          <div className="w-80 bg-white border border-gray-300 rounded-lg shadow-lg mt-2">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Chat with our AI</h2>
                <button
                  className="text-red-500"
                  onClick={clearChatMessages}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
              <div className="h-64 overflow-y-auto">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`my-2 p-2 rounded ${msg.sender === "user" ? "bg-blue-100 text-right" : "bg-gray-100 text-left"}`}>
                    {msg.text}
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSubmit} className="mt-4">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Type your message..."
                />
                <button type="submit" className="w-full mt-2 p-2 bg-blue-500 text-white rounded">Send</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Home({ subject, setSubject, topic, setTopic, additionalReq, setAdditionalReq, onStartLearning }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center selection:bg-yellow-300">
      <h1 className="text-5xl mb-6 font-newstar">Welcome to <span className="bg-yellow-300 ">BreakItDown</span></h1>
      <p className="text-xl text-black/80 mb-8 max-w-2xl font-newstar">
        Your personalized learning platform that breaks down complex topics into simple, digestible pieces.
      </p>
      <input 
        type="text" 
        placeholder="Enter Subject" 
        value={subject} 
        onChange={(e) => setSubject(e.target.value)} 
        className="mb-4 p-2 border rounded"
      />
      <input 
        type="text" 
        placeholder="Enter Topic" 
        value={topic} 
        onChange={(e) => setTopic(e.target.value)} 
        className="mb-4 p-2 border rounded"
      />
      <input 
        type="text" 
        placeholder="Anything Else?" 
        value={additionalReq} 
        onChange={(e) => setAdditionalReq(e.target.value)} 
        className="mb-4 p-2 border rounded"
      />
      <Button onClick={onStartLearning}>Start Learning</Button>
    </div>
  );
}

export default App;