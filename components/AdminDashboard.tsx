'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Coffee,
  Coins,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  X,
  FileCheck2,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { MenuItem, Transaction } from '../lib/api';
import { Voucher } from '../components/AboutUsVoucher';

interface AdminDashboardProps {
  items: MenuItem[];
  transactions: Transaction[];
  onAddMenu: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  onUpdateMenu: (item: MenuItem) => Promise<void>;
  onDeleteMenu: (id: number) => Promise<void>;
  onUpdateOrderStatus: (txId: string, status: 'Diproses' | 'dimasak' | 'pengantaran' | 'Sukses' | 'Gagal') => void;
  onLogout: () => void;
  isPhpActive: boolean;
  apiUrl: string;
  vouchers: Voucher[];
  onUpdateVouchers: (vouchers: Voucher[]) => void;
  shopLogoUrl: string;
  onUpdateShopLogo: (logoUrl: string) => void;
}

export default function AdminDashboard({
  items,
  transactions,
  onAddMenu,
  onUpdateMenu,
  onDeleteMenu,
  onUpdateOrderStatus,
  onLogout,
  isPhpActive,
  apiUrl,
  vouchers,
  onUpdateVouchers,
  shopLogoUrl,
  onUpdateShopLogo
}: AdminDashboardProps) {
  // Sidebar tab control
  const [adminTab, setAdminTab] = useState<'overview' | 'menu' | 'orders' | 'vouchers'>('overview');

  // Voucher state parameters
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [voucherFormCode, setVoucherFormCode] = useState('');
  const [voucherFormDiscount, setVoucherFormDiscount] = useState(5000);
  const [voucherFormDesc, setVoucherFormDesc] = useState('');

  // Modal Control States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formTags, setFormTags] = useState('');

  // Delete Prompt control
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

  // Success Feedback Toast info
  const [feedbackToast, setFeedbackToast] = useState('');

  // CALCULATE STATS DYNAMICALLY
  const totalRevenue = transactions
    .filter(tx => tx.status === 'Sukses')
    .reduce((acc, curr) => acc + curr.total, 0);

  const totalOrders = transactions.length;

  // Calculate Best Seller
  const itemQuantities: { [key: string]: number } = {};
  transactions.forEach(tx => {
    tx.items.forEach(it => {
      itemQuantities[it.title] = (itemQuantities[it.title] || 0) + it.quantity;
    });
  });

  let bestSellerName = 'Belum Ada';
  let maxQty = 0;
  Object.keys(itemQuantities).forEach(name => {
    if (itemQuantities[name] > maxQty) {
      maxQty = itemQuantities[name];
      bestSellerName = name;
    }
  });

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormPrice(15000);
    setFormDescription('');
    setFormImageUrl('https://picsum.photos/seed/' + Math.floor(Math.random() * 1000) + '/400/300');
    setFormTags('Kantin,Rekomendasi');
    setShowFormModal(true);
  };

  // Open modal for Update
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormPrice(item.price);
    setFormDescription(item.description);
    setFormImageUrl(item.imageUrl);
    setFormTags(item.tags.join(','));
    setShowFormModal(true);
  };

  // Submit creation or update
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedTags = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      title: formTitle,
      price: Number(formPrice),
      description: formDescription,
      imageUrl: formImageUrl || 'https://picsum.photos/seed/food/400/300',
      tags: formattedTags
    };

    try {
      if (editingItem) {
        await onUpdateMenu({
          id: editingItem.id,
          ...payload
        });
        triggerFeedback('Menu berhasil diperbarui');
      } else {
        await onAddMenu(payload);
        triggerFeedback('Menu baru sukses ditambahkan');
      }
      setShowFormModal(false);
    } catch (err) {
      triggerFeedback('Operasi gagal, periksa kelayakan server PHP');
    }
  };

  // Trigger Delete flow
  const handleOpenDelete = (id: number) => {
    setDeletingItemId(id);
    setShowDeletePrompt(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingItemId !== null) {
      try {
        await onDeleteMenu(deletingItemId);
        triggerFeedback('Menu telah dihapus dari database');
        setShowDeletePrompt(false);
        setDeletingItemId(null);
      } catch (e) {
        triggerFeedback('Hapus gagal');
      }
    }
  };

  const triggerFeedback = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  // VOUCHER EVENT HANDLERS
  const handleOpenVoucherCreate = () => {
    setEditingVoucher(null);
    setVoucherFormCode('');
    setVoucherFormDiscount(3000);
    setVoucherFormDesc('');
    setShowVoucherModal(true);
  };

  const handleOpenVoucherEdit = (v: Voucher) => {
    setEditingVoucher(v);
    setVoucherFormCode(v.code);
    setVoucherFormDiscount(v.discount);
    setVoucherFormDesc(v.description);
    setShowVoucherModal(true);
  };

  const handleVoucherFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherFormCode.trim()) return;

    let updatedList: Voucher[] = [];
    const formattedCode = voucherFormCode.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');

    if (editingVoucher) {
      updatedList = vouchers.map((v) =>
        v.id === editingVoucher.id
          ? { ...v, code: formattedCode, discount: Number(voucherFormDiscount), description: voucherFormDesc }
          : v
      );
      triggerFeedback('Voucher berhasil diperbarui');
    } else {
      const newVoucher: Voucher = {
        id: 'v_' + Date.now(),
        code: formattedCode,
        discount: Number(voucherFormDiscount),
        description: voucherFormDesc
      };
      updatedList = [...vouchers, newVoucher];
      triggerFeedback('Voucher baru sukses dirilis');
    }

    onUpdateVouchers(updatedList);
    setShowVoucherModal(false);
  };

  const handleVoucherDelete = (id: string) => {
    const updatedList = vouchers.filter((v) => v.id !== id);
    onUpdateVouchers(updatedList);
    triggerFeedback('Voucher telah dinonaktifkan / dihapus');
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 py-6">
      
      {/* SIDEBAR NAVIGATION GRID */}
      <div className="lg:col-span-3">
        <div className="sticky top-24 border-4 border-black rounded-3xl bg-zinc-900/40 backdrop-blur-2xl p-6 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="pb-4 border-b-4 border-black space-y-1">
            <h3 className="font-display font-black text-lg text-zinc-100 uppercase tracking-tighter italic">KONTROL PORTAL</h3>
            <p className="font-mono text-[9px] font-black uppercase tracking-wider text-zinc-500">Administrator</p>
          </div>

          <nav className="flex flex-col gap-2.5">
            <button
              onClick={() => setAdminTab('overview')}
              className={`w-full px-4 py-3 text-xs font-display font-black uppercase tracking-wider text-left border-4 border-black flex items-center gap-3 transition-colors cursor-pointer ${
                adminTab === 'overview'
                  ? 'bg-orange-500 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-zinc-950/40 text-zinc-300 hover:bg-zinc-850 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 stroke-[3]" />
              <span>Ringkasan Bisnis</span>
            </button>

            <button
              onClick={() => setAdminTab('menu')}
              className={`w-full px-4 py-3 text-xs font-display font-black uppercase tracking-wider text-left border-4 border-black flex items-center gap-3 transition-colors cursor-pointer ${
                adminTab === 'menu'
                  ? 'bg-orange-500 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-zinc-950/40 text-zinc-300 hover:bg-zinc-850 hover:text-white'
              }`}
            >
              <Coffee className="w-4 h-4 shrink-0 stroke-[3]" />
              <span>Kelola Menu CRUD</span>
            </button>

            <button
              onClick={() => setAdminTab('orders')}
              className={`w-full px-4 py-3 text-xs font-display font-black uppercase tracking-wider text-left border-4 border-black flex items-center gap-3 transition-colors cursor-pointer ${
                adminTab === 'orders'
                  ? 'bg-orange-500 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-zinc-950/40 text-zinc-300 hover:bg-zinc-850 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-4 h-4 shrink-0 stroke-[3]" />
              <span>Antrean Pesanan</span>
            </button>

            <button
              onClick={() => setAdminTab('vouchers')}
              className={`w-full px-4 py-3 text-xs font-display font-black uppercase tracking-wider text-left border-4 border-black flex items-center gap-3 transition-colors cursor-pointer ${
                adminTab === 'vouchers'
                  ? 'bg-orange-500 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-zinc-950/40 text-zinc-300 hover:bg-zinc-850 hover:text-white'
              }`}
            >
              <Coins className="w-4 h-4 shrink-0 stroke-[3]" />
              <span>Kelola Voucher</span>
            </button>
          </nav>

          <div className="pt-4 border-t-4 border-black flex flex-col gap-3">
            <div className="p-3.5 bg-black/60 border-2 border-black rounded-xl space-y-1.5 font-mono text-[9px] text-zinc-400 font-bold">
              <p className="uppercase text-orange-500 font-black tracking-widest text-[8px]">Informasi Target Backend:</p>
              <p className="truncate">Host: {isPhpActive ? 'PHP Remote API' : 'Simulator LocalStorage-Engine'}</p>
              {isPhpActive && <p className="truncate text-zinc-500">API: {apiUrl}</p>}
            </div>

            <button
              onClick={onLogout}
              className="w-full py-2.5 border-4 border-black hover:bg-red-500 bg-zinc-800 text-white hover:text-black rounded-lg text-xs font-mono font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <LogOut className="w-4 h-4 text-current stroke-[2.5]" />
              <span>Keluar Sesi Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* CORE DISPLAY WORKSPACE PANELS */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* VIEW 1: OVERVIEW STATISTICS */}
        {adminTab === 'overview' && (
          <div className="space-y-6">
            <div className="border-4 border-black p-5 rounded-2xl bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="font-display font-black text-2xl uppercase text-zinc-100 italic">Ringkasan Dasbor Kantin</h2>
              <p className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Live metrics dari performa transaksi JedaKuliah</p>
            </div>

            {/* BENTO STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card Total Revenue */}
              <div className="border-4 border-black p-6 rounded-2xl bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                <Coins className="w-8 h-8 text-emerald-450 mb-3 stroke-[2.5]" />
                <p className="font-mono text-[10px] text-zinc-500 font-black uppercase">Omzet Berhasil</p>
                <h3 className="font-display font-black text-2xl text-white mt-1">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </h3>
                <span className="inline-block mt-3 text-[10px] font-mono font-black text-emerald-400 bg-emerald-950/40 px-2.5 py-1 border border-emerald-800/40 uppercase">
                  Status Pembayaran Sukses
                </span>
              </div>

              {/* Card Total Orders */}
              <div className="border-4 border-black p-6 rounded-2xl bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-orange-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                <TrendingUp className="w-8 h-8 text-orange-500 mb-3 stroke-[2.5]" />
                <p className="font-mono text-[10px] text-zinc-500 font-black uppercase">Total Pesanan Masuk</p>
                <h3 className="font-display font-black text-2xl text-white mt-1">
                  {totalOrders} Antrean
                </h3>
                <span className="inline-block mt-3 text-[10px] font-mono font-black text-orange-400 bg-orange-950/40 px-2.5 py-1 border border-orange-850/40 uppercase">
                  Sesi Pelanggan Aktif
                </span>
              </div>

              {/* Card Best Seller */}
              <div className="border-4 border-black p-6 rounded-2xl bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                <Coffee className="w-8 h-8 text-cyan-400 mb-3 stroke-[2.5]" />
                <p className="font-mono text-[10px] text-zinc-500 font-black uppercase">Menu Terfavorit</p>
                <h3 className="font-display font-black text-lg text-white mt-1.5 truncate uppercase italic">
                  {bestSellerName}
                </h3>
                <span className="inline-block mt-2 text-[10px] font-mono font-black text-indigo-400 bg-indigo-950/40 px-2.5 py-1 border border-indigo-800/40 uppercase">
                  Berbasis Volume Kuantitas
                </span>
              </div>

            </div>

            {/* Quick Actions & Brand Logo Settings Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick overview list */}
              <div className="border-4 border-black rounded-3xl p-6 bg-zinc-950/60 backdrop-blur-xl space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h4 className="font-display font-black text-sm uppercase text-orange-500 italic">Aksi Cepat Menu</h4>
                <p className="text-xs text-zinc-405 font-medium leading-relaxed">
                  Gunakan menu sebelah kiri untuk melakukan mengedit, membuat menu baru, dan melihat status pemesanan. Semua perubahan di dashboard akan disinkronisasikan ke backend API PHP secara instan.
                </p>
              </div>

              {/* Custom Branding & Logo Section - READ ONLY NOTICE */}
              <div className="border-4 border-black rounded-3xl p-6 bg-zinc-950/60 backdrop-blur-xl space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-500/10 text-orange-500 border border-orange-500/20 w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                      {shopLogoUrl ? (
                        <img src={shopLogoUrl} alt="Logo Jeda" className="w-full h-full object-cover" />
                      ) : (
                        <Coffee className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <h4 className="font-display font-black text-sm uppercase text-orange-500 italic">Logo & Brand JedaKuliah</h4>
                  </div>
                  
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-lg text-[9.5px] font-mono tracking-wide uppercase font-black">
                    <span>🔐 AKSES VIA KODINGAN SAJA</span>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans font-medium mt-2">
                    Sesuai instruksi Anda, kustomisasi logo kantin kini tidak lagi diatur melalui Admin Dashboard. Logo ini dapat diubah secara langsung dengan mengedit konstanta <code className="text-white font-mono bg-zinc-900 px-1 py-0.5 rounded">BRAND_LOGO_URL</code> di dalam file kodingan <code className="text-white font-mono bg-zinc-900 px-1 py-0.5 rounded">/app/page.tsx</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: MANAGE MENU CRUD DATABASE */}
        {adminTab === 'menu' && (
          <div className="space-y-6">
            <div className="border-4 border-black p-5 rounded-2xl bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-black text-2xl uppercase text-zinc-100 italic">Daftar Menu Kantin</h2>
                <p className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Lakukan pembacaan (READ), input (CREATE), pembaruan (UPDATE), dan hapus (DELETE) makanan</p>
              </div>

              {/* ADD BUTTON */}
              <button
                onClick={handleOpenCreate}
                className="px-5 py-3 bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Makanan</span>
              </button>
            </div>

            {/* RESPONSIVE TABLE GLASSBOARD */}
            <div className="border-4 border-black rounded-3xl overflow-hidden bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              
              {/* DESKTOP VIEW COMPACT TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="border-b-4 border-black bg-zinc-950">
                      <th className="p-4 font-mono text-xs font-black uppercase text-zinc-400">Gambar</th>
                      <th className="p-4 font-mono text-xs font-black uppercase text-zinc-400">Nama Makanan</th>
                      <th className="p-4 font-mono text-xs font-black uppercase text-zinc-400">Harga</th>
                      <th className="p-4 font-mono text-xs font-black uppercase text-zinc-400">Deskripsi</th>
                      <th className="p-4 font-mono text-xs font-black uppercase text-zinc-400">Kategori</th>
                      <th className="p-4 font-mono text-xs font-black uppercase text-zinc-400 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-4">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-14 h-11 object-cover rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          />
                        </td>
                        <td className="p-4 font-display font-black text-sm uppercase text-zinc-200">
                          {item.title}
                        </td>
                        <td className="p-4 font-mono text-xs font-black text-orange-500">
                          Rp {item.price.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-xs text-zinc-400 max-w-[200px] truncate">
                          {item.description}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, i) => (
                              <span key={i} className="bg-black/60 text-zinc-400 font-mono text-[9px] px-1.5 py-0.5 border border-black uppercase font-bold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 border-2 border-black text-zinc-400 hover:text-black hover:bg-orange-500 bg-zinc-800 rounded transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                              <Edit2 className="w-3.5 h-3.5 stroke-[2]" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(item.id)}
                              className="p-2 border-2 border-black text-red-400 hover:text-black hover:bg-red-500 bg-zinc-800 rounded transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE TABLE-CONVERTED-TO-CARDS VIEW */}
              <div className="block md:hidden p-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border-4 border-black rounded-3xl p-4 bg-zinc-955/60 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-16 h-14 object-cover rounded border-2 border-black shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-display font-black text-sm uppercase text-zinc-100 truncate">{item.title}</h4>
                        <p className="font-mono text-xs font-black text-orange-500">Rp {item.price.toLocaleString('id-ID')}</p>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-1">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 pb-2 border-b-2 border-black">
                      {item.tags.map((tag, i) => (
                        <span key={i} className="bg-black text-zinc-500 font-mono text-[8px] px-1.5 py-0.5 border border-zinc-800 font-bold uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-zinc-550 font-bold">ID: #{item.id}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 border-2 border-black bg-zinc-805 hover:bg-orange-500 text-xs font-mono font-black tracking-wider text-zinc-300 hover:text-black rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Ubah</span>
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item.id)}
                          className="px-3 py-1.5 border-2 border-black text-red-400 hover:text-black hover:bg-red-500 bg-zinc-800 text-xs font-mono font-black tracking-wider rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* VIEW 3: ACTIVE QUEUED ORDERS */}
        {adminTab === 'orders' && (
          <div className="space-y-6">
            <div className="border-4 border-black p-5 rounded-2xl bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-2xl uppercase text-zinc-100 italic">Antrean Pesanan Masuk</h2>
                <p className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Ubah status pesanan mahasiswa dan koordinasikan dapur</p>
              </div>
            </div>

            <div className="space-y-6">
              {transactions.map((tx) => (
                <div key={tx.id} className="border-4 border-black bg-zinc-900/40 backdrop-blur-2xl rounded-3xl p-5 hover:bg-zinc-800/40 transition-colors space-y-4 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  
                  {/* Queue order meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-orange-500 text-black px-2 py-0.5 border-2 border-black">
                          {tx.id}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-400 font-bold">{tx.date}</span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Penerima: <strong className="text-zinc-200">{tx.customerName}</strong> ({tx.phone})
                      </p>
                    </div>

                    {/* Change Status Control Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-black uppercase text-zinc-500">Ubah Status:</span>
                      <select
                        value={tx.status}
                        onChange={(e) => onUpdateOrderStatus(tx.id, e.target.value as any)}
                        className="bg-black text-[11px] font-mono font-black text-zinc-300 px-2.5 py-1.5 border-4 border-black focus:outline-none focus:border-orange-500 cursor-pointer uppercase"
                      >
                        <option value="Diproses">1. DIPROSES (VALIDASI)</option>
                        <option value="dimasak">2. DIMASAK (DAPUR)</option>
                        <option value="pengantaran">3. PENGANTARAN (KURIR)</option>
                        <option value="Sukses">4. SUKSES (SELESAI)</option>
                        <option value="Gagal">X. GAGAL (BATAL)</option>
                      </select>
                    </div>
                  </div>

                  {/* Render products */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h5 className="font-mono text-[10px] font-black uppercase text-zinc-500 tracking-wider">Santapan:</h5>
                      {tx.items.map((it, idx) => (
                        <p key={idx} className="font-mono text-xs text-zinc-200 font-bold">
                          {it.quantity}x <strong className="text-zinc-100">{it.title}</strong> (Rp {(it.price * it.quantity).toLocaleString('id-ID')})
                        </p>
                      ))}
                    </div>

                    <div className="space-y-1.5 bg-black/60 p-4 rounded-2xl border-2 border-black font-mono text-xs text-zinc-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <p>Total Tagihan: <strong className="text-white">Rp {tx.total.toLocaleString('id-ID')}</strong></p>
                      <p>Patungan {tx.splitCount} Orang: <strong className="text-orange-500">Rp {tx.splitResult.toLocaleString('id-ID')} / orang</strong></p>
                      <p className="truncate">Tujuan: {tx.address}</p>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: VOUCHER CODES SETTINGS */}
        {adminTab === 'vouchers' && (
          <div className="space-y-6">
            <div className="border-4 border-black p-5 rounded-2xl bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-black text-2xl uppercase text-zinc-100 italic">Database Kode Voucher</h2>
                <p className="font-mono text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Sunting dan terbitkan kode promo diskon ongkos kirim secara live</p>
              </div>

              {/* ADD BUTTON */}
              <button
                onClick={handleOpenVoucherCreate}
                className="px-5 py-3 bg-orange-500 hover:bg-orange-400 text-black font-display font-black text-xs uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Rilis Voucher Baru</span>
              </button>
            </div>

            {/* TABULAR VOUCHERS LIST */}
            <div className="border-4 border-black rounded-3xl overflow-hidden bg-zinc-900/40 backdrop-blur-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="border-b-4 border-black bg-zinc-950">
                      <th className="p-4 font-mono text-xs font-black uppercase text-zinc-400">Kode Unik</th>
                      <th className="p-4 font-mono text-xs font-black uppercase text-zinc-400">Nilai Potongan</th>
                      <th className="p-4 font-mono text-xs font-black uppercase text-zinc-400">Keterangan / Deskripsi</th>
                      <th className="p-4 font-mono text-xs font-black uppercase text-zinc-400 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black">
                    {vouchers.map((v) => (
                      <tr key={v.id} className="hover:bg-zinc-800/40 transition-colors bg-zinc-900/20">
                        <td className="p-4 font-mono font-black text-sm text-zinc-200 tracking-wider">
                          <span className="bg-black border border-zinc-800 px-3 py-1 font-bold text-orange-500 rounded">
                            {v.code}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs font-black text-emerald-405">
                          Rp {v.discount.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-xs text-zinc-400 max-w-sm">
                          {v.description}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenVoucherEdit(v)}
                              className="p-2 border-2 border-black text-zinc-405 hover:text-black hover:bg-orange-500 bg-zinc-805 rounded transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                              <Edit2 className="w-3.5 h-3.5 stroke-[2]" />
                            </button>
                            <button
                              onClick={() => handleVoucherDelete(v.id)}
                              className="p-2 border-2 border-black text-red-405 hover:text-black hover:bg-red-500 bg-zinc-805 rounded transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                              <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {vouchers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-zinc-500 font-mono text-xs uppercase font-black">
                          Database voucher kosong. Rilis voucher baru sekarang!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* GLOBAL MODALS IN ACTION */}
      
      {/* 1. CREATE / UPDATE MODAL */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop dark curtain */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormModal(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg border-4 border-black rounded-3xl bg-zinc-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowFormModal(false)}
                className="absolute top-4 right-4 p-2 border-4 border-black bg-zinc-900 transition-colors hover:bg-orange-500 hover:text-black text-zinc-400 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="mb-6 space-y-1">
                <h3 className="font-display font-black text-xl uppercase tracking-tighter text-white italic">
                  {editingItem ? 'Sunting Makanan' : 'Terbitkan Menu Baru'}
                </h3>
                <p className="font-mono text-[9px] font-black uppercase tracking-wider text-zinc-500">
                  Formulir Modifikasi Entitas Database JedaKuliah
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs text-zinc-355">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black uppercase text-zinc-400">Nama Makanan</label>
                  <input
                    type="text"
                    required
                    placeholder="misal. Nasi Goreng Kampus Enak"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border-4 border-black text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-black uppercase text-zinc-400">Harga (Rupiah)</label>
                    <input
                      type="number"
                      required
                      placeholder="Pricing..."
                      value={formPrice}
                      onChange={(e) => setFormPrice(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-black/60 border-4 border-black text-zinc-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* tags */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-black uppercase text-zinc-400">Tag Kategori (koma-pisahkan)</label>
                    <input
                      type="text"
                      placeholder="Mie,Pedas,Enak"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="w-full px-3 py-2 bg-black/60 border-4 border-black text-zinc-100 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black uppercase text-zinc-400">Deskripsi Menu Mahasiswa</label>
                  <textarea
                    rows={3}
                    placeholder="Beri penjelasan yang menggugah keinginan jajan mahasiswa..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border-4 border-black text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                 {/* Image URL & Upload */}
                 <div className="space-y-2">
                   <label className="block text-[10px] font-mono font-black uppercase text-zinc-400">Gambar Ilustrasi Makan</label>
                   
                   {/* File Upload / Drag & Drop Zone */}
                   <div className="border-4 border-dashed border-zinc-800 hover:border-orange-500/70 bg-black/40 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group relative overflow-hidden">
                     {formImageUrl ? (
                       <div className="relative w-full aspect-video bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                         <img 
                           src={formImageUrl} 
                           alt="Pratinjau Makanan" 
                           className="w-full h-full object-cover" 
                         />
                         <button
                           type="button"
                           onClick={(e) => {
                             e.preventDefault();
                             setFormImageUrl('');
                           }}
                           className="absolute top-2 right-2 bg-red-650 hover:bg-red-500 text-white px-2 py-1 rounded-md text-xs font-mono font-bold border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] z-20 cursor-pointer"
                         >
                           Hapus Gambar
                         </button>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center py-2 text-center pointer-events-none">
                         <Upload className="w-8 h-8 text-zinc-500 group-hover:text-orange-500 group-hover:scale-110 transition-all duration-300 mb-2" />
                         <span className="text-xs font-sans font-bold text-zinc-300">Pilih / Seret Gambar Ke Sini (JPG, PNG)</span>
                         <span className="text-[10px] font-mono text-zinc-500 mt-1">Format JPG, JPEG, PNG, WEBP</span>
                       </div>
                     )}
                     <input
                       type="file"
                       accept="image/jpeg,image/jpg,image/png,image/webp"
                       onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           if (!file.type.startsWith('image/')) {
                             alert('Tolong unggah file gambar saja!');
                             return;
                           }
                           const reader = new FileReader();
                           reader.onloadend = () => {
                             if (typeof reader.result === 'string') {
                               setFormImageUrl(reader.result);
                             }
                           };
                           reader.readAsDataURL(file);
                         }
                       }}
                       className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                     />
                   </div>

                   {/* Or input manual URL */}
                   <div className="space-y-1">
                     <span className="block text-[9px] font-sans font-bold text-zinc-500 uppercase">Atau masukkan URL Gambar secara manual:</span>
                     <div className="relative">
                       <ImageIcon className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                       <input
                         type="text"
                         placeholder="https://images.unsplash.com/..."
                         value={formImageUrl}
                         onChange={(e) => setFormImageUrl(e.target.value)}
                         className="w-full pl-9 pr-4 py-2 bg-black/60 border-4 border-black text-zinc-100 focus:outline-none focus:border-orange-500 font-mono text-[10.5px]"
                       />
                     </div>
                   </div>
                 </div>

                {/* ACTION BUTTONS */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2 border-4 border-black bg-zinc-800 text-zinc-300 hover:text-black hover:bg-white font-mono uppercase text-[10px] font-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Batalkan
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-display font-black uppercase text-[10px] tracking-wider border-4 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1.5. CREATE / UPDATE VOUCHER MODAL */}
      <AnimatePresence>
        {showVoucherModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop dark curtain */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVoucherModal(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg border-4 border-black rounded-3xl bg-zinc-950 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowVoucherModal(false)}
                className="absolute top-4 right-4 p-2 border-4 border-black bg-zinc-900 transition-colors hover:bg-orange-500 hover:text-black text-zinc-400 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="mb-6 space-y-1">
                <h3 className="font-display font-black text-xl uppercase tracking-tighter text-white italic">
                  {editingVoucher ? 'Sunting Kode Voucher' : 'Rilis Voucher Baru'}
                </h3>
                <p className="font-mono text-[9px] font-black uppercase tracking-wider text-zinc-500">
                  Formulir Modifikasi Database Voucher JedaKuliah
                </p>
              </div>

              <form onSubmit={handleVoucherFormSubmit} className="space-y-4 font-sans text-xs text-zinc-355">
                
                {/* Code */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black uppercase text-zinc-400">Kode Unik Voucher (Hanya Huruf & Angka)</label>
                  <input
                    type="text"
                    required
                    placeholder="misal. MABAKENYANG"
                    value={voucherFormCode}
                    onChange={(e) => setVoucherFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border-4 border-black text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono tracking-wider uppercase"
                  />
                </div>

                {/* Discount */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black uppercase text-zinc-400">Nilai Potongan (Rupiah)</label>
                  <input
                    type="number"
                    required
                    placeholder="misal. 5000"
                    value={voucherFormDiscount}
                    onChange={(e) => setVoucherFormDiscount(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-black/60 border-4 border-black text-zinc-100 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black uppercase text-zinc-400">Keterangan / Deskripsi Voucher</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Jelaskan detail ketentuan bagi penikmat jajan..."
                    value={voucherFormDesc}
                    onChange={(e) => setVoucherFormDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border-4 border-black text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-black">
                  <button
                    type="button"
                    onClick={() => setShowVoucherModal(false)}
                    className="px-4 py-2 border-4 border-black bg-zinc-800 text-zinc-300 hover:text-black hover:bg-white font-mono uppercase text-[10px] font-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Batalkan
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-display font-black uppercase text-[10px] tracking-wider border-4 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
                  >
                    Simpan Voucher
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. CONFIRM DELETE NEO-BRUTALIST PROMPT */}
      <AnimatePresence>
        {showDeletePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeletePrompt(false)}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md border-4 border-black rounded-3xl bg-zinc-950 p-6 shadow-[8px_8px_0px_0px_rgba(244,63,94,1)] text-center space-y-5"
            >
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
              
              <div className="space-y-1.5">
                <h4 className="font-display font-black text-lg text-white uppercase italic">Konfirmasi Hapus Menu</h4>
                <p className="text-zinc-400 text-xs font-mono font-bold leading-relaxed">
                  Tindakan ini permanen. Menu pilihan akan terhapus dari log database dan diputus dari PHP backend API. Apakah anda 100% yakin?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeletePrompt(false)}
                  className="py-2.5 border-4 border-black bg-zinc-800 text-zinc-300 hover:bg-white hover:text-black font-mono font-black uppercase text-[10px] rounded cursor-pointer"
                >
                  Urungkan
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="py-2.5 bg-red-500 hover:bg-red-400 border-4 border-black text-black font-display font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded cursor-pointer"
                >
                  Ya, Hapus Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. FLOATING FEEDBACK TOAST ALERT */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 right-6 z-50 bg-emerald-500 border-4 border-black text-black px-4 py-3 font-display font-black uppercase text-xs flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
