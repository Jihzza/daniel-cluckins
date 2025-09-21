// src/pages/profile/AccountSettings/LegalLinksSection.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, ShieldCheckIcon, ScaleIcon } from '@heroicons/react/24/outline';
import SettingsSectionHeader from '../AccountSettings/SettingsSectionHeader';
import { useTranslation } from 'react-i18next';

const LegalLink = ({ to, label, icon: Icon }) => (
  <Link
    to={to}
    className="flex items-center justify-between p-4 rounded-xl  transition-colors duration-150"
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#002147]/5">
          <Icon className="h-5 w-5 text-[#fff]" />
        </span>
      )}
      <span className="text-sm text-white md:text-base">{label}</span>
    </div>
    <ChevronRightIcon className="h-5 w-5 text-white" />
  </Link>
);

export default function LegalLinksSection() {
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl border border-white p-6 sm:p-8">
      <SettingsSectionHeader title={t('accountSettings.legal.title')} />
      
        <LegalLink
          to="/privacy-policy"
          label={t('accountSettings.legal.privacyPolicy')}
          icon={ShieldCheckIcon}
        />
        <hr className='text-white' />
        <LegalLink
          to="/terms-of-service"
          label={t('accountSettings.legal.termsOfService')}
          icon={ScaleIcon}
        />
    </section>
  );
}
