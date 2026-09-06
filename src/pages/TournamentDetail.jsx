import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/AppLayout';
import LoadingState from '@/components/states/LoadingState';
import ErrorState from '@/components/states/ErrorState';
import { MapPin, Calendar, Users, Globe, FileText, ChevronLeft, ExternalLink, Trophy, Clock, UserPlus } from 'lucide-react';
import { demoTournaments, getLiveTournaments, saveRegistrationEntry, setLiveTournaments } from '@/lib/demo-data';
import { useAuth } from '@/lib/AuthContext';

const API_BASE = '/api';

export default function TournamentDetail() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationType, setRegistrationType] = useState('team');
  const [teamName, setTeamName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${API_BASE}/tournaments/${id}`);
        if (!response.ok) {
          throw new Error('Tournament not found');
        }
        const data = await response.json();
        setTournament(data);
      } catch {
        try {
          const data = await base44.entities.Tournament.get(id);
          setTournament(data);
        } catch {
          const localTournament = getLiveTournaments().find(item => item.id === id) || demoTournaments().find(item => item.id === id);
          if (localTournament) {
            setTournament(localTournament);
          } else {
            setError(true);
          }
        }
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <AppLayout><LoadingState /></AppLayout>;
  if (error || !tournament) return <AppLayout><ErrorState message="Tournament not found." onRetry={() => window.location.reload()} /></AppLayout>;

  const isOpen = tournament.registrationStatus === 'open';
  const eventConfig = { 'Inter-College': 'bg-purple-100 text-purple-700', University: 'bg-indigo-100 text-indigo-700', Community: 'bg-teal-100 text-teal-700', 'Outside College': 'bg-amber-100 text-amber-700', 'Open League': 'bg-orange-100 text-orange-700' };

  const submitRegistration = async (event) => {
    event.preventDefault();
    if (registrationType === 'team' && !teamName.trim()) {
      setRegistrationError('Enter a team name to continue.');
      return;
    }

    setSubmitting(true);
    setRegistrationError('');
    const registration = {
      tournamentId: tournament.id,
      tournamentTitle: tournament.title,
      registrationType,
      userId: user?.id,
      teamName: registrationType === 'team' ? teamName.trim() : undefined,
      status: 'submitted',
      registrationNumber: `UP-${Date.now().toString().slice(-6)}`,
      submittedAt: new Date().toISOString(),
    };

    try {
      if (!tournament.id.startsWith('live-tournament-') && !tournament.id.startsWith('google-') && !tournament.id.startsWith('sports-provider-')) {
        saveRegistrationEntry(registration);
        const allTournaments = getLiveTournaments();
        const nextTournaments = allTournaments.map((item) => {
          if (item.id !== tournament.id) return item;
          const nextTeamCount = Math.min((Number(item.teamCount) || 0) + 1, Number(item.maxTeams) || Number.MAX_SAFE_INTEGER);
          return { ...item, teamCount: nextTeamCount };
        });
        setLiveTournaments(nextTournaments);
        setTournament({ ...tournament, teamCount: Math.min((Number(tournament.teamCount) || 0) + 1, Number(tournament.maxTeams) || Number.MAX_SAFE_INTEGER) });
      } else {
        const response = await fetch(`${API_BASE}/tournaments/${tournament.id}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...registration,
            userId: user?.id || 'guest-user',
            userEmail: user?.email || 'guest@local.test',
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || 'Registration failed');
        }

        const payload = await response.json();
        setTournament(payload.tournament);
      }
      setRegistered(true);
      setShowRegistration(false);
      window.dispatchEvent(new Event('unisport:tournaments:updated'));
    } catch (submitError) {
      console.error(submitError);
      setRegistrationError('Registration could not be submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <Link to="/tournaments" className="mb-4 flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800">
        <ChevronLeft className="h-4 w-4" /> Tournaments
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-40" style={{ background: tournament.bannerColor || '#0f172a' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute left-5 top-5 flex gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${eventConfig[tournament.eventType] || 'bg-slate-100'}`}>{tournament.eventType}</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur">{tournament.sport}</span>
          </div>
          <div className="absolute bottom-4 left-5 right-5">
            <h1 className="font-display text-xl font-black leading-tight text-white">{tournament.title}</h1>
            <p className="mt-1 text-sm font-semibold text-white/80">{tournament.organizer}</p>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Start Date</p>
              <p className="font-display text-base font-bold text-slate-900">{tournament.startDate}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase text-slate-400">End Date</p>
              <p className="font-display text-base font-bold text-slate-900">{tournament.endDate}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Reg. Deadline</p>
              <p className="font-display text-base font-bold text-slate-900">{tournament.registrationDeadline}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase text-slate-400">Teams</p>
              <p className="font-display text-base font-bold text-slate-900">{tournament.teamCount} / {tournament.maxTeams}</p>
            </div>
          </div>

          <div className="mb-5 space-y-2.5">
            <div className="flex items-start gap-2.5 text-sm font-medium text-slate-700"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> {tournament.venue} · {tournament.location}</div>
            {tournament.officialWebsite && <div className="flex items-start gap-2.5 text-sm font-medium text-blue-600"><Globe className="mt-0.5 h-4 w-4 shrink-0" /> <a href={tournament.officialWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">Official Website <ExternalLink className="h-3 w-3" /></a></div>}
            {tournament.rulesUrl && <div className="flex items-start gap-2.5 text-sm font-medium text-blue-600"><FileText className="mt-0.5 h-4 w-4 shrink-0" /> <a href={tournament.rulesUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">Rules & Rulebook <ExternalLink className="h-3 w-3" /></a></div>}
          </div>

          {tournament.description && <p className="mb-5 rounded-xl border border-slate-100 p-4 text-sm font-medium leading-relaxed text-slate-600">{tournament.description}</p>}

          <div className="mb-5 rounded-xl bg-blue-50 p-4">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-blue-700"><UserPlus className="h-3.5 w-3.5" /> Roster Requirements</p>
            <p className="text-sm font-medium text-blue-800">Min {tournament.minRosterSize} — Max {tournament.maxRosterSize} players per team</p>
          </div>

          {registered && <div className="mb-3 rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-700">Registration submitted successfully.</div>}

          <button
            onClick={() => setShowRegistration(true)}
            disabled={!isOpen || registered}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-display text-base font-bold transition ${isOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 active:scale-95' : 'bg-slate-100 text-slate-400'}`}
          >
            <Trophy className="h-5 w-5" />
            {registered ? 'Registration Submitted' : isOpen ? 'Register Now' : 'Registration Closed'}
          </button>

          {showRegistration && (
            <form onSubmit={submitRegistration} className="mt-4 space-y-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div>
                <h2 className="font-display text-base font-extrabold text-slate-900">Register for {tournament.sport}</h2>
                <p className="mt-0.5 text-xs font-medium text-slate-600">Submit your entry for {tournament.title}.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['team', 'individual'].map(type => (
                  <button type="button" key={type} onClick={() => setRegistrationType(type)} className={`rounded-xl px-3 py-2 text-sm font-bold capitalize ${registrationType === type ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>{type}</button>
                ))}
              </div>
              {registrationType === 'team' && <input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Team name" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-500" />}
              {registrationError && <p className="text-xs font-bold text-red-600">{registrationError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowRegistration(false)} className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600">Cancel</button>
                <button disabled={submitting} type="submit" className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit Registration'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
