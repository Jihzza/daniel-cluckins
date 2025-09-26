// src/components/auth/Signup.jsx
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Input from '../common/Forms/Input';
import SectionCta from '../ui/SectionCta';
import Button from '../ui/Button';
import GoogleButton from '../common/Forms/GoogleButton';
import { useTranslation } from 'react-i18next';

export default function Signup({
  onSubmit,
  onGoogleSignIn,
  isLoading,
  containerClassName = 'space-y-6',
  textColor = 'black',
  showNameField = false
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { t } = useTranslation();

  const password = watch('password');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const formRef = useRef(null);

  const handleCtaClick = () => {
    const form = formRef.current;
    if (form?.requestSubmit) form.requestSubmit();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className={containerClassName} noValidate>
      {showNameField && (
        <div>
          <label htmlFor="name" className={`block text-sm font-medium text-left ${textColor === 'white' ? 'text-white' : 'text-black'}`}>
            {t('signup.form.nameLabel', { defaultValue: 'Name' })}
          </label>
          <div className="mt-1">
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder={t('signup.form.namePlaceholder', { defaultValue: 'Your name' })}
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
              {...register('name')}
            />
            {errors.name && (
              <p id="name-error" className="mt-2 text-sm text-red-600" aria-live="polite">
                {errors.name.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className={`block text-sm font-medium text-left ${textColor === 'white' ? 'text-white' : 'text-black'}`}>
          {t('signup.form.emailLabel')}
        </label>
        <div className="mt-1">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t('signup.form.emailPlaceholder')}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', { required: t('signup.form.validation.emailRequired') })}
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
        <label htmlFor="password" className={`block text-sm font-medium text-left ${textColor === 'white' ? 'text-white' : 'text-black'}`}>
          {t('signup.form.passwordLabel')}
        </label>
        <div className="mt-1">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t('signup.form.passwordPlaceholder')}
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(v => !v)}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password', {
              required: t('signup.form.validation.passwordRequired'),
              minLength: { value: 6, message: t('signup.form.validation.passwordMinLength') }
            })}
          />
          {errors.password && (
            <p id="password-error" className="mt-2 text-sm text-red-600" aria-live="polite">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirm" className={`block text-sm font-medium text-left ${textColor === 'white' ? 'text-white' : 'text-black'}`}>
          {t('signup.form.confirmPasswordLabel')}
        </label>
        <div className="mt-1">
          <Input
            id="confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder={t('signup.form.passwordPlaceholder')}
            showPasswordToggle
            showPassword={showConfirm}
            onTogglePassword={() => setShowConfirm(v => !v)}
            aria-invalid={errors.confirm ? 'true' : 'false'}
            aria-describedby={errors.confirm ? 'confirm-error' : undefined}
            {...register('confirm', {
              validate: value => value === password || t('signup.form.validation.passwordsNoMatch')
            })}
          />
          {errors.confirm && (
            <p id="confirm-error" className="mt-2 text-sm text-red-600" aria-live="polite">
              {errors.confirm.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="justify-center flex pt-6">
        <SectionCta sectionRef={formRef}>
          <Button onClick={handleCtaClick} isLoading={isLoading}>
            {t('signup.cta', { defaultValue: 'Create your account' })}
          </Button>
        </SectionCta>
      </div>

      {/* OR */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="rounded-full bg-white px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-black/70 shadow">
            {t('signup.form.orSeparator')}
          </span>
        </div>
      </div>

      {/* Google */}
      <div className="flex justify-center">
        <GoogleButton onClick={onGoogleSignIn} disabled={isLoading} />
      </div>

      {/* Bottom link */}
      <p className={`mt-6 text-center text-sm ${textColor === 'white' ? 'text-white/80' : 'text-black'}`}>
        {t('signup.form.loginPrompt')}{' '}
        <Link to="/login" className="font-semibold text-[#bfa200] hover:text-[#bfa200]/80 underline">
          {t('signup.form.loginLink')}
        </Link>
      </p>
    </form>
  );
}
