// src/contexts/AuthContext.js
// -----------------------------------------------------------
// Provides a <AuthProvider> wrapper and a handy useAuth() hook.
// Every component beneath <AuthProvider> can call useAuth()
// to know if someone is logged in.
// -----------------------------------------------------------

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUserSession } from '../services/authService';

// 🔸 Step 1 – Create an *empty* context object.
const AuthContext = createContext();

// 🔸 Step 2 – Build a React component that stores auth state
//            and *provides* it to children via the context.
export const AuthProvider = ({ children }) => {
  // Local state hooks ---------------------------------------
  const [user,     setUser]     = useState(null); // who is logged in?
  const [session,  setSession]  = useState(null); // raw session data
  const [loading,  setLoading]  = useState(true); // still checking?

  // 🔸 Step 3 – Run once on mount to hydrate and start the listener.
  useEffect(() => {
    // (a) Check local storage for an existing session -------------
    (async () => {
      const { data } = await getUserSession();      // wrapper call
      setSession(data.session);                     // may be null
      setUser(data.session?.user ?? null);          // safe fallback
      setLoading(false);
    })(); // ⇢ This pattern is an “IIFE” = immediately-invoked function.

    // (b) Listen for login / logout across *any* browser tab -----
    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);                    // new session or null
        setUser(session?.user ?? null);
        setLoading(false);
      });

    // (c) Cleanup: React calls this before unmount/re-run.
    return () => listener.subscription.unsubscribe();
  }, []); // [] ⇒ run only once after first render.

  // Stuff we want every component to see ----------------------
  const value = {
    session,
    user,
    loading,
    isAuthenticated: !!user, // nice boolean helper
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 🔸 Step 4 – Little helper so components write:
//             const { user } = useAuth();
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};