// src/components/scheduling/ContactInfoStep.jsx

import React from 'react';

import Input from '../common/Forms/Input';
import GoogleButton from '../common/Forms/GoogleButton';
import { useTranslation } from 'react-i18next'; // 1. Import hooks

// COMPONENT DEFINITION

/**
 * A step to collect user contact information
 * It intelligently adaps its UI based on the user's authentication status
 * 
 * @param {bollean} isLoggedIn - Flag indicating if the user is authenticated
 * @param {object} contactInfoData - Object containing the form data for this step (name, email, phone, etc.).
 * @param {function} onUpdateField - Callback to update the parent component's state
 * @param {function} onGoogleSignIn - Callback to trigger the Google sign-in flow
 */
export default function ContactInfoStep({ isLoggedIn, contactInfoData, onUpdateField, onGoogleSignIn }) {
    const { t } = useTranslation(); // 3. Initialize the hook

    return (
        <div className="w-full">
            {isLoggedIn ? (
                // LOGGED IN VIEW
                <div className="space-y-4 text-white">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white md:text-lg">{t('scheduling.contactInfo.fullNameLabel')}</label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder={t('scheduling.contactInfo.fullNamePlaceholder')}
                            value={contactInfoData.name}
                            onChange={onUpdateField}
                            className="md:text-lg shadow-xl"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white md:text-lg">{t('scheduling.contactInfo.emailLabel')}</label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t('scheduling.contactInfo.emailPlaceholder')}
                            value={contactInfoData.email}
                            onChange={onUpdateField}
                            className="md:text-lg shadow-xl"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-white md:text-lg">{t('scheduling.contactInfo.phoneLabel')}</label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder={t('scheduling.contactInfo.phonePlaceholder')}
                            value={contactInfoData.phone}
                            onChange={onUpdateField}
                            className="md:text-lg shadow-xl"
                        />
                    </div>
                </div>
            ) : (
                // GUEST / LOGGED-OUT VIEW
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-white">{t('scheduling.contactInfo.fullNameLabel')}</label>
                        <Input id="name" name="name" type="text" placeholder={t('scheduling.contactInfo.fullNamePlaceholder')} value={contactInfoData.name} onChange={onUpdateField} />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white">{t('scheduling.contactInfo.emailLabel')}</label>
                        <Input id="email" name="email" type="email" placeholder={t('scheduling.contactInfo.emailPlaceholder')} value={contactInfoData.email} onChange={onUpdateField} />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-white">{t('scheduling.contactInfo.phoneLabel')}</label>
                        <Input id="phone" name="phone" type="tel" placeholder={t('scheduling.contactInfo.phonePlaceholder')} value={contactInfoData.phone} onChange={onUpdateField} />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-white">{t('scheduling.contactInfo.passwordLabel')}</label>
                        <Input id="password" name="password" type="password" placeholder={t('scheduling.contactInfo.passwordPlaceholder')} value={contactInfoData.password} onChange={onUpdateField} />
                    </div>

                    <div className="p-2">
                        {/* 5. Use translated text for the Google button */}
                        <GoogleButton onClick={onGoogleSignIn} />
                    </div>
                    <div className="text-center text-sm text-white/80">
                        {t('scheduling.contactInfo.loginPrompt')}{' '}
                        <a href="/login" className="font-medium text-[#bfa200] hover:text-[#bfa200]/80">
                            {t('scheduling.contactInfo.loginLink')}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}