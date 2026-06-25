'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JedaAPI, MenuItem, Transaction } from '../lib/api';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import MenuSection from '../components/MenuSection';
import CartSection from '../components/CartSection';
import HistorySection from '../components/HistorySection';
import LoginSection from '../components/LoginSection';

// Prevent Vercel type compilation mismatches/caching issues
import AdminDashboard from '../components/AdminDashboard';
import MobileNavigation from '../components/MobileNavigation';
import AboutUsVoucher, { Voucher } from '../components/AboutUsVoucher';
import { ShoppingBag, ArrowRight, UserCheck, X, RefreshCw, ChevronRight, Home, Sparkles } from 'lucide-react';

// Unified Premium Transition Variants for Liquid Tab Switching (Slide-up + Blur Crossfade)
const tabContentVariants = {
  initial: {
    opacity: 0,
    y: 16,
    filter: 'blur(3px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 24,
      mass: 0.8
    }
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: 'blur(3px)',
    transition: {
      duration: 0.2,
      ease: [0.3, 0, 0.8, 0.15] // Accelerated exit
    }
  }
} as const;

// ==========================================
// KUSTOMISASI LOGO KANTIN JEDAKULIAH (Silakan kustomisasi lewat kodingan ini)
// ==========================================
const BRAND_LOGO_URL = './public/assets/logo TEP.png';

export default function Page() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isCartOpenDesktop, setIsCartOpenDesktop] = useState<boolean>(false);
  const [latestCheckoutTx, setLatestCheckoutTx] = useState<Transaction | null>(null);
  
  // Auth & API Statuses
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<{ username: string; email?: string; role: 'admin' | 'user'; phone?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPhpActive, setIsPhpActive] = useState(false);
  const [globalToast, setGlobalToast] = useState('');
  // Auto-normalize logo URL (remove './public', '/public', or 'public/' prefix so Next.js can serve it correctly)
  const shopLogoUrl = (() => {
    if (!BRAND_LOGO_URL) return '';
    let url = BRAND_LOGO_URL.trim();
    if (url.startsWith('./public/')) {
      return url.substring(8); // returns '/assets/...'
    }
    if (url.startsWith('/public/')) {
      return url.substring(7); // returns '/assets/...'
    }
    if (url.startsWith('public/')) {
      return '/' + url.substring(7); // returns '/assets/...'
    }
    return url;
  })();

  // Setup database connectivity and load lists on startup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = window.localStorage.getItem("jedakuliah_logged_in") === "true";
      setIsLoggedIn(loggedIn);

      const storedUser = window.localStorage.getItem("jedakuliah_logged_in_user");
      if (storedUser) {
        try {
          setLoggedInUser(JSON.parse(storedUser));
        } catch (e) {
          setLoggedInUser(loggedIn ? { username: 'admin', role: 'admin' } : null);
        }
      } else if (loggedIn) {
        setLoggedInUser({ username: 'admin', role: 'admin' });
      }

      // Initialize promo vouchers
      const INITIAL_VOUCHERS: Voucher[] = [
        {
          id: 'v1',
          code: "MABAKENYANG",
          discount: 5000,
          description: "Khusus Mahasiswa Baru JedaKuliah! Potongan Rp 5.000 flat untuk nugas kenyang di fakultas mana pun."
        },
        {
          id: 'v2',
          code: "IPK4LUR",
          discount: 3000,
          description: "Semanis raihan IPK 4.0 idaman. Nikmati potongan langsung Rp 3.000 ekstra saat memesan."
        }
      ];

      const storedVouchers = window.localStorage.getItem("jedakuliah_vouchers");
      if (storedVouchers) {
        try {
          setVouchers(JSON.parse(storedVouchers));
        } catch (e) {
          setVouchers(INITIAL_VOUCHERS);
        }
      } else {
        window.localStorage.setItem("jedakuliah_vouchers", JSON.stringify(INITIAL_VOUCHERS));
        setVouchers(INITIAL_VOUCHERS);
      }
    }

    async function loadAppletData() {
      setIsLoading(true);
      
      // Determine active connection type
      const activeState = JedaAPI.isRemoteActive();
      setIsPhpActive(activeState);

      try {
        const foodItems = await JedaAPI.getMenu();
        setMenuItems(foodItems);
      } catch (err) {
        console.error("Gagal menarik data menu pada startup:", err);
      }

      // Load static transaction data
      const historyList = await JedaAPI.getTransactions();
      setTransactions(historyList);
      
      setIsLoading(false);
    }

    loadAppletData();
  }, []);

  const handleLoginSuccess = (userData: { username: string; email?: string; role: 'admin' | 'user'; phone?: string }) => {
    setLoggedInUser(userData);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jedakuliah_logged_in_user", JSON.stringify(userData));
    }

    if (userData.role === 'admin') {
      setIsLoggedIn(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("jedakuliah_logged_in", "true");
      }
      setActiveTab('admin_dashboard');
      showNotification('Autentikasi Berhasil. Selamat Datang Admin JedaKuliah.');
    } else {
      setIsLoggedIn(false);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("jedakuliah_logged_in");
      }
      setActiveTab('history'); // Take user to history tab so they can see their logged-in order history!
      showNotification(`Selamat datang kembali, ${userData.username}!`);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("jedakuliah_logged_in");
      window.localStorage.removeItem("jedakuliah_logged_in_user");
    }
    setActiveTab('home');
    showNotification('Sesi telah diakhiri secara aman.');
  };

  const showNotification = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(''), 3000);
  };

  const refreshMenu = async () => {
    setIsLoading(true);
    try {
      const latest = await JedaAPI.getMenu();
      setMenuItems(latest);
    } catch (e) {
      showNotification('Gagal memuat ulang menu dari server.');
    }
    setIsLoading(false);
  };

  const refreshTransactions = async () => {
    const list = await JedaAPI.getTransactions();
    setTransactions(list);
    showNotification('Riwayat transaksi diperbarui.');
  };

  // CART OPERATIONS
  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.item.id === item.id);
      if (existing) {
        return prevCart.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prevCart, { item, quantity: 1 }];
    });
    showNotification(`${item.title} ditambahkan ke keranjang.`);
    setIsCartOpenDesktop(true);
  };

  const updateQuantity = (itemId: number, change: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.item.id === itemId);
      if (!existing) return prevCart;

      const newQty = existing.quantity + change;
      if (newQty <= 0) {
        return prevCart.filter((c) => c.item.id !== itemId);
      }
      return prevCart.map((c) =>
        c.item.id === itemId ? { ...c, quantity: newQty } : c
      );
    });
  };

  const clearCart = () => {
    setCart([]);
    showNotification('Keranjang belanja berhasil dikosongkan.');
  };

  // CHECKOUT RECORDER
  const handleCheckoutSuccess = async (newTx: Omit<Transaction, 'id' | 'date'>) => {
    const loggedTx = await JedaAPI.addTransaction(newTx);
    const list = await JedaAPI.getTransactions();
    setTransactions(list);
    
    // Store latest checkout transaction for the celebratory preview
    setLatestCheckoutTx(loggedTx);
    
    showNotification('Pesanan berhasil dibuat! Selesaikan di tiket WhatsApp.');
  };

  const handleConfirmSuccessModal = () => {
    // Clean out current cart state
    setCart([]);
    
    // Redirect student to History page to track order
    setActiveTab('history');
    
    // Open WhatsApp URL if provided
    if (latestCheckoutTx?.whatsappLink) {
      window.open(latestCheckoutTx.whatsappLink, '_blank', 'noreferrer');
    }
    
    // Close modal
    setLatestCheckoutTx(null);
  };

  // ADMIN CRUD HANDLERS
  const handleAddMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    await JedaAPI.addMenu(item);
    await refreshMenu();
  };

  const handleUpdateMenuItem = async (item: MenuItem) => {
    await JedaAPI.updateMenu(item);
    await refreshMenu();
  };

  const handleDeleteMenuItem = async (id: number) => {
    await JedaAPI.deleteMenu(id);
    await refreshMenu();
  };

  // Update transaction status inside database
  const handleUpdateOrderStatus = async (txId: string, status: 'Diproses' | 'dimasak' | 'pengantaran' | 'Sukses' | 'Gagal') => {
    if (typeof window !== "undefined") {
      await JedaAPI.updateOrderStatus(txId, status);
      const list = await JedaAPI.getTransactions();
      setTransactions(list);
      showNotification(`Pesanan ${txId} berhasil diubah ke: ${status}`);
    }
  };

  const handleUpdateVouchers = (newVouchers: Voucher[]) => {
    setVouchers(newVouchers);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jedakuliah_vouchers", JSON.stringify(newVouchers));
    }
    showNotification('Database Voucher JedaKuliah berhasil diubah.');
  };

  const handleUpdateShopLogo = (logoUrl: string) => {
    // Logo is configured directly in code constant BRAND_LOGO_URL
    showNotification('Silakan ganti URL logo langsung pada file kodingan /app/page.tsx.');
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-x-hidden">
      
      {/* Decorative ambient blurred layout background glow circles (representing glassmorphic 60% weights) */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Persistent global layout header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cart={cart}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        isPhpActive={isPhpActive}
        isCartOpenDesktop={isCartOpenDesktop}
        setIsCartOpenDesktop={setIsCartOpenDesktop}
        shopLogoUrl={shopLogoUrl}
        loggedInUser={loggedInUser}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-8 pb-24 md:pb-8 relative z-10">
        
        {/* Navigasi Beranda / Breadcrumb Page Indicator */}
        <div id="breadcrumbs-navigation" className="mb-6 flex items-center justify-between border border-zinc-900 bg-zinc-900/35 backdrop-blur-md p-2.5 rounded-xl">
          <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider overflow-x-auto scrollbar-none py-0.5">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 transition-all cursor-pointer font-sans text-xs ${
                activeTab === 'home'
                  ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 font-bold'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Home className="w-3.5 h-3.5 shrink-0" />
              <span>Beranda</span>
            </button>

            {activeTab !== 'home' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-650 shrink-0" />
                <span className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-850 bg-zinc-950 text-orange-400 font-bold rounded-lg shrink-0 font-sans text-xs whitespace-nowrap">
                  {activeTab === 'menu' && 'Katalog Kantin Jeda'}
                  {activeTab === 'search' && 'Pencarian Jajanan'}
                  {activeTab === 'cart' && 'Keranjang Belanja'}
                  {activeTab === 'history' && 'Riwayat Transaksi'}
                  {activeTab === 'login' && 'Sesi Admin'}
                  {activeTab.startsWith('admin') && 'Dashboard Admin'}
                </span>
              </>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase text-zinc-550 font-bold pr-2 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Kantin Jeda Kuliah</span>
          </div>
        </div>
        
        {isLoading && (
          <SkeletonLoader tab={activeTab} />
        )}

        <div className={isLoading ? 'hidden' : 'block'}>
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: HOME PANEL */}
            {activeTab === 'home' && (
              <motion.div
                key="home"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <HeroSection
                  onExplore={() => setActiveTab('menu')}
                  featuredItems={menuItems.slice(0, 2)}
                  addToCart={addToCart}
                />
                
                <AboutUsVoucher 
                  vouchers={vouchers}
                  onExplore={() => setActiveTab('menu')}
                  showNotification={showNotification}
                />
              </motion.div>
            )}

            {/* VIEW 2: MENU CATALOG (Featuring responsive 2-column on Desktop and Collapsible Stacked on Mobile) */}
            {(activeTab === 'menu' || activeTab === 'search') && (
              <motion.div
                key="menu-catalog"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left Side: Canteen Catalog Items List */}
                <motion.div 
                  layout
                  transition={{ type: "spring", stiffness: 180, damping: 22 }}
                  className={`space-y-6 ${isCartOpenDesktop ? 'lg:col-span-8' : 'lg:col-span-12'}`}
                >
                  <div className="border-4 border-black p-5 rounded-2xl bg-gradient-to-r from-zinc-900 to-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display font-black text-2xl uppercase tracking-tight">🏆 3 Menu Utama Mahkota Kampus</h2>
                      <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">Resep legendaris terfavorit pilihan mahasiswa, dijamin lezat, mengenyangkan, dan hemat!</p>
                    </div>

                    {/* Desktop Cart Toggle Button */}
                    <button
                      onClick={() => setIsCartOpenDesktop(!isCartOpenDesktop)}
                      className="hidden lg:flex items-center gap-2 px-4 py-2 border-4 border-black bg-zinc-800 text-zinc-200 hover:bg-orange-500 hover:text-black hover:shadow-none translate-y-0 hover:translate-y-[2px] transition-all cursor-pointer font-sans text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                    >
                      <ShoppingBag className="w-4 h-4 text-orange-500" />
                      <span>{isCartOpenDesktop ? 'Tutup Keranjang' : 'Buka Keranjang'}</span>
                      {cart.length > 0 && (
                        <span className="bg-lime-450 text-lime-400 font-mono text-[10px] font-black px-2 py-0.5 rounded border border-lime-400 animate-pulse">
                          {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      )}
                    </button>
                  </div>
                  <MenuSection
                    items={menuItems}
                    addToCart={addToCart}
                    cart={cart}
                    isPhpActive={isPhpActive}
                    autoFocusSearch={activeTab === 'search'}
                  />
                </motion.div>

                {/* Right Side: Groups Order & split billing calculator sidebar (hidden on mobile, managed in dedicated tab) */}
                <AnimatePresence>
                  {isCartOpenDesktop && (
                    <motion.div
                      key="desktop-cart-sidebar"
                      initial={{ opacity: 0, x: 150 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 150 }}
                      transition={{ type: "spring", stiffness: 180, damping: 22 }}
                      className="lg:col-span-4 sticky top-24 space-y-6 hidden lg:block"
                    >
                      <CartSection
                        cart={cart}
                        updateQuantity={updateQuantity}
                        clearCart={clearCart}
                        onCheckoutSuccess={handleCheckoutSuccess}
                        vouchers={vouchers}
                        loggedInUser={loggedInUser}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* VIEW 2.5: MOBILE CHECKOUT CART VIEW (Dedicated tab on mobile navigation) */}
            {activeTab === 'cart' && (
              <motion.div
                key="mobile-cart"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="block lg:hidden max-w-lg mx-auto space-y-6"
              >
                <div className="border-4 border-black p-5 rounded-2xl bg-gradient-to-r from-zinc-900 to-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-2xl uppercase tracking-tight italic">Keranjang Jajanan</h2>
                    <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">Atur pesanan kelompok dan bagi tagihan patungan secara instan</p>
                  </div>
                </div>
                <CartSection
                  cart={cart}
                  updateQuantity={updateQuantity}
                  clearCart={clearCart}
                  onCheckoutSuccess={handleCheckoutSuccess}
                  vouchers={vouchers}
                  loggedInUser={loggedInUser}
                />
              </motion.div>
            )}

            {/* VIEW 3: HISTORY TRANSACTIONS RECORD */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <HistorySection
                  transactions={
                    !loggedInUser
                      ? []
                      : loggedInUser.role === 'admin'
                      ? transactions
                      : transactions.filter((tx) => {
                          const isNameMatch = tx.customerName.toLowerCase().trim() === loggedInUser.username.toLowerCase().trim();
                          const isPhoneMatch = loggedInUser.phone ? tx.phone.trim() === loggedInUser.phone.trim() : false;
                          return isNameMatch || isPhoneMatch;
                        })
                  }
                  onRefresh={refreshTransactions}
                  isAdmin={isLoggedIn}
                  loggedInUser={loggedInUser}
                  onNavigateToLogin={() => setActiveTab('login')}
                />
              </motion.div>
            )}

            {/* VIEW 4: PORTAL LOGIN ENTRY */}
            {activeTab === 'login' && (
              <motion.div
                key="login"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <LoginSection
                  onLoginSuccess={handleLoginSuccess}
                  loggedInUser={loggedInUser}
                  onLogout={handleLogout}
                  onNavigateToHistory={() => setActiveTab('history')}
                />
              </motion.div>
            )}

            {/* VIEW 5: ADMIN DASHBOARD (PROTECTED CRUD HUB) */}
            {activeTab.startsWith('admin') && isLoggedIn && (
              <motion.div
                key="admin"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <AdminDashboard
                  items={menuItems}
                  transactions={transactions}
                  onAddMenu={handleAddMenuItem}
                  onUpdateMenu={handleUpdateMenuItem}
                  onDeleteMenu={handleDeleteMenuItem}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onLogout={handleLogout}
                  isPhpActive={isPhpActive}
                  apiUrl={JedaAPI.getApiBaseUrl()}
                  vouchers={vouchers}
                  onUpdateVouchers={handleUpdateVouchers}
                  shopLogoUrl={shopLogoUrl}
                  onUpdateShopLogo={handleUpdateShopLogo}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* Celebration Checkout Success Modal */}
      <AnimatePresence>
        {latestCheckoutTx && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 200, damping: 18 } 
              }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="border-8 border-black rounded-3xl bg-zinc-950 max-w-lg w-full text-zinc-100 p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(251,146,60,1)] relative overflow-hidden"
            >
              {/* Confetti / Sparkles floating background patterns */}
              <div className="absolute inset-0 bg-grid-pattern h-full w-full opacity-10 pointer-events-none" />
              
              {/* Bouncing success header */}
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <motion.div
                  initial={{ rotate: -15, scale: 0 }}
                  animate={{ 
                    rotate: 0, 
                    scale: 1,
                    transition: { type: "spring", stiffness: 260, damping: 10, delay: 0.15 } 
                  }}
                  className="w-20 h-20 border-4 border-black bg-lime-400 text-black rounded-3xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                >
                  <Sparkles className="w-10 h-10 text-black animate-pulse" />
                </motion.div>

                <div className="space-y-1.5 animate-pulse">
                  <span className="font-mono text-[10px] font-black uppercase text-lime-400 bg-lime-950 px-2.5 py-0.5 border-2 border-black tracking-widest inline-block">
                    CHECKOUT BERHASIL
                  </span>
                  <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-white italic">
                    TRANSAKSI SUKSES! 🎉
                  </h2>
                  <p className="font-mono text-[10px] text-zinc-400">
                    ID: {latestCheckoutTx.id} • {latestCheckoutTx.date}
                  </p>
                </div>
              </div>

              {/* Order summary card details inside */}
              <div className="mt-6 border-4 border-black bg-zinc-900 rounded-2xl p-4 space-y-4 font-mono text-xs relative z-10">
                {/* Header info */}
                <div className="border-b-2 border-zinc-800 pb-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase font-black text-[10px]">Penerima:</span>
                    <span className="text-white font-black">{latestCheckoutTx.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase font-black text-[10px]">Tujuan:</span>
                    <span className="text-zinc-300 font-bold truncate max-w-[200px]">{latestCheckoutTx.address}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {latestCheckoutTx.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-zinc-300">
                      <span>{it.quantity}x {it.title}</span>
                      <span className="font-bold">Rp {(it.price * it.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing / Subtotal stats */}
                <div className="border-t-2 border-dashed border-zinc-800 pt-3 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="text-zinc-400 font-bold">Rp {latestCheckoutTx.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-500">Ongkos Kirim</span>
                    <span className="text-zinc-400 font-bold">Rp {latestCheckoutTx.deliveryFee.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-white border-t-2 border-zinc-800 pt-2">
                    <span className="font-sans font-black uppercase text-xs">Total Tagihan</span>
                    <span className="font-display font-black text-lg text-orange-400">
                      Rp {latestCheckoutTx.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Patungan / Group Splitting section */}
                {latestCheckoutTx.splitCount > 1 && (
                  <div className="bg-orange-950/20 border-2 border-dashed border-orange-500/40 p-3 rounded-xl flex items-center justify-between text-[11px]">
                    <div>
                      <p className="text-orange-400 font-black uppercase text-[9px] tracking-wider">Patungan Group ({latestCheckoutTx.splitCount} Orang)</p>
                      <p className="text-zinc-300 mt-0.5">Masing-masing membayar:</p>
                    </div>
                    <span className="font-display font-black text-sm text-black bg-orange-400 px-2 py-0.5 border-2 border-black">
                      Rp {latestCheckoutTx.splitResult.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm & Next steps instructions */}
              <div className="mt-6 space-y-3 relative z-10">
                {/* primary action: confirm and clear cart */}
                <button
                  id="btn-confirm-success"
                  onClick={handleConfirmSuccessModal}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-mono font-black uppercase bg-orange-500 hover:bg-orange-400 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150 cursor-pointer text-center"
                >
                  <span>Kirim WhatsApp & Lacak Pesanan 📡</span>
                </button>

                <p className="font-mono text-[9px] text-center text-zinc-500 uppercase font-bold leading-relaxed">
                  *Dengan menekan tombol di atas, Anda akan mengosongkan keranjang, diarahkan ke pelacakan status, dan membuka percakapan WhatsApp toko.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global custom notification feedback toast */}
      <AnimatePresence>
        {globalToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 p-4 border-4 border-black bg-zinc-950 text-yellow-300 font-display font-black uppercase text-xs shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex items-center justify-between gap-4 max-w-sm"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <span>{globalToast}</span>
            </div>
            <button
              onClick={() => setGlobalToast('')}
              className="text-zinc-550 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer information bar */}
      <footer className="w-full border-t border-zinc-950 bg-black/60 py-6 px-4 mt-12 text-center text-xs font-mono text-zinc-600 relative z-10">
        <p>© 2026 JedaKuliah Platform. Hak Cipta Dilindungi Undang-Undang.</p>
        <p className="mt-1.5 uppercase text-[10px] text-zinc-700">Dikembangkan untuk ketersediaan kantin mahasiswa berkecepatan tinggi</p>
      </footer>

      {/* Floating Curved Mobile Navigation Bar */}
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((acc, curr) => acc + curr.quantity, 0)}
        isLoggedIn={isLoggedIn}
      />

    </div>
  );
}

function SkeletonLoader({ tab }: { tab: string }) {
  const isAdmin = tab.startsWith('admin');

  if (isAdmin) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        {/* Left Side: Sidebar Placeholder */}
        <div className="lg:col-span-3 space-y-6">
          <div className="border-4 border-black rounded-3xl p-5 bg-zinc-900/40 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b-4 border-black">
              <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0 animate-pulse" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
                <div className="h-2 w-12 bg-zinc-850 rounded animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="h-10 w-full bg-zinc-800/65 border-2 border-black rounded-lg animate-pulse" />
              <div className="h-10 w-full bg-zinc-850 border-2 border-black rounded-lg animate-pulse" />
              <div className="h-10 w-full bg-zinc-850 border-2 border-black rounded-lg animate-pulse" />
            </div>

            <div className="pt-4 border-t-2 border-black/80 space-y-2">
              <div className="h-14 w-full bg-zinc-950/60 border border-black/40 rounded-xl animate-pulse" />
              <div className="h-8 w-full bg-zinc-850 border-2 border-black rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Side: core Display Workspace Panel */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Banner Block */}
          <div className="border-4 border-black p-5 rounded-2xl bg-zinc-900/40 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <div className="h-6 w-48 bg-zinc-800 rounded mb-2 animate-pulse" />
            <div className="h-3 w-72 bg-zinc-850 rounded animate-pulse" />
          </div>

          {/* Bento Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-4 border-black p-6 rounded-2xl bg-zinc-900/40 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] space-y-3">
                <div className="w-8 h-8 rounded bg-zinc-800 animate-pulse" />
                <div className="h-2.5 w-24 bg-zinc-800 rounded animate-pulse" />
                <div className="h-6 w-36 bg-zinc-800 rounded mt-1 animate-pulse" />
                <div className="h-4 w-28 bg-zinc-850 rounded-md pt-2 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Table Container Skeleton */}
          <div className="border-4 border-black rounded-2xl bg-zinc-900/40 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-6">
            <div className="h-5 w-48 bg-zinc-800 rounded mb-6 animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="flex items-center justify-between py-3.5 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-32 bg-zinc-800 rounded animate-pulse" />
                      <div className="h-2 w-20 bg-zinc-850 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-3.5 w-16 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-6 w-24 bg-zinc-850 border border-black rounded-md animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Canteen Menu Catalog Skeleton as default
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
      {/* Left side: Food Catalog Items List */}
      <div className="lg:col-span-8 space-y-6">
        {/* Banner Block */}
        <div className="border-4 border-black p-5 rounded-2xl bg-gradient-to-r from-zinc-950 to-zinc-900 text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-52 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-80 bg-zinc-850 rounded animate-pulse" />
          </div>
        </div>

        {/* Filter Pills Slot */}
        <div className="flex flex-wrap gap-2.5 py-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-20 bg-zinc-900 border-2 border-black rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Search Bar slot */}
        <div className="h-11 w-full lg:max-w-md bg-zinc-900 border-4 border-black rounded-xl animate-pulse" />

        {/* Items grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="border-4 border-black rounded-3xl bg-zinc-900/40 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[16/10] w-full bg-zinc-950 border-b-4 border-black flex items-center justify-center">
                <div className="absolute top-3 left-3 w-16 h-6 bg-zinc-800 border-2 border-black rounded animate-pulse" />
                <div className="w-12 h-12 rounded-full border-4 border-dashed border-zinc-800 animate-spin" />
              </div>
              <div className="p-5 space-y-3.5 flex-1">
                <div className="flex gap-1.5">
                  <div className="h-4 w-12 bg-zinc-850 border border-black rounded animate-pulse" />
                  <div className="h-4 w-16 bg-zinc-850 border border-black rounded animate-pulse" />
                </div>
                <div className="h-5 w-5/6 bg-zinc-800 rounded animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-zinc-850 rounded animate-pulse" />
                  <div className="h-3 w-4/5 bg-zinc-850 rounded animate-pulse" />
                </div>
              </div>
              <div className="p-5 pt-0 mt-auto">
                <div className="h-10 w-full bg-zinc-850 border-2 border-black rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Sidebar Cart Panel Loader */}
      <div className="lg:col-span-4 space-y-6 hidden lg:block">
        <div className="border-4 border-black p-5 rounded-3xl bg-zinc-900/30 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-850">
            <div className="h-5 w-28 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-10 bg-zinc-850 rounded animate-pulse" />
          </div>

          <div className="space-y-4 py-2">
            {[1, 2].map((it) => (
              <div key={it} className="flex gap-3 items-center">
                <div className="w-10 h-10 bg-zinc-800 border border-black rounded-lg animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-28 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-2 w-16 bg-zinc-850 rounded animate-pulse" />
                </div>
                <div className="h-5 w-12 bg-zinc-850 border border-black rounded animate-pulse" />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t-2 border-dashed border-zinc-800 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-zinc-850 rounded animate-pulse" />
              <div className="h-3.5 w-24 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="h-11 w-full bg-zinc-850 border-2 border-black rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
