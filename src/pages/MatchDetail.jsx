import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/AppLayout';
import LoadingState from '@/components/states/LoadingState';
import ErrorState from '@/components/states/ErrorState';
import { ChevronLeft, Radio, MapPin, Play, Clock, Video } from 'lucide-react';
import { demoMatches } from '@/lib/demo-data';

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Match.get(id);
        setMatch(data);
      } catch {
        const localMatch = demoMatches().find(item => item.id === id);
        if (localMatch) {
          setMatch(localMatch);
        } else {
          setError(true);
        }
      }
      finally { setLoading(false); }
    })();
    // Subscribe to live updates
    const unsub = base44.entities.Match.subscribe((event) => {
      if (event.data?.id === id) setMatch(event.data);
    });
    return unsub;
  }, [id]);

  if (loading) return <AppLayout><LoadingState /></AppLayout>;
  if (error || !match) return <AppLayout><ErrorState message="Match not found." onRetry={() => window.location.reload()} /></AppLayout>;

  const isLive = match.status === 'live' || match.status === 'halftime' || match.status === 'quarter_break';

  return (
    <AppLayout>
      <Link to="/matches" className="mb-4 flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800">
        <ChevronLeft className="h-4 w-4" /> Matches
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-slate-900 px-5 py-3">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{match.sport} · {match.matchType}</span>
          {isLive ? (
            <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-[11px] font-bold text-white"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE</span>
          ) : <span className="text-xs font-bold uppercase text-slate-400">{match.status}</span>}
        </div>

        <div className="flex items-center justify-between gap-2 p-6">
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-md" style={{ background: match.homeTeamColor || '#1d4ed8' }}>{match.homeTeamName?.charAt(0) || 'H'}</div>
            <p className="font-display text-sm font-bold text-slate-800">{match.homeTeamName}</p>
          </div>

          <div className="px-2 text-center">
            <p className="font-display text-2xl font-black text-slate-400">VS</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{new Date(match.scheduledDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-md" style={{ background: match.awayTeamColor || '#dc2626' }}>{match.awayTeamName?.charAt(0) || 'A'}</div>
            <p className="font-display text-sm font-bold text-slate-800">{match.awayTeamName}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 border-t border-slate-100 py-3 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {match.venue || 'TBD'}</span>
        </div>
      </div>

      {/* Stream embed */}
      {match.streamUrl && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-1.5 font-display text-sm font-extrabold text-slate-900"><Video className="h-4 w-4 text-red-500" /> Live Stream</h2>
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-900">
            {match.streamUrl.includes('youtube') || match.streamUrl.includes('youtu.be')
              ? <iframe src={match.streamUrl.replace('watch?v=', 'embed/')} className="h-full w-full" allowFullScreen title="Live Stream" />
              : <a href={match.streamUrl} target="_blank" rel="noopener noreferrer" className="flex h-full w-full flex-col items-center justify-center gap-2 text-white"><Play className="h-10 w-10" /> <span className="text-sm font-bold">Open Stream</span></a>}
          </div>
        </div>
      )}

      {/* Timeline */}
      {match.timeline && match.timeline.length > 0 && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-1.5 font-display text-sm font-extrabold text-slate-900"><Clock className="h-4 w-4 text-blue-600" /> Match Timeline</h2>
          <div className="space-y-3">
            {[...match.timeline].reverse().map((evt, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex w-16 shrink-0 justify-center pt-0.5">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{evt.minute}</span>
                </div>
                <div className="flex-1 border-l-2 border-slate-100 pl-3 pb-1">
                  <p className="text-sm font-bold text-slate-800">{evt.event}{evt.team ? ` — ${evt.team}` : ''}</p>
                  {evt.description && <p className="text-xs font-medium text-slate-500">{evt.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLive && (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 py-3 text-sm font-bold text-red-600">
          <Radio className="h-4 w-4 animate-pulse" /> Updates automatically — no refresh needed
        </div>
      )}
    </AppLayout>
  );
}
