// src/pages/AddTestimonialPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createTestimonial } from '../services/testimonialService';
import { getProfile } from '../services/profileService';
import AddTestimonialForm from '../components/testimonials/AddTestimonialForm';
import SectionTextWhite from '../components/common/SectionTextWhite';

export default function AddTestimonialPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                const { data, error: fetchError } = await getProfile(user.id);
                if (fetchError) {
                    setError('Could not load your profile. Please try again later.');
                } else {
                    setProfileData(data);
                }
            };
            fetchProfile();
        }
    }, [user]);

    const handleSubmit = async (testimonialData, imageFile) => {
        if (!user) {
            setError("You must be logged in to submit a testimonial.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        const fullData = {
            ...testimonialData,
            userId: user.id,
            existingAvatarUrl: profileData?.avatar_url,
        };

        try {
            const { data, error: createError } = await createTestimonial(fullData, imageFile);

            if (createError) {
                // Provide more specific error messages based on the error type
                let errorMessage = createError.message;
                
                if (createError.message.includes('duplicate key') || createError.message.includes('unique constraint')) {
                    errorMessage = "You have already submitted a testimonial. Your previous testimonial has been updated.";
                } else if (createError.message.includes('Invalid key')) {
                    errorMessage = "There was an issue with the image file. Please try with a different image.";
                } else if (createError.message.includes('storage')) {
                    errorMessage = "There was an issue uploading your image. Please try again.";
                }
                
                setError(errorMessage);
                setIsSubmitting(false);
            } else {
                // Success - show success message and navigate after delay
                setSuccess(data?._isUpdate ? 'updated' : 'created');
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setError("An unexpected error occurred. Please try again later.");
            setIsSubmitting(false);
        }
    };

    // The container is now simplified. It will inherit the background and height from the main Layout component.
    return (
        <div className="w-full max-w-lg mx-auto p-8 space-y-8 bg-[#002147] h-full">
            <SectionTextWhite title="Leave a Testimonial" />
            
            <AddTestimonialForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                profileData={profileData}
            />
            
            {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
            {success && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded text-center">
                    <p className="font-semibold">
                        {success === 'updated' 
                            ? 'Testimonial updated successfully!' 
                            : 'Testimonial submitted successfully!'
                        }
                    </p>
                    <p className="text-sm">Redirecting you back to the home page...</p>
                </div>
            )}
        </div>
    );
}