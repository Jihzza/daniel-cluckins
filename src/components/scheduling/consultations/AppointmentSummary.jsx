// src/components/scheduling/consultations/AppointmentSummary.jsx
import React, { useMemo } from 'react'
import { format, addMinutes } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { CalendarDays, Clock, ArrowRight } from 'lucide-react'

/**
 * AppointmentSummary (modernized)
 *
 * Props:
 * - date: Date
 * - startTime: string ("HH:mm")
 * - duration: string | number (minutes)
 */
export default function AppointmentSummary({ date, startTime, duration }) {
  const { t } = useTranslation()

  const { startDateTime, endDateTime, formattedDate, formattedStartTime, formattedEndTime } = useMemo(() => {
    const [h, m] = String(startTime).split(':').map(Number)
    const start = new Date(date)
    start.setHours(h || 0, m || 0, 0, 0)
    const end = addMinutes(start, Number(duration) || 0)
    return {
      startDateTime: start,
      endDateTime: end,
      formattedDate: format(date, 'E, d MMM yyyy'),
      formattedStartTime: format(start, 'HH:mm'),
      formattedEndTime: format(end, 'HH:mm'),
    }
  }, [date, startTime, duration])

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-black/10 backdrop-blur-lg text-white shadow-xl ring-1 ring-white/10">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-center gap-2 text-center font-semibold text-base md:text-lg mb-4 border-b border-white/10 pb-3 lg:text-base">
          <CalendarDays className="h-5 w-5 opacity-80" aria-hidden="true" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center justify-center gap-6 text-base md:text-xl lg:text-base">
          <div className="flex flex-col items-center">
            <span className="text-xs md:text-sm lg:text-xs text-gray-300">{t('scheduling.appointmentSummary.from')}</span>
            <div className="flex items-center gap-1 font-bold" aria-label={t('scheduling.appointmentSummary.from')}>
              <time dateTime={formattedStartTime}>{formattedStartTime}</time>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 opacity-80" aria-hidden="true" />
          <div className="flex flex-col items-center">
            <span className="text-xs md:text-sm lg:text-xs text-gray-300">{t('scheduling.appointmentSummary.to')}</span>
            <div className="flex items-center gap-1 font-bold" aria-label={t('scheduling.appointmentSummary.to')}>
              <time dateTime={formattedEndTime}>{formattedEndTime}</time>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm md:text-base lg:text-sm text-gray-300">
          <span className="opacity-80">{t('scheduling.appointmentSummary.duration', { defaultValue: 'Duration' })}: </span>
          <strong>{Number(duration) || 0} {t('scheduling.appointmentSummary.minutesShort', { defaultValue: 'min' })}</strong>
        </div>
      </div>
    </div>
  )
}