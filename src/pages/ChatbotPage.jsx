// src/pages/ChatbotPage.jsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { openaiService } from '../services/openaiService';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiClock, FiPlus, FiSend } from 'react-icons/fi';
import Input from '../components/common/Forms/Input';

const SESSION_STORAGE_KEY = 'chatbot-session-id';

export default function ChatbotPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('session_id');
    if (fromUrl) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, fromUrl);
      return fromUrl;
    }
    const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (cached) return cached;
    const id = typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  });


  useEffect(() => {
    const sid = searchParams.get('session_id');
    if (sid && sid !== sessionId) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
      setSessionId(sid);
      setMessages([]);
      setHistoryLoaded(false);
    }
  }, [searchParams, sessionId]);

  const [messages, setMessages] = useState(() => []);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Helper to format timestamps as DD/MM/YYYY, HH:mm:ss
  const formatTimestamp = (ts) => {
    try {
      const date = ts ? new Date(ts) : new Date();
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy}, ${hh}:${min}:${ss}`;
    } catch {
      return '';
    }
  };

  const canSend = useMemo(() => {
    if (isSending) return false;
    if (!inputValue.trim()) return false;
    return true;
  }, [isSending, inputValue]);

  // Create a new conversation (new session id + clear state)
  function handleNewConversation() {
    // Prefer Crypto.randomUUID when available; otherwise a simple fallback
    const newId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()           // secure v4 UUID (MDN)
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    sessionStorage.setItem(SESSION_STORAGE_KEY, newId);
    setSessionId(newId);

    // Clear current thread and allow welcome message effect to run again
    setMessages([]);
    setHasShownWelcome(false);

    navigate(`/chat?session_id=${encodeURIComponent(newId)}`, { replace: true });


    // OPTIONAL: strip payment params from the URL to avoid carrying banners into the fresh chat
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      window.history.replaceState(null, '', url.toString());
    } catch { }
  }


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function saveChatRow(role, content) {
    try {
      const sid = sessionId;
      const userId = user?.id ||null;
      const { error } = await supabase
        .from('chatbot_conversations')
        .insert([{ session_id: sid, user_id: userId, role, content }])
        .select(); // important: return rows / surface RLS errors
      if (error) console.error('Failed to save chat row:', error);
    } catch (e) {
      console.error('saveChatRow error:', e);
    }
  }

  // Load full conversation history for this session from Supabase (if available)
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const sid = sessionId;
        if (!sid) return;

        let q = supabase
          .from('chatbot_conversations')
          .select('role, content, created_at')
          .eq('session_id', sid);

        if (user?.id) {
          // user-specific rows OR system rows with user_id NULL
          q = q.or(`user_id.eq.${user.id},user_id.is.null`);
        } else {
          // guest: only rows created as anonymous
          q = q.is('user_id', null);
        }

        const { data, error } = await q.order('created_at', { ascending: true });
        if (error) {
          console.error('Failed to load chat history:', error);
        } else if (data && data.length > 0) {
          const mapped = data
            .filter(r => r.role === 'assistant' || r.role === 'user')
            .map(r => ({ role: r.role, content: r.content, createdAt: r.created_at }));
          setMessages(mapped);
        }
      } catch (e) {
        console.error('History load error:', e);
      } finally {
        setHistoryLoaded(true);
      }
    };

    loadHistory();
  }, [user?.id, sessionId]);

  // Show welcome message when component mounts and user is authenticated
  useEffect(() => {
    if (!historyLoaded || hasShownWelcome || messages.length > 0) return;
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
          setMessages(prev => prev.length ? prev : [{ role: 'assistant', content: welcomeMessage, createdAt: new Date().toISOString() }]);
          await saveChatRow('assistant', welcomeMessage);
        } else {
          const fallback = "👋 Welcome! I'm here to help you with Daniel's coaching services. What can I assist you with today?";
          setMessages(prev => prev.length ? prev : [{ role: 'assistant', content: fallback, createdAt: new Date().toISOString() }]);
          await saveChatRow('assistant', fallback);
        }
      } catch (error) {
        console.error('Error showing welcome message:', error);
        const fallback = "👋 Welcome! I'm here to help you with Daniel's coaching services. What can I assist you with today?";
        setMessages(prev => prev.length ? prev : [{ role: 'assistant', content: fallback, createdAt: new Date().toISOString() }]);
        await saveChatRow('assistant', fallback);
      }
      setHasShownWelcome(true);
    };

    // Small delay to make the welcome feel more natural
    setTimeout(showWelcome, 500);
  }, [historyLoaded, messages.length, hasShownWelcome, user?.id]);

  // Handle payment success/cancellation from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const type = urlParams.get('type');

    if (payment === 'success') {
      if (type === 'appointment') {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: '🎉 Payment successful! Your appointment has been confirmed. You will receive a confirmation email shortly.',
          createdAt: new Date().toISOString()
        }]);
      } else if (type === 'subscription') {
        const plan = urlParams.get('plan');
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: `🎉 Payment successful! Your ${plan} coaching subscription is now active. Welcome to the program!`,
          createdAt: new Date().toISOString()
        }]);
      }

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === 'cancelled') {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Payment was cancelled. No charges were made. Feel free to try again anytime!',
        createdAt: new Date().toISOString()
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
        setMessages((prev) => [...prev, { role: 'assistant', content: msg, createdAt: new Date().toISOString() }]);
        sessionStorage.removeItem('pending_welcome_message');
        window.dispatchEvent(new CustomEvent('welcomeMessageConsumed'));
      }
    } catch { }
  }, []);

  const handleSend = async () => {
    if (!canSend) return;

    const content = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', content, createdAt: new Date().toISOString() }]);
    await saveChatRow('user', content);
    setIsSending(true);

    try {
      // All requests handled conversationally through OpenAI - no more forms!
      // The AI will handle bookings, subscriptions, and pitch deck requests through conversation

      if (!openaiService.isConfigured()) {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: "I'm currently not configured to handle questions. Please check that the OpenAI API key is set in your environment variables (VITE_OPENAI_API_KEY)."
        }]);
        await saveChatRow('assistant', "I'm currently not configured to handle questions. Please check that the OpenAI API key is set in your environment variables (VITE_OPENAI_API_KEY).");
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
          setMessages(prev => [...prev, { role: 'assistant', content: response.content, createdAt: new Date().toISOString() }]);
          await saveChatRow('assistant', response.content);
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

        setMessages(prev => [...prev, { role: 'assistant', content: errorMessage, createdAt: new Date().toISOString() }]);
        await saveChatRow('assistant', errorMessage);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Network error. Please try again.', createdAt: new Date().toISOString() },
      ]);
      await saveChatRow('assistant', 'Network error. Please try again.');
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
          {/* Left: History icon -> navigate to history page */}
          <button
            type="button"
            onClick={() => navigate('/profile/chatbot-history')} // <-- change if needed
            className="p-2 rounded-xl hover:bg-white/10 focus:outline-none focus:ring focus:ring-white/30"
            title="Chat history"
            aria-label="Open chat history"
          >
            {/* Clock-arrow (history) icon */}
            <FiClock />
          </button>

          {/* Spacer to keep icons at edges */}
          <div className="flex-1" />

          {/* Right: New conversation (+) */}
          <button
            type="button"
            onClick={handleNewConversation}
            className="p-2 rounded-xl hover:bg-white/10 focus:outline-none focus:ring focus:ring-white/30"
            title="New conversation"
            aria-label="Start a new conversation"
          >
            {/* Plus icon */}
            <FiPlus />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-3 py-4 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`group max-w-[85%] rounded-2xl px-3 py-2 text-sm md:text-base shadow-sm ${m.role === 'user'
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
                <div className={`mt-1 text-[10px] md:text-xs opacity-70 select-none ${m.role === 'user' ? 'text-black/70 text-right' : 'text-white/70'}`}>
                  {formatTimestamp(m.createdAt)}
                </div>
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

      <footer>
        <div className="max-w-3xl mx-auto w-full px-3 py-3">
          {/* Change items-end -> items-center */}
          <div className="relative">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me something!"
              disabled={isSending}
              className="h-12 pr-12 md:text-base"   // give the input a clear height + extra right padding
            />

            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`absolute inset-y-0 right-2 flex items-center justify-center rounded-xl
      ${canSend ? 'cursor-pointer text-white hover:opacity-90' : 'text-white cursor-not-allowed'}`}
              aria-label="Send message"
              title="Send"
              style={{ width: '2.25rem' }}          // ~w-9; keeps a tidy square click target
            >
              <FiSend className="text-xl" />
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}