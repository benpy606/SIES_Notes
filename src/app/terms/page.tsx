import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms of Use & Academic Guidelines for SIES_Notes — BScIT SIES Nerul.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#121215]/80 backdrop-blur-md border-b border-zinc-900/80 px-4 py-3 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              SN
            </div>
            <span className="font-bold tracking-tight text-lg text-zinc-100 group-hover:text-indigo-400 transition-colors">
              SIES_Notes
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            ← Back to Feed
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-10 sm:px-8 flex-1 w-full space-y-8">
        <div className="space-y-3 border-b border-zinc-900 pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <span>Academic Community Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-sm text-zinc-400">
            Effective Date: September 11, 2026 • Platform Developer: @benpy606
          </p>
        </div>

        <section className="space-y-4 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">1. Acceptance of Terms</h2>
          <p>
            By logging in, browsing, or uploading notes to SIES_Notes, you agree to comply with these terms of use. This platform is exclusively designed for academic note sharing among BScIT students and faculty at SIES College Nerul.
          </p>
        </section>

        <section className="space-y-4 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">2. Academic Integrity & Acceptable Uploads</h2>
          <p>
            SIES_Notes is built to foster collaborative learning. Users agree to adhere to strict content standards:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-300">
            <li>Upload only genuine lecture notes, handwritten summaries, textbook diagrams, and educational PDF documents.</li>
            <li>Do not upload copyrighted exam papers without authorization, inappropriate imagery, offensive language, or spam.</li>
            <li>Ensure uploaded notebook page photos are legible and properly tagged with accurate subject subjects.</li>
          </ul>
        </section>

        <section className="space-y-4 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">3. User Content & Ownership</h2>
          <p>
            You retain ownership of the study materials you post. By submitting content to SIES_Notes, you grant fellow students a non-exclusive license to view, download, and reference your notes for personal study purposes.
          </p>
        </section>

        <section className="space-y-4 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">4. Admin Rights & Content Moderation</h2>
          <p>
            Authorized administrators reserve the right to verify, pin, or remove posts that violate platform rules or contain corrupted files. Repeated violations may result in account restriction.
          </p>
        </section>

        <section className="space-y-4 text-zinc-300 text-sm leading-relaxed border-t border-zinc-900 pt-6">
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">5. Developer Attribution</h2>
          <p>
            SIES_Notes is designed and maintained by <span className="text-indigo-400 font-semibold">@benpy606</span> for SIES Nerul BScIT students. Feedback and bug reports are welcomed.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/80 bg-[#121215]/50 py-6 px-4 text-center text-xs text-zinc-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 SIES_Notes • SIES Nerul BScIT Cohort</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-zinc-200 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-zinc-200 transition-colors">
              Home Feed
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
