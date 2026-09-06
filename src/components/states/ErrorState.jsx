import { AlertCircle, RotateCw } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <p className="max-w-xs text-sm font-semibold text-slate-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md active:scale-95">
          <RotateCw className="h-4 w-4" /> Retry
        </button>
      )}
    </div>
  );
}