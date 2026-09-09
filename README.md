# SIES Notes

SIES Notes is a mobile-first, high-performance web platform built specifically for BScIT students at SIES Nerul. It provides a central hub for sharing lecture notes, organizing subject materials, tracking academic progress, and collaborating across semesters.

Developed by **@benpy606**.

---

## Features

- **Subject Hubs & Filtering**: Quick navigation across semesters (Semester 1 through 6) and core IT modules.
- **Client-Side Image Compression**: Automatic browser-side compression using HTML5 Canvas before uploading note images to optimize transfer times and bandwidth.
- **Post Sharing & Feed**: Share lecture notes with title, description, subject tag, image attachments, and author tags.
- **Interactive Engagement**: Like posts, save notes for revision, filter by subject, and bookmark critical lecture materials.
- **Dark / Light Mode**: Built-in visual theme toggle with CSS variable-driven design tokens.
- **Responsive Architecture**: Engineered for seamless use on smartphones, tablets, and desktop displays.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Pure CSS with Custom Properties, CSS Grid/Flexbox, and Glassmorphism effects
- **Backend & Storage**: Supabase (PostgreSQL Database & Storage Buckets)
- **Icons**: Lucide React
- **Client Compression**: HTML5 Canvas API

---

## Getting Started

### Prerequisites

Ensure you have Node.js 18.x or higher installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/benpy606/SIES_Notes.git
   ```

2. Navigate into the directory:
   ```bash
   cd SIES_Notes
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Configure environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000` in your web browser.

---

## Project Structure

```text
SIES_Notes/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global CSS tokens and themes
│   │   ├── layout.tsx           # Root layout with ThemeProvider
│   │   ├── page.tsx             # Main feed page
│   │   ├── login/               # Authentication page
│   │   └── create/              # Create post page
│   ├── components/
│   │   ├── Header.tsx           # Top navigation bar
│   │   ├── SideMenu.tsx         # Responsive side navigation drawer
│   │   ├── SubjectCarousel.tsx  # Interactive subject selector
│   │   ├── PostCard.tsx         # Post render component
│   │   ├── ThemeToggle.tsx      # Dark/Light mode toggle button
│   │   └── ...
│   └── lib/
│       ├── supabaseClient.ts    # Supabase initialisation
│       └── imageCompressor.ts   # Canvas image compression helper
├── public/                      # Static assets
├── README.md                    # Project documentation
└── package.json
```

---

## Database Schema (Supabase)

### Posts Table (`posts`)
- `id` (uuid, primary key)
- `created_at` (timestamp with time zone)
- `title` (text)
- `description` (text)
- `subject` (text)
- `image_url` (text)
- `author_name` (text)
- `author_id` (text)
- `likes_count` (integer)

---

## Author & Attribution

Developed and maintained by **@benpy606** for SIES Nerul BScIT Department.
