import { NavLink, Outlet } from 'react-router-dom';

export default function App(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-slate-100">
      <header className="flex flex-col gap-4 px-6 pt-8 sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-3xl font-semibold tracking-[0.2em] text-slate-100">
            WebTools
          </h1>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
            Explore feature sandboxes
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 sm:justify-start" aria-label="Primary">
          {[
            { label: 'Overview', to: '/' },
            { label: 'Counter', to: '/counter' },
          { label: 'Storage', to: '/storage' },
          { label: 'Text Replacement', to: '/text-replacement' },
          { label: 'JSON Tools', to: '/json-tools' },
        ].map(({ label, to }) => (
            <NavLink
              key={label}
              end={to === '/'}
              to={to}
              className={({ isActive }) =>
                [
                  'pb-1 font-semibold transition-colors',
                  isActive
                    ? 'border-b-2 border-sky-400 text-sky-400'
                    : 'border-b-2 border-transparent text-slate-300 hover:text-slate-100',
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-12 pt-6 sm:pt-10">
        <Outlet />
      </main>
    </div>
  );
}
