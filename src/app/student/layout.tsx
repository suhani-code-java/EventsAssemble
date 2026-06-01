'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Home, Calendar, Search, QrCode, Trophy, Bell, LogOut, Menu, X, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/student' },
  { icon: Search, label: 'Browse Events', href: '/student/events' },
  { icon: Calendar, label: 'My Events', href: '/student/my-events' },
  { icon: QrCode, label: 'Attendance', href: '/student/attendance' },
  { icon: Trophy, label: 'Gamification', href: '/student/gamification' },
  { icon: Bell, label: 'Notifications', href: '/student/notifications' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; points: number; role: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.role !== 'student') {
        router.push('/organizer');
        return;
      }
      setUser(parsed);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 flex-col bg-white border-r border-cream-300/50 fixed h-full z-40">
        <div className="p-6 border-b border-cream-300/50">
          <Link href="/student" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-red rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-charcoal-800">EchoPod</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
              id={`sidebar-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-cream-300/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-accent-red/10 flex items-center justify-center">
              <User className="w-5 h-5 text-accent-red" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-charcoal-800 truncate">{user.name}</p>
              <p className="text-xs text-charcoal-400 truncate">{user.points} pts</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-charcoal-400 hover:text-accent-red">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-charcoal-800/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-elegant-lg animate-slide-in-right">
            <div className="p-6 flex items-center justify-between border-b border-cream-300/50">
              <Link href="/student" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent-red rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-serif text-xl font-bold text-charcoal-800">EchoPod</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-charcoal-400" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cream-300/50">
              <button onClick={handleLogout} className="sidebar-link w-full text-charcoal-400 hover:text-accent-red">
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top Bar - Mobile */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-cream-300/50 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-charcoal-600" />
          </button>
          <span className="font-serif font-bold text-charcoal-800">EchoPod</span>
          <div className="w-6" />
        </div>

        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
