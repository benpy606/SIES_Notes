import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'SIES_Notes — Classroom Social Tracker for BScIT, SIES Nerul'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #0F172A 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'sans-serif',
          color: '#FAF8F5',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '24px',
              fontWeight: 800,
            }}
          >
            SN
          </div>
          <span style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', color: '#818CF8' }}>
            SIES_Notes
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#A5B4FC',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(99, 102, 241, 0.4)',
            }}
          >
            BScIT Cohort
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              margin: 0,
              color: '#FFFFFF',
            }}
          >
            Classroom Notes & Study Materials Tracker
          </h1>
          <p style={{ fontSize: '24px', color: '#94A3B8', margin: 0, maxWidth: '850px' }}>
            Share handwritten lecture photos, PDF note documents, and study resources instantly with SIES Nerul classmates.
          </p>
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '24px',
          }}
        >
          <span style={{ fontSize: '18px', color: '#CBD5E1', fontWeight: 600 }}>
            SIES College of Arts, Science & Commerce (Autonmous), Nerul
          </span>
          <span style={{ fontSize: '16px', color: '#818CF8', fontWeight: 700 }}>
            Dev: @benpy606
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
