// src/services/testimonialService.js´

// This service module encapsulates all interactions with the Supabase 'testimonials' table and storage.
// By centralizing data logic here, we  adhere to the Single Responsibility Principle., making our components cleaner and our data access layer easier to manage, test, and potentially replace

import { supabase } from '../lib/supabaseClient';

/**
 * Fetches approved testimonials from the database
 * Only returns testimonials where is_approved = true
 * The data is ordered by creation date to show the newest testimonials first
 * @returns {{ data: object[], error: object|null}} - The fetched approved testimonials and error
 */
export const getTestimonials = async () => {
    // Select all columns from the 'testimonials' table
    // Only fetch approved testimonials for public display
    // Supabase automatically converts snake_case (image_url) to camelCase (imageUrl) in the response.
    const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true) // Only fetch approved testimonials
        .order('created_at', { ascending: false }); // Show newest first

    if (error) {
        console.error('Error fetching testimonials:', error.message);
    }

    return { data, error };
};

/**
 * Sanitizes a filename by removing special characters and replacing them with safe alternatives
 * @param {string} filename - The original filename
 * @returns {string} - The sanitized filename
 */
const sanitizeFilename = (filename) => {
    return filename
        .normalize('NFD') // Normalize to decomposed form
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
};

/**
 * Creates a new testimonial, including uploading an image if provided
 * @param {object} testimonialData - Contains name, content, and the user ID.
 * @param {File} imageFile - The image file to upload (can be null)
 * @returns {{ data: object, error: object|null }} - The newly created testimonial data or an error
 */
export const createTestimonial = async (testimonialData, imageFile) => {
    // 1. Destructure all the data we now receive from the page.
    const { name, content, userId, existingAvatarUrl } = testimonialData;

    let finalImageUrl = existingAvatarUrl || null; // Default to the existing avatar.

    // 2. If a *new* image is provided, upload it and overwrite the URL.
    if (imageFile) {
        const sanitizedFilename = sanitizeFilename(imageFile.name);
        const filePath = `public/${userId}/${Date.now()}_${sanitizedFilename}`;

        const { error: uploadError } = await supabase.storage
            .from('testimonials')
            .upload(filePath, imageFile);

        if (uploadError) {
            console.error('Error uploading new image:', uploadError.message);
            return { data: null, error: uploadError };
        }

        const { data: urlData } = supabase.storage
            .from('testimonials')
            .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl; // Use the newly uploaded image's URL.
    }

    // 3. First check if a testimonial already exists for this user
    const { data: existingTestimonial, error: checkError } = await supabase
        .from('testimonials')
        .select('id')
        .eq('user_id', userId)
        .single();

    let data, error;

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        // If there's an error other than "no rows found", return it
        return { data: null, error: checkError };
    }

    if (existingTestimonial) {
        // Update existing testimonial
        const { data: updateData, error: updateError } = await supabase
            .from('testimonials')
            .update({
                name,
                content,
                image_url: finalImageUrl,
                is_approved: false,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single();
        
        data = updateData ? { ...updateData, _isUpdate: true } : updateData;
        error = updateError;
    } else {
        // Insert new testimonial
        const { data: insertData, error: insertError } = await supabase
            .from('testimonials')
            .insert({
                name,
                content,
                image_url: finalImageUrl,
                user_id: userId,
                is_approved: false,
            })
            .select()
            .single();
        
        data = insertData ? { ...insertData, _isUpdate: false } : insertData;
        error = insertError;
    }

    if (error) {
        console.error('Error creating testimonial:', error.message);
    }

    return { data, error };
};