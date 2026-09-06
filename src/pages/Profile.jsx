import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/AppLayout';
import LoadingState from '@/components/states/LoadingState';
import { User, Mail, Trophy, Calendar, Activity, Award } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const [bio, setBio] = useState(null);
  const [loading, setLoading] = useState(true);
  const accountRole = user?.userType || (user?.email?.toLowerCase() === 'sidharthareddy@gmail.com' ? 'admin' : user?.role) || 'user';

  useEffect(() => {
    (async () => {
      try {
        const bios = await base44.entities.Biometric.filter({ userId: user.id }, '-date', 1);
        setBio(bios[0] || null);
      } finally { setLoading(false); }
    })();
  }, [user?.id]);

  if (loading) return <AppLayout><LoadingState /></AppLayout>;

  return (
    <AppLayout>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-br from-blue-600 to-indigo-700" />
        <div className="relative px-5 pb-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-3xl font-black text-blue-600 shadow-md ring-4 ring-white" style={{ marginTop: '-2.5rem' }}>
            {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <h1 className="mt-3 font-display text-xl font-black text-slate-900">{user?.full_name || 'Athlete'}</h1>
          <p className="text-sm font-semibold text-slate-500">{user?.email}</p>
        </div>

        <div className="grid grid-cols-3 gap-px bg-slate-100">
          <div className="bg-white p-4 text-center">
            <div className="font-display text-2xl font-black text-blue-600">{bio?.readinessScore || '—'}</div>
            <div className="text-[11px] font-semibold uppercase text-slate-400">Readiness</div>
          </div>
          <div className="bg-white p-4 text-center">
            <div className="font-display text-2xl font-black text-slate-900">{bio?.acwr || '—'}</div>
            <div className="text-[11px] font-semibold uppercase text-slate-400">ACWR</div>
          </div>
          <div className="bg-white p-4 text-center">
            <div className="font-display text-2xl font-black text-green-600">{bio?.recoveryScore || '—'}</div>
            <div className="text-[11px] font-semibold uppercase text-slate-400">Recovery</div>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-display text-sm font-extrabold text-slate-900">Account Information</h2>
          <div className="space-y-2.5 text-sm font-medium text-slate-600">
            <div className="flex items-center gap-2.5"><User className="h-4 w-4 text-slate-400" /> {user?.full_name || 'Not set'}</div>
            <div className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-slate-400" /> {user?.email}</div>
            <div className="flex items-center gap-2.5"><Trophy className="h-4 w-4 text-slate-400" /> Role: {accountRole}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-display text-sm font-extrabold text-slate-900">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="/performance" className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700 hover:bg-slate-100"><Activity className="h-4 w-4 text-green-600" /> Performance</a>
            <a href="/academic" className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700 hover:bg-slate-100"><Calendar className="h-4 w-4 text-indigo-600" /> Schedules</a>
            <a href="/tournaments" className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700 hover:bg-slate-100"><Trophy className="h-4 w-4 text-amber-600" /> Tournaments</a>
            <a href="/notifications" className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700 hover:bg-slate-100"><Award className="h-4 w-4 text-purple-600" /> Notifications</a>
          </div>
        </div>

        <button onClick={() => logout()} className="w-full rounded-2xl border border-red-200 bg-red-50 py-3 font-display text-sm font-bold text-red-600 active:scale-95">
          Sign Out
        </button>
      </div>
    </AppLayout>
  );
}