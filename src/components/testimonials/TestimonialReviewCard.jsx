// src/components/testimonials/TestimonialReviewCard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import hook

const TestimonialReviewCard = ({ testimonial, onApprove, onReject }) => {
    const { t } = useTranslation(); // 2. Initialize hook
    const { content, rating, profiles: author } = testimonial;
    
    // 3. Use translated "Anonymous" text
    const authorName = author?.full_name || t('testimonials.review.anonymous');
    const avatarUrl = author?.avatar_url || `https://i.pravatar.cc/150?u=${authorName}`;

    return (
        <div className="bg-black p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200">
            <div className="flex items-center mb-4">
                <img src={avatarUrl} alt={authorName} className="w-12 h-12 rounded-full mr-4" />
                <div>
                    <p className="font-bold text-gray-800">{authorName}</p>
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                            </svg>
                        ))}
                    </div>
                </div>
            </div>
            <p className="text-gray-600 italic">"{content}"</p>
            <div className="flex justify-end space-x-3 mt-4">
                {/* 4. Use translated button text */}
                <button onClick={() => onReject(testimonial.id)} className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200">
                    {t('testimonials.review.reject')}
                </button>
                <button onClick={() => onApprove(testimonial.id)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                    {t('testimonials.review.approve')}
                </button>
            </div>
        </div>
    );
};

export default TestimonialReviewCard;