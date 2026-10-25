import { useState } from 'react'

const FEATURES = [
  {
    icon: (
      <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z M9 12l2 2 4-4" />
    ),
    title: 'Digital fee receipt',
    text: 'Your approved receipt with your photo, ready to show the driver. No paper slips.',
  },
  {
    icon: <path d="M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11z M12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />,
    title: 'Live bus tracking',
    text: 'See exactly where your point is on the map, updated every few seconds.',
  },
  {
    icon: <path d="M3 7h18v10H3z M3 10h18 M7 14h3" />,
    title: 'Online fee submission',
    text: 'Pay by JazzCash, Easypaisa or bank, upload your receipt, and get approved.',
  },
]

// NED logo from frontend/public/ned-logo.png (falls back to a bus icon if the file is missing)
function Logo() {
  const [missing, setMissing] = useState(false)
  if (missing) {
    return (
      <div className="w-16 h-16 rounded-full bg-cream-50 flex items-center justify-center text-3xl shadow-lg ring-4 ring-accent-400/40">
        🚌
      </div>
    )
  }
  return (
    <img
      src="/ned-logo.png"
      alt="NED University"
      onError={() => setMissing(true)}
      className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
    />
  )
}

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-full grid lg:grid-cols-2">
      {/* Left: brand panel */}
      <aside className="relative overflow-hidden text-white px-6 py-8 sm:px-10 lg:px-14 lg:py-12 flex flex-col
                        bg-[radial-gradient(ellipse_at_70%_15%,#8a3a2a_0%,transparent_45%),linear-gradient(160deg,#3a0c1f_0%,#631635_55%,#4a2350_100%)]">
        <Logo />

        <div className="mt-8 lg:mt-12 max-w-lg">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Your point, <span className="text-accent-400">on time.</span>
            <br />
            Your fee, verified.
          </h1>
          <p className="mt-4 text-white/75 text-sm sm:text-base leading-relaxed">
            Watch your bus come to your stop in real time, pay your point fee online, and keep your verified fee receipt on your phone.
          </p>
        </div>

        <ul className="hidden sm:grid mt-8 gap-3 max-w-lg">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex gap-3 rounded-2xl bg-white/[0.07] border border-white/10 p-4 backdrop-blur-sm">
              <span className="shrink-0 w-9 h-9 rounded-xl bg-accent-400/15 text-accent-400 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8"
                     strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
              </span>
              <span>
                <span className="block font-semibold">{f.title}</span>
                <span className="block text-sm text-white/65">{f.text}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="hidden lg:block mt-auto pt-10 text-xs text-white/50">
          NED University of Engineering &amp; Technology · Karachi
        </p>

        {/* soft wave at the bottom */}
        <svg className="hidden lg:block absolute bottom-0 left-0 w-full text-[#3f3a6b]/60" viewBox="0 0 600 60" preserveAspectRatio="none">
          <path fill="currentColor" d="M0 40 C 150 10, 300 60, 450 30 S 600 20, 600 20 L600 60 L0 60 Z" />
        </svg>
      </aside>

      {/* Right: form */}
      <main className="bg-cream-100 flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-stone-900">{title}</h2>
          {subtitle && <p className="text-sm text-stone-500 mt-1 mb-6">{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  )
}
