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
            // Create user profile for personalized welcome
            const userProfile = user ? {
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              email: user.email || null,
              phone: user.user_metadata?.phone || null
            } : null;
            
            const welcomeMessage = await openaiService.getWelcomeMessage(user?.id, userProfile);
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
        
        // Create user profile object from auth context
        const userProfile = user ? {
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          email: user.email || null,
          phone: user.user_metadata?.phone || null
        } : null;
        
        const response = await openaiService.getChatResponse(currentConversation, user?.id, userProfile);
        
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
    <div className="flex flex-col h-full bg-[#002147] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#002147]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Chatbot</h1>
          <div className="flex items-center gap-2">
            <div className="text-xs opacity-75 ml-2">Session: {sessionId.slice(0, 8)}</div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-3 py-4 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm md:text-base shadow-sm ${
                  m.role === 'user'
                    ? 'bg-[#BFA200] text-black'
                    : 'bg-black/10 text-white'
                }`}
              >
                {m.content.split('\n').map((line, lineIdx) => {
                  // Check if line contains a markdown link
                  const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
                  if (linkMatch) {
                    const [fullMatch, linkText, linkUrl] = linkMatch;
                    const beforeLink = line.substring(0, line.indexOf(fullMatch));
                    const afterLink = line.substring(line.indexOf(fullMatch) + fullMatch.length);
                    
                    return (
                      <div key={lineIdx}>
                        {beforeLink}
                        <button 
                          onClick={() => {
                            // Redirect to Stripe checkout
                            window.location.href = linkUrl;
                          }}
                          className="text-[#BFA200] underline hover:no-underline font-semibold bg-transparent border-none cursor-pointer p-0"
                        >
                          {linkText}
                        </button>
                        {afterLink}
                      </div>
                    );
                  }
                  
                  // Check if line is bold
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <div key={lineIdx} className="font-bold">
                        {line.slice(2, -2)}
                      </div>
                    );
                  }
                  
                  // Check if line is italic
                  if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                    return (
                      <div key={lineIdx} className="italic opacity-75">
                        {line.slice(1, -1)}
                      </div>
                    );
                  }
                  
                  return <div key={lineIdx}>{line}</div>;
                })}
              </div>
            </div>
          ))}
          
          {isSending && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-black/10 text-white shadow-sm">
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-white/10">
        <div className="max-w-3xl mx-auto w-full px-3 py-3">
          {!isAuthenticated && (
            <div className="text-xs text-white/70 mb-2">
              Please log in to send messages.
            </div>
          )}
          <div className="relative flex items-end">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={isAuthenticated ? 'Ask me something!' : 'Log in to chat'}
              disabled={!isAuthenticated || isSending}
              className={`w-full bg-black/10 backdrop-blur-md border border-white/20 rounded-xl py-3 pl-4 pr-24 text-white placeholder:text-white/50 focus:outline-none focus:ring focus:ring-white/30 md:text-base resize-none`}
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`absolute right-2 bottom-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                canSend ? 'bg-[#BFA200] text-black hover:opacity-90' : 'bg-black/10 text-white/50 cursor-not-allowed'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
