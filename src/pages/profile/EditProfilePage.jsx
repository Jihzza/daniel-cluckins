// src/pages/profile/EditProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile } from '../../services/authService';
import { useTranslation } from 'react-i18next';
import Input from '../../components/common/Forms/Input';
import FormButton from '../../components/common/Forms/FormButton';
import AvatarUploader from '../../components/profile/AvatarUploader';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

export default function EditProfilePage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    // strip any leading @ and spaces
    const normalizeUsername = (raw) => raw.replace(/^@+/, '').trim();

    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Use common Input component for consistency

    useEffect(() => {
        const fetchProfileData = async () => {
            if (user) {
                setLoading(true);
                setEmail(user.email || '');

                const { data: profileData, error: fetchError } = await getProfile(user.id);

                if (fetchError) {
                    setError(t('editProfile.errors.load'));
                } else if (profileData) {
                    setFullName(profileData.full_name || '');
                    setUsername(profileData.username || '');
                    setPhone(profileData.phone || '');
                    setAvatarUrl(profileData.avatar_url || user.user_metadata?.avatar_url);
                }
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [user, t]);

    const handleAvatarSuccess = (newUrl) => {
        setAvatarUrl(newUrl);
        setMessage(t('editProfile.messages.avatarSuccess'));
        setTimeout(() => setMessage(''), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');

        const updates = {
            full_name: fullName.trim(),
            username: normalizeUsername(username),
            phone: phone.trim(),
        };

        const { error: updateError } = await updateProfile(user.id, updates);

        if (updateError) {
            if (updateError.message?.includes('duplicate key value violates unique constraint')) {
                setError(t('editProfile.errors.usernameTaken', { username: updates.username }));
            } else {
                setError(t('editProfile.errors.update'));
            }
        } else {
            setMessage(t('editProfile.messages.profileSuccess'));
            setTimeout(() => navigate('/profile'), 500);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-white">{t('editProfile.loading')}</div>
        );
    }

    return (
        <main className="max-w-3xl bg-[#002147]  mx-auto p-4 sm:p-6 lg:p-8">

            {/* Card */}
            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
                {/* Top: avatar */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="shrink-0">
                            {/* Keep your Octagon avatar component as-is */}
                            <AvatarUploader currentAvatarUrl={avatarUrl} onUploadSuccess={handleAvatarSuccess} />
                        </div>
                        <div className="text-white/80">
                            <h2 className="font-semibold">{t('editProfile.photo.title')}</h2>
                            <p className="text-sm text-white/60">{t('editProfile.photo.help')}</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="p-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Email (read-only) */}
                        <div className="lg:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-white">
                                {t('editProfile.form.email.label')}
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                disabled
                                aria-readonly="true"
                                autoComplete="email"
                                className="md:text-lg"
                                aria-describedby="email-info"
                            />
                            <div id="email-info" className="flex items-center mt-2 text-xs text-white/60">
                                <InformationCircleIcon className="h-4 w-4 mr-1.5" />
                                {t('editProfile.form.email.info')}
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-white">
                                {t('editProfile.form.username.label')}
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/60">
                                    @
                                </span>
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(normalizeUsername(e.target.value))}
                                    required
                                    autoComplete="username"
                                    className="pl-7 md:text-lg"
                                />
                            </div>
                        </div>

                        {/* Full name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-white">
                                {t('editProfile.form.fullName.label')}
                            </label>
                            <Input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                autoComplete="name"
                                className="md:text-lg"
                            />
                        </div>

                        {/* Phone */}
                        <div className="lg:col-span-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-white">
                                {t('editProfile.form.phone.label')}
                            </label>
                            <Input
                                id="phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="md:text-lg"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="w-auto text-base leading-[1.45] tracking-[0.01em] px-3 py-2 rounded-lg text-white/80 hover:text-white border border-white/20 font-bold md:px-5 md:py-4 md:text-lg lg:py-2 lg:px-3"
                        >
                            {t('editProfile.form.buttons.cancel')}
                        </button>

                        <FormButton type="submit" disabled={saving}>
                            {saving ? t('editProfile.form.buttons.saving') : t('editProfile.form.buttons.save')}
                        </FormButton>
                    </div>
                </form>
            </section>
        </main>
    );
}
