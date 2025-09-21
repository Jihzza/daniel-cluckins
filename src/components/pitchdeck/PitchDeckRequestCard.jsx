// src/components/pitchdeck/PitchDeckRequestCard.jsx
import React from 'react';
import { DocumentArrowDownIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const STATUS_CLASS = {
  submitted: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  feedback_sent: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
};

export default function PitchDeckRequestCard({ request }) {
  const { t } = useTranslation();

  const company =
    request?.company_name ??
    request?.project ??
    request?.name ??
    t('pitchDeckRequest.untitled');

  const submittedAt = request?.submitted_at ?? request?.created_at ?? null;
  const formattedDate = submittedAt ? new Date(submittedAt).toLocaleDateString() : '—';

  // normalize status to an i18n key and pick a class
  const rawStatus = String(request?.status ?? 'archived').toLowerCase();
  const statusKey = rawStatus.replace(/\s+/g, '_'); // e.g. "in review" -> "in_review"
  const statusCls = STATUS_CLASS[statusKey] ?? STATUS_CLASS.archived;
  const statusLabel = t(`pitchDeckRequest.status.${statusKey}`, {
    defaultValue: request?.status ?? t('pitchDeckRequest.status.unknown'),
  });

  const fileUrl = request?.file_url || null;
  const canDownload = Boolean(fileUrl);

  return (
    <div className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800 md:text-2xl lg:text-xl">{company}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1 md:text-base lg:text-sm">
            <ClockIcon className="h-4 w-4 mr-1.5 md:h-6 md:w-6 lg:h-5 lg:w-5" />
            {t('pitchDeckRequest.submittedOn')} {formattedDate}
          </div>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize md:text-base lg:text-sm ${statusCls}`}>
          {statusLabel}
        </span>
      </div>

      {canDownload && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          {t('pitchDeckRequest.download')}
        </a>
      )}
    </div>
  );
}
