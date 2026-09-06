import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/AppLayout';
import LoadingState from '@/components/states/LoadingState';
import EmptyState from '@/components/states/EmptyState';
import { Activity, AlertTriangle, Heart, Moon, Footprints, Flame, Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts';
import { demoBiometrics } from '@/lib/demo-data';
import { isLocalDemo } from '@/lib/app-params';

const sportNutritionProfiles = {
  Basketball: { calories: 3300, protein: 126, carbs: 420, fat: 78, hydration: 4.2 },
  Football: { calories: 3500, protein: 126, carbs: 455, fat: 80, hydration: 4.5 },
  Cricket: { calories: 3000, protein: 119, carbs: 385, fat: 74, hydration: 4.0 },
  Volleyball: { calories: 3150, protein: 119, carbs: 405, fat: 76, hydration: 4.1 },
  Badminton: { calories: 2950, protein: 112, carbs: 375, fat: 72, hydration: 3.8 },
  Kabaddi: { calories: 3400, protein: 133, carbs: 430, fat: 82, hydration: 4.4 },
};

export default function Performance() {
  const { user } = useAuth();
  const [bios, setBios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('Basketball');

  useEffect(() => {
    if (isLocalDemo) {
      setBios(demoBiometrics(user?.id));
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await base44.entities.Biometric.filter({ userId: user.id }, '-date', 14);
        setBios(data.length ? data.sort((a, b) => (a.date > b.date ? 1 : -1)) : demoBiometrics(user?.id));
      } catch (e) {
        console.error(e);
        setBios(demoBiometrics(user?.id));
      }
      finally { setLoading(false); }
    })();
  }, [user?.id]);

  if (loading) return <AppLayout><LoadingState /></AppLayout>;
  if (!bios.length) return <AppLayout><EmptyState icon={Activity} title="No performance data yet" message="Biometric records will appear here once your coach or device logs sessions." /></AppLayout>;

  const latest = bios[bios.length - 1];
  const chartData = bios.map(b => ({ date: b.date.slice(5), load: b.trainingLoad, readiness: b.readinessScore, sleep: b.sleepHours }));
  const acwrConfig = {
    normal: { color: '#16a34a', label: 'Normal', msg: 'Your training load is well-balanced.' },
    caution: { color: '#d97706', label: 'Caution', msg: 'Slightly elevated load — monitor recovery.' },
    warning: { color: '#dc2626', label: 'Warning', msg: 'High training-load spike detected. Consider reviewing recovery and training volume with your coach or qualified sports professional.' },
  };
  const acwr = acwrConfig[latest.acwrStatus] || acwrConfig.normal;
  const trendIcon = latest.readinessScore > 70 ? TrendingUp : latest.readinessScore > 50 ? Minus : TrendingDown;

  const metrics = [
    { label: 'Heart Rate (avg)', value: latest.heartRateAvg ? `${latest.heartRateAvg} bpm` : '—', icon: Heart, color: 'text-red-500' },
    { label: 'Distance', value: latest.distanceKm ? `${latest.distanceKm} km` : '—', icon: Footprints, color: 'text-blue-500' },
    { label: 'Sleep', value: latest.sleepHours ? `${latest.sleepHours} hrs` : '—', icon: Moon, color: 'text-indigo-500' },
    { label: 'Session Intensity', value: latest.sessionIntensity ? `${latest.sessionIntensity}%` : '—', icon: Flame, color: 'text-orange-500' },
  ];

  const nutritionProfile = sportNutritionProfiles[selectedSport];
  const nutrition = [
    { label: 'Calories', value: nutritionProfile.calories, unit: 'kcal', icon: Flame },
    { label: 'Protein', value: nutritionProfile.protein, unit: 'g', icon: Activity },
    { label: 'Carbs', value: nutritionProfile.carbs, unit: 'g', icon: Activity },
    { label: 'Fat', value: nutritionProfile.fat, unit: 'g', icon: Activity },
    { label: 'Hydration', value: nutritionProfile.hydration, unit: 'L', icon: Droplets },
  ];

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-black tracking-tight text-slate-900">Athlete Performance</h1>
        <p className="text-sm font-semibold text-slate-500">Wellness & training-load support · not medical advice</p>
      </div>

      <div className="space-y-5">
        {/* Readiness + ACWR cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-400">Readiness</span>
              {(() => { const TrendIcon = trendIcon; return <TrendIcon className="h-4 w-4 text-green-500" />; })()}
            </div>
            <p className="font-display text-4xl font-black text-slate-900">{latest.readinessScore}</p>
            <p className="text-xs font-semibold text-slate-500">out of 100</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-400">ACWR</span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: acwr.color }}>{acwr.label}</span>
            </div>
            <p className="font-display text-4xl font-black" style={{ color: acwr.color }}>{latest.acwr}</p>
            <p className="text-xs font-semibold text-slate-500">Acute / Chronic Ratio</p>
          </div>
        </div>

        {/* ACWR breakdown + warning */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-display text-sm font-extrabold text-slate-900">Workload Breakdown</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-bold uppercase text-slate-400">Acute Load (7-day)</p>
              <p className="font-display text-2xl font-black text-slate-900">{latest.acuteLoad || '—'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-bold uppercase text-slate-400">Chronic Load (14-day)</p>
              <p className="font-display text-2xl font-black text-slate-900">{latest.chronicLoad || '—'}</p>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2.5 rounded-xl p-3" style={{ background: `${acwr.color}15` }}>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: acwr.color }} />
            <p className="text-xs font-semibold" style={{ color: acwr.color }}>{acwr.msg}</p>
          </div>
        </div>

        {/* Training load chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-display text-sm font-extrabold text-slate-900">Training Load & Readiness — 14 Days</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600 }} />
              <Area type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={2.5} fill="url(#loadGrad)" name="Training Load" />
              <Line type="monotone" dataKey="readiness" stroke="#16a34a" strokeWidth={2.5} dot={false} name="Readiness" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Body metrics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-display text-sm font-extrabold text-slate-900">Session Metrics</h2>
          <div className="grid grid-cols-2 gap-3">
            {metrics.map(m => { const Icon = m.icon; return (
              <div key={m.label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <Icon className={`h-5 w-5 ${m.color}`} />
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-400">{m.label}</p>
                  <p className="font-display text-lg font-black text-slate-900">{m.value}</p>
                </div>
              </div>
            ); })}
          </div>
        </div>

        {/* Nutrition targets */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-1 font-display text-sm font-extrabold text-slate-900">Nutrition Targets (Estimates)</h2>
          <p className="mb-3 text-xs font-medium text-slate-400">Choose a sport to view general daily training-day estimates for a 70 kg athlete. Not medical advice—adjust with a qualified professional.</p>
          <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
            {Object.keys(sportNutritionProfiles).map(sport => (
              <button key={sport} onClick={() => setSelectedSport(sport)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${selectedSport === sport ? 'bg-blue-600 text-white shadow-md' : 'border border-slate-200 bg-slate-50 text-slate-600'}`}>{sport}</button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {nutrition.map(n => (
              <div key={n.label} className="rounded-xl bg-orange-50 p-3 text-center">
                <p className="text-[10px] font-bold uppercase text-orange-600">{n.label}</p>
                <p className="font-display text-xl font-black text-slate-900">{n.value}</p>
                <p className="text-[10px] font-semibold text-slate-400">{n.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
