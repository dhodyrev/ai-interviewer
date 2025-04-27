// frontend/src/components/interview/ChatInterface.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const ChatInterface = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [interview, setInterview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageEndRef = useRef(null);

  // Initialize interview and socket connection
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        // Fetch interview details
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/interviews/join/${id}`);
        setInterview(response.data);
        
        // Initialize socket connection
        const socketIo = io(process.env.REACT_APP_API_URL, {
          transports: ['websocket']
        });
        
        setSocket(socketIo);
        
        // Socket event handlers
        socketIo.on('connect', () => {
          setIsConnected(true);
          socketIo.emit('joinInterview', id);
        });
        
        socketIo.on('messageHistory', (history) => {
          setMessages(history);
        });
        
        socketIo.on('newMessage', (message) => {
          setMessages(prevMessages => [...prevMessages, message]);
        });
        
        socketIo.on('typing', (status) => {
          setIsTyping(status);
        });
        
        socketIo.on('error', (errorData) => {
          setError(errorData.message);
        });
        
        socketIo.on('disconnect', () => {
          setIsConnected(false);
        });
        
        // Start interview if it's not already started
        if (response.data.status === 'pending') {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/interviews/${id}/start`);
        }
      } catch (err) {
        setError('Failed to initialize interview');
        console.error(err);
      }
    };
    
    initializeInterview();
    
    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [id]);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) return;
    
    // Send message through socket
    socket.emit('sendMessage', {
      interviewId: id,
      message: newMessage
    });
    
    setNewMessage('');
  };
  
  const handleEndInterview = async () => {
    if (window.confirm('Are you sure you want to end this interview?')) {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/interviews/${id}/complete`);
        // Redirect or show completion page
        window.location.href = `/interviews/${id}/thank-you`;
      } catch (err) {
        setError('Failed to end interview');
      }
    }
  };
  
  if (!interview) {
    return <div className="flex justify-center items-center h-screen">Loading interview...</div>;
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">{interview.template.title}</h1>
            <p className="text-gray-600">Product: {interview.template.product}</p>
          </div>
          <button
            onClick={handleEndInterview}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            End Interview
          </button>
        </div>
      </div>
      
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3/4 p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white shadow rounded-bl-none'
                }`}
              >
                <ReactMarkdown className="prose">
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 p-3 rounded-lg rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Invisible element for auto-scrolling */}
          <div ref={messageEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 border p-2 rounded"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;