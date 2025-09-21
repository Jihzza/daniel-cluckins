// src/components/bugReport/BugReportForm.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '../common/Forms/Input';
import FormButton from '../common/Forms/FormButton';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function BugReportForm({ onSubmit, isLoading, defaultValues = {} }) {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
        defaultValues
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const watchedImage = watch('image');

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    useEffect(() => {
        if (watchedImage && watchedImage.length > 0) {
            const file = watchedImage[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
            setImageFile(null);
        }
    }, [watchedImage]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setValue('image', e.target.files);
        }
    };

    const removeImage = () => {
        setValue('image', []);
        setImagePreview(null);
        setImageFile(null);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-white md:text-lg">
                    {t('bugReport.form.name.label')}
                </label>
                <Input
                    id="name"
                    type="text"
                    {...register('name', { required: t('bugReport.form.name.required') })}
                    className="md:text-lg"
                />
                {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-white md:text-lg">
                    {t('bugReport.form.email.label')}
                </label>
                <Input
                    id="email"
                    type="email"
                    {...register('email', { required: t('bugReport.form.email.required') })}
                    className="md:text-lg"
                />
                {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-white md:text-lg">
                    {t('bugReport.form.description.label')}
                </label>
                <textarea
                    id="description"
                    rows="4"
                    {...register('description', { required: t('bugReport.form.description.required') })}
                    className="mt-2 block w-full px-3 py-2 rounded-xl text-white placeholder-gray-400 shadow-sm ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-white/70 bg-black/10 backdrop-blur-md border border-white/20 md:text-lg"
                    placeholder={t('bugReport.form.description.placeholder')}
                />
                {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div>
                <label htmlFor="image" className="block text-sm font-medium text-white md:text-lg">
                    {t('bugReport.form.image.label')}
                    <span className="ml-1 text-xs text-white/60">({t('bugReport.form.image.optional')})</span>
                </label>
                <div className="mt-2">
                    {!imagePreview ? (
                        <div className="flex justify-center rounded-xl border-2 border-dashed border-white/30 bg-white/5 px-6 py-10 hover:bg-black/10 transition-colors">
                            <div className="text-center">
                                <PhotoIcon className="mx-auto h-12 w-12 text-white/40" />
                                <div className="mt-4 flex text-sm text-white/70">
                                    <label
                                        htmlFor="image"
                                        className="relative cursor-pointer rounded-md bg-black/10 px-3 py-2 font-medium text-white hover:bg-white/20 focus-within:outline-none focus-within:ring-2 focus-within:ring-white/50 focus-within:ring-offset-2 focus-within:ring-offset-gray-900"
                                    >
                                        <span>{t('bugReport.form.image.uploadText')}</span>
                                        <input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                <p className="pl-1 text-xs text-white/50">{t('bugReport.form.image.helpText')}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-32 w-full rounded-xl object-cover border border-white/20"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                            <p className="mt-1 text-xs text-white/70">{imageFile?.name}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-center">
                <FormButton type="submit" isLoading={isLoading}>
                    {t('bugReport.form.submitButton')}
                </FormButton>
            </div>
        </form>
    );
}