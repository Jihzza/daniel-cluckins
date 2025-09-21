// src/pages/ResetPasswordPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResetPassword from '../components/auth/ResetPassword';
import { updatePassword } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import SectionTextWhite from '../components/common/SectionTextWhite';

export default function ResetPasswordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(user ? 'form' : 'checking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Wait for Supabase PASSWORD_RECOVERY session if user not loaded yet
  useEffect(() => {
    if (step === 'checking' && user) setStep('form');
  }, [user, step]);

  const handleReset = async ({ password }) => {
    setLoading(true);
    setError(null);
    const { error } = await updatePassword(password);
    if (error) setError(error.message);
    else navigate('/profile');
    setLoading(false);
  };

  if (step === 'checking') {
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#002147] ">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#002147]/40 blur-3xl" />
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:22px_22px]" />
        </div>

        <div className="mx-auto flex h-full max-w-7xl items-center justify-center px-6 py-12">
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl bg-white/80 px-6 py-4 text-sm text-black/80 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl"
          >
            Loading…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#002147]">
      {/* Decorative background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#002147]/40 blur-3xl" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-6 py-12">
        <SectionTextWhite title="Set a new password" />

        <div className="mt-8 w-full max-w-md">
          <div className="rounded-2xl bg-black/10  p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl">
            <ResetPassword onSubmit={handleReset} isLoading={loading} />

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-black/70">
            Tip: choose a strong password you can remember.
          </p>
        </div>
      </div>
    </div>
  );
}
