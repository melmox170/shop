import React, { useState, useEffect } from 'react';
import { ShoppingBag, Shield, User, LogOut, Trash2, Plus, Minus, CheckCircle, Lock, Phone, Mail, UserCheck } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [phoneInput, setPhoneInput] = useState('+7(');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [usersDb, setUsersDb] = useState(() => {
    try {
      const saved = localStorage.getItem('shop_users_db');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [products, setProducts] = useState([
    { id: 1, name: 'Зимняя куртка "Арктика"', price: 12500, stock: 5, image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=500' },
    { id: 2, name: 'Куртка утепленная "Urban"', price: 9800, stock: 8, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=500' },
    { id: 3, name: 'Ветрозащитная парка', price: 14200, stock: 3, image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=500' },
  ]);

  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    localStorage.setItem('shop_users_db', JSON.stringify(usersDb));
  }, [usersDb]);

  useEffect(() => {
    if (currentUser) {
      try {
        const savedCart = localStorage.getItem(`cart_${currentUser.phone}`);
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        } else {
          setCart({});
        }
      } catch { setCart({}); }
    }
  }, [currentUser]);

  const updateCartForCurrent = (newCart) => {
    setCart(newCart);
    if (currentUser) {
      localStorage.setItem(`cart_${currentUser.phone}`, JSON.stringify(newCart));
    }
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('+7(')) val = '+7(';
    let digits = val.replace(/\D/g, '').slice(1);
    let formatted = '+7(';
    if (digits.length > 0) formatted += digits.substring(0, 3);
    if (digits.length >= 4) formatted += ') ' + digits.substring(3, 6);
    if (digits.length >= 7) formatted += '-' + digits.substring(6, 8);
    if (digits.length >= 9) formatted += '-' + digits.substring(8, 10);
    setPhoneInput(formatted);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const digits = phoneInput.replace(/\D/g, '');
    if (digits.length !== 11) {
      setAuthError('Введите все 10 цифр номера телефона!');
      return;
    }
    if (!nameInput.trim() || !emailInput.trim() || !passwordInput) {
      setAuthError('Заполните все поля!');
      return;
    }
    if (usersDb.some(u => u.phone === phoneInput)) {
      setAuthError('Этот номер уже зарегистрирован. Войдите в аккаунт.');
      return;
    }

    const newUser = { name: nameInput, phone: phoneInput, email: emailInput, password: passwordInput };
    const updatedUsers = [...usersDb, newUser];
    setUsersDb(updatedUsers);
    setCurrentUser(newUser);
    setAuthError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = usersDb.find(u => u.phone === phoneInput);
    if (!user || user.password !== passwordInput) {
      setAuthError('Неверный номер телефона или пароль!');
      return;
    }
    setCurrentUser(user);
    setAuthError('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart({});
    setPasswordInput('');
  };

  const addToCart = (prod) => {
    if (!currentUser) return;
    const currentQty = cart[prod.id] || 0;
    if (currentQty >= prod.stock) {
      alert('Доступно максимум на складе!');
      return;
    }
    const newCart = { ...cart, [prod.id]: currentQty + 1 };
    updateCartForCurrent(newCart);
  };

  const removeFromCart = (prodId) => {
    const newCart = { ...cart };
    delete newCart[prodId];
    updateCartForCurrent(newCart);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = products.find(item => item.id === Number(id));
      return sum + (p ? p.price * qty : 0);
    }, 0);
  };

  const checkoutTelegram = () => {
    const itemsText = Object.entries(cart).map(([id, qty]) => {
      const p = products.find(item => item.id === Number(id));
      return `- ${p?.name} (${qty} шт.) — ${p?.price * qty} руб.`;
    }).join('\n');

    const text = `🛒 Новый заказ!\nИмя: ${currentUser.name}\nТелефон: ${currentUser.phone}\nПочта: ${currentUser.email}\n\nТовары:\n${itemsText}\n\nИтого: ${getTotalPrice()} руб.`;
    window.open(`https://t.me/derzeb?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl text-white">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Магазин верхней одежды</h1>
            <p className="text-slate-400 text-sm mt-1">Для доступа к каталогу необходима авторизация</p>
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl mb-6">
            <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${authMode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Вход</button>
            <button onClick={() => { setAuthMode('register'); setAuthError(''); }} className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${authMode === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Регистрация</button>
          </div>

          {authError && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-200 text-xs rounded-xl">{authError}</div>}

          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Имя</label>
                  <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Иван" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Почта</label>
                  <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="mail@example.com" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" required />
                </div>
              </>
            )}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Номер телефона</label>
              <input type="text" value={phoneInput} onChange={handlePhoneChange} placeholder="+7(999) 000-00-00" maxLength={16} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Пароль</label>
              <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500" required />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition mt-2">{authMode === 'login' ? 'Войти в аккаунт' : 'Зарегистрироваться'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🛒 Каталог товаров</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
            <UserCheck size={16} className="text-indigo-400" />
            <span>{currentUser.name} ({currentUser.phone})</span>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="relative bg-indigo-600 p-2.5 rounded-xl hover:bg-indigo-500 transition">
            <ShoppingBag size={20} />
            {Object.keys(cart).length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{Object.values(cart).reduce((a,b)=>a+b, 0)}</span>}
          </button>
          <button onClick={handleLogout} title="Выйти" className="bg-slate-800 p-2.5 rounded-xl hover:bg-red-600/20 hover:text-red-400 transition">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(prod => (
            <div key={prod.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <img src={prod.image} alt={prod.name} className="h-60 w-full object-cover" />
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1">{prod.name}</h3>
                  <p className="text-indigo-400 font-semibold mb-2">{prod.price.toLocaleString()} руб.</p>
                  <p className="text-xs text-slate-400">В наличии: {prod.stock} шт.</p>
                </div>
                <button onClick={() => addToCart(prod)} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-xl text-sm font-semibold transition">Добавить в корзину</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="bg-slate-900 w-full max-w-md h-full p-6 flex flex-col justify-between border-l border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Ваша корзина</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                {Object.keys(cart).length === 0 ? (
                  <p className="text-slate-400 text-center py-10">Корзина пуста</p>
                ) : (
                  Object.entries(cart).map(([id, qty]) => {
                    const prod = products.find(p => p.id === Number(id));
                    if (!prod) return null;
                    return (
                      <div key={id} className="flex justify-between items-center bg-slate-800 p-3 rounded-xl">
                        <div>
                          <h4 className="font-semibold text-sm">{prod.name}</h4>
                          <p className="text-xs text-slate-400">{prod.price} руб. × {qty}</p>
                        </div>
                        <button onClick={() => removeFromCart(id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={18} /></button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            {Object.keys(cart).length > 0 && (
              <div className="border-t border-slate-800 pt-4">
                <div className="flex justify-between font-bold text-lg mb-4"><span>Итого:</span><span>{getTotalPrice().toLocaleString()} руб.</span></div>
                <button onClick={checkoutTelegram} className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">Отправить заказ в Telegram (@derzeb)</button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 w-full bg-slate-900/80 backdrop-blur border-t border-slate-800 py-2 px-6 flex justify-end">
        <button onClick={() => setIsAdminOpen(true)} className="text-slate-500 hover:text-slate-300 p-2"><Shield size={18} /></button>
      </footer>

      {isAdminOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Админ-панель</h3>
              <button onClick={() => setIsAdminOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {!isAdminLoggedIn ? (
              <div className="space-y-4">
                <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Введите пароль админа" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500" />
                <button onClick={() => { if (adminPassword === '987402') setIsAdminLoggedIn(true); else alert('Неверный пароль!'); }} className="w-full bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-xl text-sm font-semibold">Войти</button>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Зарегистрированные пользователи:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {usersDb.map((u, i) => (
                    <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                      <p><b>Имя:</b> {u.name}</p>
                      <p><b>Телефон:</b> {u.phone}</p>
                      <p><b>Почта:</b> {u.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
