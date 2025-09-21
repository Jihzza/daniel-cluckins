// src/components/appointments/AppointmentCard.jsx

import React from 'react'
import PropTypes from 'prop-types'
import { format, parseISO, addMinutes, isValid } from 'date-fns'
import { useTranslation } from 'react-i18next'

export default function AppointmentCard({ appointment }) {
  const { t } = useTranslation()
  if (!appointment) return null

  // --- DATA SAFETY & FORMATTING (unchanged) ---
  const rawStart = appointment?.appointment_start
  const duration = Number.isFinite(appointment?.duration_minutes)
    ? appointment.duration_minutes
    : null

  const parsedStart = rawStart ? parseISO(rawStart) : null
  const startDateTime = parsedStart && isValid(parsedStart) ? parsedStart : null
  const endDateTime =
    startDateTime && duration != null ? addMinutes(startDateTime, duration) : null

  const formattedDate = startDateTime
    ? format(startDateTime, 'eeee, MMMM d, yyyy')
    : t('appointments.card.dateTbd')
  const formattedStartTime = startDateTime ? format(startDateTime, 'p') : '—'
  const formattedEndTime = endDateTime ? format(endDateTime, 'p') : '—'

  const serviceType = appointment?.service_type
    ? appointment.service_type.charAt(0).toUpperCase() + appointment.service_type.slice(1)
    : t('appointments.card.appointmentFallback')

  // pluralized with i18n
  const durationLabel =
    duration != null ? t('appointments.card.duration', { count: duration }) : null

  return (
    <article
      className="relative pl-5 py-3"
      aria-label={t('appointments.card.ariaLabel', { serviceType, date: formattedDate })}
    >
      {/* left vertical bar (same palette as the other project; default gold) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-[#BFA200]"
      />

      <div className="flex items-center gap-4">
        {/* Compact start time column */}
        <time className="w-14 shrink-0 text-white/70 text-xs leading-6">
          {formattedStartTime}
        </time>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white truncate">{serviceType}</p>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/70">
            {/* Date (kept so the card works outside a grouped list too) */}
            <span className="truncate">{formattedDate}</span>
            <span aria-hidden>•</span>
            <span>
              {formattedStartTime} <span aria-hidden>–</span> {formattedEndTime}
            </span>
            {durationLabel && <span className="opacity-80">({durationLabel})</span>}
          </div>
        </div>
      </div>
    </article>
  )
}

AppointmentCard.propTypes = {
  appointment: PropTypes.shape({
    appointment_start: PropTypes.string, // ISO date string
    duration_minutes: PropTypes.number,
    service_type: PropTypes.string,
  }),
}
