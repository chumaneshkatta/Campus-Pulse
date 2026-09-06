import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm font-semibold text-slate-500">{message}</p>
    </div>
  );
}