import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/AppLayout';
import LoadingState from '@/components/states/LoadingState';
import EmptyState from '@/components/states/EmptyState';
import { Bell, Check } from 'lucide-react';
import { demoNotifications } from '@/lib/demo-data';
import { isLocalDemo } from '@/lib/app-params';

const typeIcon = {
  match_start: { color: 'text-red-600', bg: 'bg-red-50' },
  score_update: { color: 'text-orange-600', bg: 'bg-orange-50' },
  registration: { color: 'text-green-600', bg: 'bg-green-50' },
  announcement: { color: 'text-blue-600', bg: 'bg-blue-50' },
  schedule_change: { color: 'text-amber-600', bg: 'bg-amber-50' },
  followed_team: { color: 'text-purple-600', bg: 'bg-purple-50' },
  acwr_warning: { color: 'text-red-600', bg: 'bg-red-50' },
  workload_alert: { color: 'text-orange-600', bg: 'bg-orange-50' },
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLocalDemo) {
      setNotifs(demoNotifications(user?.id));
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await base44.entities.Notification.filter({ userId: user.id }, '-created_date', 50);
        setNotifs(data);
      } finally { setLoading(false); }
    })();
  }, [user?.id]);

  const markRead = async (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try { await base44.entities.Notification.update(id, { isRead: true }); } catch {}
  };

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    try { await base44.entities.Notification.updateMany({ userId: user.id, isRead: false }, { $set: { isRead: true } }); } catch {}
  };

  if (loading) return <AppLayout><LoadingState /></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-slate-900">Notifications</h1>
          <p className="text-sm font-semibold text-slate-500">{notifs.filter(n => !n.isRead).length} unread</p>
        </div>
        {notifs.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md active:scale-95">
            <Check className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {notifs.length === 0 ? <EmptyState icon={Bell} title="No notifications" message="You're all caught up." /> : (
        <div className="space-y-2.5">
          {notifs.map(n => {
            const cfg = typeIcon[n.type] || typeIcon.announcement;
            return (
              <div key={n.id} className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${n.isRead ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50/40'}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                  <Bell className={`h-5 w-5 ${cfg.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-bold text-slate-800">{n.title}</p>
                    {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{n.message}</p>
                </div>
                {!n.isRead && <button onClick={() => markRead(n.id)} className="shrink-0 text-[11px] font-bold text-blue-600 hover:underline">Mark read</button>}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}