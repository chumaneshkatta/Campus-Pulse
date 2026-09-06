import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/AppLayout';
import MatchCard from '@/components/match/MatchCard';
import LoadingState from '@/components/states/LoadingState';
import EmptyState from '@/components/states/EmptyState';
import { Calendar } from 'lucide-react';
import { demoMatches } from '@/lib/demo-data';
import { isLocalDemo } from '@/lib/app-params';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'college', label: 'College' },
  { key: 'community', label: 'Community' },
  { key: 'Telangana', label: 'Telangana' },
  { key: 'Andhra Pradesh', label: 'Andhra Pradesh' },
];

export default function Matches() {
  const [searchParams] = useSearchParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('all');

  useEffect(() => {
    const loadMatches = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      if (isLocalDemo) {
        setMatches(demoMatches());
        setLoading(false);
        return;
      }

      try {
        const data = await base44.entities.Match.list('-scheduledDate', 100);
        setMatches(data);
      } catch (error) {
        console.error(error);
        setMatches(demoMatches());
      } finally { setLoading(false); }
    };

    loadMatches(true);
    if (!isLocalDemo) {
      const interval = window.setInterval(() => loadMatches(), 1000);
      return () => window.clearInterval(interval);
    }
  }, []);

  const isTodayView = searchParams.get('filter') === 'today';
  const today = new Date().toISOString().slice(0, 10);
  const filtered = matches.filter(m => {
    const matchesType = active === 'all' || m.matchType === active || m.state === active;
    const matchesToday = !isTodayView || (m.scheduledDate || '').slice(0, 10) === today;
    return matchesType && matchesToday;
  });
  const scheduled = filtered.filter(m => m.status === 'scheduled');
  const completed = filtered.filter(m => m.status === 'completed');

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-black tracking-tight text-slate-900">{isTodayView ? "Today's Matches" : 'Match Schedule'}</h1>
        <p className="text-sm font-semibold text-slate-500">{isTodayView ? 'Fixtures scheduled for today' : 'Live, upcoming & completed fixtures'}</p>
      </div>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActive(t.key)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${active === t.key ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>{t.label}</button>
        ))}
      </div>

      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState icon={Calendar} title={isTodayView ? 'No matches scheduled today' : 'No matches found'} />
      ) : (
        <div className="space-y-5">
          {scheduled.length > 0 && <div><h2 className="mb-2.5 font-display text-sm font-extrabold text-slate-700">UPCOMING</h2><div className="space-y-3">{scheduled.map(m => <MatchCard key={m.id} match={m} />)}</div></div>}
          {completed.length > 0 && <div><h2 className="mb-2.5 font-display text-sm font-extrabold text-slate-500">COMPLETED</h2><div className="space-y-3">{completed.map(m => <MatchCard key={m.id} match={m} />)}</div></div>}
        </div>
      )}
    </AppLayout>
  );
}
