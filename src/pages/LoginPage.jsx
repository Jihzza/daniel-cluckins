// src/pages/LoginPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/auth/Login';
import { useAuth } from '../contexts/AuthContext';
import { signInWithPassword, signInWithGoogle } from '../services/authService';
import SectionTextWhite from '../components/common/FormsTitle';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already logged in -> bounce to /profile
  useEffect(() => {
    if (isAuthenticated) navigate('/profile');
  }, [isAuthenticated, navigate]);

  // Handle form submit
  const handleLogin = async ({ email, password, rememberMe }) => {
    setLoading(true);
    setError(null);
    try {
      // If you later wire "remember me", you can pass it down to your auth layer / cookie strategy.
      const { error } = await signInWithPassword(email, password);
      if (error) throw error;
      navigate('/profile'); // fast UX; context listener will also fire
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // Google sign-in will redirect, so no need to navigate manually
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#002147] ">
      {/* Decorative background accents (subtle, no color change) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#002147]/40 blur-3xl" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-start p-6">
        <SectionTextWhite title="Log in to your account" />

        <div className="mt-8 w-full max-w-md">
          <div className="rounded-2xl bg-black/10  p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl">
            {/* Form */}
            <Login
              onSubmit={handleLogin}
              onGoogleSignIn={handleGoogleSignIn}
              isLoading={loading}
              containerClassName="space-y-6"
            />

            {/* Error alert */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
