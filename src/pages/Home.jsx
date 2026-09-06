import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/AppLayout';
import MatchCard from '@/components/match/MatchCard';
import LoadingState from '@/components/states/LoadingState';
import { Calendar, Trophy, Activity, BookOpen, Dumbbell, Apple, Bell, ChevronRight, Radio, AlertTriangle } from 'lucide-react';
import { demoMatches, getLiveTournaments } from '@/lib/demo-data';
import { isLocalDemo } from '@/lib/app-params';

const API_BASE = '/api';

function SectionCard({ title, icon: Icon, to, accent = 'blue', children }) {
  const accents = {
    blue: 'from-blue-50 to-blue-100/50 text-blue-600',
    green: 'from-green-50 to-green-100/50 text-green-600',
    amber: 'from-amber-50 to-amber-100/50 text-amber-600',
    red: 'from-red-50 to-red-100/50 text-red-600',
    purple: 'from-purple-50 to-purple-100/50 text-purple-600',
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${accents[accent]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="font-display text-base font-extrabold text-slate-900">{title}</h2>
        </div>
        {to && <Link to={to} className="flex items-center text-xs font-bold text-blue-600 hover:underline">View all <ChevronRight className="h-3.5 w-3.5" /></Link>}
      </div>
      {children}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [data, setData] = useState({ matches: [], tournaments: [], notifs: [], latestBio: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncLiveData = async () => {
      if (isLocalDemo) {
        setData({ matches: demoMatches(), tournaments: getLiveTournaments(), notifs: [], latestBio: null });
        setLoading(false);
        return;
      }

      try {
        const [matches, liveTournaments, notifs, bios] = await Promise.all([
          base44.entities.Match.list('-scheduledDate', 50).catch(() => demoMatches()),
          fetch(`${API_BASE}/tournaments`).then(async (res) => {
            if (!res.ok) throw new Error('Live API unavailable');
            const payload = await res.json();
            return Array.isArray(payload) ? payload : payload.tournaments || [];
          }).catch(() => getLiveTournaments()),
          user ? base44.entities.Notification.filter({ userId: user.id }, '-created_date', 5).catch(() => []) : Promise.resolve([]),
          user ? base44.entities.Biometric.filter({ userId: user.id }, '-date', 1).catch(() => []) : Promise.resolve([]),
        ]);
        setData({ matches, tournaments: liveTournaments, notifs, latestBio: bios[0] || null });
      } catch (e) {
        console.error(e);
        setData({ matches: demoMatches(), tournaments: getLiveTournaments(), notifs: [], latestBio: null });
      } finally {
        setLoading(false);
      }
    };

    syncLiveData();
    window.addEventListener('unisport:tournaments:updated', syncLiveData);

    return () => {
      window.removeEventListener('unisport:tournaments:updated', syncLiveData);
    };
  }, [user?.id]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysMatches = data?.matches.filter(m => (m.scheduledDate || '').slice(0, 10) === todayStr) || [];
  const upcomingTournaments = data?.tournaments.filter(t => t.status !== 'completed').slice(0, 3) || [];
  const unreadNotifs = data?.notifs.filter(n => !n.isRead) || [];
  const bio = data?.latestBio;

  return (
    <AppLayout>
      {/* Greeting */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-slate-500">{greeting},</p>
        <h1 className="font-display text-2xl font-black tracking-tight text-slate-900">{user?.full_name || 'Athlete'} 👋</h1>
      </div>

      {loading ? <LoadingState /> : (
        <div className="space-y-5">
          {/* Stat strip */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/matches" className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <div className="font-display text-2xl font-black text-slate-900">{todaysMatches.length}</div>
              <div className="text-[11px] font-semibold uppercase text-slate-500">Today's Matches</div>
            </Link>
            <Link to="/tournaments" className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <div className="font-display text-2xl font-black text-amber-600">{data.tournaments.length}</div>
              <div className="text-[11px] font-semibold uppercase text-slate-500">Tournaments</div>
            </Link>
          </div>

          {/* ACWR Warning if high */}
          {bio?.acwrStatus === 'warning' && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-bold text-amber-800">High training-load spike detected (ACWR {bio.acwr})</p>
                <p className="mt-0.5 text-xs font-medium text-amber-700">Consider reviewing recovery and training volume with your coach or qualified sports professional.</p>
              </div>
            </div>
          )}

          {/* Today's matches */}
          <SectionCard title="Today's Matches" icon={Calendar} to="/matches" accent="blue">
            {todaysMatches.length > 0 ? (
              <div className="space-y-3">{todaysMatches.slice(0, 3).map(m => <MatchCard key={m.id} match={m} />)}</div>
            ) : <p className="py-4 text-sm font-medium text-slate-400">No matches scheduled today.</p>}
          </SectionCard>

          {/* Upcoming tournaments */}
          <SectionCard title="Upcoming Tournaments" icon={Trophy} to="/tournaments" accent="amber">
            <div className="space-y-2">
              {upcomingTournaments.map(t => (
                <Link key={t.id} to={`/tournaments/${t.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                  <div>
                    <p className="font-display text-sm font-bold text-slate-800">{t.title}</p>
                    <p className="text-xs font-semibold text-slate-500">{t.sport} · {t.eventType} · {t.startDate}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${t.registrationStatus === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {t.registrationStatus === 'open' ? 'Register' : t.registrationStatus}
                  </span>
                </Link>
              ))}
            </div>
          </SectionCard>

          {/* Performance summary */}
          {bio && (
            <SectionCard title="Performance & Wellness" icon={Activity} to="/performance" accent="green">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Readiness</p>
                  <p className="font-display text-2xl font-black text-slate-900">{bio.readinessScore}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">ACWR</p>
                  <p className={`font-display text-2xl font-black ${bio.acwrStatus === 'warning' ? 'text-red-600' : bio.acwrStatus === 'caution' ? 'text-amber-600' : 'text-green-600'}`}>{bio.acwr}</p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Schedules + notifications row */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/academic" className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <p className="font-display text-sm font-bold text-slate-800">Academic Schedule</p>
              <p className="text-xs font-medium text-slate-500">Classes, exams & deadlines</p>
            </Link>
            <Link to="/academic" className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Dumbbell className="h-5 w-5 text-teal-600" />
              <p className="font-display text-sm font-bold text-slate-800">Practice Schedule</p>
              <p className="text-xs font-medium text-slate-500">Training & recovery sessions</p>
            </Link>
          </div>

          {/* Notifications */}
          <SectionCard title="Notifications" icon={Bell} to="/notifications" accent="purple">
            {unreadNotifs.length > 0 ? (
              <div className="space-y-2">
                {unreadNotifs.slice(0, 3).map(n => (
                  <div key={n.id} className="flex items-start gap-2 rounded-xl border border-slate-100 p-2.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{n.title}</p>
                      <p className="text-xs font-medium text-slate-500">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="py-3 text-sm font-medium text-slate-400">You're all caught up.</p>}
          </SectionCard>
        </div>
      )}
    </AppLayout>
  );
}
