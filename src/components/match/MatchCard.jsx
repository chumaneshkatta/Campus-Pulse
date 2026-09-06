import { Link } from 'react-router-dom';
import { MapPin, Clock, Radio } from 'lucide-react';

const statusConfig = {
  scheduled: { label: 'Scheduled', cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  live: { label: 'LIVE', cls: 'bg-red-100 text-red-700', dot: 'bg-red-500 animate-pulse' },
  halftime: { label: 'Halftime', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  quarter_break: { label: 'Quarter Break', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  completed: { label: 'Completed', cls: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
  postponed: { label: 'Postponed', cls: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-600', dot: 'bg-red-400' },
};

export default function MatchCard({ match }) {
  const s = statusConfig[match.status] || statusConfig.scheduled;
  const isLive = match.status === 'live' || match.status === 'halftime' || match.status === 'quarter_break';
  const time = match.scheduledDate ? new Date(match.scheduledDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <Link to={`/matches/${match.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{match.sport} · {match.matchType}</span>
        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.cls}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white" style={{ background: match.homeTeamColor || '#1d4ed8' }}>
            {match.homeTeamName?.charAt(0) || 'H'}
          </div>
          <span className="font-display text-sm font-bold text-slate-800">{match.homeTeamName}</span>
        </div>
        <div className="px-2 text-right">
          <div className="text-[11px] font-bold text-slate-400">VS</div>
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          <span className="font-display text-sm font-bold text-slate-800">{match.awayTeamName}</span>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white" style={{ background: match.awayTeamColor || '#dc2626' }}>
            {match.awayTeamName?.charAt(0) || 'A'}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{match.venue || 'TBD'}</span>
        {!isLive && match.status !== 'completed' && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{time}</span>}
        {isLive && match.gameClock && <span className="flex items-center gap-1 text-red-500"><Radio className="h-3.5 w-3.5" />{match.gameClock}</span>}
      </div>
      {match.tournamentTitle && <div className="mt-1 text-[10px] font-medium text-slate-400">{match.tournamentTitle}</div>}
    </Link>
  );
}