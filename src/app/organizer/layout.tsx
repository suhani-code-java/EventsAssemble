'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Home, Calendar, BarChart3, Bell, Trophy, Megaphone, QrCode, LogOut, Menu, X, User, Award } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/organizer' },
  { icon: Calendar, label: 'Events', href: '/organizer/events' },
  { icon: BarChart3, label: 'Analytics', href: '/organizer/analytics' },
  { icon: QrCode, label: 'Scanner', href: '/organizer/scanner' },
  { icon: Bell, label: 'Notifications', href: '/organizer/notifications' },
  { icon: Trophy, label: 'Gamification', href: '/organizer/gamification' },
  { icon: Award, label: 'Winners', href: '/organizer/winners' },
  { icon: Megaphone, label: 'Promote', href: '/organizer/promote' },
];

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.role !== 'organizer') {
        router.push('/student');
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
      <aside className="hidden lg:flex lg:w-64 flex-col bg-charcoal-800 fixed h-full z-40">
        <div className="p-6 border-b border-charcoal-700">
          <Link href="/organizer" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-red rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-white">EchoPod</span>
          </Link>
          <p className="text-charcoal-400 text-xs mt-2">Organizer Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'bg-accent-red text-white'
                  : 'text-charcoal-300 hover:bg-charcoal-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-charcoal-700">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-accent-red/20 flex items-center justify-center">
              <User className="w-5 h-5 text-accent-red" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-charcoal-400 truncate">Organizer</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-charcoal-400 hover:bg-charcoal-700 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-charcoal-800/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-charcoal-800 shadow-elegant-lg animate-slide-in-right">
            <div className="p-6 flex items-center justify-between border-b border-charcoal-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent-red rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-serif text-xl font-bold text-white">EchoPod</span>
              </div>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href
                      ? 'bg-accent-red text-white'
                      : 'text-charcoal-300 hover:bg-charcoal-700 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-charcoal-800 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-white" />
          </button>
          <span className="font-serif font-bold text-white">EchoPod Organizer</span>
          <div className="w-6" />
        </div>
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
