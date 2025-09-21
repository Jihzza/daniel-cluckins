// src/pages/profile/AccountSettings/DeleteAccountSection.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { deleteCurrentUser, signOut } from '../../../services/authService';
import FormButton from '../../../components/common/Forms/FormButton';
import SettingsSectionHeader from '../AccountSettings/SettingsSectionHeader';
import { useTranslation } from 'react-i18next';

const DeleteAccountSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(t('accountSettings.deleteAccount.confirm'))) {
      setLoading(true);
      const { error } = await deleteCurrentUser();
      if (error) {
        alert(t('accountSettings.deleteAccount.error', { message: error.message }));
        setLoading(false);
      } else {
        alert(t('accountSettings.deleteAccount.success'));
        await signOut();
        navigate('/signup');
      }
    }
  };

  return (
    <section className="rounded-2xl border border-red-800 p-6 sm:p-8">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-700" />
        </span>
        <SettingsSectionHeader
          title={t('accountSettings.deleteAccount.title')}
          className="mb-0 text-red-800"
        />
      </div>

      <p className="py-3 text-sm text-red-700 md:text-base">
        {t('accountSettings.deleteAccount.description')}
      </p>

      <FormButton
        onClick={handleDelete}
        isLoading={loading}
        fullWidth
        className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 inline-flex items-center justify-center gap-2"
      >
        {t('accountSettings.deleteAccount.button')}
      </FormButton>
    </section>
  );
};

export default DeleteAccountSection;
