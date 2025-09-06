import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:5198/api/Chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          UserMessage: userInput
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || `HTTP error! Status: ${response.status}`);
      }

      setChat(prev => [...prev, {
        userMessage: userInput,
        botResponse: data.botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setUserInput('');
    } catch (error) {
      console.error("API Error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <div className="bot-avatar">SB</div>
          <h1>Samsoma Bot</h1>
        </div>
        
        <div className="chat-box">
          {chat.length === 0 && !isLoading && (
            <div className="welcome-message">
              <p>Hello! I'm Samsoma Bot. How can I assist you today?</p>
            </div>
          )}
          
          {chat.map((c, index) => (
            <React.Fragment key={index}>
              <div className="message user-message">
                <div className="message-content">
                  <p>{c.userMessage}</p>
                  <span className="message-time">{c.timestamp}</span>
                </div>
              </div>
              <div className="message bot-message">
                <div className="bot-avatar small">SB</div>
                <div className="message-content">
                  <p>{c.botResponse}</p>
                  <span className="message-time">{c.timestamp}</span>
                </div>
              </div>
            </React.Fragment>
          ))}
          
          {isLoading && (
            <div className="message bot-message">
              <div className="bot-avatar small">SB</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="input-area">
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button 
            onClick={sendMessage} 
            disabled={isLoading || !userInput.trim()}
          >
            {isLoading ? (
              <span className="send-icon loading"></span>
            ) : (
              <span className="send-icon">↑</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;