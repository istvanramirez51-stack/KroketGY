'use client';

import { motion } from 'motion/react';
import { ShoppingBag, History, User, LayoutDashboard, Coffee, Home, LogOut } from 'lucide-react';
import { MenuItem } from '../lib/api';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cart: { item: MenuItem; quantity: number }[];
  isLoggedIn: boolean;
  onLogout: () => void;
  isPhpActive: boolean;
  isCartOpenDesktop?: boolean;
  setIsCartOpenDesktop?: (open: boolean) => void;
  shopLogoUrl?: string;
  loggedInUser?: { username: string; email?: string; role: 'admin' | 'user'; phone?: string } | null;
}

export default function Header({
  activeTab,
  setActiveTab,
  cart,
  isLoggedIn,
  onLogout,
  isPhpActive,
  isCartOpenDesktop,
  setIsCartOpenDesktop,
  shopLogoUrl,
  loggedInUser = null
}: HeaderProps) {
  const totalCartItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-3.5 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/80 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* LOGO AND BRANDING */}
        <motion.div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setActiveTab('home')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="bg-orange-500/10 text-orange-500 border border-orange-500/20 w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
            {shopLogoUrl ? (
              <img src={shopLogoUrl} alt="Logo Jeda" className="w-full h-full object-cover" />
            ) : (
              <Coffee className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>
          <div>
            <h1 className="font-display font-black text-xl tracking-tight uppercase italic text-orange-500">
              Jeda<span className="text-white">Kuliah</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isPhpActive ? 'bg-emerald-500 animate-pulse' : 'bg-cyan-500'}`} />
              <p className="font-mono text-[9px] uppercase text-zinc-550 font-bold tracking-widest">
                {isPhpActive ? 'PHP Remote Database' : 'Lokal Offline Mode'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* MINIMAL NAVIGATION BUTTONS */}
        <nav className="hidden md:flex items-center gap-1.5 bg-zinc-900/40 p-1.5 border border-zinc-900 rounded-xl">
          
          {/* Beranda (Home) */}
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold'
                : 'text-zinc-400 hover:text-zinc-150 hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </button>

          {/* Menu Catalog */}
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'menu' || activeTab === 'search'
                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold'
                : 'text-zinc-400 hover:text-zinc-150 hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Katalog Kantin</span>
          </button>

          {/* History */}
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold'
                : 'text-zinc-400 hover:text-zinc-150 hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Belanja</span>
          </button>

          {/* Separate Divider for Action buttons */}
          <span className="h-4 w-[1px] bg-zinc-800 mx-1" />

          {/* Cart Quick Info */}
          <button
            onClick={() => {
              setActiveTab('menu');
              if (setIsCartOpenDesktop) {
                setIsCartOpenDesktop(true);
              }
            }}
            className="px-3 py-2 text-xs font-mono font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:bg-zinc-900/85 text-zinc-350 border border-transparent"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">Keranjang:</span>
            <span className="text-xs font-black text-emerald-400 font-mono bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
              {totalCartItems}
            </span>
          </button>

          {/* Auth Toggles */}
          {isLoggedIn ? (
            <>
              <span className="h-4 w-[1px] bg-zinc-800 mx-1" />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('admin_dashboard')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab.startsWith('admin')
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25'
                      : 'bg-zinc-950/40 text-cyan-500 border border-zinc-900 hover:bg-zinc-900/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard Admin</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg border border-zinc-900 bg-red-950/20 text-red-400 hover:bg-red-950/30 hover:border-red-900/40 cursor-pointer transition-all flex items-center justify-center"
                  title="Logout Admin"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : loggedInUser ? (
            <>
              <span className="h-4 w-[1px] bg-zinc-800 mx-1" />
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  <span className="font-mono text-[11px] max-w-[80px] truncate">{loggedInUser.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg border border-zinc-900 bg-red-950/20 text-red-400 hover:bg-red-950/30 hover:border-red-900/40 cursor-pointer transition-all flex items-center justify-center"
                  title="Logout Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="h-4 w-[1px] bg-zinc-800 mx-1" />
              <button
                onClick={() => setActiveTab('login')}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-zinc-150 text-black border border-zinc-200 font-bold'
                    : 'text-zinc-400 hover:text-zinc-150 border border-transparent'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Portal Masuk</span>
              </button>
            </>
          )}
        </nav>

      </div>
    </header>
  );
}
