// src/components/auth/ResetPassword.jsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../common/Forms/Input';
import FormButton from '../common/Forms/FormButton';

export default function ResetPassword({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const pwd = watch('password', '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* New Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-white md:text-base">
          New password
        </label>
        <div className="mt-1">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            spellCheck={false}
            placeholder="••••••••"
            showPasswordToggle={true}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum length is 6 characters' }
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
        <label htmlFor="confirm" className="block text-sm font-medium text-white md:text-base">
          Confirm password
        </label>
        <div className="mt-1">
          <Input
            id="confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            spellCheck={false}
            placeholder="••••••••"
            showPasswordToggle={true}
            showPassword={showConfirm}
            onTogglePassword={() => setShowConfirm((v) => !v)}
            aria-invalid={errors.confirm ? 'true' : 'false'}
            aria-describedby={errors.confirm ? 'confirm-error' : undefined}
            {...register('confirm', {
              validate: (v) => v === pwd || 'Passwords do not match'
            })}
          />
          {errors.confirm && (
            <p id="confirm-error" className="mt-2 text-sm text-red-600" aria-live="polite">
              {errors.confirm.message}
            </p>
          )}
        </div>
      </div>

      <FormButton type="submit" isLoading={isLoading} disabled={isLoading} fullWidth>
        Change password
      </FormButton>
    </form>
  );
}
