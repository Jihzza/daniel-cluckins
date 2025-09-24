// src/pages/ChatbotPage.jsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { openaiService } from '../services/openaiService';
import { supabase } from '../lib/supabaseClient';

const SESSION_STORAGE_KEY = 'chatbot-session-id';

export default function ChatbotPage() {
  const { user, isAuthenticated } = useAuth();

  const [sessionId, setSessionId] = useState(() => {
    // Prefer sid from URL, then localStorage, then sessionStorage, else generate new
    try {
      const url = new URL(window.location.href);
      const sidFromUrl = url.searchParams.get('sid');
      let existing = sidFromUrl || localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!existing) {
        existing = typeof crypto?.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      }
      // Keep both storages in sync for compatibility
      localStorage.setItem(SESSION_STORAGE_KEY, existing);
      sessionStorage.setItem(SESSION_STORAGE_KEY, existing);
      return existing;
    } catch (_e) {
      const fallback = typeof crypto?.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_STORAGE_KEY, fallback);
      try { localStorage.setItem(SESSION_STORAGE_KEY, fallback); } catch {}
      return fallback;
    }
  });

  const [messages, setMessages] = useState(() => []);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const isGenerating = useRef(false); // Moved to top level

  const canSend = useMemo(() => {
    if (!isAuthenticated) return false;
    if (isSending) return false;
    if (!inputValue.trim()) return false;
    return true;
  }, [isAuthenticated, isSending, inputValue]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keep a ref to the latest messages to guard async welcome
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Keep storages in sync when sessionId changes
  useEffect(() => {
    if (!sessionId) return;
    console.log('Chatbot session_id:', sessionId);
    try { localStorage.setItem(SESSION_STORAGE_KEY, sessionId); } catch {}
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }, [sessionId]);

  // Load existing messages when auth/session is ready
  useEffect(() => {
    const loadMessages = async () => {
      if (!sessionId) {
        console.log('[Chatbot] loadMessages: no sessionId yet, skipping');
        return;
      }
      if (!isAuthenticated) {
        console.log('[Chatbot] loadMessages: not authenticated yet, skipping');
        return; // wait until auth is ready to avoid RLS errors
      }

      setIsLoadingMessages(true);
      try {
        const { data: authUserData } = await supabase.auth.getUser();
        console.log('[Chatbot] loadMessages: querying', {
          sessionId,
          isAuthenticated,
          authUserId: authUserData?.user?.id || null
        });
      } catch (e) {
        console.log('[Chatbot] loadMessages: getUser failed', e);
      }

      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[Chatbot] Error loading messages:', error);
        setIsLoadingMessages(false);
        return;
      }

      console.log('[Chatbot] loadMessages: rows', data?.length || 0);
      if (data?.length > 0) {
        setMessages(data.map(msg => ({ role: msg.role, content: msg.content })));
        console.log('[Chatbot] loadMessages: setMessages with DB rows, setting hasShownWelcome=true');
        setHasShownWelcome(true);
      } else {
        console.log('[Chatbot] loadMessages: no rows for this session');
      }
      setIsLoadingMessages(false);
    };

    loadMessages();
  }, [sessionId, isAuthenticated]);

  // Show welcome message only if no messages loaded
  useEffect(() => {
    if (isAuthenticated && messages.length === 0 && !hasShownWelcome && !isGenerating.current && !isLoadingMessages) {
      console.log('[Chatbot] welcome guard passed', {
        isAuthenticated,
        messagesLen: messages.length,
        hasShownWelcome,
        isGenerating: isGenerating.current,
        isLoadingMessages
      });
      isGenerating.current = true;

      const showWelcome = async () => {
        try {
          const sid = sessionIdRef.current || sessionId;
          console.log('[Chatbot] showWelcome: start', { sid });
          
          // If messages arrived while we waited, abort
          if (messagesRef.current.length > 0) {
            console.log('[Chatbot] showWelcome: aborting, messages already loaded');
            return;
          }

          // Check for existing welcome in DB
          const { data: existingWelcome, error: checkError } = await supabase
            .from('chatbot_conversations')
            .select('content')
            .eq('session_id', sid)
            .eq('is_welcome', true)
            .eq('role', 'assistant')
            .limit(1)
            .maybeSingle();

          if (checkError) throw checkError;

          let welcomeMessage;
          if (existingWelcome) {
            console.log('[Chatbot] showWelcome: found existing welcome');
            welcomeMessage = existingWelcome.content;
          } else if (openaiService.isConfigured()) {
            const userProfile = user ? {
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
              email: user.email || null,
              phone: user.user_metadata?.phone || null
            } : null;
            
            welcomeMessage = await openaiService.getWelcomeMessage(user?.id, userProfile);
            
            // Store welcome message using the same upsert logic
            const stored = await storeMessage(sid, 'assistant', welcomeMessage, true);
            if (!stored) {
              console.log('Welcome message storage failed, checking for existing...');
              // If store fails (e.g., duplicate), re-query to get the existing one
              const { data: fallbackExisting } = await supabase
                .from('chatbot_conversations')
                .select('content')
                .eq('session_id', sid)
                .eq('is_welcome', true)
                .limit(1)
                .single();
              welcomeMessage = fallbackExisting?.content || "👋 Welcome! I'm here to help you with Daniel's coaching services. What can I assist you with today?";
            }
          } else {
            welcomeMessage = "👋 Welcome! I'm here to help you with Daniel's coaching services. What can I assist you with today?";
          }

          // Double-check again before setting welcome to avoid race
          if (messagesRef.current.length === 0) {
            console.log('[Chatbot] showWelcome: setting messages to single welcome');
            setMessages([{ role: 'assistant', content: welcomeMessage }]);
          } else {
            console.log('[Chatbot] showWelcome: skipped setting welcome, messages present');
          }
        } catch (error) {
          console.error('Error showing welcome message:', error);
          setMessages([{ 
            role: 'assistant', 
            content: "👋 Welcome! I'm here to help you with Daniel's coaching services. What can I assist you with today?" 
          }]);
        } finally {
          console.log('[Chatbot] showWelcome: finished, setHasShownWelcome(true)');
          setHasShownWelcome(true);
          isGenerating.current = false;
        }
      };
      
      setTimeout(showWelcome, 500);
    }
  }, [isAuthenticated, messages.length, hasShownWelcome, user?.id]);

  // Maintain a ref for sessionId inside async blocks
  const sessionIdRef = useRef(sessionId);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Handle payment success/cancellation from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const type = urlParams.get('type');
    const sid = urlParams.get('sid');
    if (sid) {
      console.log('[Chatbot] URL sid found, setting sessionId', sid);
      setSessionId(sid);
    }
    console.log('[Chatbot] payment URL params', { payment, type, sid });
    
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
  }, []); // Removed the pending_welcome_message effect

  // Helper to create idempotency key for messages
  const createMessageKey = (sessionId, role, content, isWelcome = false) => {
    const data = `${sessionId}:${role}:${content}:${isWelcome}`;
    // Simple hash function (you could use crypto.subtle.digest for better hashing)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  };

  // Helper to check for recent duplicates (temporary until migration)
  const existsRecentDuplicate = async (sessionId, role, content, isWelcome = false) => {
    try {
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .select('id, created_at')
        .eq('session_id', sessionId)
        .eq('role', role)
        .eq('content', content)
        .eq('is_welcome', isWelcome)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) return false;
      if (!data) return false;
      
      const createdAt = new Date(data.created_at).getTime();
      const now = Date.now();
      return now - createdAt < 5000; // consider duplicate if within 5 seconds
    } catch (_e) {
      return false;
    }
  };

  // Helper to store message with fallback approach
  const storeMessage = async (sessionId, role, content, isWelcome = false) => {
    const messageKey = createMessageKey(sessionId, role, content, isWelcome);
    
    try {
      // First, try the new upsert approach (works after migration)
      const { error: upsertError } = await supabase
        .from('chatbot_conversations')
        .upsert({
          message_key: messageKey,
          session_id: sessionId,
          user_id: user?.id || null,
          role,
          content,
          created_at: new Date().toISOString(),
          is_welcome: isWelcome
        }, {
          onConflict: 'message_key',
          ignoreDuplicates: true
        });

      // If upsert works (migration completed), we're done
      if (!upsertError) {
        console.log(`✅ ${role} message stored with upsert (migration completed)`);
        return true;
      }

      // If upsert fails (likely due to missing message_key column), fall back to old method
      console.log(`⚠️ Upsert failed, falling back to insert + duplicate check:`, upsertError.message);
      
      // Check for recent duplicates to avoid doubles
      const isDuplicate = await existsRecentDuplicate(sessionId, role, content, isWelcome);
      if (isDuplicate) {
        console.log(`🔄 Skipping duplicate ${role} message`);
        return true; // Consider it successful since message already exists
      }

      // Try regular insert as fallback
      const { error: insertError } = await supabase
        .from('chatbot_conversations')
        .insert({
          session_id: sessionId,
          user_id: user?.id || null,
          role,
          content,
          created_at: new Date().toISOString(),
          is_welcome: isWelcome
        });

      if (insertError) {
        console.error(`❌ Error storing ${role} message with fallback insert:`, insertError);
        return false;
      }

      console.log(`✅ ${role} message stored with fallback insert`);
      return true;

    } catch (err) {
      console.error(`💥 Exception storing ${role} message:`, err);
      return false;
    }
  };

  const handleSend = async () => {
    if (!canSend) return;

    const content = inputValue.trim();
    if (!content) return;

    setInputValue('');
    const sid = sessionIdRef.current || sessionId;

    // 1) Optimistically update UI with user message
    setMessages((prev) => [...prev, { role: 'user', content }]);

    // 2) Store user message in DB (outside of state updater)
    const userStorePromise = storeMessage(sid, 'user', content, false);

    setIsSending(true);

    try {
      if (!openaiService.isConfigured()) {
        const errorMessage = "I'm currently not configured to handle questions. Please check that the OpenAI API key is set in your environment variables (VITE_OPENAI_API_KEY).";
        
        // Update UI immediately
        setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
        
        // Store error message in DB
        await storeMessage(sid, 'assistant', errorMessage, false);
        return;
      }

      // Wait for user message to be stored before proceeding
      await userStorePromise;

      // Create the complete conversation including the current user message
      const currentConversation = [...messages, { role: 'user', content }];
      
      const userProfile = user ? {
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        email: user.email || null,
        phone: user.user_metadata?.phone || null
      } : null;
      
      const response = await openaiService.getChatResponse(currentConversation, user?.id, userProfile);
      
      if (response.success) {
        // 1) Update UI with assistant message
        setMessages((prev) => [...prev, { role: 'assistant', content: response.content }]);
        
        // 2) Store assistant message in DB (outside of state updater)
        await storeMessage(sid, 'assistant', response.content, false);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (aiError) {
      console.error('AI response error:', aiError);
      const errorMessage = "Sorry, I'm having trouble responding right now. Please try again later.";
      
      // Update UI
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
      
      // Store error message in DB
      await storeMessage(sid, 'assistant', errorMessage, false);
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
