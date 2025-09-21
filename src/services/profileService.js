// src/services/profileService.js

// This service module handles all interactions with the 'profile' table
// It's responsible for fetching public user profile data

import { supabase } from '../lib/supabaseClient';

/**
 * Fetches a user's public profile from the database
 * @param {string} userId - The ID of the user whose profile is being fecthed
 * @returns {{ data: object|null, error: object|null }} - The user's profile data and any potential error
 */

export const getProfile = async (userId) =>  {
    // 1. We select the user's name and avatar_url from the 'profiles' table
    // We use 'eq(id, userId)' to find the row that matches the currently logged-in user
    const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', erro.message);
        // It's important to return the error so the calling component can handle it
        return { data, error: null };
    };

    // 2. We return the data in a standardized format
    // The component will check for the presence of 'error'
    return { data, error: null };
};