
import React from 'react';
import { NAVIGATION_ITEMS, ADMIN_NAVIGATION_ITEMS } from '../constants';
import { AppView, User } from '../types';
import { LogOut, Bell, Search, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setActiveView, user, onLogout }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white border-r border-slate-100 p-5 z-40">
        <div className="mb-8 px-1 cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <Logo variant="compact" />
        </div>
        
        <div className="flex-1 space-y-1 overflow-y-auto no-scrollbar pb-10">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Hauptmenü</p>
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as AppView)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/25' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-brand-orange'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-orange'}`}>
                  {item.icon}
                </span>
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            );
          })}

          {user.isAdmin && (
            <>
              <div className="pt-6 pb-2 border-t border-slate-50 mt-4">
                <p className="px-3 text-[10px] font-bold text-brand-burgundy/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck size={12} /> Administration
                </p>
              </div>
              {ADMIN_NAVIGATION_ITEMS.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as AppView)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-brand-burgundy text-white shadow-lg shadow-brand-burgundy/25' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-brand-burgundy'
                    }`}
                  >
                    <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-burgundy'}`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 space-y-4 bg-white">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50">
            <div className="relative">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-brand-burgundy truncate leading-none mb-1">{user.name}</p>
              <p className="text-[11px] font-medium text-slate-500 truncate">{user.isAdmin ? 'Administrator' : user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-200 font-bold text-sm"
          >
            <LogOut size={18} />
            Abmelden
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-50">
        <div className="cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <Logo variant="compact" />
        </div>
        <div className="flex items-center gap-4">
          {user.isAdmin && <ShieldCheck className="text-brand-burgundy" size={18} />}
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-100" />
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar Desktop */}
        <header className="hidden md:flex items-center justify-between px-10 py-5 bg-white/40 backdrop-blur-sm border-b border-slate-100/50">
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Suchen..." 
              className="w-full bg-white border-none rounded-2xl pl-11 pr-4 py-2 text-sm outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-brand-orange/50 shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-6">
             <button className="relative p-2.5 bg-white rounded-2xl shadow-sm text-slate-500 hover:text-brand-orange transition-colors">
               <Bell size={18} />
               <span className="absolute top-2 right-2.5 w-2 h-2 bg-brand-orange rounded-full border-2 border-white"></span>
             </button>
             <div className="h-8 w-[1px] bg-slate-200"></div>
             <div className="flex items-center gap-3">
               <div className="text-right">
                 <p className="text-xs font-bold text-slate-800 leading-none mb-1">{user.name}</p>
                 <p className="text-[10px] font-black text-brand-orange uppercase tracking-tighter">Status: {user.isAdmin ? 'Admin' : 'Mitarbeiter'}</p>
               </div>
               <img src={user.avatar} className="w-9 h-9 rounded-xl object-cover shadow-sm border border-slate-100" />
             </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto pb-28 md:pb-10 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] flex justify-around items-center px-4 z-50 shadow-2xl shadow-slate-900/40">
        {NAVIGATION_ITEMS.slice(0, 4).map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as AppView)}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive ? 'bg-brand-orange text-white scale-110 shadow-lg shadow-brand-orange/40' : 'text-slate-400'
              }`}
            >
              {item.icon}
            </button>
          );
        })}
        {user.isAdmin && (
           <button
             onClick={() => setActiveView('admin-users')}
             className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
               activeView.startsWith('admin') ? 'bg-brand-burgundy text-white scale-110 shadow-lg' : 'text-slate-400'
             }`}
           >
             <ShieldCheck size={20} />
           </button>
        )}
      </nav>
    </div>
  );
};

export default Layout;
