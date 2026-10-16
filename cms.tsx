import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Lock,
  Unlock,
  SlidersHorizontal,
  Send,
  Mail,
  Copy,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  Settings,
  Store,
  Phone,
  Image as ImageIcon,
  ShoppingCart,
  Minus,
  Sparkles,
  LogOut,
  FileText,
  ShieldCheck,
  User,
  Users
} from 'lucide-react';

const INITIAL_STORE_SETTINGS = {
  storeName: 'JACKET MASTERS',
  storeTagline: 'Stand out Without trying',
  nicheDescription: 'Премиальные пуховики, верхняя одежда и стильные аксессуары',
  currency: '₽',
  telegramUsername: 'derzeb',
  adminPassword: '987402',
  workingHours: 'Ежедневно с 09:00 до 21:00'
};

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'Рюкзак городской премиум',
    category: 'Сумки',
    description: 'Инновационный утеплитель, защита от ветра и влаги до -25°C, технологичный матовый нейлон.',
    price: 4990,
    status: 'in_stock',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-2',
    title: 'Пуховик Oversize Orange Limited',
    category: 'Пуховики',
    description: 'Яркий акцентный пуховик свободного кроя с высоким воротом и глубоким капюшоном.',
    price: 18500,
    status: 'in_stock',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-3',
    title: 'Укороченная зимняя куртка Metallic',
    category: 'Куртки',
    description: 'Стильная модель с металлизированным блеском, легкая и невероятно теплая.',
    price: 12900,
    status: 'pre_order',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'
  }
];

const STATUS_CONFIG = {
  in_stock: {
    label: 'В наличии',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-3 py-1 font-semibold',
    dotClass: 'bg-emerald-400',
    canOrder: true
  },
  pre_order: {
    label: 'Под заказ',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs px-3 py-1 font-semibold',
    dotClass: 'bg-amber-400',
    canOrder: true
  },
  out_of_stock: {
    label: 'Нет в наличии',
    badgeClass: 'bg-zinc-800 text-zinc-400 border-zinc-700 text-xs px-3 py-1 font-semibold',
    dotClass: 'bg-zinc-500',
    canOrder: false
  }
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.in_stock;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border backdrop-blur-md ${cfg.badgeClass}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('/');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('jacket_masters_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('jacket_masters_settings');
      return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
    } catch {
      return INITIAL_STORE_SETTINGS;
    }
  });

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('jacket_masters_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('jacket_masters_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('jacket_masters_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState('login');
  const [isMandatoryRegOpen, setIsMandatoryRegOpen] = useState(!currentUser);

  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+7 (');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Корзина привязана к текущему пользователю
  const [cart, setCart] = useState(() => {
    try {
      if (!currentUser?.phone) return [];
      const userKey = `jacket_masters_cart_${currentUser.phone.replace(/\D/g, '')}`;
      const savedCart = localStorage.getItem(userKey) || localStorage.getItem(`jacket_masters_cart_${currentUser.phone}`);
      if (savedCart) return JSON.parse(savedCart);
      return currentUser.cart || [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerComment, setCustomerComment] = useState('');

  const [ordersLog, setOrdersLog] = useState(() => {
    try {
      const saved = localStorage.getItem('jacket_masters_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Автосохранение корзины в localStorage и в объект пользователя при каждом изменении
  useEffect(() => {
    if (currentUser?.phone) {
      const cleanPhone = currentUser.phone.replace(/\D/g, '');
      try {
        localStorage.setItem(`jacket_masters_cart_${cleanPhone}`, JSON.stringify(cart));
        localStorage.setItem(`jacket_masters_cart_${currentUser.phone}`, JSON.stringify(cart));

        // Также обновляем в массиве зарегистрированных пользователей
        setRegisteredUsers((prevUsers) => {
          const updated = prevUsers.map((u) => {
            if (u.phone === currentUser.phone || u.phone.replace(/\D/g, '') === cleanPhone) {
              return { ...u, cart };
            }
            return u;
          });
          localStorage.setItem('jacket_masters_users', JSON.stringify(updated));
          return updated;
        });

        // Обновляем текущего пользователя
        setCurrentUser((prev) => (prev ? { ...prev, cart } : null));
      } catch (e) {}
    }
  }, [cart]);

  // Загрузка корзины при входе
  useEffect(() => {
    if (currentUser?.phone) {
      const cleanPhone = currentUser.phone.replace(/\D/g, '');
      try {
        const savedCart =
          localStorage.getItem(`jacket_masters_cart_${cleanPhone}`) ||
          localStorage.getItem(`jacket_masters_cart_${currentUser.phone}`);
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        } else if (Array.isArray(currentUser.cart)) {
          setCart(currentUser.cart);
        } else {
          setCart([]);
        }
      } catch {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  }, [currentUser?.phone]);

  useEffect(() => {
    try {
      localStorage.setItem('jacket_masters_products', JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('jacket_masters_settings', JSON.stringify(storeSettings));
    } catch (e) {}
  }, [storeSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('jacket_masters_users', JSON.stringify(registeredUsers));
    } catch (e) {}
  }, [registeredUsers]);

  useEffect(() => {
    try {
      localStorage.setItem('jacket_masters_current_user', JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    setIsMandatoryRegOpen(!currentUser);
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('jacket_masters_orders', JSON.stringify(ordersLog));
    } catch (e) {}
  }, [ordersLog]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  const handlePhoneMask = (val, setter) => {
    let raw = val.replace(/\D/g, '');
    if (raw.startsWith('7') || raw.startsWith('8')) {
      raw = raw.substring(1);
    }
    raw = raw.substring(0, 10);

    let formatted = '+7 (';
    if (raw.length > 0) {
      formatted += raw.substring(0, 3);
    }
    if (raw.length >= 3) {
      formatted += ') ' + raw.substring(3, 6);
    }
    if (raw.length >= 6) {
      formatted += '-' + raw.substring(6, 8);
    }
    if (raw.length >= 8) {
      formatted += '-' + raw.substring(8, 10);
    }

    setter(formatted);
  };

  const [adminTab, setAdminTab] = useState('manage_items');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('Все');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Пуховики',
    description: '',
    price: '',
    status: 'in_stock',
    image: ''
  });

  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const importJsonRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  };

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category.trim()).filter(Boolean)));
    return ['Все', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Все' || product.category === selectedCategory;
        const matchesStock = !hideOutOfStock || product.status !== 'out_of_stock';
        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'default') {
          if (a.status === 'out_of_stock' && b.status !== 'out_of_stock') return 1;
          if (a.status !== 'out_of_stock' && b.status === 'out_of_stock') return -1;
          return 0;
        }
        if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
        if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, hideOutOfStock, sortBy]);

  const adminFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(adminSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(adminSearch.toLowerCase());
      const matchesCat = adminCategoryFilter === 'Все' || p.category === adminCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, adminSearch, adminCategoryFilter]);

  const addToCart = (product) => {
    if (!currentUser) {
      setIsMandatoryRegOpen(true);
      return;
    }
    if (product.status === 'out_of_stock') return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`«${product.title}» добавлен в корзину`);
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Товар удален из корзины');
  };

  const cartTotalCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartTotalPrice = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0),
    [cart]
  );

  const formatPrice = (value) => {
    return `${Number(value || 0).toLocaleString('ru-RU')} ${storeSettings.currency}`;
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const rawDigits = regPhone.replace(/\D/g, '');
    if (rawDigits.length < 10) {
      setAuthError('Введите полный номер телефона в формате +7 (***) ***-**-**');
      return;
    }

    if (!regPassword.trim() || regPassword.length < 4) {
      setAuthError('Пароль должен содержать минимум 4 символа');
      return;
    }

    const cleanedPhone = regPhone.trim();
    const existingUser = registeredUsers.find((u) => u.phone === cleanedPhone || u.phone.replace(/\D/g, '') === rawDigits);

    if (existingUser) {
      setAuthError('Пользователь с таким телефоном уже зарегистрирован. Войдите через вкладку "Вход".');
      return;
    }

    if (!regName.trim() || !regEmail.trim()) {
      setAuthError('Заполните все обязательные поля');
      return;
    }

    const newUser = {
      id: `USR-${Date.now()}`,
      name: regName.trim(),
      phone: cleanedPhone,
      email: regEmail.trim(),
      password: regPassword.trim(),
      registeredAt: new Date().toLocaleString('ru-RU'),
      cart: []
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setCart([]);
    setIsMandatoryRegOpen(false);
    showToast(`Добро пожаловать, ${newUser.name}! Аккаунт создан.`);
    setRegName('');
    setRegPhone('+7 (');
    setRegEmail('');
    setRegPassword('');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const rawDigits = regPhone.replace(/\D/g, '');
    if (rawDigits.length < 10) {
      setAuthError('Введите полный номер телефона в формате +7 (***) ***-**-**');
      return;
    }

    const cleanedPhone = regPhone.trim();
    const foundUser = registeredUsers.find(
      (u) => u.phone === cleanedPhone || u.phone.replace(/\D/g, '') === rawDigits
    );

    if (!foundUser) {
      setAuthError('Пользователь с таким номером не найден. Зарегистрируйтесь.');
      return;
    }

    if (foundUser.password !== regPassword.trim()) {
      setAuthError('Неверный пароль');
      return;
    }

    setCurrentUser(foundUser);
    
    // Восстанавливаем корзину пользователя
    const cleanPhone = foundUser.phone.replace(/\D/g, '');
    const savedCart =
      localStorage.getItem(`jacket_masters_cart_${cleanPhone}`) ||
      localStorage.getItem(`jacket_masters_cart_${foundUser.phone}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else if (Array.isArray(foundUser.cart)) {
      setCart(foundUser.cart);
    } else {
      setCart([]);
    }

    setIsMandatoryRegOpen(false);
    showToast(`С возвращением, ${foundUser.name}! Корзина загружена.`);
    setRegPhone('+7 (');
    setRegPassword('');
  };

  const generateOrderText = () => {
    const lines = [
      `🛍 Новый заказ в магазине «${storeSettings.storeName}»`,
      `------------------------`,
      ...cart.map(
        (item, idx) =>
          `${idx + 1}. ${item.product.title} (${STATUS_CONFIG[item.product.status]?.label}) — ${item.quantity} шт. × ${formatPrice(item.product.price)} = ${formatPrice(item.product.price * item.quantity)}`
      ),
      `------------------------`,
      `💰 Итого к оплате: ${formatPrice(cartTotalPrice)}`,
      ``,
      `👤 Имя: ${currentUser?.name || 'Гость'}`,
      `📞 Телефон: ${currentUser?.phone || 'Не указан'}`,
      currentUser?.email ? `📧 Почта: ${currentUser.email}` : '',
      customerComment.trim() ? `💬 Комментарий: ${customerComment.trim()}` : ''
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderText = generateOrderText();
    const encodedText = encodeURIComponent(orderText);

    const newOrderRecord = {
      id: `ORD-${Date.now().toString().slice(-5)}`,
      date: new Date().toLocaleString('ru-RU'),
      customerName: currentUser?.name || 'Гость',
      customerPhone: currentUser?.phone || '—',
      total: cartTotalPrice,
      itemsCount: cartTotalCount,
      channel: 'telegram',
      text: orderText
    };
    setOrdersLog((prev) => [newOrderRecord, ...prev]);

    const cleanUser = storeSettings.telegramUsername.replace('@', '').trim();
    const tgUrl = `https://t.me/${cleanUser}?text=${encodedText}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');

    showToast('Заявка сформирована и отправлена в Telegram (@derzeb)!');
    setCart([]);
    setIsCartOpen(false);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passwordInput === storeSettings.adminPassword) {
      setIsAdminAuthenticated(true);
      setLoginError('');
      setPasswordInput('');
      setCurrentRoute('/admin');
      showToast('Вы вошли в панель администратора');
    } else {
      setLoginError('Неверный пароль. Попробуйте снова.');
    }
  };

  const handleInlinePriceChange = (productId, newPriceValue) => {
    const numeric = Math.max(0, Number(newPriceValue) || 0);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: numeric } : p))
    );
  };

  const handleToggleStockSwitch = (product) => {
    const nextStatus = product.status === 'out_of_stock' ? 'in_stock' : 'out_of_stock';
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
    );
    showToast(`Статус «${product.title}»: ${STATUS_CONFIG[nextStatus].label}`);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      category: 'Пуховики',
      description: '',
      price: '',
      status: 'in_stock',
      image: ''
    });
    setIsProductModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      category: product.category,
      description: product.description,
      price: product.price,
      status: product.status,
      image: product.image || ''
    });
    setIsProductModalOpen(true);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, image: String(reader.result) }));
      showToast('Фото успешно загружено');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Укажите название товара', 'error');
      return;
    }

    const prepared = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category.trim() || 'Разное',
      description: formData.description.trim(),
      price: Math.max(0, Number(formData.price) || 0),
      status: formData.status,
      image: formData.image.trim() || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'
    };

    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? prepared : p)));
      showToast(`Товар «${prepared.title}» обновлен`);
    } else {
      setProducts((prev) => [prepared, ...prev]);
      showToast(`Товар «${prepared.title}» успешно добавлен на витрину!`);
    }

    setIsProductModalOpen(false);
  };

  const confirmDeleteProduct = () => {
    if (!productToDelete) return;
    const deletedTitle = productToDelete.title;
    setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
    setCart((prev) => prev.filter((item) => item.product.id !== productToDelete.id));
    setProductToDelete(null);
    showToast(`Товар «${deletedTitle}» удален`);
  };

  const handleExportCatalog = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      storeSettings,
      products,
      registeredUsers
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalog-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Каталог экспортирован');
  };

  const handleImportCatalog = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed.products)) {
          setProducts(parsed.products);
          if (parsed.storeSettings) {
            setStoreSettings((prev) => ({ ...prev, ...parsed.storeSettings }));
          }
          if (Array.isArray(parsed.registeredUsers)) {
            setRegisteredUsers(parsed.registeredUsers);
          }
          showToast(`Импортировано товаров: ${parsed.products.length}`);
        } else if (Array.isArray(parsed)) {
          setProducts(parsed);
          showToast(`Импортировано товаров: ${parsed.length}`);
        } else {
          showToast('Неверный формат JSON', 'error');
        }
      } catch (err) {
        showToast('Ошибка чтения файла', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#121214] text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-bounce">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border text-base font-bold ${
              toast.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700'
                : 'bg-zinc-900/95 text-zinc-100 border-zinc-700 backdrop-blur-xl'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-orange-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Mandatory Registration / Login Modal */}
      {isMandatoryRegOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#18181c] rounded-[32px] max-w-md w-full p-8 sm:p-10 border border-zinc-700 shadow-2xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <span className="px-4 py-1.5 rounded-full text-xs font-black bg-orange-500/20 text-orange-400 uppercase tracking-widest border border-orange-500/30">
                Авторизация
              </span>
              <h2 className="text-3xl font-black text-white">
                {authMode === 'login' ? 'Вход в аккаунт' : 'Регистрация аккаунта'}
              </h2>
              <p className="text-sm text-zinc-400">
                {authMode === 'login'
                  ? 'Введите номер телефона и пароль для доступа к вашей корзине.'
                  : 'Создайте аккаунт, чтобы сохранять корзину и оформлять заказы.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`py-3 rounded-xl font-bold text-sm transition ${
                  authMode === 'login' ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Вход
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={`py-3 rounded-xl font-bold text-sm transition ${
                  authMode === 'register' ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Регистрация
              </button>
            </div>

            {authError && (
              <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-sm font-semibold">
                {authError}
              </div>
            )}

            {authMode === 'register' ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-base">
                <div>
                  <label className="block text-zinc-300 font-bold mb-2">Ваше имя *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Иван"
                    className="w-full px-5 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-semibold text-base focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-2">Номер телефона * (+7 *** ***-**-**)</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => handlePhoneMask(e.target.value, setRegPhone)}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full px-5 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-semibold text-base focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-2">Электронная почта *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="example@mail.ru"
                    className="w-full px-5 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-semibold text-base focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-2">Пароль * (мин. 4 символа)</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-semibold text-base focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg shadow-xl shadow-orange-500/30 transition mt-3"
                >
                  Зарегистрироваться
                </button>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-base">
                <div>
                  <label className="block text-zinc-300 font-bold mb-2">Номер телефона * (+7 *** ***-**-**)</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => handlePhoneMask(e.target.value, setRegPhone)}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full px-5 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-semibold text-base focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-2">Пароль *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-semibold text-base focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg shadow-xl shadow-orange-500/30 transition mt-3"
                >
                  Войти в аккаунт
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-[#18181b] text-zinc-300 text-sm py-2.5 px-6 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 font-semibold text-base">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/15 text-orange-400 font-mono text-xs border border-orange-500/30">
              {currentRoute === '/' ? 'МАГАЗИН' : 'CMS ADMIN'}
            </span>
            <span className="text-zinc-300">{storeSettings.workingHours}</span>
          </div>

          <div className="flex items-center gap-4">
            {isAdminAuthenticated && (
              <button
                onClick={() => setCurrentRoute('/')}
                className={`px-4 py-1.5 rounded-full font-bold transition flex items-center gap-2 text-sm ${
                  currentRoute === '/'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                <Store className="w-4 h-4" />
                Витрина
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-30 bg-[#121214]/90 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div
            onClick={() => setCurrentRoute('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <span className="font-black text-2xl md:text-3xl tracking-wider text-white uppercase flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-orange-500 animate-pulse" />
              {storeSettings.storeName}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm hidden sm:block">
                  <p className="font-bold text-white">{currentUser.name}</p>
                  <p className="text-xs text-orange-300 font-mono">{currentUser.phone}</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setCart([]);
                    setIsMandatoryRegOpen(true);
                  }}
                  className="ml-2 text-zinc-400 hover:text-rose-400 text-xs font-bold"
                  title="Выйти"
                >
                  Выйти
                </button>
              </div>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2.5 bg-[#222226] hover:bg-orange-600 text-white px-6 py-3.5 rounded-full font-extrabold text-base transition shadow-xl border border-zinc-700"
            >
              <ShoppingCart className="w-5 h-5 text-orange-400" />
              <span>Корзина</span>
              {cartTotalCount > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-black rounded-full bg-orange-500 text-white">
                  {cartTotalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {currentRoute === '/' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
          <div id="catalog" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
              <div className="flex items-center gap-3 overflow-x-auto pb-3 md:pb-0 no-scrollbar">
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-7 py-3.5 rounded-full text-base font-extrabold uppercase tracking-wide transition ${
                        active
                          ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/30'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4">
                <div className="relative flex-1 sm:w-80">
                  <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по каталогу..."
                    className="w-full pl-11 pr-5 py-3.5 bg-zinc-900 border border-zinc-800 rounded-full text-base font-semibold text-zinc-100 focus:outline-none focus:border-orange-500 transition shadow-inner"
                  />
                </div>

                <button
                  onClick={() => setHideOutOfStock(!hideOutOfStock)}
                  className={`px-6 py-3.5 rounded-full text-sm font-extrabold border transition ${
                    hideOutOfStock
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800'
                  }`}
                >
                  {hideOutOfStock ? 'Только в наличии' : 'Все статусы'}
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 p-16 text-center max-w-lg mx-auto my-12">
                <Package className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-zinc-100 mb-2">Ничего не найдено</h3>
                <p className="text-base text-zinc-400 mb-6">Товары скоро появятся в продаже.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => {
                  const isOut = product.status === 'out_of_stock';
                  const inCartItem = cart.find((item) => item.product.id === product.id);

                  return (
                    <article
                      key={product.id}
                      className={`group bg-[#17171a] rounded-[32px] border border-zinc-800/90 overflow-hidden shadow-2xl hover:border-orange-500/60 transition-all duration-300 flex flex-col ${
                        isOut ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className={`w-full h-full object-cover group-hover:scale-105 transition duration-700 ${
                              isOut ? 'grayscale' : ''
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <ImageIcon className="w-12 h-12" />
                          </div>
                        )}

                        <div className="absolute top-4 left-4">
                          <span className="px-4 py-2 rounded-full text-sm font-extrabold bg-black/75 backdrop-blur-md text-zinc-200 border border-zinc-700">
                            {product.category}
                          </span>
                        </div>

                        <div className="absolute top-4 right-4">
                          <StatusBadge status={product.status} />
                        </div>
                      </div>

                      <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                        <div>
                          <h3 className="font-black text-2xl text-white mb-3 leading-snug group-hover:text-orange-400 transition">
                            {product.title}
                          </h3>
                          <p className="text-base text-zinc-300 line-clamp-3 leading-relaxed">
                            {product.description || 'Описание отсутствует.'}
                          </p>
                        </div>

                        <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs uppercase font-extrabold text-zinc-400 block mb-1">Цена</span>
                            <span className="text-3xl font-black text-white tracking-tight">{formatPrice(product.price)}</span>
                          </div>

                          {isOut ? (
                            <button disabled className="px-7 py-3.5 rounded-full bg-zinc-800 text-zinc-500 text-base font-bold cursor-not-allowed">
                              Нет в наличии
                            </button>
                          ) : inCartItem ? (
                            <div className="flex items-center gap-3 bg-orange-500/15 border border-orange-500/40 rounded-full p-2 shadow-lg">
                              <button
                                onClick={() => updateCartQuantity(product.id, -1)}
                                className="w-9 h-9 rounded-full bg-zinc-900 text-orange-400 hover:bg-zinc-800 flex items-center justify-center transition font-bold"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-black text-base text-orange-200">{inCartItem.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(product.id, 1)}
                                className="w-9 h-9 rounded-full bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center transition font-bold"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(product)}
                              className="px-8 py-4 rounded-full bg-white hover:bg-orange-500 text-zinc-950 hover:text-white font-black text-base transition shadow-2xl flex items-center gap-2.5"
                            >
                              <Plus className="w-5 h-5" />
                              Купить
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
          {!isAdminAuthenticated ? (
            <div className="max-w-md mx-auto my-12 bg-[#17171a] rounded-3xl border border-zinc-800 p-8 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-5 border border-orange-500/30">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2">Панель администратора</h2>
              <p className="text-base text-zinc-400 mb-6">Введите пароль для управления товарами.</p>

              <form onSubmit={handleAdminLogin} className="space-y-5">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Пароль..."
                  className="w-full px-5 py-4 rounded-2xl border border-zinc-800 bg-zinc-900 text-white text-lg font-semibold focus:outline-none focus:border-orange-500"
                  autoFocus
                />
                {loginError && <p className="text-sm text-rose-400 font-bold">{loginError}</p>}
                <button type="submit" className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-lg transition shadow-xl shadow-orange-500/20">
                  Войти в CMS
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-[#17171a] rounded-3xl border border-zinc-800 p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl">
                <div>
                  <span className="px-4 py-1.5 rounded-full text-xs font-black bg-orange-500/20 text-orange-400 uppercase tracking-widest border border-orange-500/30">
                    CMS Control Panel
                  </span>
                  <h2 className="text-3xl font-black text-white mt-2">Управление витриной</h2>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button onClick={openCreateModal} className="px-7 py-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-base font-black transition flex items-center gap-2.5 shadow-xl shadow-orange-500/25">
                    <Plus className="w-5 h-5" /> Добавить товар
                  </button>
                  <button onClick={handleExportCatalog} className="px-6 py-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-base font-bold transition flex items-center gap-2">
                    <Download className="w-5 h-5" /> Экспорт
                  </button>
                  <input ref={importJsonRef} type="file" accept=".json" onChange={handleImportCatalog} className="hidden" />
                  <button onClick={() => importJsonRef.current?.click()} className="px-6 py-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-base font-bold transition flex items-center gap-2">
                    <Upload className="w-5 h-5" /> Импорт
                  </button>
                  <button onClick={() => { setIsAdminAuthenticated(false); setCurrentRoute('/'); }} className="p-4 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition" title="Выйти">
                    <LogOut className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 overflow-x-auto">
                <button onClick={() => setAdminTab('manage_items')} className={`px-7 py-3.5 rounded-full text-base font-bold transition ${adminTab === 'manage_items' ? 'bg-orange-500 text-white shadow-lg' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'}`}>
                  ➕ Добавить / Удалить ({products.length})
                </button>
                <button onClick={() => setAdminTab('users')} className={`px-7 py-3.5 rounded-full text-base font-bold transition ${adminTab === 'users' ? 'bg-orange-500 text-white shadow-lg' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'}`}>
                  👥 База зарегистрированных ({registeredUsers.length})
                </button>
                <button onClick={() => setAdminTab('products')} className={`px-7 py-3.5 rounded-full text-base font-bold transition ${adminTab === 'products' ? 'bg-orange-500 text-white shadow-lg' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'}`}>
                  Цены и наличие
                </button>
                <button onClick={() => setAdminTab('settings')} className={`px-7 py-3.5 rounded-full text-base font-bold transition ${adminTab === 'settings' ? 'bg-orange-500 text-white shadow-lg' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'}`}>
                  Настройки бренда
                </button>
                <button onClick={() => setAdminTab('orders')} className={`px-7 py-3.5 rounded-full text-base font-bold transition ${adminTab === 'orders' ? 'bg-orange-500 text-white shadow-lg' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'}`}>
                  Заказы ({ordersLog.length})
                </button>
              </div>

              {adminTab === 'manage_items' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-6 bg-[#17171a] rounded-3xl border border-zinc-800 p-8 space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Plus className="w-6 h-6 text-orange-400" /> Добавить товар на витрину
                      </h3>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-6 text-base">
                      <div>
                        <label className="block text-zinc-200 font-bold mb-2">Название товара *</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="Например: Пуховик зимний"
                          className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white text-lg font-semibold focus:border-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-200 font-bold mb-2">Категория</label>
                          <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            placeholder="Пуховики, Сумки..."
                            className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white text-lg font-semibold focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-200 font-bold mb-2">Цена ({storeSettings.currency}) *</label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            placeholder="4990"
                            className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-black text-xl focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-200 font-bold mb-2">Статус наличия</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white text-lg font-semibold focus:border-orange-500"
                        >
                          <option value="in_stock">🟢 В наличии</option>
                          <option value="pre_order">🟡 Под заказ</option>
                          <option value="out_of_stock">⚪ Нет в наличии</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-200 font-bold mb-2">Описание</label>
                        <textarea
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Описание товара..."
                          className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white text-base focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-200 font-bold mb-2">Ссылка на фото (или загрузите файл)</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            placeholder="https://images.unsplash.com/..."
                            className="flex-1 px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white text-base focus:border-orange-500"
                          />
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-4 rounded-2xl bg-zinc-800 text-white font-bold text-base">
                            Файл
                          </button>
                        </div>
                      </div>

                      {formData.image && (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-zinc-700">
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}

                      <button type="submit" className="w-full py-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg transition shadow-xl shadow-orange-500/25">
                        Опубликовать товар на сайте
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-6 bg-[#17171a] rounded-3xl border border-zinc-800 p-8 space-y-6 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Trash2 className="w-6 h-6 text-rose-500" /> Удаление товаров ({products.length})
                    </h3>
                    <p className="text-base text-zinc-300">Нажмите кнопку удаления, чтобы товар исчез с витрины.</p>

                    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
                      {products.map((product) => (
                        <div key={product.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 rounded-2xl bg-zinc-800 overflow-hidden shrink-0">
                              {product.image ? (
                                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-zinc-500 m-auto mt-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-base font-bold text-white truncate">{product.title}</h4>
                              <p className="text-sm font-semibold text-zinc-400">{formatPrice(product.price)} • {product.category}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="px-5 py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-sm font-bold transition shrink-0 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Удалить
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {adminTab === 'users' && (
                <div className="bg-[#17171a] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-white flex items-center gap-3">
                        <Users className="w-7 h-7 text-orange-400" /> База зарегистрированных пользователей
                      </h3>
                      <p className="text-sm text-zinc-400 mt-1">Все пользователи, которые прошли регистрацию на сайте.</p>
                    </div>
                    <span className="px-4 py-2 rounded-full bg-orange-500/20 text-orange-300 text-sm font-bold border border-orange-500/30">
                      Всего: {registeredUsers.length}
                    </span>
                  </div>

                  {registeredUsers.length === 0 ? (
                    <div className="p-12 text-center text-zinc-400 bg-zinc-900 rounded-2xl border border-zinc-800">
                      <Users className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                      <p className="text-lg font-bold">Пока нет зарегистрированных пользователей</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-800 text-xs font-black uppercase tracking-wider text-zinc-400 bg-zinc-900/40">
                            <th className="py-4 px-6">Имя</th>
                            <th className="py-4 px-6">Телефон</th>
                            <th className="py-4 px-6">Почта</th>
                            <th className="py-4 px-6">Дата регистрации</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-base">
                          {registeredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-zinc-900/40 transition">
                              <td className="py-4 px-6 font-bold text-white">{u.name}</td>
                              <td className="py-4 px-6 font-mono text-orange-300">{u.phone}</td>
                              <td className="py-4 px-6 text-zinc-300">{u.email}</td>
                              <td className="py-4 px-6 text-sm text-zinc-500">{u.registeredAt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {adminTab === 'products' && (
                <div className="bg-[#17171a] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-zinc-800 flex items-center justify-between gap-4 bg-zinc-900/50">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Быстрый поиск..."
                        className="w-full pl-11 pr-5 py-3.5 rounded-full bg-zinc-900 border border-zinc-800 text-base font-semibold text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 text-sm font-black uppercase tracking-wider text-zinc-400 bg-zinc-900/40">
                          <th className="py-5 px-6">Товар</th>
                          <th className="py-5 px-6">Категория</th>
                          <th className="py-5 px-6">Цена ({storeSettings.currency})</th>
                          <th className="py-5 px-6">Наличие (Тумблер)</th>
                          <th className="py-5 px-6 text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800 text-base">
                        {adminFilteredProducts.map((product) => {
                          const isAvailable = product.status !== 'out_of_stock';
                          return (
                            <tr key={product.id} className="hover:bg-zinc-900/40 transition">
                              <td className="py-5 px-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700 flex items-center justify-center">
                                    {product.image ? (
                                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="w-6 h-6 text-zinc-500" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-lg text-white line-clamp-1">{product.title}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-5 px-6">
                                <span className="px-3.5 py-1.5 rounded-full bg-zinc-800 text-zinc-200 text-sm font-bold">
                                  {product.category}
                                </span>
                              </td>

                              <td className="py-5 px-6">
                                <div className="relative w-40">
                                  <input
                                    type="number"
                                    min="0"
                                    value={product.price}
                                    onChange={(e) => handleInlinePriceChange(product.id, e.target.value)}
                                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 font-black text-white text-base focus:border-orange-500"
                                  />
                                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-bold">{storeSettings.currency}</span>
                                </div>
                              </td>

                              <td className="py-5 px-6">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStockSwitch(product)}
                                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                                    isAvailable ? 'bg-orange-500' : 'bg-zinc-700'
                                  }`}
                                >
                                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${isAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                              </td>

                              <td className="py-5 px-6 text-right">
                                <div className="inline-flex items-center gap-3">
                                  <button onClick={() => openEditModal(product)} className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition" title="Редактировать">
                                    <Edit3 className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => setProductToDelete(product)} className="p-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition" title="Удалить">
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminTab === 'settings' && (
                <div className="bg-[#17171a] rounded-3xl border border-zinc-800 p-8 max-w-2xl space-y-6 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white">Настройки магазина</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
                    <div>
                      <label className="block text-zinc-300 font-bold mb-2">Название бренда</label>
                      <input type="text" value={storeSettings.storeName} onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-semibold" />
                    </div>
                    <div>
                      <label className="block text-zinc-300 font-bold mb-2">Telegram (@username)</label>
                      <input type="text" value={storeSettings.telegramUsername} onChange={(e) => setStoreSettings({...storeSettings, telegramUsername: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-semibold" />
                    </div>
                    <div>
                      <label className="block text-zinc-300 font-bold mb-2">Пароль /admin</label>
                      <input type="text" value={storeSettings.adminPassword} onChange={(e) => setStoreSettings({...storeSettings, adminPassword: e.target.value})} className="w-full px-5 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-mono font-semibold" />
                    </div>
                  </div>
                  <button onClick={() => showToast('Настройки сохранены')} className="px-8 py-3.5 rounded-full bg-orange-500 text-white font-black text-base shadow-lg">
                    Сохранить
                  </button>
                </div>
              )}

              {adminTab === 'orders' && (
                <div className="bg-[#17171a] rounded-3xl border border-zinc-800 p-8 space-y-4 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-2">История заявок</h3>
                  {ordersLog.length === 0 ? (
                    <p className="text-base text-zinc-400">Заказов пока не было.</p>
                  ) : (
                    ordersLog.map((ord) => (
                      <div key={ord.id} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-base space-y-2">
                        <div className="text-orange-400 font-black text-lg">{ord.id} • {ord.date}</div>
                        <div className="text-white font-bold">{ord.customerName} ({ord.customerPhone})</div>
                        <pre className="text-zinc-300 font-sans whitespace-pre-wrap">{ord.text}</pre>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#18181c] rounded-[32px] max-w-2xl w-full p-8 sm:p-10 border border-zinc-700 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <span className="text-xs uppercase font-black text-orange-400 tracking-widest">Управление каталогом</span>
                <h3 className="text-3xl font-black text-white mt-1">{editingProduct ? 'Редактирование товара' : 'Добавление товара'}</h3>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className="w-11 h-11 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-base">
              <div>
                <label className="block text-zinc-200 font-bold mb-2">Название товара *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Например: Пуховик"
                  className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-lg font-semibold focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-200 font-bold mb-2">Категория</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="Пуховики, Сумки..."
                    className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-lg font-semibold focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-200 font-bold mb-2">Цена ({storeSettings.currency}) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="4990"
                    className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-xl font-black focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-200 font-bold mb-2">Статус наличия</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-lg font-semibold focus:border-orange-500"
                >
                  <option value="in_stock">🟢 В наличии</option>
                  <option value="pre_order">🟡 Под заказ</option>
                  <option value="out_of_stock">⚪ Нет в наличии</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-200 font-bold mb-2">Описание</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Описание..."
                  className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-base focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-zinc-200 font-bold mb-2">Фотография товара (Ссылка или файл)</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-base focus:border-orange-500"
                  />
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-base transition border border-zinc-700 shrink-0 flex items-center gap-2"
                  >
                    <Upload className="w-5 h-5" /> Файл
                  </button>
                </div>
              </div>

              {formData.image && (
                <div className="w-28 h-28 rounded-2xl overflow-hidden border border-zinc-700 relative bg-zinc-900">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-7 py-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-base transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-9 py-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-base transition shadow-xl shadow-orange-500/20"
                >
                  Сохранить товар
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#17171a] rounded-3xl max-w-sm w-full p-8 border border-zinc-800 text-center space-y-6">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-xl font-bold text-white">Удалить товар «{productToDelete.title}»?</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setProductToDelete(null)} className="py-3.5 rounded-xl bg-zinc-800 text-zinc-200 text-base font-bold">Отмена</button>
              <button onClick={confirmDeleteProduct} className="py-3.5 rounded-xl bg-rose-600 text-white text-base font-black">Удалить</button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-fadeIn">
          <div className="bg-[#17171a] w-full max-w-lg h-full flex flex-col border-l border-zinc-800 shadow-2xl animate-slideLeft">
            <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <ShoppingCart className="w-7 h-7 text-orange-400" /> Корзина ({cartTotalCount})
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="w-11 h-11 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-400">
                <ShoppingBag className="w-20 h-20 mb-4 stroke-1 text-zinc-600" />
                <p className="text-xl font-bold text-zinc-300">Ваша корзина пуста</p>
                <p className="text-sm text-zinc-500 mt-1">Выберите товары из каталога и добавьте их сюда</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-4">
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="group flex items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-orange-500/40 transition">
                      <div className="flex items-center gap-4 min-w-0">
                        {product.image && (
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700">
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-lg font-bold text-white truncate">{product.title}</h4>
                          <p className="text-sm font-black text-orange-400 mt-0.5">{formatPrice(product.price)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700 rounded-2xl p-1.5">
                          <button
                            onClick={() => updateCartQuantity(product.id, -1)}
                            className="w-9 h-9 rounded-xl bg-zinc-900 text-orange-400 hover:bg-orange-500 hover:text-white flex items-center justify-center transition font-bold"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-base font-black text-white">{quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(product.id, 1)}
                            className="w-9 h-9 rounded-xl bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center transition font-bold"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="w-10 h-10 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition"
                          title="Удалить товар"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-3xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-between">
                  <span className="font-bold text-orange-200 text-lg">Итого к оплате:</span>
                  <span className="font-black text-orange-400 text-3xl">{formatPrice(cartTotalPrice)}</span>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-5 text-base">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 space-y-1">
                    <p className="font-bold text-white">Заказ оформляется на данные аккаунта:</p>
                    <p>👤 Имя: <span className="text-orange-300 font-bold">{currentUser?.name}</span></p>
                    <p>📞 Телефон: <span className="text-orange-300 font-mono font-bold">{currentUser?.phone}</span></p>
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-2">Комментарий к заказу</label>
                    <textarea
                      rows={3}
                      value={customerComment}
                      onChange={(e) => setCustomerComment(e.target.value)}
                      placeholder="Пожелания по доставке или размеру..."
                      className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-semibold text-base focus:border-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg transition shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-3"
                  >
                    <Send className="w-6 h-6" /> Отправить заказ в Telegram (@{storeSettings.telegramUsername})
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#17171a] border-t border-zinc-800/80 py-8 px-6 text-center text-sm text-zinc-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-medium">© {new Date().getFullYear()} {storeSettings.storeName}. Заказы отправляются в Telegram @{storeSettings.telegramUsername}.</span>
          <button
            onClick={() => setCurrentRoute('/admin')}
            className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-orange-400 transition border border-zinc-800"
            title="Панель администратора"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}