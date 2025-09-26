import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '../common/Forms/Input';
import FormButton from '../common/Forms/FormButton';
import { PaperClipIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

/**
 * Mobile-first Bug Report Form
 * - Paperclip button sits INSIDE the textarea (bottom-right), never blocks typing (extra right padding).
 * - Hidden <input type="file" multiple> triggered by that button.
 * - Nice preview grid: thumbnails for images; compact tiles with extension label for other files (pdf/docx/txt/...).
 * - We keep RHF ('attachments') in sync with the actual File[] the service expects.
 */
export default function BugReportForm({ onSubmit, isLoading, defaultValues = {} }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({ defaultValues });

  // We store objects so we can keep preview URLs without leaking memory
  // { file: File, previewUrl?: string, kind: 'image' | 'file', ext: '.pdf' | '.docx' | ... }
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // Keep RHF synchronized with the "raw" File[] expected by the service
  useEffect(() => {
    setValue('attachments', attachments.map(a => a.file));
  }, [attachments, setValue]);

  const triggerFilePicker = () => fileInputRef.current?.click();

  // What the picker shows (MIME + extensions for reliability)
  const ACCEPT = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/*',
    // Docs
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/markdown',
    // Extensions as fallback
    '.jpg', '.jpeg', '.png', '.webp', '.gif',
    '.pdf', '.docx', '.doc', '.txt', '.md', '.log'
  ].join(',');

  // IMPORTANT: this is enforced here AND in the service.
  const MAX_BYTES = 20 * 1024 * 1024; // 20MB per file

  // Helpers
  const isImage = (f) => (f.type || '').toLowerCase().startsWith('image/');
  const getExt = (name = '') => {
    const m = /\.[a-z0-9]+$/i.exec(name);
    return m ? m[0].toLowerCase() : '';
  };

  const makePreviewItem = (file) => {
    if (isImage(file)) {
      const url = URL.createObjectURL(file);
      return { file, previewUrl: url, kind: 'image', ext: getExt(file.name) };
    }
    return { file, previewUrl: null, kind: 'file', ext: getExt(file.name) };
  };

  const revokePreviews = (items) => {
    for (const a of items) {
      if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
    }
  };

  const onFilesPicked = (e) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;

    // Size gate
    const safe = list.filter(f => f.size <= MAX_BYTES);
    const items = safe.map(makePreviewItem);

    setAttachments(prev => [...prev, ...items]);
    // Allow selecting same file again later
    e.target.value = '';
  };

  const removeAttachmentAt = (idx) => {
    setAttachments(prev => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => revokePreviews(attachments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Small tile for non-image files (pdf/docx/txt/log/etc.)
  const FileTile = ({ name, size, ext, onRemove }) => (
    <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
        <DocumentTextIcon className="h-5 w-5 text-white/90" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs md:text-sm text-white/90">{name}</div>
        <div className="text-[10px] md:text-xs text-white/60">
          {ext || ''} · {formatSize(size)}
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 rounded-full bg-red-500/80 p-0.5 text-white hover:bg-red-600"
        aria-label={t('bugReport.form.attachments.remove', 'Remove')}
        title={t('bugReport.form.attachments.remove', 'Remove')}
      >
        <XMarkIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  // Image thumbnail (square)
  const ImageThumb = ({ url, name, size, onRemove }) => (
    <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-white/20 bg-white/5">
      <img src={url} alt={name} className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -right-1 -top-1 rounded-full bg-red-500/90 p-0.5 text-white hover:bg-red-600"
        aria-label={t('bugReport.form.attachments.remove', 'Remove')}
        title={t('bugReport.form.attachments.remove', 'Remove')}
      >
        <XMarkIcon className="h-3.5 w-3.5" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1 py-0.5 text-[10px] text-white/90">
        {formatSize(size)}
      </div>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 text-left"
    >
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white md:text-base">
          {t('bugReport.form.name.label', 'Your name')}
        </label>
        <Input
          id="name"
          type="text"
          {...register('name', { required: t('bugReport.form.name.required', 'Name is required') })}
          className="text-sm md:text-base"
        />
        {errors.name && <p className="mt-2 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white md:text-base">
          {t('bugReport.form.email.label', 'Email')}
        </label>
        <Input
          id="email"
          type="email"
          {...register('email', { required: t('bugReport.form.email.required', 'Email is required') })}
          className="text-sm md:text-base"
        />
        {errors.email && <p className="mt-2 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Description + paperclip button (inside the textarea) */}
      <div className="relative">
        <label htmlFor="description" className="block text-sm font-medium text-white md:text-base">
          {t('bugReport.form.description.label', 'Bug details')}
        </label>

        {/* Extra right padding so typing never sits under the button on small screens */}
        <textarea
          id="description"
          rows="5"
          {...register('description', { required: t('bugReport.form.description.required', 'Description is required') })}
          className="mt-2 block w-full rounded-xl text-white placeholder-gray-400 shadow-sm focus:outline-none bg-black/20 backdrop-blur-md border border-white/20 px-3 py-3 pr-12 text-sm md:text-base"
          placeholder={t('bugReport.form.description.placeholder', 'Describe the issue…')}
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={onFilesPicked}
        />

        {/* Paperclip button INSIDE textarea area */}
        <button
          type="button"
          onClick={triggerFilePicker}
          className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition"
          aria-label={t('bugReport.form.attachments.add', 'Add attachments')}
          title={t('bugReport.form.attachments.add', 'Add attachments')}
        >
          <PaperClipIcon className="h-5 w-5 text-white" />
        </button>

        {errors.description && <p className="mt-2 text-xs text-red-500">{errors.description.message}</p>}
      </div>

      {/* Preview grid (images as thumbs, others as small tiles) */}
      {attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-white/80 md:text-sm">
            {t('bugReport.form.attachments.selected', 'Attachments')}:
          </p>

          {/* Images row */}
          <div className="flex flex-wrap gap-2">
            {attachments.map((a, i) => (
              a.kind === 'image' ? (
                <ImageThumb
                  key={`img-${i}-${a.file.name}`}
                  url={a.previewUrl}
                  name={a.file.name}
                  size={a.file.size}
                  onRemove={() => removeAttachmentAt(i)}
                />
              ) : null
            ))}
          </div>

          {/* Files list */}
          <div className="flex flex-col gap-2">
            {attachments.map((a, i) => (
              a.kind === 'file' ? (
                <FileTile
                  key={`file-${i}-${a.file.name}`}
                  name={a.file.name}
                  size={a.file.size}
                  ext={a.ext}
                  onRemove={() => removeAttachmentAt(i)}
                />
              ) : null
            ))}
          </div>
        </div>
      )}

      {/* Hidden RHF field (the service expects File[]) */}
      <input type="hidden" {...register('attachments')} />

      {/* Submit */}
      <div className="flex justify-center">
        <FormButton type="submit" isLoading={isLoading}>
          {t('bugReport.form.submitButton', 'Send bug report')}
        </FormButton>
      </div>
    </form>
  );
}
