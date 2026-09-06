import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/AppLayout';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.userType === 'admin' || user?.email === 'sidharthareddy@gmail.com';

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      setError('Access denied. Admin privileges required.');
      return;
    }

    const loadUsers = async () => {
      try {
        const response = await fetch('/api/auth/users');
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Backend is unavailable. Start the API server and try again.');
        }

        setUsers(data.users || []);
      } catch (err) {
        setError(err.message || 'Unable to load users.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isAdmin]);

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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Admin</p>
            <h1 className="mt-1 font-display text-3xl font-black text-slate-900">Registered Users</h1>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading users...
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Institution</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Sport</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-sm text-slate-500" colSpan={6}>No users found.</td>
                  </tr>
                ) : (
                  users.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">{item.full_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.userType === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.userType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.institution}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.sport}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</td>
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
