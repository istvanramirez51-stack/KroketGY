'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Sparkles, Filter, Check } from 'lucide-react';
import { MenuItem } from '../lib/api';

interface MenuSectionProps {
  items: MenuItem[];
  addToCart: (item: MenuItem) => void;
  cart: { item: MenuItem; quantity: number }[];
  isPhpActive: boolean;
  autoFocusSearch?: boolean;
}

export default function MenuSection({ items, addToCart, cart, isPhpActive, autoFocusSearch }: MenuSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('Semua');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocusSearch && searchInputRef.current) {
      // Small timeout to let any mounting animation complete smoothly
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [autoFocusSearch]);

  // Gather all unique tags from items list for filtering
  const allTags = ['Semua', ...Array.from(new Set(items.flatMap(item => item.tags)))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'Semua' || item.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const getItemQuantity = (itemId: number) => {
    const cartItem = cart.find(i => i.item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="space-y-6">
      
      {/* FILTER & SEARCH SUITE */}
      <div className="border-4 border-black p-5 rounded-2xl bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Bar Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-455" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Cari masakan kantin favorit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-black/60 border-4 border-black focus:border-orange-500 focus:outline-none text-zinc-100 font-sans tracking-wide"
          />
        </div>

        {/* Tag chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0 hidden md:block mr-1" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 text-xs font-display font-black uppercase tracking-wider shrink-0 border-4 border-black transition-all ${
                selectedTag === tag
                  ? 'bg-orange-500 text-black font-extrabold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>

      {/* RENDER GRID */}
      {filteredItems.length === 0 ? (
        <div className="border-4 border-black p-12 text-center rounded-2xl bg-zinc-900/30 backdrop-blur-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-zinc-400 font-mono text-sm max-w-sm mx-auto uppercase font-bold">
            Menu tidak ditemukan. Silakan tambahkan menu baru lewat dashboard administrator atau ubah kata kunci cari.
          </p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ 
                    scale: 1.02, 
                    x: -4, 
                    y: -4, 
                    boxShadow: "14px 14px 0px 0px rgba(0,0,0,1)" 
                  }}
                  className="group relative border-4 border-black rounded-3xl bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col justify-between cursor-pointer"
                >
                  {/* Decorative Glowing Backdrop */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/10 transition-colors" />

                  <div>
                    {/* Header Image Frame */}
                    <div className="relative aspect-[16/10] w-full bg-zinc-950 overflow-hidden border-b-4 border-black">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Price Badge */}
                      <div className="absolute top-3 left-3 bg-black border-4 border-black font-mono text-xs font-black text-white px-2.5 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        Rp {item.price.toLocaleString('id-ID')}
                      </div>

                      {/* Floating Quantity counter */}
                      {qty > 0 && (
                        <div className="absolute top-3 right-3 bg-lime-400 text-black border-4 border-black font-display font-black text-xs px-2 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] uppercase">
                          {qty} Dipesan
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-black/80 border-2 border-black text-zinc-350 font-mono text-[9px] font-black uppercase tracking-wider px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-display font-black text-xl text-zinc-100 uppercase tracking-tight italic group-hover:text-orange-500 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="px-5 pb-5 pt-1">
                    <button
                      onClick={() => addToCart(item)}
                      className={`w-full py-2.5 font-display font-black text-xs uppercase tracking-wider border-4 border-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        qty > 0
                          ? 'bg-orange-500 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-400'
                          : 'bg-zinc-800 hover:bg-white text-zinc-200 hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <Plus className="w-4 h-4 text-current stroke-[3]" />
                      <span>{qty > 0 ? "Tambah Lagi" : "Sikat Menu Ini"}</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

    </div>
  );
}
