// src/services/appointmentService.js

import { supabase } from '../lib/supabaseClient'; // Ensure this path is correct
import { startOfDay, endOfDay } from 'date-fns';

/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} appointment_start - The combined ISO 8601 timestamp for the appointment.
 * @property {number} duration_minutes
 * @property {string} user_id
 */

/**
 * Fetches appointments for a specific date directly from Supabase.
 * This function now correctly queries the 'appointment_start' column.
 *
 * @param {Date} date - The date to fetch appointments for.
 * @returns {Promise<{data: Booking[] | null, error: any | null}>}
 */
export const getAppointmentsForDate = async (date) => {
  if (!date) {
    return { data: null, error: new Error("Date is required.") };
  }

  const dayStart = startOfDay(date).toISOString();
  const dayEnd = endOfDay(date).toISOString();

  try {
    // --- THE ONLY CHANGE IS HERE ---
    // We are now querying the 'appointment_start' column to match your new database schema.
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_start', dayStart) // Changed from 'appointment_date'
      .lte('appointment_start', dayEnd);   // Changed from 'appointment_date'

    if (error) {
      throw error;
    }

    return { data, error: null };

  } catch (error) {
    console.error(`Failed to fetch appointments for date ${date.toISOString()}:`, error);
    return { data: null, error };
  }
};

/**
 * Fetches all appointments for a given user.
 *
 * @param {string} userId - The user's UUID.
 * @returns {Promise<{data: Booking[] | null, error: any | null}>}
 */
export const getAppointmentsByUserId = async (userId) => {
    if (!userId) {
        return { data: null, error: new Error("User ID is required.") };
    }

    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', userId)
            .order('appointment_start', { ascending: true }); // Also updated here for consistency

        if (error) throw error;
        
        return { data, error: null };

    } catch (error) {
        console.error(`Failed to fetch appointments for user ${userId}:`, error);
        return { data: null, error };
    }
};