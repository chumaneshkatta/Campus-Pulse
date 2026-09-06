import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', message, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <div>
        <p className="font-display text-lg font-bold text-slate-800">{title}</p>
        {message && <p className="mt-1 text-sm font-medium text-slate-500">{message}</p>}
      </div>
    </div>
  );
}