import Link from 'next/link';
import { LayoutDashboard, Users, MessageSquare, Briefcase, Settings, Bot } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Leads & Contacts', icon: Users, href: '/contacts' },
  { name: 'Pipelines', icon: Briefcase, href: '/pipelines' },
  { name: 'Omnichannel Inbox', icon: MessageSquare, href: '/inbox' },
  { name: 'AI Automation', icon: Bot, href: '/automation' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 glass hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-600">
          Smarketing
        </span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <Icon size={20} className="shrink-0" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Admin User</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">System Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
