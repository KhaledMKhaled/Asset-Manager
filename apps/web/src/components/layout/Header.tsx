import { Bell, Search, Menu, Globe } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 glass border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center relative">
          <Search size={16} className="absolute left-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search leads, campaigns..." 
            className="pl-9 pr-4 py-2 w-64 bg-slate-100 dark:bg-slate-800/50 border-none rounded-full text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
          <Globe size={20} />
        </button>
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
      </div>
    </header>
  );
}
