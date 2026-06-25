'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  ShoppingBag,
  MapPin, 
  Flame, 
  Truck, 
  Clock, 
  X, 
  Play, 
  ArrowRight,
  Activity,
  Zap
} from 'lucide-react';
import { JedaAPI, Transaction } from '../lib/api';

interface HistorySectionProps {
  transactions: Transaction[];
  onRefresh: () => void;
  isAdmin?: boolean;
  loggedInUser?: { username: string; email?: string; role: 'admin' | 'user'; phone?: string } | null;
  onNavigateToLogin?: () => void;
}

export default function HistorySection({ 
  transactions, 
  onRefresh, 
  isAdmin = false,
  loggedInUser = null,
  onNavigateToLogin
}: HistorySectionProps) {
  const [selectedTrackTx, setSelectedTrackTx] = useState<Transaction | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Helper to progress step by step automatically
  const startSimulation = async (txId: string) => {
    if (isSimulating) return;
    setIsSimulating(true);

    const stages: ('Diproses' | 'dimasak' | 'pengantaran' | 'Sukses')[] = ['Diproses', 'dimasak', 'pengantaran', 'Sukses'];
    
    // Find where the transaction is starting from
    const currentStatus = selectedTrackTx?.status || 'Diproses';
    let startIndex = stages.indexOf(currentStatus as any);
    if (startIndex === -1 || currentStatus === 'Gagal' || currentStatus === 'Sukses') {
      startIndex = 0; // Restart from Diproses
    }

    let currentIndex = startIndex;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      while (currentIndex < stages.length) {
        const nextStatus = stages[currentIndex];
        
        // Update LocalStorage and Remote database
        if (typeof window !== "undefined") {
          await JedaAPI.updateOrderStatus(txId, nextStatus);
        }

        // Update local React select tracker & app index states
        setSelectedTrackTx(prev => prev ? { ...prev, status: nextStatus } : null);
        onRefresh();

        if (currentIndex === stages.length - 1) {
          break; // Simulation completed at Sukses state
        }

        currentIndex++;
        await delay(2000); // 2 second intervals for each tracking transition
      }
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  // Helper to progress to the next step manually (one check step at a time)
  const handleNextStepManual = async (txId: string) => {
    if (isSimulating) return;

    const stages: ('Diproses' | 'dimasak' | 'pengantaran' | 'Sukses')[] = ['Diproses', 'dimasak', 'pengantaran', 'Sukses'];
    const currentStatus = selectedTrackTx?.status || 'Diproses';
    
    let nextIndex = 0;
    if (currentStatus === 'Diproses') nextIndex = 1;
    else if (currentStatus === 'dimasak') nextIndex = 2;
    else if (currentStatus === 'pengantaran') nextIndex = 3;
    else if (currentStatus === 'Sukses' || currentStatus === 'Gagal') nextIndex = 0; // reset loop back

    const targetStatus = stages[nextIndex];

    if (typeof window !== "undefined") {
      await JedaAPI.updateOrderStatus(txId, targetStatus);
    }

    setSelectedTrackTx(prev => prev ? { ...prev, status: targetStatus } : null);
    onRefresh();
  };

  // Helper to retrieve progress bar widths & colors based on active status
  const getStatusProgressInfo = (status: string) => {
    switch (status) {
      case 'Diproses':
        return { percent: '15%', color: 'bg-cyan-500', step: 1 };
      case 'dimasak':
        return { percent: '50%', color: 'bg-yellow-500', step: 2 };
      case 'pengantaran':
        return { percent: '80%', color: 'bg-purple-500', step: 3 };
      case 'Sukses':
        return { percent: '100%', color: 'bg-lime-500', step: 4 };
      default:
        return { percent: '0%', color: 'bg-red-500', step: 0 };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* SECTION PANEL HEADER */}
      <div id="history-panel-header" className="border-4 border-black p-5 rounded-2xl bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-orange-500 font-bold" />
          <div>
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-white italic">
              Riwayat Pembelian & Pelacakan
            </h2>
            <p className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
              Pantau status pesanan makanan di kantin dari NPM anda
            </p>
          </div>
        </div>
        <button
          id="btn-refresh-history"
          onClick={onRefresh}
          className="p-3 border-4 border-black font-mono font-black uppercase tracking-wider text-zinc-300 hover:text-black hover:bg-white bg-zinc-800 transition-all flex items-center gap-1.5 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Perbarui</span>
        </button>
      </div>

      {!loggedInUser ? (
        <div id="login-required-history" className="border-4 border-black p-12 text-center rounded-2xl bg-zinc-900/30 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
          <History className="w-8 h-8 text-zinc-650 mx-auto mb-3" />
          <p className="text-zinc-300 font-mono text-sm max-w-md mx-auto uppercase font-bold leading-relaxed mb-6">
            Anda belum masuk portal. Silakan masuk / daftar akun terlebih dahulu untuk melihat dan melacak pesanan Anda secara real-time.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 font-display font-black text-xs uppercase text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Masuk ke Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div id="empty-history-alert" className="border-4 border-black p-12 text-center rounded-2xl bg-zinc-900/30 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <History className="w-8 h-8 text-zinc-650 mx-auto mb-3" />
          <p className="text-zinc-400 font-mono text-sm max-w-md mx-auto uppercase font-bold leading-relaxed">
            Akun ({loggedInUser.username}) belum memiliki riwayat pembelian. Silakan buat pesanan lezat di katalog kantin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {transactions.map((tx) => (
            <motion.div
              id={`order-card-${tx.id}`}
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-4 border-black rounded-3xl bg-zinc-900/40 backdrop-blur-2xl p-5 hover:bg-zinc-800/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              {/* Left Column: ID, Date, Items summary */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs font-black bg-orange-500 text-black px-2 py-0.5 border-2 border-black">
                    {tx.id}
                  </span>
                  <p className="font-mono text-xs text-zinc-400 font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{tx.date}</span>
                  </p>
                  
                  {/* High contrast status badge mapping with animated, color-coded icons */}
                  <span>
                    {tx.status === 'Sukses' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 shadow-sm" title="Pesanan Sukses Selesai">
                        <CheckCircle2 className="w-3.5 h-3.5 animate-bounce [animation-iteration-count:3] text-emerald-500" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Selesai</span>
                      </span>
                    ) : tx.status === 'dimasak' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-500 shadow-sm animate-pulse" title="Makanan sedang dimasak">
                        <Flame className="w-3.5 h-3.5 text-orange-500 animate-bounce [animation-duration:1.5s]" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Dimasak</span>
                      </span>
                    ) : tx.status === 'pengantaran' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 shadow-sm" title="Pesanan dalam pengantaran">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                        <Truck className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Dikirim</span>
                      </span>
                    ) : tx.status === 'Diproses' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 shadow-sm" title="Pesanan sedang diproses">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </span>
                        <Clock className="w-3.5 h-3.5 animate-spin [animation-duration:6s] text-yellow-500" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Diproses</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-500 shadow-sm" title="Pesanan Gagal/Batal">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Batal</span>
                      </span>
                    )}
                  </span>
                </div>

                {/* Ordered Items summary list */}
                <div className="space-y-1">
                  {tx.items.map((it, index) => (
                    <div key={index} className="font-mono text-xs text-zinc-300 flex items-center justify-between max-w-sm">
                      <span className="font-bold">{it.quantity}x {it.title}</span>
                      <span className="text-zinc-500 font-bold">Rp {(it.price * it.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t-2 border-zinc-900 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs text-zinc-400">
                  <div>
                    <span className="font-mono font-black uppercase tracking-wider text-[10px]">Penerima:</span> <strong className="text-zinc-200">{tx.customerName}</strong>
                  </div>
                  <div className="hidden sm:block text-zinc-800">|</div>
                  <div>
                    <span className="font-mono font-black uppercase tracking-wider text-[10px]">Grup Patungan:</span> <strong className="text-orange-500">{tx.splitCount} Orang</strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing & Link & Live Tracking action */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 border-t-2 border-zinc-900 md:border-t-0 pt-4 md:pt-0 shrink-0 md:text-right min-w-[170px]">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] font-black uppercase text-zinc-550 tracking-wider">Perkiraan Patungan</p>
                  <p className="font-display font-black text-lg text-white italic">
                    Rp {tx.splitResult.toLocaleString('id-ID')} <span className="text-[10px] text-zinc-500 font-mono font-normal">/ Orang</span>
                  </p>
                  <p className="font-mono text-[10px] text-zinc-400 font-bold">
                    Total: Rp {tx.total.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  {/* Track Live order status modal trigger */}
                  <button
                    id={`btn-track-live-${tx.id}`}
                    onClick={() => {
                      // Set active transaction in state
                      setSelectedTrackTx(tx);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono font-black uppercase bg-orange-500 hover:bg-orange-400 text-black border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer transition-all duration-150 w-full"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Lacak Live 📡</span>
                  </button>

                  {tx.whatsappLink && (
                    <a
                      id={`btn-wa-retransmit-${tx.id}`}
                      href={tx.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono font-black uppercase bg-zinc-950 border-4 border-black hover:bg-zinc-800 transition-all text-zinc-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] w-full text-center"
                    >
                      <span>Kirim WA Ulang</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* --- REAL-TIME ORDER TRACKING STATUS MODAL (NEO-BRUTALIST BRAND) --- */}
      {mounted && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedTrackTx && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
              <motion.div
                id="order-tracking-modal"
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="border-[6px] md:border-8 border-black rounded-3xl bg-zinc-950 max-w-lg w-full text-zinc-100 p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(251,146,60,1)] relative"
              >
              {/* Background accent lines */}
              <div className="absolute top-0 left-0 bg-grid-pattern h-full w-full opacity-10 pointer-events-none" />
              
              {/* Top Banner with Close Button */}
              <div className="flex items-center justify-between border-b-4 border-black pb-3 mb-4 relative z-10">
                <div className="flex items-center gap-1.5 text-orange-500 font-display font-black italic uppercase text-sm sm:text-base">
                  <Activity className="w-4 h-4 animate-pulse text-orange-500" />
                  <span>Pelacakan Pesanan Real-Time 📡</span>
                </div>
                <button
                  id="btn-close-tracking"
                  onClick={() => {
                    setSelectedTrackTx(null);
                    setIsSimulating(false);
                  }}
                  className="p-1 border-2 md:border-4 border-black bg-zinc-900 text-zinc-100 hover:bg-red-500 hover:text-black cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5 font-black" />
                </button>
              </div>

              {/* Order Info Panel container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/80 p-3 border-4 border-black rounded-2xl mb-4 font-mono text-[11px] relative z-10">
                <div className="space-y-0.5">
                  <p className="text-zinc-550 font-black uppercase text-[9px]">No. Transaksi</p>
                  <p className="text-sm font-black text-orange-500">{selectedTrackTx.id}</p>
                  <p className="text-zinc-400 text-[10px]">{selectedTrackTx.date}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-zinc-550 font-black uppercase text-[9px]">Nama Penerima</p>
                  <p className="text-zinc-200 font-black text-[13px]">{selectedTrackTx.customerName}</p>
                  <p className="text-zinc-400 truncate text-[10px]">Tujuan: {selectedTrackTx.address}</p>
                </div>
              </div>

              {/* ACTIVE NEO-BRUTALIST TRACKING STATUS BADGE COOPERATION */}
              <div className="mb-5 text-center relative z-10">
                <p className="font-mono text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1.5">Status Saat Ini</p>
                
                <div className="inline-block">
                  {selectedTrackTx.status === 'Sukses' ? (
                    <div className="border-[3px] border-black bg-lime-400 text-black px-4 py-1.5 font-sans font-black uppercase tracking-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-[11px] sm:text-xs md:text-sm animate-bounce">
                      ⚡ SUKSES - ORDER SELESAI ⚡
                    </div>
                  ) : selectedTrackTx.status === 'dimasak' ? (
                    <div className="border-[3px] border-black bg-yellow-400 text-black px-4 py-1.5 font-sans font-black uppercase tracking-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-[11px] sm:text-xs md:text-sm">
                      🔥 SEDANG DIMASAK DI DAPUR 🔥
                    </div>
                  ) : selectedTrackTx.status === 'pengantaran' ? (
                    <div className="border-[3px] border-black bg-purple-400 text-black px-4 py-1.5 font-sans font-black uppercase tracking-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-[11px] sm:text-xs md:text-sm">
                      🛵 DALAM PERJALANAN PENGANTARAN 🛵
                    </div>
                  ) : selectedTrackTx.status === 'Diproses' ? (
                    <div className="border-[3px] border-black bg-cyan-400 text-black px-4 py-1.5 font-sans font-black uppercase tracking-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-[11px] sm:text-xs md:text-sm">
                      ⚙️ PESANAN SEDANG DIPROSES ⚙️
                    </div>
                  ) : (
                    <div className="border-[3px] border-black bg-red-500 text-black px-4 py-1.5 font-sans font-black uppercase tracking-tight shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-[11px] sm:text-xs md:text-sm">
                      🛑 GAGAL - PESANAN DIBATALKAN 🛑
                    </div>
                  )}
                </div>
                
                {/* Dynamic Status Description based on tracking stage */}
                <p className="mt-3 text-[11px] font-mono text-zinc-400 max-w-sm mx-auto leading-relaxed px-2">
                  {selectedTrackTx.status === 'Sukses' && "Cihuy! Santapan penyelamat lapar sudah tiba di tempat tujuan Anda dengan selamat. Selamat bersantap!"}
                  {selectedTrackTx.status === 'dimasak' && "Dapur koki kantin membara! Pesanan Anda saat ini sedang dalam proses pematangan agar renyah, nikmat, dan higienis."}
                  {selectedTrackTx.status === 'pengantaran' && "Kurir paguyuban mahasiswa sedang berpacu melintasi rute gedung-gedung kampus untuk mengantarkan paketan hangat ke tangan Anda."}
                  {selectedTrackTx.status === 'Diproses' && "Pesanan telah kami terima di server JedaKuliah. Antrean sedang diaudit oleh kasir stan makanan terintegrasi."}
                  {selectedTrackTx.status === 'Gagal' && "Maaf, pesanan dihentikan sementara. Silakan berkonsultasi langsung ke bot admin kantin untuk detail problem."}
                </p>
              </div>

              {/* STAGES CHRONOLOGY GRAPHICS */}
              <div className="relative mb-6 px-1 z-10">
                {/* Horizontal Progress bar line */}
                <div className="absolute top-[16px] left-[12%] right-[12%] h-1.5 bg-zinc-850 border border-black z-0 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${getStatusProgressInfo(selectedTrackTx.status).color}`}
                    style={{ width: getStatusProgressInfo(selectedTrackTx.status).percent }}
                  />
                </div>

                {/* Tracking Circle Milestones */}
                <div className="flex justify-between items-start relative z-10 w-full">
                  {/* Step 1: Diproses */}
                  <div className="flex flex-col items-center text-center space-y-1.5 w-[24%]">
                    <div className={`w-8 h-8 border-[3px] border-black rounded-full flex items-center justify-center transition-colors shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                      selectedTrackTx.status === 'Gagal' ? 'bg-zinc-800 text-zinc-500' :
                      ['Diproses', 'dimasak', 'pengantaran', 'Sukses'].includes(selectedTrackTx.status) ? 'bg-cyan-400 text-black' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      <Clock className={`w-3.5 h-3.5 ${selectedTrackTx.status === 'Diproses' ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <span className="block font-sans font-black uppercase text-[7.5px] xs:text-[8.5px] md:text-[9px] leading-tight text-white tracking-widest">DIPROSES</span>
                      <span className="font-mono text-[7px] xs:text-[7.5px] md:text-[8px] text-zinc-550 font-bold block mt-0.5 leading-none">Order Masuk</span>
                    </div>
                  </div>

                  {/* Step 2: Dimasak */}
                  <div className="flex flex-col items-center text-center space-y-1.5 w-[24%]">
                    <div className={`w-8 h-8 border-[3px] border-black rounded-full flex items-center justify-center transition-colors shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                      ['dimasak', 'pengantaran', 'Sukses'].includes(selectedTrackTx.status) ? 'bg-yellow-400 text-black' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      <Flame className={`w-3.5 h-3.5 ${selectedTrackTx.status === 'dimasak' ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <span className="block font-sans font-black uppercase text-[7.5px] xs:text-[8.5px] md:text-[9px] leading-tight text-white tracking-widest">DIMASAK</span>
                      <span className="font-mono text-[7px] xs:text-[7.5px] md:text-[8px] text-zinc-550 font-bold block mt-0.5 leading-none">Dapur Aktif</span>
                    </div>
                  </div>

                  {/* Step 3: Pengantaran */}
                  <div className="flex flex-col items-center text-center space-y-1.5 w-[24%]">
                    <div className={`w-8 h-8 border-[3px] border-black rounded-full flex items-center justify-center transition-colors shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                      ['pengantaran', 'Sukses'].includes(selectedTrackTx.status) ? 'bg-purple-400 text-black' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      <Truck className={`w-3.5 h-3.5 ${selectedTrackTx.status === 'pengantaran' ? 'animate-bounce' : ''}`} />
                    </div>
                    <div>
                      <span className="block font-sans font-black uppercase text-[7.5px] xs:text-[8.5px] md:text-[9px] leading-tight text-white tracking-widest">KURIR</span>
                      <span className="font-mono text-[7px] xs:text-[7.5px] md:text-[8px] text-zinc-550 font-bold block mt-0.5 leading-none">Pengiriman</span>
                    </div>
                  </div>

                  {/* Step 4: Sukses / Selesai */}
                  <div className="flex flex-col items-center text-center space-y-1.5 w-[24%]">
                    <div className={`w-8 h-8 border-[3px] border-black rounded-full flex items-center justify-center transition-colors shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                      selectedTrackTx.status === 'Sukses' ? 'bg-lime-400 text-black animate-pulse' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block font-sans font-black uppercase text-[7.5px] xs:text-[8.5px] md:text-[9px] leading-tight text-white tracking-widest">TIBA</span>
                      <span className="font-mono text-[7px] xs:text-[7.5px] md:text-[8px] text-zinc-550 font-bold block mt-0.5 leading-none">Order Selesai</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items in the Active Tracker Order card summary */}
              <div className="border-4 border-black bg-zinc-900/60 p-3 rounded-2xl relative z-10 mb-4">
                <h4 className="font-sans font-black text-[10px] uppercase text-zinc-500 tracking-wider mb-1.5 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" />
                  <span>Daftar Menu Yang Dipesan</span>
                </h4>
                <div className="space-y-1 divide-y divide-zinc-800">
                  {selectedTrackTx.items.map((it, idx) => (
                    <div key={idx} className="font-mono text-[11px] pt-1 flex items-center justify-between">
                      <span className="text-zinc-250 font-bold">{it.quantity}x {it.title}</span>
                      <span className="text-zinc-400">Rp {(it.price * it.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                  <div className="font-mono text-[11px] pt-1.5 flex items-center justify-between text-orange-400 font-black">
                    <span>Total Tagihan Pesanan:</span>
                    <span>Rp {selectedTrackTx.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
