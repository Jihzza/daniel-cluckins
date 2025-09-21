// src/components/auth/Login.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import Input from '../common/Forms/Input';
import FormButton from '../common/Forms/FormButton';
import GoogleButton from '../common/Forms/GoogleButton';

/**
 * A reusable, "dumb" login form component with improved a11y and UX.
 *
 * - Accessible errors via aria-* ties (WCAG / ARIA guidance).
 * - Optional password-visibility toggle (button; no extra deps).
 * - "Remember me" checkbox (hooked to form values for future use).
 *
 * @param {function} onSubmit - called with { email, password, rememberMe }
 * @param {boolean} isLoading - disables controls and shows loading on submit
 * @param {string} [containerClassName]
 */
export default function Login({ onSubmit, onGoogleSignIn, isLoading, containerClassName = 'space-y-6' }) {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const [showPassword, setShowPassword] = useState(false);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={containerClassName} noValidate>
            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-white">
                    Email
                </label>
                <div className="mt-1">
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        placeholder="you@example.com"
                        {...register('email', {
                            required: 'Email is required'
                        })}
                    />
                    {errors.email && (
                        <p id="email-error" className="mt-2 text-sm text-red-600" aria-live="polite">
                            {errors.email.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Password + Show/Hide */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-white">
                    Password
                </label>
                <div className="mt-1">
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        showPasswordToggle={true}
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword((v) => !v)}
                        aria-invalid={errors.password ? 'true' : 'false'}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                        {...register('password', {
                            required: 'Password is required'
                        })}
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
                    <span className="text-sm text-white/80">Remember me</span>
                </label>

                <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-[#bfa200] hover:text-[#bfa200]/80 underline underline-offset-2"
                >
                    Forgot password?
                </Link>
            </div>

            {/* Submit */}
            <FormButton type="submit" isLoading={isLoading} fullWidth>
                Log in
            </FormButton>

            {/* OR separator */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                    <span className="rounded-full bg-white px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-black/70 shadow">
                        or
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
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="font-semibold text-[#bfa200] hover:text-[#bfa200]/80 underline">
                        Create one
                    </Link>
                </p>
            </div>
        </form>
    );
}
