// src/pages/ChatbotPage.jsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { openaiService } from '../services/openaiService';

const SESSION_STORAGE_KEY = 'chatbot-session-id';

export default function ChatbotPage() {
  const { user, isAuthenticated } = useAuth();

  const [sessionId, setSessionId] = useState(() => {
    const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (cached) return cached;
    const id = typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  });

  const [messages, setMessages] = useState(() => []);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const canSend = useMemo(() => {
    if (!isAuthenticated) return false;
    if (isSending) return false;
    if (!inputValue.trim()) return false;
    return true;
  }, [isAuthenticated, isSending, inputValue]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Show welcome message when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && messages.length === 0 && !hasShownWelcome) {
      const showWelcome = async () => {
        try {
          if (openaiService.isConfigured()) {
            const welcomeMessage = await openaiService.getWelcomeMessage(user?.id);
            setMessages([{ role: 'assistant', content: welcomeMessage }]);
          } else {
            setMessages([{ 
              role: 'assistant', 
              content: "👋 Welcome! I'm here to help you with Daniel's coaching services. What can I assist you with today?" 
            }]);
          }
        } catch (error) {
          console.error('Error showing welcome message:', error);
          setMessages([{ 
            role: 'assistant', 
            content: "👋 Welcome! I'm here to help you with Daniel's coaching services. What can I assist you with today?" 
          }]);
        }
        setHasShownWelcome(true);
      };
      
      // Small delay to make the welcome feel more natural
      setTimeout(showWelcome, 500);
    }
  }, [isAuthenticated, messages.length, hasShownWelcome, user?.id]);

  // Handle payment success/cancellation from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const type = urlParams.get('type');
    
    if (payment === 'success') {
      if (type === 'appointment') {
        setMessages((prev) => [...prev, { 
          role: 'assistant', 
          content: '🎉 Payment successful! Your appointment has been confirmed. You will receive a confirmation email shortly.' 
        }]);
      } else if (type === 'subscription') {
        const plan = urlParams.get('plan');
        setMessages((prev) => [...prev, { 
          role: 'assistant', 
          content: `🎉 Payment successful! Your ${plan} coaching subscription is now active. Welcome to the program!` 
        }]);
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === 'cancelled') {
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'Payment was cancelled. No charges were made. Feel free to try again anytime!' 
      }]);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Consume pending welcome message once the user visits the chat page
  useEffect(() => {
    try {
      const msg = sessionStorage.getItem('pending_welcome_message');
      if (msg) {
        setMessages((prev) => [...prev, { role: 'assistant', content: msg }]);
        sessionStorage.removeItem('pending_welcome_message');
        window.dispatchEvent(new CustomEvent('welcomeMessageConsumed'));
      }
    } catch {}
  }, []);

  const handleSend = async () => {
    if (!canSend) return;

    const content = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setIsSending(true);

    try {
      // All requests handled conversationally through OpenAI - no more forms!
      // The AI will handle bookings, subscriptions, and pitch deck requests through conversation

      if (!openaiService.isConfigured()) {
        setMessages((prev) => [...prev, { 
          role: 'assistant', 
          content: "I'm currently not configured to handle questions. Please check that the OpenAI API key is set in your environment variables (VITE_OPENAI_API_KEY)." 
        }]);
        return;
      }

      try {
        // Create the complete conversation including the current user message
        // (since setMessages is async, the current message isn't in the messages state yet)
        const currentConversation = [...messages, { role: 'user', content }];
        const response = await openaiService.getChatResponse(currentConversation, user?.id);
        
        if (response.success) {
          setMessages((prev) => [...prev, { role: 'assistant', content: response.content }]);
        } else {
          throw new Error('Failed to get AI response');
        }
      } catch (aiError) {
        console.error('OpenAI service error:', aiError);
        let errorMessage = "I'm having trouble processing your request right now. Please try again in a moment.";
        
        // Provide specific error messages for common issues
        if (aiError.message.includes('quota')) {
          errorMessage = "I've reached my usage limit for today. Please try again later or contact support.";
        } else if (aiError.message.includes('api_key')) {
          errorMessage = "There's a configuration issue with my AI service. Please contact support.";
        }
        
        setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Network error. Please try again.' },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-500 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Daniel DaGalow Assistant</h1>
              <p className="text-sm opacity-90">Your personal coaching AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xl px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-500 text-white'
                      : 'bg-gray-800 text-white border border-gray-700'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-white border border-gray-700 max-w-xl px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-900 border-t border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-4">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  !isAuthenticated 
                    ? "Please log in to chat..." 
                    : "Ask me something!"
                }
                disabled={!canSend && !(!isAuthenticated)}
                className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50"
                rows="2"
              />
              <button
                onClick={handleSend}
                disabled={!canSend}
                className="bg-gradient-to-r from-yellow-600 to-orange-500 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-700 hover:to-orange-600 transition-all duration-200"
              >
                Send
              </button>
            </div>
            {!isAuthenticated && (
              <div className="mt-2 text-center text-gray-400 text-sm">
                Please{' '}
                <a href="/login" className="text-yellow-500 hover:text-yellow-400">
                  log in
                </a>{' '}
                to start chatting with Daniel's AI assistant.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
