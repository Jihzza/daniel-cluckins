// src/services/availabilityService.js

import {
    parseISO,
    startOfDay,
    endOfDay,
    set,
    addMinutes,
    subMinutes,
    isWithinInterval,
    areIntervalsOverlapping,
    isBefore,
    addHours,
} from 'date-fns';

/**
 * @typedef {Object} TimeSlot
 * @property {string} value - The time in "HH:mm" format (e.g., "10:15").
 * @property {string} label - The display label for the time (e.g., "10:15 AM").
 */

/**
 * @typedef {Object} Booking
 * @property {string} appointment_start - The ISO 8601 string for the appointment's start time.
 * @property {number} duration_minutes - The duration of the appointment in minutes.
 */

const SCHEDULING_CONFIG = {
    WORKING_HOURS: { start: { hours: 10, minutes: 0 }, end: { hours: 22, minutes: 0 } },
    TIME_SLOT_INTERVAL: 15,
    BUFFER_MINUTES: 30,
};

/**
 * Creates a list of all time intervals that are blocked by existing bookings.
 * This function is now more robust and will not crash on invalid data.
 *
 * @param {Date} date - The date for which to get blocked times.
 * @param {Booking[]} existingBookings - An array of existing appointment objects.
 * @returns {Interval[]} An array of date-fns Interval objects representing blocked times.
 */
const getBlockedTimeIntervals = (date, existingBookings) => {
    if (!existingBookings || existingBookings.length === 0) return [];

    // --- THIS IS THE FIX ---
    // "Why": We now use .filter() to remove any bookings that are missing the
    // `appointment_start` property. This prevents `parseISO` from ever receiving
    // a null or undefined value, thus preventing the crash.
    return existingBookings
      .filter(booking => booking && booking.appointment_start)
      .map(booking => {
          const startTime = parseISO(booking.appointment_start);
          const bookingEnd = addMinutes(startTime, booking.duration_minutes);
          const bufferStart = subMinutes(startTime, SCHEDULING_CONFIG.BUFFER_MINUTES);
          return { start: bufferStart, end: bookingEnd };
      });
};

/**
 * Generates and filters time slots to find all valid, available start times.
 *
 * @param {Date} selectedDate - The calendar date the user has picked.
 * @param {number} desiredDuration - The duration in minutes for the new consultation.
 * @param {Booking[]} existingBookings - An array of appointments already on the calendar for that day.
 * @returns {TimeSlot[]} An array of available time slot objects.
 */
export const getAvailableTimeSlots = (selectedDate, desiredDuration, existingBookings) => {
    const dayStart = set(startOfDay(selectedDate), SCHEDULING_CONFIG.WORKING_HOURS.start);
    const dayEnd = set(endOfDay(selectedDate), SCHEDULING_CONFIG.WORKING_HOURS.end);

    const blockedIntervals = getBlockedTimeIntervals(selectedDate, existingBookings);
    const availableSlots = [];
    let currentTime = dayStart;

    while (currentTime < dayEnd) {
        const proposedEndTime = addMinutes(currentTime, desiredDuration);
        const proposedInterval = { start: currentTime, end: proposedEndTime };

        const isValid =
            isWithinInterval(proposedEndTime, { start: dayStart, end: dayEnd }) &&
            !blockedIntervals.some(blocked =>
                areIntervalsOverlapping(proposedInterval, blocked, { inclusive: true })
            );

        if (isValid) {
            availableSlots.push({
                value: `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`,
                label: `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`,
            });
        }

        currentTime = addMinutes(currentTime, SCHEDULING_CONFIG.TIME_SLOT_INTERVAL);
    }

    return availableSlots;
};