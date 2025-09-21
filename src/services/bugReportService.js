// src/services/bugReportService.js

/**
 * A service module for handling bug report submissions.
 * This encapsulates all logic for sending bug data to the Supabase 'bug_reports' table.
 *
 * @module services/bugReportService
 */

// Import the configured Supabase client, just like in your other services.
import { supabase } from '../lib/supabaseClient';

/**
 * Uploads an image file to Supabase Storage and returns the public URL.
 *
 * @param {File} imageFile - The image file to upload.
 * @param {string} reportId - The bug report ID to associate with the image.
 * @returns {Promise<{url: string|null, error: object|null}>} - An object containing either the public URL or an error.
 */
const uploadImage = async (imageFile, reportId) => {
  try {
    // Create a unique filename
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${reportId}-${Date.now()}.${fileExt}`;
    const filePath = `bug-reports/${fileName}`;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('bug-reports')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error.message);
      return { url: null, error };
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('bug-reports')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (err) {
    console.error('Error in uploadImage:', err);
    return { url: null, error: err };
  }
};

/**
 * Inserts a new bug report into the Supabase database.
 *
 * @param {object} reportData - The bug report data from the form.
 * @param {string} reportData.name - The name of the person submitting the report.
 * @param {string} reportData.email - The email of the person submitting the report.
 * @param {string} reportData.description - The detailed description of the bug.
 * @param {FileList} [reportData.image] - The image file(s) to upload (optional).
 * @param {string} [userId] - The UUID of the authenticated user submitting the report (optional).
 * @returns {Promise<{data: object|null, error: object|null}>} - An object containing either the newly created data or an error.
 */
export const submitBugReport = async (reportData, userId = null) => {
  // Destructure the form data for clarity.
  const { name, email, description, image } = reportData;

  let imageUrl = null;

  // Handle image upload if provided
  if (image && image.length > 0) {
    // First, create the bug report to get an ID
    const { data: initialData, error: initialError } = await supabase
      .from('bug_reports')
      .insert({
        name,
        email,
        description,
        user_id: userId,
        image_url: null, // Will be updated after image upload
      })
      .select()
      .single();

    if (initialError) {
      console.error('Error creating initial bug report:', initialError.message);
      return { data: null, error: initialError };
    }

    // Upload the image
    const { url, error: uploadError } = await uploadImage(image[0], initialData.id);
    
    if (uploadError) {
      // If image upload fails, we can still keep the bug report but without image
      console.error('Error uploading image, keeping bug report without image:', uploadError.message);
      return { data: initialData, error: null };
    }

    imageUrl = url;

    // Update the bug report with the image URL
    const { data, error } = await supabase
      .from('bug_reports')
      .update({ image_url: imageUrl })
      .eq('id', initialData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bug report with image URL:', error.message);
      return { data: initialData, error };
    }

    return { data, error: null };
  } else {
    // No image provided, create bug report without image
    const { data, error } = await supabase
      .from('bug_reports')
      .insert({
        name,
        email,
        description,
        user_id: userId,
        image_url: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bug report:', error.message);
    }

    return { data, error };
  }
};