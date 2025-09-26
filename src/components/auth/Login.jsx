// src/components/auth/Login.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import Input from '../common/Forms/Input';
import FormButton from '../common/Forms/FormButton';
import GoogleButton from '../common/Forms/GoogleButton';
import { useTranslation } from 'react-i18next';

export default function Login({ onSubmit, onGoogleSignIn, isLoading, containerClassName = 'space-y-6' }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={containerClassName} noValidate>
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white">
          {t('login.form.emailLabel')}
        </label>
        <div className="mt-1">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t('login.form.emailPlaceholder')}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', { required: t('login.form.validation.emailRequired') })}
          />
          {errors.email && (
            <p id="email-error" className="mt-2 text-sm text-red-600" aria-live="polite">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white">
          {t('login.form.passwordLabel')}
        </label>
        <div className="mt-1">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('login.form.passwordPlaceholder')}
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(v => !v)}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password', { required: t('login.form.validation.passwordRequired') })}
          />
          {errors.password && (
            <p id="password-error" className="mt-2 text-sm text-red-600" aria-live="polite">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between">
        <label className="inline-flex select-none items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/30 bg-black/10 text-[#bfa200] focus:ring-[#bfa200]"
            {...register('rememberMe')}
          />
          <span className="text-sm text-white/80">{t('login.form.rememberMe')}</span>
        </label>

        <Link
          to="/forgot-password"
          className="text-sm font-medium text-[#bfa200] hover:text-[#bfa200]/80 underline underline-offset-2"
        >
          {t('login.form.forgotPassword')}
        </Link>
      </div>

      {/* Submit */}
      <FormButton type="submit" isLoading={isLoading} fullWidth>
        {t('login.form.submit')}
      </FormButton>

      {/* OR */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="rounded-full bg-white px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-black/70 shadow">
            {t('login.form.orSeparator')}
          </span>
        </div>
      </div>

      {/* Google */}
      <div className="justify-center flex">
        <GoogleButton onClick={onGoogleSignIn} disabled={isLoading} />
      </div>

      {/* Bottom link */}
      <div className="mt-6 text-center text-sm">
        <p className="text-white/80">
          {t('login.form.signupPrompt')}{' '}
          <Link to="/signup" className="font-semibold text-[#bfa200] hover:text-[#bfa200]/80 underline">
            {t('login.form.signupLink')}
          </Link>
        </p>
      </div>
    </form>
  );
}
