import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import LoadingState from '@/components/states/LoadingState';
import EmptyState from '@/components/states/EmptyState';
import { ClipboardList } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getRegisteredEntries } from '@/lib/demo-data';
import { isLocalDemo } from '@/lib/app-params';

export default function MyRegistrations() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        if (isLocalDemo) {
          setRegistrations(getRegisteredEntries().filter((entry) => entry.userId === user?.id));
          return;
        }
        const response = await fetch('/api/registrations');
        const data = await response.json();
        setRegistrations((Array.isArray(data) ? data : []).filter((entry) => entry.userId === user?.id || entry.userEmail === user?.email));
      } catch (error) {
        console.error(error);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    loadRegistrations();
    const interval = window.setInterval(loadRegistrations, 10000);
    return () => window.clearInterval(interval);
  }, [user?.id, user?.email]);

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-black tracking-tight text-slate-900">My Registrations</h1>
        <p className="text-sm font-semibold text-slate-500">All tournament entries in one place</p>
      </div>
      {loading ? <LoadingState /> : registrations.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No registrations yet" message="Your tournament registrations will appear here." />
      ) : (
        <div className="space-y-3">
          {registrations.map((registration) => (
            <Link key={registration.id} to={`/tournaments/${registration.tournamentId}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-extrabold text-slate-900">{registration.tournamentTitle}</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">{registration.registrationType === 'team' ? `Team: ${registration.teamName}` : 'Individual entry'}</p>
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase text-green-700">{registration.status}</span>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-400">{registration.registrationNumber} · {new Date(registration.submittedAt).toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
