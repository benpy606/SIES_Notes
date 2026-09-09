# Task List & Persistent Design Context - SIES_Notes

- [x] Update `src/app/globals.css` (Display typography, vibrant design tokens, crisp card shadows & micro-animations)
- [x] Update `src/components/Header.tsx` (Energetic logo badge, vivid BSCIT tag, crisp user avatar)
- [x] Update `src/components/SideMenu.tsx` (Dark obsidian drawer, vibrant subject dots, high-contrast format filters)
- [x] Update `src/components/PostCard.tsx` (Editorial titles, framed PDF document viewer, animated upvote heart)
- [x] Update `src/components/UploadModal.tsx` (Bold format switcher tabs, energetic upload dropzone, high-contrast button)
- [x] Update `src/components/SubjectCarousel.tsx` & `src/components/PostList.tsx` (High-contrast filter chips)
- [x] Rebrand application to **SIES_Notes** with `@benpy606` developer attribution
- [x] Amplify Login Page & Landing container layout
- [x] Automated build verification (`npm run build`)

---

## Design Context

### Users
- **Primary Audience**: BScIT students and faculty at SIES Nerul (Navi Mumbai).
- **Context & Goal**: Students accessing handwritten lecture photos, PDF note documents, and study materials on mobile smartphones between classes or during exam revision.
- **Job to Be Done**: Fast, friction-free note uploading and instant single-tap reading without unnecessary navigation or clutter.

### Brand Personality
- **Voice & Tone**: Energetic, student-focused, aesthetic, and authentic.
- **3-Word Personality**: Aesthetic, Energetic, Seamless.
- **Emotional Goals**: Confidence during study prep, delight in interaction, and pride in campus identity.

### Aesthetic Direction
- **Visual Style**: "Simple yet Aesthetic" — Deep obsidian dark surroundings (`#020617` / `#0F172A`) paired with clean paper card surfaces (`#FAF8F5`), distinct subject color badges (Terracotta, Emerald, Solar Amber, Violet), and display typography (Space Grotesk + Plus Jakarta Sans + JetBrains Mono).
- **Branding**: **SIES_Notes** (BSCIT cohort) with developer tag **`@benpy606`**.
- **Anti-References**: Generic monochrome templates, clutter, bloated multi-step wizards, or low-contrast illegible text.

### Design Principles
1. **Single-Tap Accessibility**: Every note photo and PDF document must be readable with a single tap or expand modal.
2. **Mobile-First Excellence**: Prioritize touch targets (40px+), responsive drawer slides, and fluid viewport scrolling.
3. **Simple & Aesthetic Balance**: Keep layouts clean and functional while adding subtle micro-interactions (heart pulses, tactile hover scaling, glowing accents).
4. **Vivid Campus Identity**: Consistently highlight SIES Nerul cohort identity, subject color coding, and `@benpy606` dev credits.
