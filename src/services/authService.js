// src/services/authService.js
// -----------------------------------------------------------
// This file wraps every Supabase authentication call in a
// tiny helper function. If you ever switch providers you
// only edit this file, not every place that uses auth.
// -----------------------------------------------------------

// 1️⃣  Pull in the already-configured Supabase client object.
import { supabase } from '../lib/supabaseClient';

/**
 * Create a brand-new account with email + password.
 *
 * @param {string} email    – The user’s email address.
 * @param {string} password – The password they chose.
 * @param {Object} [options] – Optional extra data (e.g. redirect URL).
 * @param {string} userId - The user's ID.
 * @param {object} profileData - An object with username, full_name, etc. * @returns {{data: object, error: object|null}}
 *            data  → Info about the new user & session.
 *            error → If something went wrong.
 */
export const signUpNewUser = async (email, password, options = {}) => {
  // ↪️  Await pauses until Supabase finishes the network request.
  const { data, error } = await supabase.auth.signUp({
    email,       // object-shorthand: same as email: email
    password,    // same for password
    options,     // extra, totally optional settings
  });
  return { data, error }; // Always hand both back to the caller.
};

/**
 * Log in an existing user.
 */
export const signInWithPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// Starts the Google OAuth flow. SUpabase will redirect the user to Google's consent screen, then back to the website

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // The redirect must point to the page where the form lives.
      redirectTo: window.location.origin, 
    },
  });

  // It's good practice to log potential errors.
  if (error) {
    console.error("Error signing in with Google:", error.message);
  }

  return { data, error };
};

// Send a reset-password email. Supabse will include a link that returns to /reset-password.

export const sendPasswordResetEmail = async (email) => {
  return await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password`,
  }); 
};

// After the user clicks the "change" button on /reset-password, we ask Supabase to set the *new* password.
export const updatePassword = async (newPassword) => {
  return await supabase.auth.updateUser({
    password: newPassword,
  });
};

/**
 * Log *out* the current user.
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error }; // no data on success, only “did an error happen?”
};

/**
 * Ask Supabase whether a saved session already exists
 * (for example after the page reloads).
 */
export const getUserSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

export const getProfile = async (userId) => {
  if (!userId) return { data: null, error: 'User ID is required' };

  const { data, error } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url, phone')
    .eq('id', userId)
    .single(); // .single() returns one object instead of an array

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is ok
    console.error('Error fetching profile:', error);
  }
  
  return { data, error };
}

export const updateProfile = async (userId, updates) => {
  if (!userId) return { data: null, error: { message: 'User ID is required.' } };

  try {
      const { data, error } = await supabase
          .from('profiles')
          .update({
              ...updates,
              updated_at: new Date().toISOString(), // Always update the timestamp
          })
          .eq('id', userId)
          .select() // Use .select() to get the updated data back
          .single(); // Use .single() if you expect only one row to be updated

      if (error) {
          console.error('Error updating profile:', error);
          throw error;
      }

      return { data, error: null };
  } catch (error) {
      return { data: null, error };
  }
};

export const uploadAvatar = async (userId, file) => {
  try {
      if (!userId || !file) {
          throw new Error('User ID and file are required for avatar upload.');
      }

      // 1. Define the path for the file in the storage bucket.
      // We include a timestamp to bypass caching issues in the browser.
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}.${fileExt}?t=${new Date().getTime()}`;

      // 2. Upload the file to the 'avatars' bucket.
      // `upsert: true` will overwrite the file if it already exists.
      const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
          });

      if (uploadError) {
          throw uploadError;
      }

      // 3. Get the public URL of the uploaded file.
      const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
          throw new Error('Could not get public URL for avatar.');
      }
      
      const publicUrl = urlData.publicUrl;

      // 4. Update the 'avatar_url' in the user's profile table.
      const { error: dbError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', userId);

      if (dbError) {
          throw dbError;
      }

      return publicUrl;
  } catch (error) {
      console.error('Error in avatar upload process:', error);
      // Here you could add more specific error handling or logging
      return null;
  }
};

export const updateUserEmail = async (newEmail) => {
  const { data, error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) console.error('Error updating user email:', error.message);
  return { data, error };
};

export const updateUserPassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) console.error('Error updating user password:', error.message);
  return { data, error };
};

export const deleteCurrentUser = async () => {
  const { data, error } = await supabase.functions.invoke('delete-user', {
    method: 'POST',
  });
  if (error) console.error("Error deleting user:", error.message);
  return { data, error };
};