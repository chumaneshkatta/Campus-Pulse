import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/AppLayout';
import LoadingState from '@/components/states/LoadingState';
import EmptyState from '@/components/states/EmptyState';
import { BookOpen, Dumbbell, Calendar, AlertTriangle } from 'lucide-react';
import { demoAcademicSchedule, demoPracticeSchedule } from '@/lib/demo-data';
import { isLocalDemo } from '@/lib/app-params';

const typeConfig = {
  class: 'bg-blue-100 text-blue-700',
  assignment: 'bg-amber-100 text-amber-700',
  exam: 'bg-red-100 text-red-700',
  deadline: 'bg-orange-100 text-orange-700',
  practice: 'bg-green-100 text-green-700',
  gym: 'bg-teal-100 text-teal-700',
  team_meeting: 'bg-indigo-100 text-indigo-700',
  recovery: 'bg-cyan-100 text-cyan-700',
  match: 'bg-red-100 text-red-700',
};

export default function Academic() {
  const { user } = useAuth();
  const [academic, setAcademic] = useState([]);
  const [practice, setPractice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('combined');
  const [state, setState] = useState('all');

  useEffect(() => {
    if (isLocalDemo) {
      setAcademic(demoAcademicSchedule(user?.id));
      setPractice(demoPracticeSchedule(user?.id));
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const [a, p] = await Promise.all([
          base44.entities.AcademicSchedule.filter({ userId: user.id }, 'scheduledDate', 20),
          base44.entities.PracticeSchedule.filter({ userId: user.id }, 'scheduledDate', 20),
        ]);
        setAcademic(a);
        setPractice(p);
      } catch (error) {
        console.error(error);
        setAcademic(demoAcademicSchedule(user?.id));
        setPractice(demoPracticeSchedule(user?.id));
      } finally { setLoading(false); }
    })();
  }, [user?.id]);

  if (loading) return <AppLayout><LoadingState /></AppLayout>;

  const combined = [
    ...academic.map(a => ({ ...a, _cat: 'academic' })),
    ...practice.map(p => ({ ...p, _cat: 'practice' })),
  ].sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  // Workload indicator
  const practiceCount = practice.length;
  const examCount = academic.filter(a => a.type === 'exam').length;
  let workload = 'Balanced', workloadColor = 'text-green-600', workloadBg = 'bg-green-50';
  if (practiceCount >= 3 || examCount >= 1) { workload = 'Moderate'; workloadColor = 'text-amber-600'; workloadBg = 'bg-amber-50'; }
  if (practiceCount >= 4 && examCount >= 1) { workload = 'High'; workloadColor = 'text-orange-600'; workloadBg = 'bg-orange-50'; }
  if (practiceCount >= 5 && examCount >= 2) { workload = 'Critical'; workloadColor = 'text-red-600'; workloadBg = 'bg-red-50'; }

  const selected = tab === 'academic' ? academic.map(a => ({ ...a, _cat: 'academic' })) : tab === 'practice' ? practice.map(p => ({ ...p, _cat: 'practice' })) : combined;
  const shown = selected.filter(item => state === 'all' || item.state === state);

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-black tracking-tight text-slate-900">Academic & Practice Schedule</h1>
        <p className="text-sm font-semibold text-slate-500">Balance your training and studies</p>
      </div>

      {/* Workload indicator */}
      <div className={`mb-5 flex items-center gap-3 rounded-2xl ${workloadBg} border border-slate-200 p-4`}>
        <AlertTriangle className={`h-6 w-6 ${workloadColor}`} />
        <div>
          <p className={`font-display text-base font-extrabold ${workloadColor}`}>Workload: {workload}</p>
          <p className="text-xs font-semibold text-slate-600">{practiceCount} practice sessions · {examCount} upcoming exams this period</p>
        </div>
      </div>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {[{ k: 'combined', l: 'Combined' }, { k: 'academic', l: 'Academic' }, { k: 'practice', l: 'Practice' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${tab === t.k ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>{t.l}</button>
        ))}
      </div>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {[{ k: 'all', l: 'All States' }, { k: 'Telangana', l: 'Telangana' }, { k: 'Andhra Pradesh', l: 'Andhra Pradesh' }].map(s => (
          <button key={s.k} onClick={() => setState(s.k)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${state === s.k ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>{s.l}</button>
        ))}
      </div>

      {shown.length === 0 ? <EmptyState icon={Calendar} title="No scheduled items" message="Your academic and practice calendar is empty." /> : (
        <div className="space-y-5">
          {Object.entries(shown.reduce((days, item) => {
            const key = new Date(item.scheduledDate).toDateString();
            days[key] = [...(days[key] || []), item];
            return days;
          }, {})).map(([day, items]) => (
            <section key={day} className="space-y-3">
              <h2 className="font-display text-sm font-extrabold uppercase tracking-wide text-slate-500">{new Date(day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h2>
              {items.map(item => {
            const dt = new Date(item.scheduledDate).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const Icon = item._cat === 'academic' ? BookOpen : Dumbbell;
            return (
              <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item._cat === 'academic' ? 'bg-blue-50' : 'bg-green-50'}`}>
                  <Icon className={`h-5 w-5 ${item._cat === 'academic' ? 'text-blue-600' : 'text-green-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-bold text-slate-800">{item.title}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${typeConfig[item.type] || 'bg-slate-100 text-slate-600'}`}>{item.type.replace('_', ' ')}</span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">{dt}{item.duration ? ` · ${item.duration} min` : ''}{item.venue ? ` · ${item.venue}` : ''}</p>
                  {item.state && <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{item.state}</p>}
                  {item.intensity && <p className="mt-0.5 text-[11px] font-bold uppercase text-slate-400">Intensity: {item.intensity}</p>}
                </div>
              </div>
            );
              })}
            </section>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
