import { NavLink, Outlet } from 'react-router-dom';

export default function App(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-slate-100">
      <header className="flex flex-col gap-4 px-6 pt-8 sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <h1 className="text-center text-3xl font-semibold tracking-[0.2em] text-slate-100 sm:text-left">
          React Counter
        </h1>
        <nav className="flex justify-center gap-6 sm:justify-start" aria-label="Primary">
          <NavLink
            end
            to="/"
            className={({ isActive }) =>
              [
                'border-b-2 border-transparent pb-1 font-semibold text-slate-300 transition-colors hover:text-slate-100',
                isActive ? 'border-sky-400 text-sky-400' : '',
              ]
                .filter(Boolean)
                .join(' ')
            }
          >
            Counter
          </NavLink>
        </nav>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-12 pt-6 sm:pt-10">
        <Outlet />
      </main>
    </div>
  );
}
