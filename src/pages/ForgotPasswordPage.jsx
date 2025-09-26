// src/pages/ForgotPasswordPage.jsx

import { useState } from 'react';
import ForgotPassword from '../components/auth/ForgotPassword';
import { sendPasswordResetEmail } from '../services/authService';
import { Link } from 'react-router-dom';
import SectionTextWhite from '../components/common/FormsTitle';
import Button from '../components/ui/Button';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  const handleForgot = async ({ email }) => {
    setLoading(true);
    setError(null);
    const { error } = await sendPasswordResetEmail(email);
    if (error) setError(error.message || t('auth.forgot.errors.unexpected'));
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#002147]">
      {/* Decorative background accents (same as Login/Signup) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#002147]/40 blur-3xl" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-6 py-12">
        <SectionTextWhite title={sent ? t('auth.forgot.pageTitleSent') : t('auth.forgot.pageTitleReset')} />

        <div className="mt-8 w-full max-w-md">
          <div className="rounded-2xl bg-black/10  p-8 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl">
            {sent ? (
              <div role="status" aria-live="polite" className="space-y-4 text-center">
                <p className="text-sm text-black/80">
                  {t('auth.forgot.sentDescription')}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('auth.forgot.openGmail')}
                  </Button>
                  <Link to="/login" className="text-sm font-medium text-indigo-600 underline">
                    {t('auth.forgot.backToLogin')}
                  </Link>
                </div>
              </div>
            ) : (
              <ForgotPassword
                onSubmit={handleForgot}
                isLoading={loading}
                containerClassName="space-y-6"
              />
            )}

            {/* Error alert */}
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

          <p className="mt-6 text-center text-xs text-white">
            {t('auth.forgot.securityNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
