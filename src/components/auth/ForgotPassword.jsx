// src/components/auth/ForgotPassword.jsx

import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Input from '../common/Forms/Input';
import FormButton from '../common/Forms/FormButton';

// Pure UI – parent passes onSubmit + isLoading
export default function ForgotPassword({
  onSubmit,
  isLoading,
  containerClassName = 'space-y-6',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={containerClassName} noValidate>
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white md:text-base">
          Enter your account email
        </label>
        <div className="mt-1">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="account@email.com"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', { required: 'Email is required' })}
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
        Send reset link
      </FormButton>

      {/* Back to login */}
      <p className="text-center text-sm text-white/80">
        Go back to{' '}
        <Link to="/login" className="font-semibold text-[#bfa200] hover:text-[#bfa200]/80 underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
