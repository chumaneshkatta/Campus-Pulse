import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Calendar, Activity, User, Bell, Users, Clock3, ClipboardList, PlusCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import BrandMark from '@/components/BrandMark';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/tournaments', label: 'Tournaments', icon: Trophy },
  { to: '/matches', label: 'Matches', icon: Calendar },
  { to: '/performance', label: 'Performance', icon: Activity },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function AppLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.userType === 'admin' || user?.email === 'sidharthareddy@gmail.com';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
              <BrandMark className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-extrabold tracking-tight text-slate-900">CampusPulse</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">College & Community Sports</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="hidden items-center gap-1 sm:flex">
                <Link to="/admin/users" className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${location.pathname === '/admin/users' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <Users className="h-4 w-4" />
                  Users
                </Link>
                <Link to="/admin/logins" className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${location.pathname === '/admin/logins' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <Clock3 className="h-4 w-4" />
                  Login Activity
                </Link>
                <Link to="/admin/tournaments" className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${location.pathname === '/admin/tournaments' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}><PlusCircle className="h-4 w-4" /> Add Tournament</Link>
              </div>
            )}
            <Link to="/my-registrations" title="My registrations" className="hidden rounded-full p-2 text-slate-600 hover:bg-slate-100 sm:block">
              <ClipboardList className="h-5 w-5" />
            </Link>
            <Link to="/notifications" className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </Link>
            <Link to="/profile" className="flex items-center gap-2 rounded-full bg-slate-100 p-1 pr-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-semibold text-slate-700 sm:block">{user?.full_name || 'Athlete'}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around px-1 py-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to} className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 ${active ? 'text-blue-600' : 'text-slate-500'}`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[10px] font-semibold ${active ? 'text-blue-600' : 'text-slate-500'}`}>{label}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <>
              <Link to="/admin/users" className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 ${location.pathname === '/admin/users' ? 'text-blue-600' : 'text-slate-500'}`}>
                <Users className="h-5 w-5" strokeWidth={location.pathname === '/admin/users' ? 2.5 : 2} />
                <span className={`text-[10px] font-semibold ${location.pathname === '/admin/users' ? 'text-blue-600' : 'text-slate-500'}`}>Users</span>
              </Link>
              <Link to="/admin/logins" className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 ${location.pathname === '/admin/logins' ? 'text-blue-600' : 'text-slate-500'}`}>
                <Clock3 className="h-5 w-5" strokeWidth={location.pathname === '/admin/logins' ? 2.5 : 2} />
                <span className={`text-[10px] font-semibold ${location.pathname === '/admin/logins' ? 'text-blue-600' : 'text-slate-500'}`}>Logins</span>
              </Link>
              <Link to="/admin/tournaments" className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 ${location.pathname === '/admin/tournaments' ? 'text-blue-600' : 'text-slate-500'}`}><PlusCircle className="h-5 w-5" /><span className="text-[10px] font-semibold">Add Event</span></Link>
            </>
          )}
          <Link to="/my-registrations" className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 ${location.pathname === '/my-registrations' ? 'text-blue-600' : 'text-slate-500'}`}>
            <ClipboardList className="h-5 w-5" />
            <span className="text-[10px] font-semibold">My Entries</span>
          </Link>
        </div>
      </nav>

      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-3 md:bottom-8">
        <Link to="/chat" className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/30 transition active:scale-95">
          <span className="absolute right-16 top-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white md:block">Ask AI</span>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </Link>
      </div>
    </div>
  );
}