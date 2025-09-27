// src/pages/sections/SignupSection.jsx

// --- IMPORTS (remain the same) ---
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signUpNewUser, signInWithGoogle } from '../../services/authService';
import SectionTextBlack from '../../components/common/SectionTextBlack';
import Signup from '../../components/auth/Signup';
import EmailVerificationModal from '../../components/auth/EmailVerificationModal';
import { useTranslation } from 'react-i18next';

export default function SignupSection() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [needVerification, setNeedVerification] = useState(false);
    const { t } = useTranslation();

    const handleSignup = async ({ email, password }) => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await signUpNewUser(email, password);
            if (error) throw error;

            if (!data.session) {
                setNeedVerification(true);
                setIsLoading(false);
                return;
            }
            navigate('/profile');

        } catch (err) {
            setError(err.message || 'An unexpected error occurred during sign up.');
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { error } = await signInWithGoogle();
            if (error) throw error;
            // Google sign-in will redirect, so no need to navigate manually
        } catch (err) {
            setError(err.message || 'Google sign-in failed');
            setIsLoading(false);
        }
    };

    return (
        <section id="signup-section" className="max-w-4xl mx-auto py-4 text-center md:px-6">
            <SectionTextBlack title={t('signup.title')}>
                {t('signup.subtitle')}
            </SectionTextBlack>

            <div className="mt-8 flex justify-center">
                <div className="w-full max-w-md">
                    <div className="w-full max-w-2xl p-8 space-y-4 bg-[#002147] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                        <Signup onSubmit={handleSignup} onGoogleSignIn={handleGoogleSignIn} isLoading={isLoading} textColor="black" showNameField />
                        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                    </div>
                </div>
            </div>
            
            <EmailVerificationModal
                open={needVerification}
                onClose={() => setNeedVerification(false)}
            />
        </section>
    );
}