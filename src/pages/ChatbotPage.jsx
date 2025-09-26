// src/pages/ChatbotPage.jsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { openaiService } from '../services/openaiService';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiClock, FiPlus, FiSend } from 'react-icons/fi';
import Input from '../components/common/Forms/Input';
import { useTranslation } from 'react-i18next';

const SESSION_STORAGE_KEY = 'chatbot-session-id';

export default function ChatbotPage() {
  const { t, i18n } = useTranslation();
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

  // Locale-aware timestamp
  const formatTimestamp = (ts) => {
    try {
      const date = ts ? new Date(ts) : new Date();
      return t('common.dateTimeFull', {
        val: date,
        formatParams: {
          val: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }
        }
      });
    } catch {
      // safe fallback
      return (ts ? new Date(ts) : new Date()).toLocaleString(i18n.language || undefined, {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    }
  };

  const canSend = useMemo(() => !isSending && !!inputValue.trim(), [isSending, inputValue]);

  function handleNewConversation() {
    const newId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    sessionStorage.setItem(SESSION_STORAGE_KEY, newId);
    setSessionId(newId);
    setMessages([]);
    setHasShownWelcome(false);
    navigate(`/chat?session_id=${encodeURIComponent(newId)}`, { replace: true });

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      window.history.replaceState(null, '', url.toString());
    } catch {}
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function saveChatRow(role, content) {
    try {
      const sid = sessionId;
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

  // Load conversation history
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
          q = q.or(`user_id.eq.${user.id},user_id.is.null`);
        } else {
          q = q.is('user_id', null);
        }

        const { data, error } = await q.order('created_at', { ascending: true });
        if (!error && data?.length) {
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

  // Welcome message
  useEffect(() => {
    if (!historyLoaded || hasShownWelcome || messages.length > 0) return;
    const showWelcome = async () => {
      try {
        if (openaiService.isConfigured()) {
          const userProfile = user ? {
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            email: user.email || null,
            phone: user.user_metadata?.phone || null
          } : null;

          const welcomeMessage = await openaiService.getWelcomeMessage(user?.id, userProfile);
          setMessages(prev => prev.length ? prev : [{ role: 'assistant', content: welcomeMessage, createdAt: new Date().toISOString() }]);
          await saveChatRow('assistant', welcomeMessage);
        } else {
          const fallback = t('chatbot.page.messages.welcomeFallback');
          setMessages(prev => prev.length ? prev : [{ role: 'assistant', content: fallback, createdAt: new Date().toISOString() }]);
          await saveChatRow('assistant', fallback);
        }
      } catch (error) {
        console.error('Error showing welcome message:', error);
        const fallback = t('chatbot.page.messages.welcomeFallback');
        setMessages(prev => prev.length ? prev : [{ role: 'assistant', content: fallback, createdAt: new Date().toISOString() }]);
        await saveChatRow('assistant', fallback);
      }
      setHasShownWelcome(true);
    };

    setTimeout(showWelcome, 500);
  }, [historyLoaded, messages.length, hasShownWelcome, user?.id, t]);

  // Payment banners
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const type = urlParams.get('type');

    if (payment === 'success') {
      if (type === 'appointment') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: t('chatbot.page.messages.paymentSuccessAppointment'),
          createdAt: new Date().toISOString()
        }]);
      } else if (type === 'subscription') {
        const plan = urlParams.get('plan');
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: t('chatbot.page.messages.paymentSuccessSubscription', { plan }),
          createdAt: new Date().toISOString()
        }]);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (payment === 'cancelled') {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: t('chatbot.page.messages.paymentCancelled'),
        createdAt: new Date().toISOString()
      }]);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [t]);

  // Consume pending welcome message
  useEffect(() => {
    try {
      const msg = sessionStorage.getItem('pending_welcome_message');
      if (msg) {
        setMessages(prev => [...prev, { role: 'assistant', content: msg, createdAt: new Date().toISOString() }]);
        saveChatRow('assistant', msg);
        sessionStorage.removeItem('pending_welcome_message');
        window.dispatchEvent(new CustomEvent('welcomeMessageConsumed'));
      }
    } catch {}
  }, []);

  const handleSend = async () => {
    if (!canSend) return;

    const content = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content, createdAt: new Date().toISOString() }]);
    await saveChatRow('user', content);
    setIsSending(true);

    try {
      if (!openaiService.isConfigured()) {
        const msg = t('chatbot.page.messages.notConfigured');
        setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
        await saveChatRow('assistant', msg);
        return;
      }

      try {
        const currentConversation = [...messages, { role: 'user', content }];
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
        let errorMessage = t('chatbot.page.messages.processingError');

        if (aiError.message?.includes('quota')) {
          errorMessage = t('chatbot.page.messages.quotaError');
        } else if (aiError.message?.includes('api_key')) {
          errorMessage = t('chatbot.page.messages.apiKeyError');
        }

        setMessages(prev => [...prev, { role: 'assistant', content: errorMessage, createdAt: new Date().toISOString() }]);
        await saveChatRow('assistant', errorMessage);
      }
    } catch {
      const msg = t('chatbot.page.messages.networkError');
      setMessages(prev => [...prev, { role: 'assistant', content: msg, createdAt: new Date().toISOString() }]);
      await saveChatRow('assistant', msg);
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
          <button
            type="button"
            onClick={() => navigate('/profile/chatbot-history')}
            className="p-2 rounded-xl hover:bg-white/10 focus:outline-none focus:ring focus:ring-white/30"
            title={t('chatbot.page.header.historyTitle')}
            aria-label={t('chatbot.page.header.historyAria')}
          >
            <FiClock />
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={handleNewConversation}
            className="p-2 rounded-xl hover:bg-white/10 focus:outline-none focus:ring focus:ring-white/30"
            title={t('chatbot.page.header.newTitle')}
            aria-label={t('chatbot.page.header.newAria')}
          >
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
                    return <div key={lineIdx} className="font-bold">{line.slice(2, -2)}</div>;
                  }
                  if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                    return <div key={lineIdx} className="italic opacity-75">{line.slice(1, -1)}</div>;
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
                {t('chatbot.page.typing')}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer>
        <div className="max-w-3xl mx-auto w-full px-3 py-3">
          <div className="relative">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chatbot.page.inputPlaceholder')}
              disabled={isSending}
              className="h-12 pr-12 md:text-base"
            />

            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`absolute inset-y-0 right-2 flex items-center justify-center rounded-xl
      ${canSend ? 'cursor-pointer text-white hover:opacity-90' : 'text-white cursor-not-allowed'}`}
              aria-label={t('chatbot.page.sendAria')}
              title={t('chatbot.page.sendTitle')}
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
