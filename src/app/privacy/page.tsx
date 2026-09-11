import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for SIES_Notes — Classroom notes social tracker for BScIT, SIES Nerul.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              SN
            </div>
            <span className="font-bold tracking-tight text-lg text-slate-100 group-hover:text-indigo-400 transition-colors">
              SIES_Notes
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            ← Back to Feed
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-10 sm:px-8 flex-1 w-full space-y-8">
        <div className="space-y-3 border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">
            Last Updated: September 11, 2026 • Effective for all SIES Nerul BScIT Students
          </p>
        </div>

        <section className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">1. Information We Collect</h2>
          <p>
            SIES_Notes collects minimal personal data required to deliver academic note sharing services:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong className="text-slate-100">Account Information:</strong> Email address and full name provided during registration or Supabase Authentication.
            </li>
            <li>
              <strong className="text-slate-100">User Content:</strong> Note images, PDF study documents, lecture titles, subject tags, and captions uploaded by you.
            </li>
            <li>
              <strong className="text-slate-100">Usage Data:</strong> Upvote interactions, pinned notes history, and essential cookie session state.
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">2. How We Use Your Information</h2>
          <p>
            Your information is strictly used for facilitating classroom study collaboration:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>To render handwritten lecture photos and PDF note documents in the community feed.</li>
            <li>To display student author attributions on note posts.</li>
            <li>To protect the platform against spam and unauthorized note tampering.</li>
          </ul>
        </section>

        <section className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">3. Data Storage & Security</h2>
          <p>
            All user data and uploaded media files are securely stored using Supabase Infrastructure with encrypted connections (HTTPS/TLS) and PostgreSQL Row-Level Security (RLS) policies. Sensitive database secrets are never exposed on the client side.
          </p>
        </section>

        <section className="space-y-4 text-slate-300 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">4. Cookies & Storage</h2>
          <p>
            We use essential cookies and browser <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-200">localStorage</code> tokens solely for authentication persistence and preference retention (e.g. dark mode setting and cookie consent status). We do not perform cross-site tracking or third-party ad profiling.
          </p>
        </section>

        <section className="space-y-4 text-slate-300 text-sm leading-relaxed border-t border-slate-800 pt-6">
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">5. Contact & Support</h2>
          <p>
            For privacy inquiries or content removal requests, please contact your class representative or developer attribution{' '}
            <span className="text-indigo-400 font-semibold">@benpy606</span>.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SIES_Notes • SIES Nerul BScIT Cohort</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-slate-200 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/" className="hover:text-slate-200 transition-colors">
              Home Feed
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
