import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faRobot,
  faUser,
  faMicrophone,
  faMicrophoneSlash,
  faSpinner,
  faVolumeUp,
  faVolumeMute
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "../../context/AuthContext";

const Support = () => {
  const [chatHistory, setCharHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceInputStatus, setVoiceInputStatus] = useState('');
  const [displayWelcome, setDisplayWelcome] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingMessageId, setCurrentlySpeakingMessageId] = useState(null);
  const { axiosInstance } = useAuth();
  
  const chatContainerRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  // Backend API endpoint
  const BACKEND_API_URL = `${import.meta.env.VITE_API_URL}/gemini`;

  useEffect(() => {
    // Add welcome message when component mounts with animation delay
    setTimeout(() => {
      setDisplayWelcome(true);
      setCharHistory([
        {
          id: 'welcome-msg',
          text: "Hello! I'm your Hospital Management System support assistant. How can I help you today?",
          sender: 'bot'
        }
      ]);
    }, 500);
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Clean up any active speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);
  
  const callGeminiAPI = async (message) => {
    console.log('Sending message to backend API:', message);
  
    try {
      const response = await axiosInstance.post(BACKEND_API_URL, { message }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.data.success && response.data.data) {
        return response.data.data;  // Return the AI-generated text from the response
      } else {
        console.error('Unexpected API response format:', response.data);
        return null;
      }
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  };
  
  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!userInput.trim()) return;

    // Add user message with unique ID
    const messageId = `user-msg-${Date.now()}`;
    const userMessage = { id: messageId, text: userInput, sender: 'user' };
    setCharHistory(prev => [...prev, userMessage]);
    setUserInput('');

    // Show typing indicator
    setIsBotTyping(true);

    try {
      const response = await callGeminiAPI(userInput);
      setIsBotTyping(false);

      if (response) {
        // Process response text to handle markdown-style formatting
        const formattedResponse = formatBotResponse(response);
        const botMessageId = `bot-msg-${Date.now()}`;
        setCharHistory(prev => [...prev, { id: botMessageId, text: formattedResponse, sender: 'bot', rawText: response }]);
      } else {
        setCharHistory(prev => [
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

      setCharHistory(prev => [
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

  // Speech recognition functions
  const startVoiceRecording = () => {
    // Check if SpeechRecognition is available
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceInputStatus('Speech recognition not supported in this browser.');
      return;
    }

    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognitionRef.current = new SpeechRecognition();

    speechRecognitionRef.current.continuous = true; // Keep listening until manually stopped
    speechRecognitionRef.current.interimResults = true;
    speechRecognitionRef.current.lang = 'en-US';

    speechRecognitionRef.current.onstart = () => {
      setIsVoiceRecording(true);
      setVoiceInputStatus('Listening...');
    };

    speechRecognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      setUserInput(transcript);

      // Update status with real-time indication that voice is being recognized
      setVoiceInputStatus('Listening... (Voice detected)');
    };

    speechRecognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setVoiceInputStatus(`Error: ${event.error}`);
      // Don't stop recording automatically on error
    };

    speechRecognitionRef.current.onend = () => {
      // Only reset status if we're not in an error state
      if (voiceInputStatus === 'Listening...' || voiceInputStatus === 'Listening... (Voice detected)') {
        setVoiceInputStatus('Voice input ready. Click send to submit.');
      }

      // If recognition ends unexpectedly but user hasn't clicked stop, restart it
      if (isVoiceRecording && speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch (error) {
          console.error('Could not restart recognition', error);
          setIsVoiceRecording(false);
        }
      }
    };

    try {
      speechRecognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition', error);
      setVoiceInputStatus('Failed to start voice recognition.');
    }
  };

  const stopVoiceRecording = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsVoiceRecording(false);
      setVoiceInputStatus('Voice input ready. Click send to submit.');
    }
  };

  const toggleVoiceRecording = () => {
    if (isVoiceRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  // Text-to-speech functions
  const speakText = (text, messageId) => {
    // Stop any currently playing speech
    stopSpeech();

    // Check if SpeechSynthesis is available
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech not supported in this browser');
      return;
    }

    // Create a new SpeechSynthesisUtterance object
    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice options (optional)
    utterance.lang = 'en-US';
    utterance.rate = 1.0; // Speed of speech
    utterance.pitch = 1.0; // Pitch of speech

    // Save reference to utterance
    speechSynthesisRef.current = utterance;

    // Set up event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentlySpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingMessageId(null);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setCurrentlySpeakingMessageId(null);
    };

    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentlySpeakingMessageId(null);
    }
  };

  const toggleSpeech = (messageText, messageId) => {
    if (isSpeaking && currentlySpeakingMessageId === messageId) {
      stopSpeech();
    } else {
      // Clean text for speech (remove HTML tags)
      const cleanText = messageText.replace(/<[^>]*>/g, '');
      speakText(cleanText, messageId);
    }
  };

  // Function to extract plain text from HTML for speech synthesis
  const getPlainTextFromHTML = (html) => {
    // Create a temporary element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  return (
    // Main wrapper with CSS Grid layout
    <div className="grid grid-rows-[auto_1fr_auto] h-[calc(100vh-64px)]">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-4 animate-gradient-x">
        <h1 className="text-2xl font-bold flex items-center">
          <span className="mr-2 animate-pulse">🏥</span>
          Support Assistant
        </h1>
      </header>
      
      {/* Chat messages - middle section that scrolls */}
      <main 
        ref={chatContainerRef}
        className="overflow-y-auto p-6 space-y-6"
        style={{ 
          backgroundImage: 'radial-gradient(circle at center, #f3f4f6 1px, transparent 1px)', 
          backgroundSize: '20px 20px'
        }}
      >
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`flex max-w-md ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  msg.sender === 'user'
                    ? 'bg-emerald-100 text-emerald-600 ml-2 animate-bounceIn'
                    : 'bg-teal-100 text-teal-600 mr-2 animate-bounceIn'
                }`}
                style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
              >
                <FontAwesomeIcon icon={msg.sender === 'user' ? faUser : faRobot} size="sm" />
              </div>
              <div
                className={`relative p-4 rounded-2xl shadow-sm transition-all duration-300 ${
                    msg.sender === 'user'
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-gray-800 border-emerald-200 border animate-slideInLeft'
                      : 'bg-white hover:bg-gray-50 text-gray-800 border-teal-200 border animate-slideInRight'
                  }`}
                style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
              >
                {/* Text-to-speech button for bot messages only */}
                {msg.sender === 'bot' && (
                  <button
                    onClick={() => toggleSpeech(msg.rawText || getPlainTextFromHTML(msg.text), msg.id)}
                    className={`absolute -top-2 -right-2 p-1 rounded-full ${
                        isSpeaking && currentlySpeakingMessageId === msg.id
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      } transition-colors`}
                    title={isSpeaking && currentlySpeakingMessageId === msg.id ? "Stop speaking" : "Listen to message"}
                  >
                    <FontAwesomeIcon
                      icon={isSpeaking && currentlySpeakingMessageId === msg.id ? faVolumeMute : faVolumeUp}
                      size="xs"
                      className={isSpeaking && currentlySpeakingMessageId === msg.id ? 'animate-pulse' : ''}
                    />
                  </button>
                )}

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
          <div className="flex justify-start animate-fadeIn">
            <div className="flex">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 mr-2">
                <FontAwesomeIcon icon={faRobot} size="sm" />
              </div>
              <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recording status */}
        {voiceInputStatus && (
          <div className="flex justify-center animate-fadeIn">
            <div className="bg-blue-50 p-2 px-4 rounded-full border border-blue-200 text-blue-700 text-sm flex items-center space-x-2">
              {isVoiceRecording && (
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
              <span>{voiceInputStatus}</span>
            </div>
          </div>
        )}
      </main>

      {/* Input area - footer */}
      <footer className="border-t p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask a question about the hospital system..."
            className={`flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 hover:border-teal-400 transition-colors ${isVoiceRecording ? 'border-red-400 bg-red-50' : ''}`}
          />

          {/* Microphone button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center shadow hover:shadow-lg transform hover:scale-105 active:scale-95 ${
                isVoiceRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            title={isVoiceRecording ? "Stop recording" : "Start voice input"}
          >
            <FontAwesomeIcon
              icon={isVoiceRecording ? faMicrophoneSlash : faMicrophone}
              className={isVoiceRecording ? 'animate-pulse' : ''}
            />
          </button>

          {/* Send button */}
          <button
            type="submit"
            className={`bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-xl transition-all duration-300 flex items-center justify-center shadow hover:shadow-lg transform hover:scale-105 active:scale-95 ${!userInput.trim() ? 'opacity-50 cursor-not-allowed' : 'animate-bounce-subtle'}`}
            disabled={!userInput.trim()}
            title="Send message"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
      </footer>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulseRing {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(0.8); }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
        
        .animate-pulseRing {
          animation: pulseRing 2s infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Support;