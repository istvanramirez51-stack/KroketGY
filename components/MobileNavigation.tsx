'use client';

import React from 'react';
import { Home, History, Store, ShoppingBasket, User } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export default function MobileNavigation({
  activeTab,
  setActiveTab,
  cartCount,
  isLoggedIn,
  onLogout
}: MobileNavigationProps) {
  
  // Helpers to identify active columns
  const isHomeActive = activeTab === 'home';
  const isHistoryActive = activeTab === 'history';
  const isCatalogActive = activeTab === 'menu';
  const isCartActive = activeTab === 'cart';
  const isProfileActive = activeTab === 'login' || activeTab.startsWith('admin');

  // Profile click handler
  const handleProfileClick = () => {
    if (isLoggedIn) {
      setActiveTab('admin_dashboard');
    } else {
      setActiveTab('login');
    }
  };

  return (
    <div className="md:hidden fixed bottom-5 left-4 right-4 z-50">
      {/* Floating Sleek Navigation Container */}
      <div className="bg-[#121214]/95 backdrop-blur-xl border border-zinc-900 rounded-3xl h-[72px] flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.5)]">
        
        {/* Five-column symmetric Grid */}
        <div className="grid grid-cols-5 w-full h-full items-center relative px-2">
          
          {/* TAB 1: HOME */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex flex-col items-center justify-center h-full focus:outline-none cursor-pointer"
          >
            <div className="relative flex flex-col items-center justify-center">
              <Home
                className={`w-[22px] h-[22px] transition-all duration-300 ${
                  isHomeActive 
                    ? 'text-indigo-500 fill-indigo-500/15 stroke-[2.2] scale-110' 
                    : 'text-zinc-500 stroke-[2] hover:text-zinc-400'
                }`}
              />
              <span
                className={`text-[9px] font-sans font-bold mt-1 tracking-wide transition-all duration-200 ${
                  isHomeActive ? 'text-indigo-500 transform translate-y-0.5' : 'text-zinc-500 font-medium'
                }`}
              >
                Home
              </span>
            </div>
          </button>

          {/* TAB 2: HISTORY */}
          <button
            onClick={() => setActiveTab('history')}
            className="flex flex-col items-center justify-center h-full focus:outline-none cursor-pointer"
          >
            <div className="relative flex flex-col items-center justify-center">
              <History
                className={`w-[22px] h-[22px] transition-all duration-300 ${
                  isHistoryActive 
                    ? 'text-indigo-500 stroke-[2.2] scale-110' 
                    : 'text-zinc-500 stroke-[2] hover:text-zinc-400'
                }`}
              />
              <span
                className={`text-[9px] font-sans font-bold mt-1 tracking-wide transition-all duration-200 ${
                  isHistoryActive ? 'text-indigo-500 transform translate-y-0.5' : 'text-zinc-500 font-medium'
                }`}
              >
                Riwayat
              </span>
            </div>
          </button>

          {/* TAB 3: CENTER FLOATING CATALOG (Store icon) */}
          <div className="relative h-full flex items-center justify-center">
            <div className="absolute -top-6 flex flex-col items-center justify-center">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
              >
                {/* Outer semi-transparent indigo pulse glow */}
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 scale-125 blur-[1.5px] animate-pulse" />
                
                {/* Middle sleek gradient outline */}
                <div className="absolute -inset-[2.5px] rounded-full bg-gradient-to-tr from-indigo-400 to-sky-300 opacity-90" />

                {/* Solid white high-contrast separator ring */}
                <div className="absolute -inset-[4.5px] rounded-full border-[3px] border-zinc-950" />

                {/* Main Blue elevated button act */}
                <button
                  onClick={() => setActiveTab('menu')}
                  aria-label="Katalog Kantin Jeda"
                  className={`w-[54px] h-[54px] rounded-full flex items-center justify-center relative z-10 transition-all duration-300 shadow-[0_8px_20px_rgba(99,102,241,0.45)] cursor-pointer ${
                    isCatalogActive
                      ? 'bg-indigo-600 border border-indigo-400/30'
                      : 'bg-[#5c49e7] border border-indigo-400/20'
                  }`}
                >
                  <Store className="w-[23px] h-[23px] text-white stroke-[2.2]" />
                </button>
              </motion.div>
            </div>
          </div>

          {/* TAB 4: CART */}
          <button
            onClick={() => setActiveTab('cart')}
            className="flex flex-col items-center justify-center h-full focus:outline-none cursor-pointer"
          >
            <div className="relative flex flex-col items-center justify-center">
              <div className="relative">
                <ShoppingBasket
                  className={`w-[22px] h-[22px] transition-all duration-300 ${
                    isCartActive 
                      ? 'text-indigo-500 stroke-[2.2] scale-110' 
                      : 'text-zinc-500 stroke-[2] hover:text-zinc-400'
                  }`}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-black font-extrabold font-mono text-[8px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center border border-zinc-950 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] font-sans font-bold mt-1 tracking-wide transition-all duration-200 ${
                  isCartActive ? 'text-indigo-500 transform translate-y-0.5' : 'text-zinc-500 font-medium'
                }`}
              >
                Cart
              </span>
            </div>
          </button>

          {/* TAB 5: PROFILE */}
          <button
            onClick={handleProfileClick}
            className="flex flex-col items-center justify-center h-full focus:outline-none cursor-pointer"
          >
            <div className="relative flex flex-col items-center justify-center">
              <User
                className={`w-[22px] h-[22px] transition-all duration-300 ${
                  isProfileActive 
                    ? 'text-indigo-500 stroke-[2.2] scale-110' 
                    : 'text-zinc-500 stroke-[2] hover:text-zinc-400'
                }`}
              />
              <span
                className={`text-[9px] font-sans font-bold mt-1 tracking-wide transition-all duration-200 ${
                  isProfileActive ? 'text-indigo-500 transform translate-y-0.5' : 'text-zinc-500 font-medium'
                }`}
              >
                Profile
              </span>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}
