import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, 
  faRobot, 
  faUser, 
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  
  const chatContainerRef = useRef(null);
  
  // Backend API endpoints - Updated to use the admin route
  const BACKEND_API_URL = `${import.meta.env.VITE_API_URL}/admin/gemini`;
  
  // API endpoints for function calling
  const API_ENDPOINTS = {
    getEmployees:  `${import.meta.env.VITE_API_URL}/employees`,
    // Add more endpoints here as needed
    // getPatients: 'http://localhost:5000/api/patients',
    // getDepartments: 'http://localhost:5000/api/departments',
  };

  useEffect(() => {
    // Add welcome message when component mounts
    setChatHistory([
      { 
        id: 'welcome-msg',
        text: "Hello! I'm your Hospital Management System admin assistant. I can help you with employee information, department data, and other administrative tasks. How can I help you today?", 
        sender: 'bot' 
      }
    ]);
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!userInput.trim()) return;
    
    // Add user message with unique ID
    const messageId = `user-msg-${Date.now()}`;
    const userMessage = { id: messageId, text: userInput, sender: 'user' };
    setChatHistory(prev => [...prev, userMessage]);
    setUserInput('');
    
    // Show typing indicator
    setIsBotTyping(true);
    
    try {
      // Send the message with available functions to the admin endpoint
      const response = await callGeminiAPIWithFunctionCalling(userInput);
      
      setIsBotTyping(false);
      
      if (response) {
        // Process response text to handle markdown-style formatting
        const formattedResponse = formatBotResponse(response);
        const botMessageId = `bot-msg-${Date.now()}`;
        setChatHistory(prev => [...prev, { id: botMessageId, text: formattedResponse, sender: 'bot', rawText: response }]);
      } else {
        setChatHistory(prev => [
          ...prev, 
          { 
            id: `error-msg-${Date.now()}`,
            text: "I'm sorry, I couldn't process your request. Please try again.", 
            sender: 'bot',
            rawText: "I'm sorry, I couldn't process your request. Please try again."
          }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsBotTyping(false);
      
      // More specific error message based on the type of error
      let errorMessage = "I'm sorry, there was an error processing your request. Please try again later.";
      
      if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage = "I'm unable to connect to the server. Please check your internet connection or try again later.";
      }
      
      setChatHistory(prev => [
        ...prev, 
        { 
          id: `error-msg-${Date.now()}`,
          text: errorMessage, 
          sender: 'bot',
          rawText: errorMessage
        }
      ]);
    }
  };

  // Function to format bot responses, handling asterisks and other markdown-like syntax
  const formatBotResponse = (text) => {
    // Parse and convert **text** to <strong>text</strong>
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Parse and convert *text* to <em>text</em> (but only if not already part of **)
    formattedText = formattedText.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    
    // Handle line breaks
    formattedText = formattedText.replace(/\n/g, '<br />');
    
    return formattedText;
  };

  // Gemini API call with function calling capabilities
  const callGeminiAPIWithFunctionCalling = async (message) => {
    console.log('Sending message to admin backend API with function calling capability:', message);

    try {
      // Send the query along with the available functions
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          availableFunctions: [
            {
              name: "getEmployees",
              description: "Get information about hospital employees",
              parameters: {
                type: "object",
                properties: {
                  role: {
                    type: "string",
                    description: "Filter employees by role (e.g., doctor, nurse, pharmacist)"
                  },
                  department: {
                    type: "string",
                    description: "Filter employees by department"
                  },
                  id: {
                    type: "string",
                    description: "Get a specific employee by ID"
                  }
                },
                required: []
              }
            },
            // Add more function definitions here
            // {
            //   name: "getPatients",
            //   description: "Get information about hospital patients",
            //   parameters: { ... }
            // }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend API error response:', errorData);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;  // Return the AI-generated text from the response
      } else {
        console.error('Unexpected API response format:', data);
        return null;
      }
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Main content area - full width */}
      <div className="flex-1 w-full h-full">
        <div className="w-full h-full bg-white overflow-hidden flex flex-col shadow-lg">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h1 className="text-2xl font-bold flex items-center">
              <span className="mr-2">🏥</span>
              Admin Assistant
            </h1>
          </div>
          
          {/* Chat messages container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-6 overflow-y-auto flex flex-col space-y-6 h-full"
            style={{ flex: '1 1 auto' }}
          >
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-md ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                    msg.sender === 'user' 
                      ? 'bg-blue-100 text-blue-600 ml-2' 
                      : 'bg-purple-100 text-purple-600 mr-2'
                  }`}>
                    <FontAwesomeIcon icon={msg.sender === 'user' ? faUser : faRobot} size="sm" />
                  </div>
                  <div 
                    className={`relative p-4 rounded-2xl shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-blue-50 text-gray-800 border-blue-200 border' 
                        : 'bg-white text-gray-800 border-purple-200 border'
                    }`}
                  >
                    {/* Message content */}
                    <div 
                      dangerouslySetInnerHTML={
                        msg.sender === 'bot' 
                          ? { __html: msg.text } 
                          : undefined
                      }
                    >
                      {msg.sender === 'user' ? msg.text : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isBotTyping && (
              <div className="flex justify-start">
                <div className="flex">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-2">
                    <FontAwesomeIcon icon={faRobot} size="sm" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                      <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                      <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area - fixed to bottom */}
          <div className="border-t p-4 bg-white sticky bottom-0 left-0 right-0 w-full">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask a question about the hospital system..."
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              {/* Send button */}
              <button
                type="submit"
                className={`bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl ${!userInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!userInput.trim()}
                title="Send message"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;