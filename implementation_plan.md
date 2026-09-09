# Implementation Plan - Multi-Image Uploads, Visual Color Scheme Overhaul & UI Polish

This plan outlines the architecture and implementation for supporting **multi-image note uploads**, an interactive **multi-photo carousel & multi-image lightbox viewer**, an updated **vibrant design color system**, and UI refinements across light & dark themes.

---

## User Review Required

> [!IMPORTANT]
> **Database Schema Update**: We will introduce an `image_urls TEXT[]` column to the `posts` table in Supabase so each note post can store multiple image pages. Existing single `image_url` values will fall back gracefully or be automatically migrated into `image_urls`.

> [!NOTE]
> **Canvas Multi-Image Compression**: Client-side WebP canvas compression will run on every selected image prior to uploading, keeping network payload small and uploads fast even when attaching multiple notebook page photos.

---

## Proposed Supabase Schema Update (DDL)

```sql
-- Support multiple image uploads per post
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Migration helper: populate image_urls from existing image_url if present
UPDATE public.posts 
SET image_urls = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);
```

---

## Proposed Changes

### 1. Color Scheme & Design System Overhaul (`src/app/globals.css`)
- **Refined Theme Palette**:
  - Update CSS custom properties for Dark (`#090D16` deep void background with indigo/terracotta/emerald accents) and Light mode (`#FAF8F5` warm paper aesthetic with high contrast headers).
  - Add theme gradients (`--gradient-primary`, `--gradient-accent`, `--gradient-card-border`) for buttons, badges, hover rings, and active state highlights.
- **Enhanced Glassmorphism & Micro-Interactions**:
  - Soft ambient glow effects on active cards and selected subject pills.
  - Multi-image badge indicators, pagination dot styling, and tactile tap feedback.

### 2. Multi-Image Server Action & Type Updates (`src/app/actions.ts` & `src/components/*.tsx`)
- Update `createPost` action to handle multiple image files (`FormData.getAll('images')`).
- Compress/upload each image to Supabase storage `note-images` bucket.
- Save array of uploaded public URLs into `image_urls TEXT[]` (plus primary fallback into `image_url`).
- Update `PostWithRelations` type across `PostCard.tsx`, `Feed.tsx`, and `PostList.tsx` to include `image_urls?: string[] | null`.

### 3. Multi-Image Upload Modal (`src/components/UploadModal.tsx`)
- Update `<input type="file" multiple accept="image/*" />` to accept multiple photos.
- Display interactive thumbnail grid of selected images with:
  - Remove photo button (`X` icon on hover/tap).
  - Image counter (e.g. `3 of 10 pages selected`).
  - Asynchronous Canvas WebP compression loop with visual progress indicator.

### 4. Feed & Post Card Multi-Image Viewer (`src/components/PostCard.tsx` & `src/components/Lightbox.tsx`)
- **Carousel Preview in PostCard**:
  - Render active image with page slide indicators (dots) and previous/next arrows when `image_urls.length > 1`.
  - Page counter badge (e.g. `Page 1 of 4`).
- **Multi-Image Lightbox Modal**:
  - Extend `Lightbox.tsx` to accept `images: string[]` and `initialIndex: number` with keyboard arrow navigation and image switching controls.

### 5. Header, Side Menu & Subject Badges (`src/components/Header.tsx`, `src/components/SideMenu.tsx`, `src/components/SubjectCarousel.tsx`)
- Apply vibrant subject color coding with CSS variables (`var(--accent-terracotta)`, `var(--accent-indigo)`, etc.).
- Refine side menu drawer styling with subtle gradient headers, glowing active state indicators, and polished typography.

---

## Audit Checklist & Risk Mitigation

| Component | Identified Risk / Finding | Audit Fix & Mitigation |
| :--- | :--- | :--- |
| **Supabase DB** | Missing `image_urls` column on unmigrated instances | Server action inserts both `image_urls` array and primary `image_url` fallback. `PostCard` checks `post.image_urls` first, defaulting to `[post.image_url]`. |
| **Upload Modal** | Canvas compression blocking UI on batch uploads | Compress images asynchronously using `Promise.all` with a loading spinner and page counter. |
| **Lightbox** | Single-image lightbox breaks multi-page navigation | Refactor `Lightbox` to store `currentIndex` with previous/next controls and keyboard listener. |
| **Color Scheme** | Low text contrast ratio in light mode | Ensure WCAG AA compliance (>= 4.5:1) for all typography on both dark and light modes. |

---

## Verification Plan

### Automated Build & Type-Check
- Run `npm run build` to verify TypeScript types, Next.js compilation, and server action compatibility.

### Manual Verification
- **Multi-Image Upload**: Attach 3-5 notebook page photos in UploadModal, verify thumbnail order, deletion, canvas compression, and post creation.
- **Carousel & Lightbox Navigation**: Flip through image pages on PostCard, open Lightbox, test next/prev arrow buttons and keyboard arrow keys.
- **Color Scheme & Theme Toggle**: Test light/dark mode toggle across Header, Feed, SideMenu, PostCard, and Modals.
