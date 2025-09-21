// src/services/financialService.js
import { supabase } from '../lib/supabaseClient';

/**
 * Calculate financial metrics for a user based on their appointments and subscriptions
 * @param {string} userId - The user's ID
 * @returns {Promise<{data: Object, error: any}>}
 */
export const getFinancialMetrics = async (userId) => {
  if (!userId) {
    return { data: null, error: new Error("User ID is required.") };
  }

  try {
    // Fetch appointments for consultation earnings calculation
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('duration_minutes, status')
      .eq('user_id', userId)
      .eq('status', 'Confirmed');

    if (appointmentsError) throw appointmentsError;

    // Fetch subscriptions for coaching revenue calculation
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('plan_id, status')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (subscriptionsError) throw subscriptionsError;

    // Calculate consultation earnings (lifetime)
    // Standard rate: €90/hour = €1.5 per minute
    const consultationEarnings = appointments?.reduce((total, appointment) => {
      const duration = appointment.duration_minutes || 0;
      const price = duration * 1.5; // €1.5 per minute
      return total + price;
    }, 0) || 0;

    // Calculate coaching revenue (current monthly)
    // Since we don't have price in the database, we'll use plan_id to determine pricing
    const planPricing = {
      'basic': 40,    // €40/month for basic plan
      'standard': 90, // €90/month for standard plan  
      'premium': 230  // €230/month for premium plan
    };
    
    const coachingRevenue = subscriptions?.reduce((total, subscription) => {
      const planId = subscription.plan_id?.toLowerCase();
      const price = planPricing[planId] || 0;
      return total + price;
    }, 0) || 0;

    // Pitch deck requests are free, so earnings are 0
    const pitchDeckEarnings = 0;

    return {
      data: {
        consultationEarnings,
        coachingRevenue,
        pitchDeckEarnings
      },
      error: null
    };

  } catch (error) {
    console.error('Failed to fetch financial metrics:', error);
    return { data: null, error };
  }
};
