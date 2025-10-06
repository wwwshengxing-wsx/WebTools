import { Link } from 'react-router-dom';

const cards = [
  {
    title: 'Counter',
    description: 'Adjust a numeric value with increment, decrement, and reset controls.',
    to: '/counter',
  },
  {
    title: 'Storage',
    description: 'Inspect and manage key/value pairs stored in your browser localStorage.',
    to: '/storage',
  },
  {
    title: 'Text Replacement',
    description: 'Import, edit, and export shortcut → phrase pairs with full history tracking.',
    to: '/text-replacement',
  },
];

export default function HomePage(): JSX.Element {
  return (
    <section className="w-full max-w-5xl px-4">
      <header className="mb-8 text-center sm:mb-12">
        <h2 className="text-3xl font-semibold tracking-wide text-slate-100 sm:text-4xl">
          Feature Directory
        </h2>
        <p className="mt-3 text-base text-slate-300 sm:text-lg">
          Jump into any sandbox below to explore interactive UI patterns and state management demos.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group flex flex-col rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-[0_25px_40px_rgba(15,23,42,0.35)] transition-transform duration-150 hover:-translate-y-1 hover:border-sky-400/70 hover:shadow-[0_35px_60px_rgba(15,23,42,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            <h3 className="text-2xl font-semibold text-slate-100">{card.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{card.description}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-300">
              Explore
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
