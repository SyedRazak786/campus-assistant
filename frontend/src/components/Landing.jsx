const SOURCES = [
  { label: 'Syllabus', detail: 'Unit-wise breakdown, credits, electives' },
  { label: 'Academic calendar', detail: 'Exam dates, holidays, deadlines' },
  { label: 'Notices & circulars', detail: 'Admin announcements, revaluation' },
  { label: 'Placement documents', detail: 'Eligibility, drives, backlogs policy' },
]

const STEPS = [
  {
    n: '01',
    title: 'You ask',
    detail: 'Type a question in plain language — no need to know which document has the answer.',
  },
  {
    n: '02',
    title: 'It retrieves',
    detail: 'The system searches indexed college documents for the passages most relevant to your question.',
  },
  {
    n: '03',
    title: 'It answers',
    detail: 'Gemini reads those passages and writes a grounded answer, not a guess from general knowledge.',
  },
]

function Nav({ user, profile, showLinks, onLogin, onLogout, onHome }) {
  const linkStyle = { fontSize: '14px', textDecoration: 'none', color: 'var(--slate)' }
  const isFaculty = profile && profile.role === 'faculty'
  const firstName = profile && profile.name ? profile.name.split(' ')[0] : ''

  return (
    <header style={{ borderBottom: '1px solid var(--line)' }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>
        <button
          onClick={onHome}
          style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, color: 'var(--ink)' }}
        >
          Campus Assistant
        </button>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {showLinks && !user && (
            <>
              <a href="#coverage" style={linkStyle}>What it knows</a>
              <a href="#how" style={linkStyle}>How it works</a>
            </>
          )}
          {user ? (
            <>
              <span style={{ fontSize: '14px', color: 'var(--ink)' }}>
                {firstName}
                <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--gold-deep)' }}>
                  {isFaculty ? 'Faculty' : 'Student'}
                </span>
              </span>
              <button className="btn-outline" onClick={onLogout} style={{ padding: '8px 18px', fontSize: '14px' }}>
                Log out
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={onLogin} style={{ padding: '9px 22px', fontSize: '14px' }}>
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

function Hero({ onStart }) {
  return (
    <section className="wrap" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '64px', padding: '88px 32px 96px', alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: '14px', color: 'var(--gold-deep)', marginBottom: '18px', fontWeight: 500 }}>
          Built for KKR & KSR Institute of Technology and Sciences
        </p>
        <h1 style={{ fontSize: '46px', lineHeight: 1.15, marginBottom: '22px' }}>
          Ask your college anything.
        </h1>
        <p style={{ fontSize: '17px', lineHeight: 1.65, maxWidth: '440px', marginBottom: '32px' }}>
          One place to ask about your syllabus, exam dates, notices, or placement rules —
          answered from the actual documents your college publishes, not a guess.
        </p>
        <button className="btn-primary" onClick={onStart}>
          Start asking
        </button>
      </div>

      <div style={{ background: 'var(--paper-card)', border: '1px solid var(--line)', padding: '28px' }}>
        <p style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '16px' }}>Sample exchange</p>
        <div style={{ marginBottom: '18px' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', color: 'var(--ink)', fontStyle: 'italic' }}>
            "Last date to apply for revaluation this semester?"
          </p>
        </div>
        <hr className="hairline" style={{ marginBottom: '18px' }} />
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--ink)' }}>
          Revaluation applications close 10 days after results are published,
          as per the academic calendar notice dated March 2026.
        </p>
        <p style={{ fontSize: '12px', color: 'var(--gold-deep)', marginTop: '14px' }}>
          Source: Academic Calendar 2025–26
        </p>
      </div>
    </section>
  )
}

function Coverage() {
  return (
    <section id="coverage" className="wrap" style={{ padding: '80px 32px' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>What it knows</h2>
      <p style={{ fontSize: '15px', marginBottom: '48px', maxWidth: '480px' }}>
        Every answer is grounded in these documents — nothing is invented.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {SOURCES.map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: '4px 24px',
              borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
            }}
          >
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', color: 'var(--ink)', marginBottom: '8px' }}>
              {s.label}
            </p>
            <p style={{ fontSize: '13.5px', lineHeight: 1.5 }}>{s.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how" style={{ background: 'var(--ink)', padding: '88px 0' }}>
      <div className="wrap">
        <h2 style={{ fontSize: '28px', marginBottom: '48px', color: 'var(--paper-card)' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
          {STEPS.map((step) => (
            <div key={step.n}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', color: 'var(--gold)', marginBottom: '14px' }}>
                {step.n}
              </p>
              <h3 style={{ fontSize: '19px', color: 'var(--paper-card)', marginBottom: '10px' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'rgba(246,241,231,0.7)' }}>
                {step.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { Nav, Hero, Coverage, HowItWorks }
