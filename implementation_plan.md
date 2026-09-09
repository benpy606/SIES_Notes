# Implementation Plan - Direct Note Posting, PDF Uploads & Side Menu Navigation

This plan details the steps to streamline note posting (removing lecture schedule requirements), add PDF support with file handling, and introduce an interactive slide-out Side Navigation Drawer.

## User Review Required

> [!IMPORTANT]
> **Database Schema Update**: We will update the SQL schema to link `posts` directly to `subject_id` with an optional `pdf_url` field and `file_type`. If you have existing Supabase data, run the provided DDL script in your Supabase SQL Editor.

> [!NOTE]
> **PDF Uploads & Previews**: PDF files will be stored in Supabase Storage. In the feed, PDFs will display an interactive card with file size/badge and an inline modal viewer or new tab download.

---

## Proposed Supabase Schema Update (DDL)

```sql
-- Add subject_id directly to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'image'; -- 'image' or 'pdf'
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.posts ALTER COLUMN lecture_id DROP NOT NULL;

-- Create Storage bucket for PDFs if not existing
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-pdfs', 'note-pdfs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public access to note pdfs"
  ON storage.objects FOR SELECT USING (bucket_id = 'note-pdfs');

CREATE POLICY "Authenticated users can upload note pdfs"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'note-pdfs' AND auth.role() = 'authenticated');
```

---

## Proposed Changes

### 1. Server Actions (`src/app/actions.ts`)
- Modify `createPost` to directly process `subjectId`, `title`, `caption`, and optional `image` or `pdf` file.
- Add PDF upload handling to Supabase `note-pdfs` bucket.
- Add `signOut` server action for logging out from the Side Menu.

### 2. Side Menu Component (`[NEW] src/components/SideMenu.tsx`)
- Build a responsive slide-out drawer accessible from the Header.
- Displays:
  - User avatar, name, and email.
  - User role (`Admin` or `Student`).
  - Subject navigation list with colored badge indicators.
  - Content filter toggle (All / Images / PDFs).
  - Quick "Upload Note" button.
  - Sign Out option.

### 3. Header & Navigation (`src/components/Header.tsx`)
- Add Hamburger `Menu` icon button on top left to trigger the Side Menu drawer.

### 4. Upload Modal (`src/components/UploadModal.tsx`)
- Simplify inputs: Select **Subject**, enter **Title/Topic**, enter optional **Caption**.
- Add tab/toggle selection to upload an **Image Note** (compressed canvas WebP) or **PDF Document** (`.pdf`).

### 5. Feed & Post Cards (`src/components/PostCard.tsx` & `src/components/Feed.tsx`)
- Display posts linked directly to subjects without needing a scheduled lecture.
- Render **Image Notes** with Lightbox preview.
- Render **PDF Notes** with a dedicated PDF card UI, size badge, and view/download options.

---

## Verification Plan

### Automated Build & Type-Check
- Run `npm run build` to verify TypeScript type safety and compilation.

### Manual Verification
- Test opening/closing the Side Menu drawer.
- Test posting image notes and PDF notes for a selected subject.
- Test PDF viewer/download modal and subject filters.
