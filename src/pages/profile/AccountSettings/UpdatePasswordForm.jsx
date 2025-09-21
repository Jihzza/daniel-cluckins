// src/pages/profile/AccountSettings/UpdatePasswordForm.jsx

import React, { useState } from 'react';
import { KeyIcon } from '@heroicons/react/24/outline';
import { updateUserPassword } from '../../../services/authService';
import Input from '../../../components/common/Forms/Input';
import FormButton from '../../../components/common/Forms/FormButton';
import SettingsSectionHeader from '../AccountSettings/SettingsSectionHeader';
import { useTranslation } from 'react-i18next';

const UpdatePasswordForm = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await updateUserPassword(password);
    if (error) {
      setMessage(t('accountSettings.updateEmail.errorMessage', { message: error.message }));
    } else {
      setMessage(t('accountSettings.updatePassword.successMessage'));
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <section className="rounded-2xl border border-white p-6 sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#002147]/5">
          <KeyIcon className="h-5 w-5 text-[#fff]" />
        </span>
        <SettingsSectionHeader title={t('accountSettings.updatePassword.title')} className="mb-0" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('accountSettings.updatePassword.placeholder')}
          required
          minLength="6"
        />
        <FormButton type="submit" isLoading={loading} fullWidth className="focus:ring-[#002147]">
          {t('accountSettings.updatePassword.button')}
        </FormButton>
      </form>

      {message && <p className="mt-4 text-sm text-center text-white">{message}</p>}
    </section>
  );
};

export default UpdatePasswordForm;
