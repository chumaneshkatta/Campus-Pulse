import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/AppLayout';
import TournamentCard from '@/components/tournament/TournamentCard';
import LoadingState from '@/components/states/LoadingState';
import EmptyState from '@/components/states/EmptyState';
import { Trophy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { demoTournaments, getLiveTournaments } from '@/lib/demo-data';

const API_BASE = '/api';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'Inter-College', label: 'Inter-College' },
  { key: 'University', label: 'University' },
  { key: 'Community', label: 'Community' },
  { key: 'Outside College', label: 'Outside College' },
  { key: 'Open League', label: 'Open League' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'open', label: 'Registration Open' },
  { key: 'completed', label: 'Completed' },
];

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('all');
  const [q, setQ] = useState('');
  const tournamentsRef = useRef([]);

  useEffect(() => {
    let hasLoaded = false;
    const syncTournaments = async () => {
      try {
        const response = await fetch(`${API_BASE}/tournaments`);
        if (!response.ok) {
          throw new Error('Live API unavailable');
        }
        const payload = await response.json();
        const data = Array.isArray(payload) ? payload : payload.tournaments;
        const nextTournaments = data?.length ? data : getLiveTournaments();
        if (hasLoaded) {
          const previousIds = new Set(tournamentsRef.current.map((item) => item.id));
          const added = nextTournaments.find((item) => !previousIds.has(item.id));
          if (added) toast({ title: 'New tournament added', description: `${added.title} is now available.` });
        }
        tournamentsRef.current = nextTournaments;
        setTournaments(nextTournaments);
      } catch (error) {
        console.error(error);
        try {
          const data = await base44.entities.Tournament.list('-startDate', 50);
          setTournaments(data.length ? data : getLiveTournaments());
        } catch (baseError) {
          console.error(baseError);
          const nextTournaments = getLiveTournaments();
          tournamentsRef.current = nextTournaments;
          setTournaments(nextTournaments);
        }
      } finally {
        setLoading(false);
      }
    };

    syncTournaments().finally(() => { hasLoaded = true; });
    const interval = window.setInterval(() => syncTournaments(), 10000);
    window.addEventListener('unisport:tournaments:updated', syncTournaments);

    return () => {
      window.removeEventListener('unisport:tournaments:updated', syncTournaments);
      window.clearInterval(interval);
    };
  }, []);

  const filtered = tournaments.filter(t => {
    if (active === 'all') return true;
    if (active === 'upcoming') return t.status === 'upcoming';
    if (active === 'open') return t.registrationStatus === 'open';
    if (active === 'completed') return t.status === 'completed';
    return t.eventType === active;
  }).filter(t => !q || t.title.toLowerCase().includes(q.toLowerCase()) || t.sport.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-black tracking-tight text-slate-900">Tournament Hub</h1>
        <p className="text-sm font-semibold text-slate-500">Live tournaments from the UniSport backend · refreshed every 10 seconds</p>
      </div>

      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search tournaments, sports…"
        className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-blue-500"
      />

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setActive(f.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${active === f.key ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState icon={Trophy} title="No tournaments found" message="Try a different filter or search term." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">{filtered.map(t => <TournamentCard key={t.id} tournament={t} />)}</div>
      )}
    </AppLayout>
  );
}
