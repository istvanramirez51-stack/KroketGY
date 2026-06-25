'use client';

import { motion } from 'motion/react';
import { Coffee, ArrowRight, Flame, Search, ChevronRight } from 'lucide-react';
import { MenuItem } from '../lib/api';

interface HeroSectionProps {
  onExplore: () => void;
  featuredItems: MenuItem[];
  addToCart: (item: MenuItem) => void;
}

export default function HeroSection({ onExplore, featuredItems, addToCart }: HeroSectionProps) {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-left py-12 px-4 overflow-hidden bg-transparent">
      {/* Background Neon light elements */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-orange-500/10 blur-[130px] pointer-events-none animate-pulseGlow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none animate-pulseGlow" style={{ animationDelay: '3s' }} />

      <div className="relative w-full max-w-7xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN: HERO INFORMATION */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/30 font-mono text-xs uppercase tracking-widest rounded-full w-fit"
          >
            <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
            <span>Kantin Kampus Terintegrasi</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-[1.05] text-zinc-100 uppercase tracking-tighter italic">
              Promo Akhir Bulan,<br/>
              <span className="text-orange-500">Penyelamat Urusan Perut.</span>
            </h1>
            <p className="max-w-xl text-zinc-400 text-sm sm:text-base leading-relaxed">
              Kroket Grapes-Yakult mengintegrasikan kantin kampus dengan platform checkout instan. Nikmati aneka santapan penyelamat lapar mahasiswa sekaligus hitung patungan grup order dalam sekali klik.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <button
              onClick={onExplore}
              className="px-8 py-4 bg-orange-500 text-black font-display font-black text-base uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <span>Urus Perut Sekarang</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              onClick={onExplore}
              className="px-6 py-4 bg-zinc-900/40 text-zinc-100 font-display font-bold text-base uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] backdrop-blur-2xl hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>Lihat Selengkapnya</span>
            </button>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t-4 border-black max-w-lg">
            <div>
              <p className="font-mono text-[10px] text-zinc-500 font-black uppercase tracking-wider">Estimasi Masak</p>
              <h4 className="font-display font-black text-lg text-zinc-100 italic">10-15 Menit</h4>
            </div>
            <div>
              <p className="font-mono text-[10px] text-zinc-500 font-black uppercase tracking-wider">Rekomendasi Menu</p>
              <h4 className="font-display font-black text-lg text-orange-500 italic">Kroket</h4>
            </div>
            <div>
              <p className="font-mono text-[10px] text-zinc-500 font-black uppercase tracking-wider">Tarif Ongkir Flat</p>
              <h4 className="font-display font-black text-lg text-zinc-100 italic">Rp 5.000</h4>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: NETFLIX-STYLE HERO CARDS */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-orange-500/5 rounded-3xl filter blur-3xl pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative border-4 border-black p-6 rounded-3xl bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping" />
                <p className="font-mono text-[11px] uppercase tracking-wider text-orange-500 font-black">🔥 Sedang Hangat Diproduksi</p>
              </div>
              <span className="font-mono text-xs text-zinc-500">Laris Hari Ini</span>
            </div>

            {/* Featured Item Preview */}
            {featuredItems.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-zinc-950">
                  <img
                    src={featuredItems[0].imageUrl}
                    alt={featuredItems[0].title}
                    className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-black border-2 border-black text-white font-mono text-[10px] tracking-widest font-black uppercase px-2 py-1">
                    RP {featuredItems[0].price.toLocaleString('id-ID')}
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-black text-xl text-zinc-150 uppercase tracking-tight italic">
                    {featuredItems[0].title}
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1.5 line-clamp-2">
                    {featuredItems[0].description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {featuredItems[0].tags.map((t, idx) => (
                      <span key={idx} className="bg-zinc-800/80 border-2 border-black font-mono text-[9px] font-black uppercase text-zinc-300 px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => addToCart(featuredItems[0])}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    <Coffee className="w-4 h-4 text-black" />
                    <span>Tambahkan ke Keranjang Mahasiswa</span>
                  </button>
                </div>
              </div>
            )}

            {/* Extra mini carousel item */}
            {featuredItems.length > 1 && (
              <div className="border-t-4 border-black pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredItems[1].imageUrl}
                    alt={featuredItems[1].title}
                    className="w-12 h-12 border-2 border-black object-cover"
                  />
                  <div>
                    <h5 className="font-display font-black text-xs uppercase text-zinc-300 italic">{featuredItems[1].title}</h5>
                    <p className="font-mono text-[10px] text-orange-500 font-bold">Rp {featuredItems[1].price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <button
                  onClick={() => addToCart(featuredItems[1])}
                  className="p-2 border-4 border-black bg-zinc-800/50 hover:bg-orange-500 text-zinc-300 hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </motion.div>
        </div>

      </div>
    </div>
  );
}
