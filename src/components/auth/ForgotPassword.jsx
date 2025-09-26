// src/components/auth/ForgotPassword.jsx

import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Input from '../common/Forms/Input';
import FormButton from '../common/Forms/FormButton';
import { useTranslation } from 'react-i18next';

// Pure UI – parent passes onSubmit + isLoading
export default function ForgotPassword({
  onSubmit,
  isLoading,
  containerClassName = 'space-y-6',
}) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={containerClassName} noValidate>
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white md:text-base">
          {t('forgot.form.emailLabel')}
        </label>
        <div className="mt-1">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t('forgot.form.emailPlaceholder')}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', { required: t('forgot.form.validation.emailRequired') })}
          />
          {errors.email && (
            <p id="email-error" className="mt-2 text-sm text-red-600" aria-live="polite">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <FormButton type="submit" isLoading={isLoading} disabled={isLoading} fullWidth>
        {t('forgot.form.submit')}
      </FormButton>

      {/* Back to login */}
      <p className="text-center text-sm text-white/80">
        {t('forgot.form.backTo')}{' '}
        <Link to="/login" className="font-semibold text-[#bfa200] hover:text-[#bfa200]/80 underline">
          {t('forgot.form.loginLink')}
        </Link>
      </p>
    </form>
  );
}
