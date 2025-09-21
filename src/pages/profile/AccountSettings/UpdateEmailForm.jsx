// src/pages/profile/AccountSettings/UpdateEmailForm.jsx

import React, { useState } from 'react';
import { AtSymbolIcon } from '@heroicons/react/24/outline';
import { updateUserEmail } from '../../../services/authService';
import Input from '../../../components/common/Forms/Input';
import FormButton from '../../../components/common/Forms/FormButton';
import SettingsSectionHeader from '../AccountSettings/SettingsSectionHeader';
import { useTranslation } from 'react-i18next';

const UpdateEmailForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await updateUserEmail(email);
    if (error) {
      setMessage(t('accountSettings.updateEmail.errorMessage', { message: error.message }));
    } else {
      setMessage(t('accountSettings.updateEmail.successMessage'));
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <section className="rounded-2xl border border-white p-6 sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#002147]/5">
          <AtSymbolIcon className="h-5 w-5 text-[#fff]" />
        </span>
        <SettingsSectionHeader title={t('accountSettings.updateEmail.title')} className="mb-0" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('accountSettings.updateEmail.placeholder')}
          required
        />
        <FormButton type="submit" isLoading={loading} fullWidth className="focus:ring-[#002147]">
          {t('accountSettings.updateEmail.button')}
        </FormButton>
      </form>

      {message && <p className="mt-4 text-sm text-center text-gray-600">{message}</p>}
    </section>
  );
};

export default UpdateEmailForm;
