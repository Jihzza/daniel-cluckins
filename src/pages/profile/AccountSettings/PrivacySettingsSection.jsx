// src/pages/profile/AccountSettings/PrivacySettingsSection.jsx

import React, { useState } from 'react';
import FormButton from '../../../components/common/Forms/FormButton';
import SettingsSectionHeader from '../AccountSettings/SettingsSectionHeader';
import { useTranslation } from 'react-i18next';

const ToggleSwitch = ({ label, description, name, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-200">
    <div className="flex-grow pr-4">
      <label htmlFor={name} className="block text-sm font-medium text-white md:text-base">
        {label}
      </label>
      <p className="text-xs text-white md:text-sm">{description}</p>
    </div>

    {/* Accessible, modern toggle */}
    <div className="relative">
      <input
        id={name}
        name={name}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-[#002147]" />
      <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </div>
  </div>
);

const SelectInput = ({ label, description, name, value, onChange, options }) => (
  <div className="py-4 border-b border-gray-200">
    <label htmlFor={name} className="block text-sm font-medium text-white md:text-base">
      {label}
    </label>
    <p className="text-xs text-white mb-2 md:text-sm">{description}</p>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-xl border-0 ring-1 ring-gray-300 focus:ring-2 focus:ring-[#002147] text-sm py-2 pl-3 pr-10 bg-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default function PrivacySettingsSection() {
  const { t } = useTranslation();
  const [privacySettings, setPrivacySettings] = useState({
    shareAnalytics: true,
    chatRetention: '6months',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrivacySettings((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    setIsLoading(true);
    setMessage('');
    setTimeout(() => {
      setMessage(t('accountSettings.privacy.saveSuccess'));
      setIsLoading(false);
    }, 1000);
  };

  const retentionOptions = Object.entries(
    t('accountSettings.privacy.retention.options', { returnObjects: true })
  ).map(([value, label]) => ({ value, label }));

  return (
    <section className="rounded-2xl border border-white p-6 sm:p-8">
      <SettingsSectionHeader title={t('accountSettings.privacy.title')} />

      <ToggleSwitch
        label={t('accountSettings.privacy.analytics.label')}
        description={t('accountSettings.privacy.analytics.description')}
        name="shareAnalytics"
        checked={privacySettings.shareAnalytics}
        onChange={handlePrivacyChange}
      />

      <SelectInput
        label={t('accountSettings.privacy.retention.label')}
        description={t('accountSettings.privacy.retention.description')}
        name="chatRetention"
        value={privacySettings.chatRetention}
        onChange={handlePrivacyChange}
        options={retentionOptions}
      />

      <div className="py-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-white md:text-base">
            {t('accountSettings.privacy.download.title')}
          </h4>
          <p className="text-xs text-white md:text-sm">
            {t('accountSettings.privacy.download.description')}
          </p>
        </div>
        <FormButton
          onClick={() => alert(t('accountSettings.privacy.download.alert'))}
          isLoading={false}
          className="w-auto text-sm focus:ring-[#002147]"
        >
          {t('accountSettings.privacy.download.button')}
        </FormButton>
      </div>

      <div className="mt-6">
        <FormButton onClick={handleSave} isLoading={isLoading} fullWidth className="focus:ring-[#002147]">
          {t('accountSettings.privacy.saveButton')}
        </FormButton>
        {message && <p className="mt-4 text-sm text-center text-green-600">{message}</p>}
      </div>
    </section>
  );
}
