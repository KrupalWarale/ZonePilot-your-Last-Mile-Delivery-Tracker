import React from 'react';
import { useDemo } from '../store/DemoStore';
import { Package2, LogOut, ShieldAlert, User as UserIcon, Truck } from 'lucide-react';

export function Navigation() {
  const { currentUser, logout } = useDemo();

  if (!currentUser) return null;

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 selection:bg-zinc-150">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-900">
          <div className="bg-zinc-900 text-white p-2 rounded-xl shadow-sm border border-zinc-800">
            <Package2 size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">ZonePilot</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-sm">
            {currentUser.role === 'admin' ? (
              <ShieldAlert size={15} className="text-zinc-600" />
            ) : currentUser.role === 'agent' ? (
              <Truck size={15} className="text-zinc-600" />
            ) : (
              <UserIcon size={15} className="text-zinc-600" />
            )}
            <span className="font-semibold text-zinc-800">{currentUser.name}</span>
            <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-200/50 px-2 py-0.5 rounded-md tracking-wider">
              {currentUser.role}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 px-3.5 py-2 rounded-xl text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-all cursor-pointer"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
