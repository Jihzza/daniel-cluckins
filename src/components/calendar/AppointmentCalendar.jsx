// src/components/calendar/AppointmentCalendar.jsx
// Thin wrapper to feed highlighted dates into CustomCalendar.

import React, { useMemo } from "react";
import { parseISO } from "date-fns";
import CustomCalendar from "../scheduling/consultations/CustomCalendar";

/**
 * Highlights dates that have appointments.
 *
 * @param {Array} appointments - appointment objects containing `appointment_start`
 * @param {Date|null} selectedDate
 * @param {(date: Date) => void} onDateSelect
 */
export default function AppointmentCalendar({ appointments, selectedDate, onDateSelect }) {
  const highlightedDates = useMemo(() => {
    return Array.isArray(appointments)
      ? appointments
          .map((a) => a?.appointment_start)
          .filter(Boolean)
          .map((iso) => parseISO(iso))
      : [];
  }, [appointments]);

  return (
    <div className="w-full max-w-md mx-auto">
      <CustomCalendar
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        isDateSelectionRestricted={false}
        highlightedDates={highlightedDates}
      />
    </div>
  );
}
