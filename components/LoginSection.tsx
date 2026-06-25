'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, Key, CheckCircle2, ShieldAlert, ArrowRight, Mail, Phone, UserPlus } from 'lucide-react';
import { JedaAPI } from '../lib/api';

interface LoginSectionProps {
  onLoginSuccess: (userData: { username: string; email?: string; role: 'admin' | 'user'; phone?: string }) => void;
  loggedInUser?: { username: string; email?: string; role: 'admin' | 'user'; phone?: string } | null;
  onLogout?: () => void;
  onNavigateToHistory?: () => void;
}

export default function LoginSection({ onLoginSuccess, loggedInUser, onLogout, onNavigateToHistory }: LoginSectionProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [registerWa, setRegisterWa] = useState('');
  const [registerGmail, setRegisterGmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Subtitle depending on active tab and role/identifier entered
  const getLoginSubtitle = () => {
    if (activeTab !== 'login') {
      return 'Dapatkan Akses JedaKuliah & Lacak Pesanan Anda';
    }
    const identifierLower = loginIdentifier.toLowerCase().trim();
    if (identifierLower === 'admin' || identifierLower.includes('admin')) {
      return 'Mendeteksi Akses: Administrator JedaKuliah';
    } else if (identifierLower.length > 0) {
      return `Mendeteksi Akses: Pelanggan / User (${loginIdentifier})`;
    } else {
      return 'Silakan masuk ke akun JedaKuliah Anda';
    }
  };

  // Dynamic Button Text depending on role/identifier entered
  const getSubmitButtonText = () => {
    if (isSubmitting) {
      return 'Memverifikasi Akun...';
    }
    const identifierLower = loginIdentifier.toLowerCase().trim();
    if (identifierLower === 'admin' || identifierLower.includes('admin')) {
      return 'Login sebagai Admin';
    } else if (identifierLower.length > 0) {
      return 'Login';
    } else {
      return 'Login';
    }
  };

  // Clear messages on tab change
  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    // 1. Check default admin credentials (instant offline check)
    const isDefaultAdmin = 
      (loginIdentifier === '120202615' && loginPassword === 'admin123') ||
      (loginIdentifier === 'admin' && loginPassword === 'admin123') ||
      (loginIdentifier === 'admin@gmail.com' && loginPassword === 'admin123');

    if (isDefaultAdmin) {
      onLoginSuccess({
        username: loginIdentifier,
        role: 'admin'
      });
      setIsSubmitting(false);
      return;
    }

    // 2. Check remote PHP backend database
    if (JedaAPI.isRemoteActive()) {
      const res = await JedaAPI.login(loginIdentifier, loginPassword);
      if (res.success) {
        onLoginSuccess({
          username: loginIdentifier,
          role: loginIdentifier.toLowerCase().includes('admin') ? 'admin' : 'user'
        });
        setIsSubmitting(false);
        return;
      } else {
        // If MySQL authentication specifically returned an error (e.g. invalid password or user not found)
        // and we aren't using local-only testing, show the server error message.
        // We'll also fall back to local storage just in case they registered before the backend was active.
      }
    }

    // 3. Fallback: Check registered accounts from dynamic local storage
    if (typeof window !== 'undefined') {
      const storedUsersRaw = window.localStorage.getItem('jedakuliah_registered_users');
      if (storedUsersRaw) {
        try {
          const users = JSON.parse(storedUsersRaw);
          const matchedUser = users.find((u: any) => 
            (u.username.toLowerCase() === loginIdentifier.toLowerCase() || 
             u.gmail.toLowerCase() === loginIdentifier.toLowerCase()) && 
            u.password === loginPassword
          );

          if (matchedUser) {
            onLoginSuccess({
              username: matchedUser.username,
              email: matchedUser.gmail,
              phone: matchedUser.wa,
              role: matchedUser.username.toLowerCase().includes('admin') ? 'admin' : 'user'
            });
            setIsSubmitting(false);
            return;
          }
        } catch (err) {
          console.error('Failed to parse local stored users', err);
        }
      }
    }

    setErrorMessage('Username/Gmail atau Kata Sandi salah. Silakan coba kembali.');
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    const waClean = registerWa.trim();
    const gmailClean = registerGmail.trim().toLowerCase();
    const usernameClean = registerUsername.trim();
    const passwordClean = registerPassword;

    if (!waClean || !gmailClean || !usernameClean || !passwordClean) {
      setErrorMessage('Semua kolom form registrasi wajib diisi!');
      setIsSubmitting(false);
      return;
    }

    // 1. Register to remote PHP database
    if (JedaAPI.isRemoteActive()) {
      const res = await JedaAPI.register({
        username: usernameClean,
        gmail: gmailClean,
        whatsapp: waClean,
        password: passwordClean
      });

      if (!res.success) {
        setErrorMessage(res.message);
        setIsSubmitting(false);
        return;
      }
    }

    // 2. Local fallback registration
    if (typeof window !== 'undefined') {
      const storedUsersRaw = window.localStorage.getItem('jedakuliah_registered_users') || '[]';
      try {
        const users = JSON.parse(storedUsersRaw);

        // Check duplicate local storage only if offline
        if (!JedaAPI.isRemoteActive()) {
          const existUser = users.some((u: any) => 
            u.username.toLowerCase() === usernameClean.toLowerCase() || 
            u.gmail.toLowerCase() === gmailClean
          );

          if (existUser) {
            setErrorMessage('Username atau Gmail tersebut telah terdaftar.');
            setIsSubmitting(false);
            return;
          }
        }

        // Save new credentials
        const newUser = {
          wa: waClean,
          gmail: gmailClean,
          username: usernameClean,
          password: passwordClean
        };

        users.push(newUser);
        window.localStorage.setItem('jedakuliah_registered_users', JSON.stringify(users));

        setSuccessMessage(`Registrasi Sukses! Silakan masuk menggunakan akun "${usernameClean}"`);
        
        // Pre-fill login identifier and auto switch tabs
        setLoginIdentifier(usernameClean);
        setLoginPassword('');
        
        // Reset registration inputs
        setRegisterWa('');
        setRegisterGmail('');
        setRegisterUsername('');
        setRegisterPassword('');
        
        // Small delay before switching back to login to let user read the notice
        setTimeout(() => {
          setActiveTab('login');
        }, 1500);

      } catch (err) {
        setErrorMessage('Terjadi gangguan penyimpanan offline.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8 relative">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-zinc-900 rounded-2xl bg-zinc-950/60 backdrop-blur-xl p-7 md:p-8 shadow-2xl relative"
      >
        {/* Sleek Decorative Detail */}
        <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest font-black">
          <Key className="w-3 h-3" />
          <span>PORTAL AKUN</span>
        </div>

        {/* Title */}
        <div className="text-center space-y-2 mb-6">
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-white italic">
            {activeTab === 'login' ? 'Login / Masuk' : 'Daftar Akun'}
          </h2>
          <p className="font-mono text-[10px] text-zinc-550 font-bold uppercase tracking-widest leading-relaxed">
            {getLoginSubtitle()}
          </p>
        </div>

        {/* TABS SELECTOR (Minimalist UI) */}
        <div className="flex bg-zinc-900/40 p-1 border border-zinc-900 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold'
                : 'text-zinc-500 hover:text-zinc-400 border border-transparent'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold'
                : 'text-zinc-500 hover:text-zinc-400 border border-transparent'
            }`}
          >
            Daftar (Register)
          </button>
        </div>

        {/* Feedbacks */}
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 bg-red-950/20 border border-red-550/25 text-red-400 rounded-xl text-xs font-mono flex items-center gap-2 mb-5"
            >
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 animate-scale-up" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 bg-emerald-950/20 border border-emerald-550/25 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2 mb-5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORM CONTAINER */}
        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
              onSubmit={handleLoginSubmit}
              className="space-y-4"
            >
              {/* Username / Gmail Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-550 font-bold uppercase tracking-wider">
                  Username atau Gmail
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-650" />
                  <input
                    type="text"
                    required
                    placeholder="nama_user / email@gmail.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-900/30 border border-zinc-900 rounded-xl focus:border-orange-500/50 focus:outline-none text-zinc-150 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-550 font-bold uppercase tracking-wider">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-650" />
                  <input
                    type="password"
                    required
                    placeholder="Masukkan sandi..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-900/30 border border-zinc-900 rounded-xl focus:border-orange-500/50 focus:outline-none text-zinc-150 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-900 disabled:text-zinc-600 border border-transparent rounded-xl text-black font-semibold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-lg shadow-orange-500/10"
              >
                <span>{getSubmitButtonText()}</span>
                {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register-form"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              onSubmit={handleRegisterSubmit}
              className="space-y-3.5"
            >
              {/* WhatsApp Number Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-550 font-bold uppercase tracking-wider">
                  Nomor WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-650" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 08123456789"
                    value={registerWa}
                    onChange={(e) => setRegisterWa(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-900/30 border border-zinc-900 rounded-xl focus:border-orange-500/50 focus:outline-none text-zinc-150 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Gmail Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-550 font-bold uppercase tracking-wider">
                  Alamat Gmail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-650" />
                  <input
                    type="email"
                    required
                    placeholder="username@gmail.com"
                    value={registerGmail}
                    onChange={(e) => setRegisterGmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-900/30 border border-zinc-900 rounded-xl focus:border-orange-500/50 focus:outline-none text-zinc-150 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-550 font-bold uppercase tracking-wider">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-650" />
                  <input
                    type="text"
                    required
                    placeholder="Buat username unik..."
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-900/30 border border-zinc-900 rounded-xl focus:border-orange-500/50 focus:outline-none text-zinc-150 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-zinc-550 font-bold uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-650" />
                  <input
                    type="password"
                    required
                    placeholder="Buat kata sandi..."
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-900/30 border border-zinc-900 rounded-xl focus:border-orange-500/50 focus:outline-none text-zinc-150 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-900 disabled:text-zinc-600 border border-transparent rounded-xl text-black font-semibold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-lg shadow-orange-500/10"
              >
                {isSubmitting ? (
                  <span>Mendaftarkan Akun...</span>
                ) : (
                  <>
                    <span>Daftar Akun Baru</span>
                    <UserPlus className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
