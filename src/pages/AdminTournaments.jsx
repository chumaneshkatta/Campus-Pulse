import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Plus } from 'lucide-react';

export default function AdminTournaments() {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', sport: '', startDate: '', endDate: '', location: '', organizer: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const isAdmin = user?.userType === 'admin' || user?.email?.toLowerCase() === 'sidharthareddy@gmail.com';

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/tournaments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Unable to add tournament.');
      setForm({ title: '', sport: '', startDate: '', endDate: '', location: '', organizer: '' });
      setMessage('Tournament added successfully. It will appear in Tournament Hub on the next refresh.');
      window.dispatchEvent(new Event('unisport:tournaments:updated'));
    } catch (submitError) { setError(submitError.message || 'Backend is unavailable. Start the API server and try again.'); }
  };

  if (!isAdmin) return <AppLayout><div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Access denied. Admin privileges required.</div></AppLayout>;

  return <AppLayout><div className="mx-auto max-w-2xl space-y-5"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Admin</p><h1 className="mt-1 font-display text-3xl font-black text-slate-900">Add Tournament</h1><p className="mt-1 text-sm font-semibold text-slate-500">Create a tournament in the UniSport live data source.</p></div>{message && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">{message}</div>}{error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}<form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-4 sm:grid-cols-2">{[['title','Tournament name','text'],['sport','Sport','text'],['startDate','Start date','datetime-local'],['endDate','End date','datetime-local'],['location','Location','text'],['organizer','Organizer','text']].map(([name, label, type]) => <label key={name} className="space-y-1.5 text-sm font-bold text-slate-700">{label}<input name={name} type={type} value={form[name]} onChange={update} required={name === 'title' || name === 'sport' || name === 'startDate'} className="h-11 w-full rounded-xl border border-slate-200 px-3 font-medium outline-none focus:border-blue-500" /></label>)}</div><button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Add Tournament</button></form></div></AppLayout>;
}
