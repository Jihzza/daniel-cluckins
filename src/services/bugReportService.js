import { supabase } from '../lib/supabaseClient';

/** Convert FileList/array to array of File */
const toFileArray = (maybeFiles) => {
  if (!maybeFiles) return [];
  if (Array.isArray(maybeFiles)) return maybeFiles;
  try { return Array.from(maybeFiles); } catch { return []; }
};

// IMPORTANT: client & server must match this if you change it
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB per file

// Allowlist (MIME + extensions)
const ALLOWED_MIME = new Set([
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  // Docs
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword',                                                     // .doc
  'text/plain',                                                             // .txt
  'text/markdown'                                                           // .md
]);

const ALLOWED_EXT = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.pdf', '.docx', '.doc', '.txt', '.md', '.log'
]);

const hasAllowedExt = (name = '') => {
  const lower = name.toLowerCase();
  for (const ext of ALLOWED_EXT) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
};

const allowByMimeOrExt = (file) => {
  const mime = (file.type || '').toLowerCase();
  if (ALLOWED_MIME.has(mime)) return true;
  if (mime.startsWith('image/')) return true; // generic image/*
  return hasAllowedExt(file.name || '');
};

/** Upload one file to "bug-reports/<reportId>/<timestamp>-<safeName>" */
const uploadOneFile = async (file, reportId) => {
  const safeName = String(file.name || 'file')
    .replace(/[^\w.\-]+/g, '_')
    .slice(-150);

  const path = `${String(reportId)}/${Date.now()}-${safeName}`;

  const { data: upData, error: upErr } = await supabase
    .storage
    .from('bug-reports') // bucket
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined
    });

  if (upErr) {
    console.error('[bugReport] storage upload error:', file.name, upErr);
    throw upErr;
  }

  // Public bucket: store a public URL
  const { data: pub } = supabase.storage.from('bug-reports').getPublicUrl(upData.path);
  const file_url = pub?.publicUrl || null;

  return {
    file_url,
    file_name: file.name,
    mime_type: file.type || 'application/octet-stream',
    size_bytes: file.size ?? 0
  };
};

/**
 * Submit a new bug report and upload any attachments.
 * reportData: { name, email, description, attachments }
 * Returns: { data: { id, filesInserted, uploaded }, error }
 */
export const submitBugReport = async (reportData, userId = null) => {
  const { name, email, description, attachments: rawAttachments } = reportData;

  // 1) Insert the bug report row
  const { data: inserted, error: insertErr } = await supabase
    .from('bug_reports')
    .insert({
      name,
      email,
      description,
      user_id: userId ?? null
    })
    .select()
    .single();

  if (insertErr) {
    console.error('[bugReport] create error:', insertErr);
    return { data: null, error: insertErr };
  }

  const reportId = String(inserted.id); // bigint or uuid safe

  // 2) Validate files
  const files = toFileArray(rawAttachments);
  console.log('[bugReport] received files:', files?.map(f => ({
    name: f.name, size: f.size, type: f.type
  })));

  const validFiles = files.filter(f =>
    f && f.size <= MAX_BYTES && allowByMimeOrExt(f)
  );

  if (validFiles.length !== files.length) {
    const rejected = files.filter(f => !validFiles.includes(f));
    console.warn('[bugReport] rejected files (size/type):', rejected.map(f => ({
      name: f.name, size: f.size, type: f.type
    })));
  }

  // 3) Upload & collect metadata rows
  const fileRows = [];
  const uploadedNames = [];

  for (const file of validFiles) {
    try {
      const meta = await uploadOneFile(file, reportId);
      if (!meta.file_url) {
        console.warn('[bugReport] missing public URL for', file.name);
        continue;
      }

      uploadedNames.push(meta.file_name);

      // FK is BIGINT in your schema. Use Number(reportId).
      fileRows.push({
        bug_report_id: Number(reportId),
        file_url: meta.file_url,           // if the bucket is private, store storage 'path' instead
        file_name: meta.file_name,
        mime_type: meta.mime_type,
        size_bytes: meta.size_bytes
      });
    } catch (e) {
      console.error('[bugReport] upload failed:', file?.name, e?.message || e);
      // continue to next file
    }
  }

  // 4) Insert file metadata
  let filesInserted = 0;
  if (fileRows.length > 0) {
    const { error: filesErr } = await supabase
      .from('bug_report_files')
      .insert(fileRows);

    if (filesErr) {
      console.error('[bugReport] files insert error:', filesErr);
    } else {
      filesInserted = fileRows.length;
    }
  } else {
    console.warn('[bugReport] no fileRows to insert (likely upload or validation issue)');
  }

  return {
    data: { id: inserted.id, filesInserted, uploaded: uploadedNames },
    error: null
  };
};
