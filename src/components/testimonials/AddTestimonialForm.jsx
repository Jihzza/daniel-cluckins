// src/components/testimonials/AddTestimonialForm.jsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../common/Forms/Input';
import FormButton from '../common/Forms/FormButton';
import { useTranslation } from 'react-i18next';
import OctagonAvatar from '../common/OctagonAvatar'; // ← NEW

export default function AddTestimonialForm({ onSubmit, isSubmitting, profileData }) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (profileData) {
      reset({ name: profileData.username });
    }
  }, [profileData, reset]);

  const handleFormSubmit = (data) => {
    const imageFile = data.image && data.image[0] ? data.image[0] : null;
    onSubmit({ name: data.name, content: data.content }, imageFile);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      <div className="flex flex-col items-center space-y-4">
        {profileData?.avatar_url && (
          <OctagonAvatar
            src={profileData.avatar_url}
            alt="Current profile"
            size={80}         // ~ w-20 / h-20
            ringWidth={3}
            gap={3}
            ringColor="#BFA200" // matches your border brand color
            className="shadow"
          />
        )}
        <div className="flex-1">
          <label htmlFor="image" className="block text-sm font-medium text-white">
            {profileData?.avatar_url ? t('addTestimonial.changePhoto') : t('addTestimonial.uploadPhoto')} {t('addTestimonial.optional')}
          </label>
          <div className="mt-1">
            <Input
              id="image"
              type="file"
              {...register('image')}
              accept="image/*"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white">{t('addTestimonial.yourNameLabel')}</label>
        <div className="mt-1">
          <Input
            id="name"
            type="text"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name', { required: t('addTestimonial.yourNameRequired') })}
            readOnly
          />
        </div>
        {errors.name && (
          <p id="name-error" className="mt-2 text-sm text-red-600" aria-live="polite">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-white">{t('addTestimonial.testimonialLabel')}</label>
        <div className="mt-1">
          <textarea
            id="content"
            rows="4"
            aria-invalid={errors.content ? 'true' : 'false'}
            aria-describedby={errors.content ? 'content-error' : undefined}
            {...register('content', {
              required: t('addTestimonial.testimonialRequired'),
              maxLength: { value: 120, message: t('addTestimonial.testimonialMaxLength') }
            })}
            className="w-full px-3 py-2 mt-2 rounded-xl text-white placeholder-gray-400 shadow-sm ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-white/70 bg-black/10 backdrop-blur-md border border-white/20"
          />
        </div>
        {errors.content && (
          <p id="content-error" className="mt-2 text-sm text-red-600" aria-live="polite">{errors.content.message}</p>
        )}
      </div>

      <FormButton type="submit" disabled={isSubmitting} fullWidth>
        {isSubmitting ? t('addTestimonial.submitting') : t('addTestimonial.submitButton')}
      </FormButton>
    </form>
  );
}
