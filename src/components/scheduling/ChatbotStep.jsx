// src/components/scheduling/ChatbotStep.jsx

import React, { use, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { openaiService } from '../../services/openaiService';
import { supabase } from '../../lib/supabaseClient';
import { FiSend } from 'react-icons/fi';
import Input from '../common/Forms/Input';

const SESSION_STORAGE_KEY = 'chatbot-step-session-id';

export default function ChatbotStep({
  mode = 'intake',
  paymentStatus = 'awaiting',
  serviceType = null,
  consultation = {},
  coaching = {},
  contactInfo = {},
}) {
  const { user, isAuthenticated } = useAuth();

  const [sessionId, setSessionId] = useState('');
  useEffect(() => {
    const newId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, newId);
    setSessionId(newId);
  }, []);

  const [messages, setMessages] = useState(() => []);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [historyLoaded, setHistoryLoaded] = useState(true);

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
    if (!isAuthenticated) return false;
    if (isSending) return false;
    if (!inputValue.trim()) return false;
    return true;
  }, [isAuthenticated, isSending, inputValue]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function saveChatRow(role, content) {
    try {
      const sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const userId = user?.id || null;
      const { error } = await supabase
        .from('chatbot_conversations')
        .insert([{ session_id: sid, user_id: userId, role, content }])
        .select();
      if (error) console.error('Failed to save chat row:', error);
    } catch (e) {
      console.error('saveChatRow error:', e);
    }
  }

  useEffect(() => {
    if (!isAuthenticated || hasShownWelcome || messages.length > 0) return;
    (async () => {
      try {
        const userProfile = user ? {
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          email: user.email || null,
          phone: user.user_metadata?.phone || null
        } : null;

        const intakeContext = { serviceType, consultation, coaching, contactInfo };
        const first = await openaiService.generateIntakeKickoff({
          paymentStatus,
          serviceType,
          intakeContext,
          userId: user?.id || null,
          userProfile
        });

        setMessages([{ role: 'assistant', content: first, createdAt: new Date().toISOString() }]);
        await saveChatRow('assistant', first);
        setHasShownWelcome(true);
      } catch (e) {
        console.error('Kickoff generation failed:', e);
        const fallback = "🎉 Payment confirmed! To tailor things for you, what’s the main goal you want us to focus on first?";
        setMessages([{ role: 'assistant', content: fallback, createdAt: new Date().toISOString() }]);
        await saveChatRow('assistant', fallback);
        setHasShownWelcome(true);
      }
    })();
  }, [
    isAuthenticated,
    hasShownWelcome,
    messages.length,
    paymentStatus,
    serviceType,
    consultation,
    coaching,
    contactInfo,
    user?.id
  ]);

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
      if (!openaiService.isConfigured()) {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: "I'm currently not configured to handle questions. Please check that the OpenAI API key is set in your environment variables (VITE_OPENAI_API_KEY)."
        }]);
        await saveChatRow('assistant', "I'm currently not configured to handle questions. Please check that the OpenAI API key is set in your environment variables (VITE_OPENAI_API_KEY).");
        return;
      }

      try {
        const currentConversation = [...messages, { role: 'user', content }];

        const userProfile = user ? {
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          email: user.email || null,
          phone: user.user_metadata?.phone || null
        } : null;

        const intakeContext = { serviceType, consultation, coaching, contactInfo };
        const response = await openaiService.getChatResponseWithMode(
          currentConversation,
          { mode, userId: user?.id, userProfile, intakeContext }
        );

        if (response.success) {
          setMessages(prev => [...prev, { role: 'assistant', content: response.content, createdAt: new Date().toISOString() }]);
          await saveChatRow('assistant', response.content);
        } else {
          throw new Error('Failed to get AI response');
        }
      } catch (aiError) {
        console.error('OpenAI service error:', aiError);
        let errorMessage = "I'm having trouble processing your request right now. Please try again in a moment.";

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
    <div className="flex flex-col h-[28rem] md:h-[36rem] lg:h-[44rem] bg-[#002147] text-white rounded-2xl">
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-3 py-2 md:py-3 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`group max-w-[85%] rounded-2xl px-3 py-2 text-sm md:text-base shadow-sm ${m.role === 'user'
                  ? 'bg-[#BFA200] text-black'
                  : 'bg-black/10 text-white'
                  }`}
              >
                {m.content.split('\n').map((line, lineIdx) => {
                  const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
                  if (linkMatch) {
                    const [fullMatch, linkText, linkUrl] = linkMatch;
                    const beforeLink = line.substring(0, line.indexOf(fullMatch));
                    const afterLink = line.substring(line.indexOf(fullMatch) + fullMatch.length);

                    return (
                      <div key={lineIdx}>
                        {beforeLink}
                        <button
                          onClick={() => { window.location.href = linkUrl; }}
                          className="text-[#BFA200] underline hover:no-underline font-semibold bg-transparent border-none cursor-pointer p-0"
                        >
                          {linkText}
                        </button>
                        {afterLink}
                      </div>
                    );
                  }

                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <div key={lineIdx} className="font-bold">
                        {line.slice(2, -2)}
                      </div>
                    );
                  }

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
            <div className="flex justify-start" aria-live="polite" aria-atomic="true">
              <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm bg-black/10 text-white shadow-sm flex items-center gap-1">
                <span className="sr-only">Assistant is typing</span>
                <div className="flex items-end gap-1" role="status" aria-label="Assistant is typing">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/80 typing-dot" style={{ animationDelay: '0ms' }} />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/80 typing-dot" style={{ animationDelay: '150ms' }} />
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/80 typing-dot" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer>
        <div className="max-w-3xl mx-auto w-full px-3 py-3">
          {!isAuthenticated && (
            <div className="text-xs text-white/70 mb-2">
              Please log in to send messages.
            </div>
          )}

          <div className="relative">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAuthenticated ? 'Ask me something!' : 'Log in to chat'}
              disabled={!isAuthenticated || isSending}
              className="h-12 pr-12 md:text-base"
            />

            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`absolute inset-y-0 right-2 flex items-center justify-center rounded-xl
      ${canSend ? 'cursor-pointer text-white hover:opacity-90' : 'text-white cursor-not-allowed'}`}
              aria-label="Send message"
              title="Send"
              style={{ width: '2.25rem' }}
            >
              <FiSend className="text-xl" />
            </button>
          </div>

        </div>
      </footer>
    </div>
  );
}


