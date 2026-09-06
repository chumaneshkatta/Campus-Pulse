import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, ExternalLink } from 'lucide-react';

const statusConfig = {
  open: { label: 'Registration Open', cls: 'bg-green-100 text-green-700' },
  closed: { label: 'Registration Closed', cls: 'bg-slate-100 text-slate-600' },
  completed: { label: 'Completed', cls: 'bg-blue-100 text-blue-700' },
};
const eventConfig = {
  'Inter-College': 'bg-purple-100 text-purple-700',
  University: 'bg-indigo-100 text-indigo-700',
  Community: 'bg-teal-100 text-teal-700',
  'Open League': 'bg-orange-100 text-orange-700',
};

export default function TournamentCard({ tournament }) {
  const s = statusConfig[tournament.registrationStatus] || statusConfig.open;
  const e = eventConfig[tournament.eventType] || 'bg-slate-100 text-slate-700';

  return (
    <Link to={`/tournaments/${tournament.id}`} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-24" style={{ background: tournament.bannerColor || '#0f172a' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${e}`}>{tournament.eventType}</span>
        </div>
        <div className="absolute right-4 top-4">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>{s.label}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-extrabold leading-snug text-slate-900 group-hover:text-blue-600">{tournament.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1 text-slate-700">{tournament.sport}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tournament.location || tournament.venue}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{tournament.startDate}</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{tournament.teamCount}/{tournament.maxTeams}</span>
        </div>
      </div>
    </Link>
  );
}
