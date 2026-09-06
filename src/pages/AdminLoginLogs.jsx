import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/AppLayout';
import { Download, Search } from 'lucide-react';

export default function AdminLoginLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const isAdmin = user?.userType === 'admin' || user?.email === 'sidharthareddy@gmail.com';

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      setError('Access denied. Admin privileges required.');
      return;
    }

    const loadLogs = async () => {
      try {
        const response = await fetch('/api/auth/login-logs');
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Backend is unavailable. Start the API server and try again.');
        }

        setLogs(data.logs || []);
      } catch (err) {
        setError(err.message || 'Unable to load login logs.');
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [isAdmin]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return logs;

    return logs.filter((log) => [log.full_name, log.email, log.userType]
      .some((value) => value?.toLowerCase().includes(query)));
  }, [logs, search]);

  const exportLogs = () => {
    const headers = ['User', 'Email', 'Role', 'Login Time'];
    const rows = filteredLogs.map((log) => [
      log.full_name,
      log.email,
      log.userType,
      log.login_time ? new Date(log.login_time).toLocaleString() : '',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'unisport-login-activity.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Access denied. Only the admin account can view this page.
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Admin</p>
          <h1 className="mt-1 font-display text-3xl font-black text-slate-900">Login Activity</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users, emails, or roles"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <button
            type="button"
            onClick={exportLogs}
            disabled={filteredLogs.length === 0}
            title="Download the visible login activity as CSV"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading login history...
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Login Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-slate-500" colSpan={4}>
                      {logs.length === 0 ? 'No login activity yet.' : 'No matching login activity.'}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">{log.full_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${log.userType === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {log.userType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {log.login_time ? new Date(log.login_time).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
