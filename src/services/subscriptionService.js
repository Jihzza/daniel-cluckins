// src/services/subscriptionService.js

import { supabase } from '../lib/supabaseClient';

/**
 * Fetches all subscriptions for a user from the database
 * The service layer absctacts data logic away from UI components
 * 
 * @param {string} userId - The ID of the user whose subscriptions we want to fetch.
 * @returns {Promise<{data: any[] | null, error: any | null}>}
 */
export const getSubscriptionsByUserId = async (userId) => {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    return { data, error };
};