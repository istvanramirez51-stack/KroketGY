'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Copy, Check, Gift, Users2, Zap, Coins, MessageSquare, Coffee, Compass } from 'lucide-react';

export interface Voucher {
  id: string;
  code: string;
  discount: number;
  description: string;
}

interface AboutUsVoucherProps {
  vouchers: Voucher[];
  onExplore: () => void;
  showNotification: (msg: string) => void;
}

export default function AboutUsVoucher({ vouchers, onExplore, showNotification }: AboutUsVoucherProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedId(id);
      showNotification(`Sip! Kode voucher "${code}" berhasil disalin.`);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-16 py-8 mt-12 border-t-4 border-black relative z-10">
      
      {/* 2-COLUMN SECTION: ABOUT US & BENEFITS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        
        {/* TENTANG KAMI PANEL */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 border-4 border-black bg-zinc-900/50 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex flex-col justify-between"
        >
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/30 font-mono text-[10px] uppercase tracking-widest rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              <span>SIAPA KAMI?</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-4xl text-zinc-100 uppercase tracking-tight italic">
              KANTIN DIGITAL UTK <br/>
              <span className="text-orange-500">PEJUANG KULIAH.</span>
            </h2>

            <p className="text-zinc-400 text-sm leading-relaxed text-justify sm:text-left">
              <strong>JedaKuliah</strong> didirikan oleh sekelompok mahasiswa tingkat akhir yang bosan mengorbankan waktu istirahat berharga hanya demi mengantre makan siang. Melalui platform kantin terintegrasi, kami mendigitalisasikan jajaran stal kuliner favorit kampus Anda.
            </p>
            
            <p className="text-zinc-400 text-sm leading-relaxed text-justify sm:text-left">
              Sekarang, Anda bisa dengan tenang memesan makanan hangat dari dalam kelas sebelum dosen mengucapkan kalimat penutup, melakukan patungan harga dengan kawan satu kelompok, dan mengambilnya tanpa sikut-sikutan begitu lonceng jeda berdering.
            </p>
          </div>

          <div className="pt-6 border-t-2 border-black/50 mt-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <div className="flex -space-x-2">
                <span className="w-8 h-8 rounded-full border-2 border-black bg-orange-500 font-sans text-[10px] font-black text-black flex items-center justify-center">15</span>
                <span className="w-8 h-8 rounded-full border-2 border-black bg-indigo-500 font-sans text-[10px] font-black text-white flex items-center justify-center">FT</span>
                <span className="w-8 h-8 rounded-full border-2 border-black bg-yellow-500 font-sans text-[10px] font-black text-black flex items-center justify-center">IP</span>
              </div>
              <div className="text-[10px] font-mono font-bold text-zinc-500 self-center">
                Direkomendasikan oleh 1,200+ Mahasiswa
              </div>
            </div>

            <button
              onClick={onExplore}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Mulai Cari Jajanan</span>
            </button>
          </div>
        </motion.div>

        {/* BEDA DIBANDINGKAN DENGAN WEB LAIN */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 flex flex-col gap-5 justify-between"
        >
          <div className="border-4 border-black bg-zinc-900/30 p-5 rounded-2xl">
            <p className="font-mono text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">MENGAPA KITA BEDA</p>
            <h3 className="font-display font-black text-xl uppercase tracking-tighter text-zinc-200 italic">UNGGUL TELAK DI KELASNYA</h3>
          </div>

          <div className="flex-1 grid grid-cols-1 gap-4">
            {/* Keunggulan 1 */}
            <div className="border-4 border-black p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center shrink-0 self-start mt-0.5">
                <Users2 className="w-5 h-5 text-orange-500" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-black text-sm uppercase text-zinc-150">Kalkulator Bagi Tagihan Otomatis</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Beda dengan web kuliner biasa yang merepotkan bendahara kelas. Di JedaKuliah, Anda bisa langsung mengatur patungan biaya/ongkir secara digital sebelum checkout dikirim.
                </p>
              </div>
            </div>

            {/* Keunggulan 2 */}
            <div className="border-4 border-black p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center shrink-0 self-start mt-0.5">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-black text-sm uppercase text-zinc-150">Gateway Langsung ke Chat Dapur</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Tidak ada perantara robot kurir ketiga yang lambat. Pesanan yang terbuat akan terformat rapi dan diledakkan langsung ke WhatsApp pemilik kedai kantin kampus.
                </p>
              </div>
            </div>

            {/* Keunggulan 3 */}
            <div className="border-4 border-black p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center shrink-0 self-start mt-0.5">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-black text-sm uppercase text-zinc-150">Voucher Ongkos Kirim Dinamis</h4>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Daur sirkulasi voucher super hemat khusus pejuang ruko kost. Biaya kirim flat hanya Rp 5.000, serta bisa melesat gratis dengan kode voucher dari portal promo.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* DYNAMIC VOUCHER CODE DISPLAY */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className="border-4 border-black rounded-3xl bg-zinc-900/50 backdrop-blur-md p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-4 border-black">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-mono text-[10px] uppercase tracking-widest rounded-full w-fit">
              <Gift className="w-3.5 h-3.5" />
              <span>PROMO PENGGUNA BARU</span>
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-zinc-100 uppercase tracking-tighter italic">
              KODE VOUCHER UNTUK MAHASISWA
            </h3>
            <p className="text-xs text-zinc-500 font-mono font-bold uppercase tracking-wide">
              Gunakan kode di bawah dan masukkan saat checkout untuk potongan langsung!
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 border-2 border-black rounded-xl text-center self-start md:self-center">
            <Coffee className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="font-mono text-xs text-zinc-400 font-black">Hemat Hingga Rp 5.000</span>
          </div>
        </div>

        {/* Voucher Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className="border-4 border-black bg-zinc-950 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between group shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] transition-all"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-colors" />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] font-black text-orange-400 bg-orange-950/40 border border-orange-900/50 px-2.5 py-1 uppercase rounded-md">
                    Potongan Rp {v.discount.toLocaleString('id-ID')}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 font-black">ACTIVE PROMO</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-display font-black text-lg text-zinc-200 tracking-tight">{v.code}</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed">{v.description}</p>
                </div>
              </div>

              {/* Boxed Neo Brutalist Code Copy trigger */}
              <div className="pt-4 border-t-2 border-zinc-900 flex items-center justify-between mt-4">
                <div className="font-mono text-[11px] text-zinc-550 font-bold">
                  Klik tombol untuk salin
                </div>

                <button
                  onClick={() => handleCopyCode(v.code, v.id)}
                  className={`px-4 py-2 border-2 border-black text-xs font-mono font-black rounded-lg transition-transform focus:scale-95 flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] shrink-0 ${
                    copiedId === v.id
                      ? 'bg-emerald-500 text-black shadow-none translate-x-[2px] translate-y-[2px]'
                      : 'bg-zinc-800 hover:bg-orange-500 text-zinc-200 hover:text-black'
                  }`}
                >
                  {copiedId === v.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}

          {vouchers.length === 0 && (
            <div className="md:col-span-2 border-4 border-dashed border-zinc-800 p-8 rounded-3xl text-center text-zinc-550 font-mono text-xs uppercase font-black">
              Belum ada voucher aktif saat ini. Admin akan merilisnya segera!
            </div>
          )}
        </div>

      </motion.div>

    </div>
  );
}
