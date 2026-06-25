// JedaKuliah Core API and State Types

export interface MenuItem {
  id: number;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  tags: string[];
}

export interface Transaction {
  id: string;
  date: string;
  items: {
    id: number;
    title: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  splitCount: number;
  splitResult: number;
  customerName: string;
  phone: string;
  address: string;
  status: 'Diproses' | 'dimasak' | 'pengantaran' | 'Sukses' | 'Gagal';
  whatsappLink?: string;
}

// Initial Indonesian Indonesian Campus food stall menu preset
const INITIAL_MENU_PRESET: MenuItem[] = [
  {
    id: 1,
    title: 'Kroket',
    price: 5000,
    description: 'Kroket kentang premium dengan isian wortel, ayam cincang gurih, dan bumbu rempah warisan keluarga.',
    imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=400',
    tags: ['Terlaris', 'Jajanan', 'Kenyang']
  },
  {
    id: 2,
    title: 'Risoles Ragout Ayam',
    price: 5000,
    description: 'Risoles renyah isi sayur ragout krim ayam manis-gurih yang lumer di mulut.',
    imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=400',
    tags: ['Jajanan']
  },
  {
    id: 3,
    title: 'Nasi Ayam Geprek Jeda',
    price: 15000,
    description: 'Nasi hangat dengan ayam goreng krispi yang digeprek sambal korek pedas mantap tingkat dewa.',
    imageUrl: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=400',
    tags: ['Makanan Utama', 'Pedas']
  },
];

// Initial mock transaction list for historical record demonstration
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-5832',
    date: '24 Jun 2026, 12:45',
    items: [
      { id: 1, title: 'Kroket Kentang Spesial', price: 5000, quantity: 2 },
      { id: 5, title: 'Es Teh Manis Jumbo', price: 3000, quantity: 2 }
    ],
    subtotal: 16000,
    deliveryFee: 2000,
    total: 18000,
    splitCount: 2,
    splitResult: 9000,
    customerName: 'William Graham bel',
    phone: '081234567890',
    address: 'Jl. Merdeka No. 12',
    status: 'Sukses'
  },
  {
    id: 'TRX-9421',
    date: '25 Jun 2026, 10:15',
    items: [
      { id: 3, title: 'Nasi Ayam Geprek Jeda', price: 15000, quantity: 1 },
      { id: 5, title: 'Es Teh Manis Jumbo', price: 3000, quantity: 1 }
    ],
    subtotal: 18000,
    deliveryFee: 2000,
    total: 20000,
    splitCount: 1,
    splitResult: 20000,
    customerName: 'Nesa',
    phone: '089876543210',
    address: 'Hotel siapadia Lantai 3',
    status: 'Sukses'
  }
];

// Determine the API base endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://jedakuliah.freehosting.dev";

// Safely parse JSON or fallback
function safeParseJSON(text: string, fallback: any) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
}

// Low-power cache of current memory lists
function getLocalMenu(): MenuItem[] {
  if (typeof window === "undefined") return INITIAL_MENU_PRESET;
  const stored = window.localStorage.getItem("jedakuliah_items_prod");
  if (!stored) {
    window.localStorage.setItem("jedakuliah_items_prod", JSON.stringify(INITIAL_MENU_PRESET));
    return INITIAL_MENU_PRESET;
  }
  const parsed = safeParseJSON(stored, INITIAL_MENU_PRESET);
  if (Array.isArray(parsed) && parsed.length === 0) {
    window.localStorage.setItem("jedakuliah_items_prod", JSON.stringify(INITIAL_MENU_PRESET));
    return INITIAL_MENU_PRESET;
  }
  return parsed;
}

function saveLocalMenu(items: MenuItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("jedakuliah_items_prod", JSON.stringify(items));
}

function getLocalTransactions(): Transaction[] {
  if (typeof window === "undefined") return INITIAL_TRANSACTIONS;
  const stored = window.localStorage.getItem("jedakuliah_transactions_prod");
  if (!stored) {
    window.localStorage.setItem("jedakuliah_transactions_prod", JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }
  const parsed = safeParseJSON(stored, INITIAL_TRANSACTIONS);
  if (Array.isArray(parsed) && parsed.length === 0) {
    window.localStorage.setItem("jedakuliah_transactions_prod", JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }
  return parsed;
}

function saveLocalTransactions(txs: Transaction[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("jedakuliah_transactions_prod", JSON.stringify(txs));
}

// CORE EXPORTED API UTILITY
export const JedaAPI = {
  // Check if real PHP backend is active
  isRemoteActive(): boolean {
    return false;
  },

  getApiBaseUrl(): string {
    return API_URL;
  },

  // READ MENU
  async getMenu(): Promise<MenuItem[]> {
    if (this.isRemoteActive()) {
      try {
        const response = await fetch(`${API_URL}/get_menu.php`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        // Return structured menu items format. 
        // If PHP returns tags as string comma-joined, convert to array
        return data.map((item: any) => ({
          id: Number(item.id),
          title: item.title || item.nama_menu || "",
          price: Number(item.price || item.harga || 0),
          description: item.description || item.deskripsi || "",
          imageUrl: item.imageUrl || item.image || item.gambar || "https://picsum.photos/seed/food/400/300",
          tags: Array.isArray(item.tags) 
            ? item.tags 
            : (item.tags ? item.tags.split(',') : [])
        }));
      } catch (err) {
        console.warn("Koneksi remote PHP API gagal, menggunakan salinan lada lokal. Error:", err);
        return getLocalMenu();
      }
    } else {
      return getLocalMenu();
    }
  },

  // ADD MENU ITEM (CREATE)
  async addMenu(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    if (this.isRemoteActive()) {
      try {
        const bodyData = {
          title: item.title,
          price: item.price,
          description: item.description,
          imageUrl: item.imageUrl,
          tags: item.tags.join(',')
        };
        const response = await fetch(`${API_URL}/add_menu.php`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(bodyData)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return {
          id: Number(data.id || Math.floor(Math.random() * 100000)),
          title: data.title || item.title,
          price: Number(data.price || item.price),
          description: data.description || item.description,
          imageUrl: data.imageUrl || item.imageUrl,
          tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',') : item.tags)
        };
      } catch (err) {
        console.warn("Koneksi POST add_menu.php gagal, menyimpan ke lokal storage.", err);
        const localItems = getLocalMenu();
        const newItem: MenuItem = {
          id: localItems.length > 0 ? Math.max(...localItems.map(i => i.id)) + 1 : 1,
          ...item
        };
        localItems.push(newItem);
        saveLocalMenu(localItems);
        return newItem;
      }
    } else {
      const localItems = getLocalMenu();
      const newItem: MenuItem = {
        id: localItems.length > 0 ? Math.max(...localItems.map(i => i.id)) + 1 : 1,
        ...item
      };
      localItems.push(newItem);
      saveLocalMenu(localItems);
      return newItem;
    }
  },

  // UPDATE MENU ITEM
  async updateMenu(item: MenuItem): Promise<MenuItem> {
    if (this.isRemoteActive()) {
      try {
        const bodyData = {
          id: item.id,
          title: item.title,
          price: item.price,
          description: item.description,
          imageUrl: item.imageUrl,
          tags: item.tags.join(',')
        };
        const response = await fetch(`${API_URL}/update_menu.php`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(bodyData)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        // Return updated object
        return item;
      } catch (err) {
        console.warn("Koneksi POST update_menu.php gagal, memperbarui lokal storage.", err);
        const localItems = getLocalMenu();
        const index = localItems.findIndex(i => i.id === item.id);
        if (index !== -1) {
          localItems[index] = item;
          saveLocalMenu(localItems);
        }
        return item;
      }
    } else {
      const localItems = getLocalMenu();
      const index = localItems.findIndex(i => i.id === item.id);
      if (index !== -1) {
        localItems[index] = item;
        saveLocalMenu(localItems);
      }
      return item;
    }
  },

  // DELETE MENU ITEM
  async deleteMenu(id: number): Promise<boolean> {
    if (this.isRemoteActive()) {
      try {
        const response = await fetch(`${API_URL}/delete_menu.php`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ id: id })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return true;
      } catch (err) {
        console.warn("Koneksi delete_menu.php gagal, menghapus dari lokal storage.", err);
        const localItems = getLocalMenu();
        const filtered = localItems.filter(i => i.id !== id);
        saveLocalMenu(filtered);
        return true;
      }
    } else {
      const localItems = getLocalMenu();
      const filtered = localItems.filter(i => i.id !== id);
      saveLocalMenu(filtered);
      return true;
    }
  },

  // READ TRANSACTIONS
  async getTransactions(): Promise<Transaction[]> {
    if (this.isRemoteActive()) {
      try {
        const response = await fetch(`${API_URL}/get_transactions.php`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data;
      } catch (err) {
        console.warn("Koneksi remote PHP API get_transactions gagal, menggunakan lokal storage. Error:", err);
        return getLocalTransactions();
      }
    } else {
      return getLocalTransactions();
    }
  },

  // CREATE TRANSACTION
  async addTransaction(tx: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
    const generatedId = `TRX-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedDate = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newTx: Transaction = {
      ...tx,
      id: generatedId,
      date: generatedDate
    };

    if (this.isRemoteActive()) {
      try {
        const response = await fetch(`${API_URL}/add_transaction.php`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(newTx)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        // Also update local cache for smooth offline fallback
        const list = getLocalTransactions();
        list.unshift(newTx);
        saveLocalTransactions(list);
        return newTx;
      } catch (err) {
        console.warn("Koneksi add_transaction.php gagal, menyimpan ke lokal storage.", err);
        const list = getLocalTransactions();
        list.unshift(newTx);
        saveLocalTransactions(list);
        return newTx;
      }
    } else {
      const list = getLocalTransactions();
      list.unshift(newTx);
      saveLocalTransactions(list);
      return newTx;
    }
  },

  // UPDATE ORDER STATUS
  async updateOrderStatus(txId: string, status: 'Diproses' | 'dimasak' | 'pengantaran' | 'Sukses' | 'Gagal'): Promise<boolean> {
    if (this.isRemoteActive()) {
      try {
        const response = await fetch(`${API_URL}/update_transaction_status.php`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ id: txId, status: status })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        // Update local cache
        const list = getLocalTransactions();
        const index = list.findIndex((t) => t.id === txId);
        if (index !== -1) {
          list[index].status = status;
          saveLocalTransactions(list);
        }
        return true;
      } catch (err) {
        console.warn("Koneksi update_transaction_status.php gagal, memperbarui lokal storage.", err);
        const list = getLocalTransactions();
        const index = list.findIndex((t) => t.id === txId);
        if (index !== -1) {
          list[index].status = status;
          saveLocalTransactions(list);
        }
        return true;
      }
    } else {
      const list = getLocalTransactions();
      const index = list.findIndex((t) => t.id === txId);
      if (index !== -1) {
        list[index].status = status;
        saveLocalTransactions(list);
      }
      return true;
    }
  },

  // USER LOGIN
  async login(identifier: string, password: string): Promise<{ success: boolean; message: string; user?: any }> {
    if (this.isRemoteActive()) {
      try {
        const response = await fetch(`${API_URL}/login.php`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ identifier, password })
        });
        
        const data = await response.json();
        if (response.ok && data.status === 'success') {
          return { success: true, message: data.message, user: data.user };
        } else {
          return { success: false, message: data.message || "Gagal masuk. Silakan cek kredensial Anda." };
        }
      } catch (err) {
        console.warn("Koneksi login.php gagal, mencoba pencarian lokal offline.", err);
        return { success: false, message: "Koneksi ke database hosting gagal saat login." };
      }
    }
    return { success: false, message: "Mode Offline Aktif." };
  },

  // USER REGISTER
  async register(data: { username: string; gmail: string; whatsapp: string; password: string }): Promise<{ success: boolean; message: string }> {
    if (this.isRemoteActive()) {
      try {
        const response = await fetch(`${API_URL}/register.php`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            username: data.username,
            gmail: data.gmail,
            whatsapp: data.whatsapp,
            password: data.password
          })
        });

        const resData = await response.json();
        if (response.ok && resData.status === 'success') {
          return { success: true, message: resData.message };
        } else {
          return { success: false, message: resData.message || "Gagal mendaftar akun." };
        }
      } catch (err) {
        console.warn("Koneksi register.php gagal.", err);
        return { success: false, message: "Koneksi ke database hosting gagal saat pendaftaran." };
      }
    }
    return { success: false, message: "Mode Offline Aktif." };
  }
};
