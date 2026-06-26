'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Smartphone, Users, MapPin, Calculator, Send, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { MenuItem, Transaction } from '../lib/api';

import { Voucher } from '../components/AboutUsVoucher';

/* Props specifying Cart actions and logging */
interface CartSectionProps {
  cart: { item: MenuItem; quantity: number }[];
  updateQuantity: (itemId: number, change: number) => void;
  clearCart: () => void;
  onCheckoutSuccess: (tx: Transaction) => void;
  vouchers?: Voucher[];
  loggedInUser?: { username: string; email?: string; role: 'admin' | 'user'; phone?: string } | null;
}

export default function CartSection({
  cart = [],
  updateQuantity,
  clearCart,
  onCheckoutSuccess,
  vouchers,
  loggedInUser
}: CartSectionProps) {
  // Customer details state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Automatically pre-fill fields when loggedInUser changes
  useEffect(() => {
    if (loggedInUser) {
      setCustomerName(loggedInUser.username || '');
      setCustomerPhone(loggedInUser.phone || '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
    }
  }, [loggedInUser]);

  // Group split bill state
  const [splitCount, setSplitCount] = useState(1);
  const [errorFeedback, setErrorFeedback] = useState('');

  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');

  // Subtotal calculations
  const subtotal = (cart || []).reduce((acc, curr) => acc + (curr?.item?.price || 0) * (curr?.quantity || 0), 0);
  const deliveryFee = subtotal > 0 ? 5000 : 0;
  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Split calculations
  const splitResult = splitCount > 0 ? Math.ceil(total / splitCount) : total;

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError('');
    setVoucherSuccess('');
    
    if (!voucherCode.trim()) {
      setAppliedVoucher(null);
      return;
    }

    const matched = vouchers?.find(
      (v) => v.code.toUpperCase().trim() === voucherCode.toUpperCase().trim()
    );

    if (matched) {
      setAppliedVoucher(matched);
      setVoucherSuccess(`Sip! Voucher ${matched.code} berhasil dipasang (Potongan Rp ${matched.discount.toLocaleString('id-ID')})`);
    } else {
      setAppliedVoucher(null);
      setVoucherError('Kode voucher tidak terdaftar.');
    }
  };

  // Construct text summary exactly as specified
  const generatePlaintextSummary = () => {
    const rincianMenu = cart.map(c => 
      `${c.quantity} x ${c.item.title} (Rp ${c.item.price.toLocaleString('id-ID')})`
    ).join('\n');

    return `[PESANAN BARU - JEDAKULIAH]
----------------------------------------
[DETAIL PELANGGAN]
* Nama: ${customerName || '-'}
* No. HP: ${customerPhone || '-'}
* Alamat: ${customerAddress || '-'}

[RINCIAN MENU]
${rincianMenu}

[PEMBAYARAN]
* Subtotal: Rp ${subtotal.toLocaleString('id-ID')}
* Ongkir: Rp 5.000${appliedVoucher ? `\n* Voucher (${appliedVoucher.code}): -Rp ${appliedVoucher.discount.toLocaleString('id-ID')}` : ''}
* Total: Rp ${total.toLocaleString('id-ID')}

[GROUP ORDER]
* Dibagi: ${splitCount} Orang
* Per Orang: Rp ${splitResult.toLocaleString('id-ID')}
----------------------------------------
Mohon segera diproses. Terima kasih.`;
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      setErrorFeedback('Keranjang masih kosong, silakan pilih menu terlebih dahulu.');
      return;
    }

    if (!customerName || !customerPhone || !customerAddress) {
      setErrorFeedback('Mohon lengkapi Detail Pelanggan (Nama, No. HP, & Alamat) untuk memesan.');
      return;
    }

    // Capture the generated message block
    const rawText = generatePlaintextSummary();
    const encodedText = encodeURIComponent(rawText);
    
    // Construct real WhatsApp link. Use general wa.me send protocol.
    const whatsappLink = `https://wa.me/${customerPhone.replace(/[^0-9]/g, '') || '+6283114198515'}?text=${encodedText}`;

    // Structure Transaction log
    const itemsLog = cart.map(c => ({
      id: c.item.id,
      title: c.item.title,
      price: c.item.price,
      quantity: c.quantity
    }));

    // Record through checkouts list
    onCheckoutSuccess({
      id: '', // Generated on server/helper
      date: '', // Generated on server/helper
      items: itemsLog,
      subtotal,
      deliveryFee,
      total,
      splitCount,
      splitResult,
      customerName,
      phone: customerPhone,
      address: customerAddress,
      status: 'Diproses',
      whatsappLink
    });

    // Reset customer values optional
    // setCustomerName('');
    // setCustomerPhone('');
    // setCustomerAddress('');
  };

  return (
    <div className="border-4 border-black rounded-3xl bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      
      {/* Drawer Title Header */}
      <div className="p-5 border-b-4 border-black bg-zinc-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-orange-500" />
          <h2 className="font-display font-black text-lg uppercase tracking-tight text-white italic">
            Pemesanan & Patungan
          </h2>
        </div>
        <button
          onClick={clearCart}
          disabled={cart.length === 0}
          className="text-[10px] font-mono font-black tracking-widest uppercase px-3 py-1.5 border-4 border-black bg-zinc-800 text-white hover:bg-red-500 hover:text-black disabled:opacity-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          Kosongkan
        </button>
      </div>

      <div className="p-5 space-y-6">
        
        {/* RENDER CART ITEMS */}
        <div className="space-y-3">
          <h4 className="font-mono text-xs text-zinc-500 font-extrabold uppercase tracking-widest">📋 Daftar Makanan</h4>
          {cart.length === 0 ? (
            <div className="border-4 border-dashed border-zinc-800 p-6 text-center rounded-xl text-zinc-500 font-mono text-xs">
              Mulai pesan dengan memencet tombol tambah di katalog menu.
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {cart.map((c) => (
                  <motion.div
                    key={c.item.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      layout: { type: 'spring', stiffness: 450, damping: 35 }
                    }}
                    className="p-3 bg-zinc-950/60 border-2 border-black rounded flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-black text-xs uppercase text-zinc-200 truncate">
                        {c.item.title}
                      </p>
                      <p className="font-mono text-[10px] text-zinc-500 font-bold">
                        Rp {c.item.price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    {/* Stepper counter widget */}
                    <div className="flex items-center gap-1 bg-black/60 border-2 border-black p-1">
                      <button
                        onClick={() => updateQuantity(c.item.id, -1)}
                        className="p-1 hover:text-white hover:bg-zinc-800 rounded text-zinc-400 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs font-black text-center w-5 text-orange-500">
                        {c.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(c.item.id, 1)}
                        className="p-1 hover:text-white hover:bg-zinc-800 rounded text-zinc-400 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => updateQuantity(c.item.id, -c.quantity)}
                      className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-zinc-900 transition-colors rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* VOUCHER INPUT BOX */}
        {cart.length > 0 && (
          <div className="space-y-2 p-3.5 bg-black/45 border-4 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <label className="block text-[10px] font-mono text-zinc-400 font-extrabold uppercase tracking-wide">🎫 Kode Voucher Diskon</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="PROMO..."
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-black/60 border-2 border-black focus:border-orange-500 focus:outline-none text-zinc-150 font-mono tracking-wider uppercase rounded"
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                className="px-4 py-1.5 border-2 border-black bg-zinc-800 hover:bg-orange-500 text-xs font-mono font-black uppercase text-zinc-300 hover:text-black cursor-pointer transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded"
              >
                Pakai
              </button>
            </div>
            {voucherError && <p className="text-[10px] font-mono text-red-400 font-bold">{voucherError}</p>}
            {voucherSuccess && <p className="text-[10px] font-mono text-emerald-400 font-bold">{voucherSuccess}</p>}
          </div>
        )}

        {/* METRICS BILL BREAKDOWN */}
        {cart.length > 0 && (
          <div className="p-4 bg-zinc-950/60 border-4 border-black rounded-2xl space-y-2 font-mono text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Subtotal Canteen</span>
              <span className="font-bold">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Ongkos Kirim Kampus</span>
              <span className="font-bold">Rp 5.000</span>
            </div>
            {appliedVoucher && (
              <div className="flex items-center justify-between text-emerald-400">
                <span>Voucher ({appliedVoucher.code})</span>
                <span className="font-bold">-Rp {appliedVoucher.discount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="h-[2px] bg-black my-1" />
            <div className="flex items-center justify-between font-display text-sm font-black text-white">
              <span>TOTAL</span>
              <span className="text-orange-500">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}

        {/* GROUP SLIT CALCULATOR FIELD */}
        <div className="space-y-3 pt-2 border-t-4 border-black">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-455" />
            <h4 className="font-mono text-xs text-zinc-300 font-extrabold uppercase tracking-widest">
              Kalkulator Bagi Tagihan (Patungan)
            </h4>
          </div>

          <div className="p-4 bg-zinc-950/40 border-4 border-black rounded-2xl space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-zinc-450 uppercase font-black tracking-wider text-[10px]">Jumlah Mahasiswa</span>
                <span className="text-orange-500 font-black">{splitCount} Anggota</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={splitCount}
                onChange={(e) => setSplitCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-2 bg-black border border-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between font-mono text-[9px] text-zinc-500 font-bold">
                <span>1 (Sendiri)</span>
                <span>6 Orang</span>
                <span>12 Orang</span>
              </div>
            </div>

            {subtotal > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-500 border-4 border-black text-black font-display font-black text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="uppercase tracking-wider">Tanggung Jawab Per Orang</span>
                <span className="font-mono text-sm">Rp {splitResult.toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>
        </div>

        {/* CUSTOMER METADATA INPUT FORM */}
        <form onSubmit={handleCheckout} className="space-y-3 pt-2 border-t-4 border-black">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-zinc-455" />
            <h4 className="font-mono text-xs text-zinc-300 font-extrabold uppercase tracking-widest">
              Detail Alamat & Penerima
            </h4>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 font-black uppercase mb-1">Nama Mahasiswa</label>
              <input
                type="text"
                placeholder="misal. Raja Sitorus"
                value={customerName}
                onChange={(e) => { setCustomerName(e.target.value); setErrorFeedback(''); }}
                className="w-full px-3 py-2 text-xs bg-black/60 border-4 border-black focus:border-orange-500 focus:outline-none text-zinc-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 font-black uppercase mb-1">Nomor Whatsapp</label>
                <input
                  type="tel"
                  placeholder="misal. 081234567890"
                  value={customerPhone}
                  onChange={(e) => { setCustomerPhone(e.target.value); setErrorFeedback(''); }}
                  className="w-full px-3 py-2 text-xs bg-black/60 border-4 border-black focus:border-orange-500 focus:outline-none text-zinc-200"
                />
              </div>
              <div className="flex items-end text-[10px] font-mono text-zinc-600 pb-2.5 pl-1 font-bold">
                Gunakan format no. HP aktif
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 font-black uppercase mb-1">Alamat Gedung / Kost</label>
              <textarea
                rows={2}
                placeholder="Kost Pondok Hijau, Gang Dahlia RT 02 RW 05 Kamar B7"
                value={customerAddress}
                onChange={(e) => { setCustomerAddress(e.target.value); setErrorFeedback(''); }}
                className="w-full px-3 py-2 text-xs bg-black/60 border-4 border-black focus:border-orange-500 focus:outline-none text-zinc-200 resize-none"
              />
            </div>
          </div>

          {/* ERROR DISPLAY */}
          {errorFeedback && (
            <div className="p-3 bg-red-950/40 border-4 border-black text-red-400 text-xs font-mono font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {errorFeedback}
            </div>
          )}

          {/* MAIN CHECKOUT TRIGGER BUTTON */}
          <button
            type="submit"
            className="w-full py-4 mt-2 bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-sm uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 text-black stroke-[3]" />
            <span>Kirim Pesanan ke Whatsapp</span>
          </button>
        </form>

      </div>
    </div>
  );
}
