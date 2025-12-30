import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Calendar, CheckCircle2, Brain, Trophy, Wifi, AlertCircle, Clock, 
  Briefcase, GraduationCap, Dumbbell, Plus, Menu, X, Trash2, ArrowRight, 
  Users, Send, Mail, Lock, Share2, Key, Sun, Moon, LogOut,
  Maximize2, Minimize2, ArrowLeft, Bot, UserPlus, Fingerprint, Bell, ShieldCheck, User
} from 'lucide-react';

// --- CONFIGURATION ---
const API_URL = "https://backend-production-c3b5.up.railway.app";

// --- THEME ENGINE ---
const THEMES = {
  dark: {
    bg: 'bg-black',
    sidebar: 'bg-neutral-950',
    surface: 'bg-neutral-900',
    border: 'border-neutral-800',
    text: 'text-neutral-200',
    textMuted: 'text-neutral-500',
    accentBg: 'bg-emerald-600',
    accentText: 'text-emerald-500',
    input: 'bg-neutral-900',
    hover: 'hover:bg-neutral-800'
  },
  light: {
    bg: 'bg-slate-50',
    sidebar: 'bg-white',
    surface: 'bg-white',
    border: 'border-slate-200',
    text: 'text-slate-800',
    textMuted: 'text-slate-500',
    accentBg: 'bg-indigo-600',
    accentText: 'text-indigo-600',
    input: 'bg-slate-100',
    hover: 'hover:bg-slate-100'
  }
};

export default function App() {
  // --- ÉTATS ---
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null); 
  const [view, setView] = useState('landing'); 
  const [serverStatus, setServerStatus] = useState('checking');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // App States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Data
  const [tasks, setTasks] = useState([]);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [aiMessages, setAiMessages] = useState([{ id: 1, sender: "Coach IA", text: "Je suis opérationnel. Donne-moi tes objectifs.", isMe: false }]);
  const [isAiTyping, setIsAiTyping] = useState(false); // Nouvel état pour l'IA
  
  // Inputs
  const [email, setEmail] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newAiMessage, setNewAiMessage] = useState('');
  const [newTask, setNewTask] = useState({ title: '', time: '08:00', category: 'school' });
  const [friendEmail, setFriendEmail] = useState('');

  const messagesEndRef = useRef(null);
  const aiEndRef = useRef(null);

  // --- INITIALISATION ---
  useEffect(() => {
    checkServer();
    const savedUser = localStorage.getItem('v12_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadAllData(parsedUser.id);
      setView('app');
    }
  }, []);

  // Polling (Mise à jour auto toutes les 5s)
  useEffect(() => {
    let interval;
    if (user && view === 'app') {
      interval = setInterval(() => {
        if (activeTab === 'social') {
            fetchMessages();
            fetchFriends(user.id);
        }
        fetchNotifications(user.id);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [user, view, activeTab]);

  const loadAllData = (userId) => {
    fetchTasks(userId);
    fetchFriends(userId);
    fetchMessages();
    fetchNotifications(userId);
  };

  // --- API CALLS ---

  const checkServer = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hello`);
      setServerStatus(res.ok ? 'online' : 'offline');
    } catch { setServerStatus('offline'); }
  };

  const fetchTasks = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) { console.error("Erreur tasks", err); }
  };

  const fetchFriends = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/social/friends?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (err) { console.error("Erreur friends", err); }
  };

  const fetchNotifications = async (userId) => {
    try {
        const res = await fetch(`${API_URL}/api/social/notifications?userId=${userId}`);
        if(res.ok) {
            const data = await res.json();
            setNotifications(data);
        }
    } catch (err) { console.error("Erreur notifs", err); }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/social/messages`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(msg => ({
          id: msg.id,
          sender: msg.sender_name,
          text: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          // Correction comparaison ID (Int vs String)
          isMe: String(msg.sender_id) === String(user.id)
        }));
        setMessages(formatted);
      }
    } catch (err) { console.error("Erreur messages", err); }
  };

  // --- ACTIONS ---

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('v12_user', JSON.stringify(data.user));
        loadAllData(data.user.id);
        setView('app');
      } else {
        alert("Erreur: " + data.error);
      }
    } catch (err) {
      alert("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    
    const tempId = Date.now();
    const tempTask = { ...newTask, id: tempId, done: false, isTemp: true };
    setTasks(prev => [...prev, tempTask]);
    setShowModal(false);
    setNewTask({ title: '', time: '08:00', category: 'school' });

    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, userId: user.id })
      });
      if (res.ok) fetchTasks(user.id);
    } catch (err) { console.error(err); }
  };

  const toggleTask = async (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}/toggle`, { method: 'PUT' });
    } catch (err) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch (err) { console.error("Erreur delete", err); }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendEmail) return;
    if (friendEmail === user.email) { alert("Tu ne peux pas t'ajouter toi-même !"); return; }

    try {
      const res = await fetch(`${API_URL}/api/social/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendEmail })
      });
      const data = await res.json();
      if (data.success) {
        alert("Demande envoyée !");
        setShowFriendModal(false);
        setFriendEmail('');
      } else {
        alert("Erreur: " + data.error);
      }
    } catch (err) { alert("Erreur connexion"); }
  };

  // NOUVEAU: Accepter ami depuis les notifications/squad
  const handleAcceptFriend = async (friendId) => {
      try {
          const res = await fetch(`${API_URL}/api/social/friends/accept`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, friendId })
          });
          if(res.ok) {
              fetchFriends(user.id);
              fetchNotifications(user.id);
              alert("Ami accepté !");
          }
      } catch(err) { alert("Erreur lors de l'acceptation"); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msgContent = newMessage;
    setNewMessage(''); 
    try {
      await fetch(`${API_URL}/api/social/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: user.id, senderName: user.name, content: msgContent })
      });
      fetchMessages(); 
    } catch (err) { console.error(err); }
  };

  const sendAiMessage = (e) => {
    e.preventDefault();
    if (!newAiMessage.trim()) return;
    const userMsg = { id: Date.now(), sender: "Moi", text: newAiMessage, isMe: true };
    setAiMessages(prev => [...prev, userMsg]);
    setNewAiMessage('');
    setIsAiTyping(true); // Animation
    
    setTimeout(() => {
        let response = "Je n'ai pas compris. Peux-tu reformuler ?";
        const lowerMsg = userMsg.text.toLowerCase();
        
        // Logique IA simple mais efficace
        if (lowerMsg.includes('planning') || lowerMsg.includes('tache') || lowerMsg.includes('quoi faire')) {
            const schoolTasks = tasks.filter(t => t.category === 'school' && !t.done).length;
            const bizTasks = tasks.filter(t => t.category === 'business' && !t.done).length;
            response = `Analyse du jour : Tu as ${schoolTasks} tâches scolaires et ${bizTasks} tâches business en attente. Priorité à l'étude.`;
        } else if (lowerMsg.includes('fatigué') || lowerMsg.includes('pause')) {
            response = "La performance nécessite de la récupération. Prends 15min, bois de l'eau, et reviens.";
        } else if (lowerMsg.includes('business') || lowerMsg.includes('argent')) {
            response = "Le succès aime la vitesse. Concentre-toi sur les tâches à haute valeur ajoutée.";
        } else if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut')) {
            response = `Salut ${user.name}. Prêt à conquérir la journée ?`;
        }
        
      setAiMessages(prev => [...prev, { id: Date.now()+1, sender: "Coach IA", text: response, isMe: false }]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('v12_user');
    setTasks([]); setFriends([]); setMessages([]);
    setView('landing');
    setEmail('');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const T = THEMES[theme];

  // --- RENDU ADMIN ---
  const renderAdminPanel = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="text-rose-500" /> Interface Administrateur
              </h2>
              <span className="px-3 py-1 bg-rose-500/20 text-rose-500 rounded-full text-xs font-bold uppercase">Accès Restreint</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl ${T.surface} border border-rose-500/30`}>
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Users size={18}/> Utilisateurs Actifs (Simulation)</h3>
                  <div className="space-y-3">
                      {[user, {name: "Thomas", email: "thomas@biz.com", id: 2}, {name: "Sarah", email: "sarah@ifsi.com", id: 3}].map(u => (
                          u && <div key={u.id} className="flex justify-between items-center p-3 rounded-xl bg-black/20">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-rose-900 flex items-center justify-center font-bold text-rose-200">{u.name[0]}</div>
                                  <div>
                                      <p className="text-sm font-bold text-white">{u.name}</p>
                                      <p className="text-xs text-neutral-500">{u.email}</p>
                                  </div>
                              </div>
                              <span className="text-xs text-emerald-500">Actif</span>
                          </div>
                      ))}
                  </div>
              </div>
              <div className={`p-6 rounded-2xl ${T.surface} border border-rose-500/30`}>
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Activity size={18}/> Statistiques Globales</h3>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/20 rounded-xl">
                          <p className="text-xs text-neutral-500 uppercase">Messages Totaux</p>
                          <p className="text-2xl font-bold text-white">{messages.length + 142}</p>
                      </div>
                      <div className="p-4 bg-black/20 rounded-xl">
                          <p className="text-xs text-neutral-500 uppercase">Tâches Créées</p>
                          <p className="text-2xl font-bold text-white">{tasks.length + 89}</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  // ================= VUES =================

  // 1. LANDING PAGE
  if (view === 'landing') {
      return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${T.bg} ${T.text} relative overflow-hidden font-sans`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>
            <div className="relative z-10 text-center max-w-2xl px-4 animate-in fade-in zoom-in duration-700">
                <div className={`w-24 h-24 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-8 shadow-2xl`}>
                    <LayoutDashboard size={48} className="text-white" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">Planning OS</h1>
                <p className={`text-lg md:text-xl mb-12 max-w-lg mx-auto ${T.textMuted}`}>L'outil ultime.</p>
                <button onClick={() => setView('login')} className={`px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto`}>
                    Connexion <ArrowRight size={20} />
                </button>
                <div className="mt-24 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={`text-xs ${T.textMuted}`}>SERVER: {serverStatus.toUpperCase()}</span>
                </div>
            </div>
        </div>
      );
  }

  // 2. LOGIN
  if (view === 'login') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${T.bg} ${T.text}`}>
        <button onClick={() => setView('landing')} className={`absolute top-8 left-8 hover:text-white flex items-center gap-2 transition-colors ${T.textMuted}`}>
            <ArrowLeft size={20} /> Retour
        </button>
        
        <div className={`w-full max-w-sm p-8 rounded-3xl border ${T.border} ${T.surface} shadow-2xl relative overflow-hidden flex flex-col gap-6`}>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Connexion</h1>
            <p className={`text-sm ${T.textMuted} mt-2`}>Entre ton email pour accéder à ton espace.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col w-full gap-4">
            <div className={`flex items-center px-4 py-4 rounded-xl border ${T.border} ${T.input} focus-within:ring-1 transition duration-200`}>
                <Mail size={18} className={T.textMuted} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.com" className={`flex-1 bg-transparent border-none outline-none ml-3 text-base font-medium ${T.text}`} />
            </div>
            <button disabled={loading} className={`w-full py-4 rounded-xl font-bold text-white ${T.accentBg} hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2`}>
                {loading ? "Chargement..." : "Entrer dans le QG"} <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. APP
  return (
    <div className={`h-screen w-full flex flex-col md:flex-row overflow-hidden ${T.bg} ${T.text} font-sans selection:${T.accentBg} selection:text-white`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${T.sidebar} flex flex-col transform md:static md:translate-x-0 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shrink-0`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2 rounded-lg ${T.accentBg} text-white`}><LayoutDashboard size={20} /></div>
            <span className="font-bold text-lg tracking-tight">Planning OS</span>
          </div>
          
          <div className={`p-4 rounded-xl ${T.surface} mb-6 flex items-center gap-3 border ${T.border}`}>
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white`}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate capitalize">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span className={`text-[10px] ${T.textMuted}`}>En ligne</span></div>
            </div>
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-white/5 rounded-lg transition">
                <Bell size={18} className={T.textMuted} />
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
            </button>
          </div>

          <nav className="space-y-1">
            <NavItem icon={<Calendar />} label="Planning" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false)}} T={T} />
            <NavItem icon={<Users />} label="Squad & Chat" active={activeTab === 'social'} onClick={() => {setActiveTab('social'); setIsMobileMenuOpen(false)}} T={T} />
            <NavItem icon={<Bot />} label="Coach IA" active={activeTab === 'ai'} onClick={() => {setActiveTab('ai'); setIsMobileMenuOpen(false)}} T={T} badge="PRO" />
            
            {/* ADMIN LINK (Visible seulement si email contient 'admin') */}
            {user?.email?.includes('admin') && (
                <div className="mt-8 pt-4 border-t border-dashed border-neutral-800">
                    <p className="px-4 text-[10px] font-bold uppercase text-rose-500 mb-2">Zone Admin</p>
                    <button onClick={() => setActiveTab('admin')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all">
                        <ShieldCheck size={18} /> Administration
                    </button>
                </div>
            )}
          </nav>
        </div>
        <div className={`mt-auto p-4 border-t ${T.border} flex items-center justify-between`}>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-lg ${T.hover} ${T.textMuted}`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition"><LogOut size={18} /></button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className={`md:hidden flex items-center justify-between p-4 border-b ${T.border} ${T.sidebar} shrink-0`}>
          <span className="font-bold">Planning OS</span>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
        </header>

        {/* NOTIFICATIONS PANEL */}
        {showNotifications && (
            <div className={`absolute top-4 right-4 w-80 z-50 p-4 rounded-2xl border ${T.border} ${T.sidebar} shadow-2xl animate-in slide-in-from-top-2`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                </div>
                <div className="space-y-2">
                    {notifications.length === 0 && <p className={`text-xs ${T.textMuted}`}>Rien à signaler.</p>}
                    {notifications.map(n => (
                        <div key={n.id} className={`p-3 rounded-xl ${T.input} text-sm flex flex-col gap-2`}>
                            <div><span className="font-bold">{n.from_name}</span> {n.content}</div>
                            {n.type === 'friend_request' && (
                                <button onClick={() => handleAcceptFriend(n.from_user_id)} className={`text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold w-full`}>Accepter la demande</button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth">
          
          {/* DASHBOARD & ZONES */}
          {(activeTab === 'dashboard' || activeTab === 'business' || activeTab === 'school') && (
            <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-1 text-white">
                    {activeTab === 'dashboard' ? 'Tableau de Bord' : activeTab === 'business' ? 'QG Business' : 'QG Études'}
                  </h2>
                  <p className={T.textMuted}>Prêt à dominer la journée, <span className={`font-bold capitalize ${T.accentText}`}>{user?.name}</span> ?</p>
                </div>
                <div className="flex gap-2">
                    {/* TABS DE NAVIGATION RAPIDE */}
                    <button onClick={() => setActiveTab('school')} className={`px-4 py-2 rounded-xl border ${activeTab === 'school' ? 'bg-indigo-600 border-indigo-600 text-white' : `${T.border} ${T.textMuted} hover:${T.hover}`}`}>Études</button>
                    <button onClick={() => setActiveTab('business')} className={`px-4 py-2 rounded-xl border ${activeTab === 'business' ? 'bg-emerald-600 border-emerald-600 text-white' : `${T.border} ${T.textMuted} hover:${T.hover}`}`}>Business</button>
                    
                    <button onClick={() => setShowModal(true)} className={`px-4 py-2 rounded-xl ${T.accentBg} text-white font-bold shadow-lg flex items-center gap-2`}>
                        <Plus size={18} />
                    </button>
                </div>
              </div>

              {/* LISTE DES TÂCHES FILTRÉES */}
              <div className={`rounded-2xl ${T.surface} border ${T.border} overflow-hidden shadow-xl`}>
                <div className={`p-4 border-b ${T.border} flex justify-between items-center ${T.input} bg-opacity-50`}>
                  <h3 className="font-bold flex items-center gap-2"><Clock className={T.accentText} size={18} /> Timeline {activeTab !== 'dashboard' && `(${activeTab})`}</h3>
                  <button onClick={toggleFullscreen} className={T.textMuted}>{isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
                </div>
                <div className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                  {tasks.filter(t => activeTab === 'dashboard' || t.category === activeTab).length === 0 && (
                      <div className={`p-12 text-center ${T.textMuted} italic`}>
                          Aucune mission {activeTab !== 'dashboard' ? 'dans cette catégorie' : ''}. Ajoute quelque chose !
                      </div>
                  )}
                  {tasks.filter(t => activeTab === 'dashboard' || t.category === activeTab).map(task => (
                    <div key={task.id} className={`p-5 flex items-center gap-4 ${T.hover} transition group`}>
                      <span className={`font-mono text-sm font-bold w-12 ${T.textMuted} text-right`}>{task.time}</span>
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? 'bg-emerald-500 border-emerald-500' : `border-neutral-500 hover:${T.accentBorder}`}`}
                      >
                        {task.done && <CheckCircle2 size={14} className="text-white" />}
                      </button>
                      <div className={`flex-1 ${task.done ? 'line-through opacity-40' : ''}`}>
                        <p className="font-medium">{task.title}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${T.border} ${T.input} ${T.textMuted}`}>{task.category}</span>
                      <button onClick={() => deleteTask(task.id)} className="text-rose-500 p-2 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SOCIAL */}
          {activeTab === 'social' && (
            <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in">
              <div className={`w-full md:w-80 rounded-2xl border ${T.border} ${T.sidebar} p-4`}>
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold flex gap-2 items-center"><Users size={18}/> Ma Squad</h3><button onClick={() => setShowFriendModal(true)} className={`${T.accentText} hover:${T.accentLight} p-1 rounded transition`}><UserPlus size={18}/></button></div>
                <div className="space-y-2">
                  {friends.length === 0 && <p className={`text-xs ${T.textMuted} italic text-center py-4`}>Pas encore d'amis acceptés.</p>}
                  {/* AFFICHAGE DES DEMANDES EN ATTENTE */}
                  {notifications.filter(n => n.type === 'friend_request').length > 0 && (
                      <div className="mb-4">
                          <p className="text-[10px] uppercase font-bold text-neutral-500 mb-2">En attente</p>
                          {notifications.filter(n => n.type === 'friend_request').map(n => (
                              <div key={n.id} className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-2">
                                  <p className="text-xs mb-2"><span className="font-bold text-indigo-400">{n.from_name}</span> veut te rejoindre.</p>
                                  <button onClick={() => handleAcceptFriend(n.from_user_id)} className="w-full py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-500">Accepter</button>
                              </div>
                          ))}
                      </div>
                  )}
                  {friends.map(f => (
                    <div key={f.id} className={`p-3 rounded-xl border ${T.border} ${T.hover} flex items-center gap-3 cursor-pointer transition`}>
                      <div className="relative"><div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center font-bold text-white">{f.name[0]}</div><div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${f.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'}`}></div></div>
                      <div className='overflow-hidden'><p className="text-sm font-bold truncate">{f.name}</p><p className={`text-xs ${T.textMuted} truncate`}>{f.email}</p></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`flex-1 rounded-2xl border ${T.border} ${T.sidebar} flex flex-col overflow-hidden`}>
                <div className={`p-4 border-b ${T.border} flex justify-between items-center ${T.surface} bg-opacity-50`}>
                  <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full ${T.accentLight} ${T.accentText} flex items-center justify-center font-bold`}>#</div><div><p className="font-bold text-sm">Général</p><p className={`text-xs ${T.textMuted}`}>{friends.length} membres</p></div></div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-4 ${msg.isMe ? `${T.accentBg} text-white` : `${T.input} border ${T.border}`}`}>
                        {!msg.isMe && <p className={`text-xs font-bold mb-1 ${T.accentText}`}>{msg.sender}</p>}
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] opacity-60 text-right mt-1`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className={`p-4 border-t ${T.border} ${T.surface} flex gap-2`}>
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Message..." className={`flex-1 bg-transparent border-none outline-none text-sm px-2 ${T.text}`} />
                  <button className={`p-2 rounded-lg ${T.accentBg} text-white hover:opacity-90 transition`}><Send size={18} /></button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: AI */}
          {activeTab === 'ai' && (
            <div className="h-full flex flex-col max-w-3xl mx-auto animate-in slide-in-from-bottom-4">
              <div className={`p-4 mb-4 rounded-xl border ${T.border} ${T.surface} flex items-center gap-3`}>
                <div className={`p-2 ${T.accentLight} rounded-lg`}><Bot className={T.accentText} /></div>
                <div><h3 className="font-bold text-sm">Coach Stratégique</h3><p className={`text-xs ${T.textMuted}`}>Optimisation tactique activée.</p></div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {aiMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 ${msg.isMe ? `${T.accentBg} text-white` : `${T.input} border ${T.border}`}`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isAiTyping && <div className={`text-xs ${T.textMuted} animate-pulse ml-4`}>Le coach écrit...</div>}
                <div ref={aiEndRef} />
              </div>
              <form onSubmit={sendAiMessage} className={`p-2 border ${T.border} rounded-xl flex gap-2 ${T.surface} focus-within:ring-1 ${T.accentRing} transition`}>
                <input value={newAiMessage} onChange={e => setNewAiMessage(e.target.value)} placeholder="Pose une question..." className={`flex-1 bg-transparent px-4 outline-none ${T.text}`} />
                <button className={`p-3 rounded-lg ${T.accentBg} text-white hover:opacity-90 transition`}><Send size={18} /></button>
              </form>
            </div>
          )}

          {/* TAB: ADMIN (Visible uniquement si email admin) */}
          {activeTab === 'admin' && renderAdminPanel()}

        </div>
      </main>

      {/* MODAL TASK */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className={`${T.sidebar} border ${T.border} w-full max-w-md rounded-2xl p-6 shadow-2xl`}>
            <h3 className="text-xl font-bold mb-6">Ajouter Tâche</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input autoFocus value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className={`w-full p-3 rounded-lg border ${T.border} ${T.input} focus:ring-1 ${T.accentRing} outline-none`} placeholder="Titre..." />
              <div className="flex gap-4">
                <input type="time" value={newTask.time} onChange={e => setNewTask({...newTask, time: e.target.value})} className={`w-full p-3 rounded-lg border ${T.border} ${T.input} outline-none`} />
                <select value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} className={`w-full p-3 rounded-lg border ${T.border} ${T.input} outline-none`}>
                  <option value="school">Études</option><option value="business">Business</option><option value="health">Sport</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4"><button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-3 ${T.input} rounded-lg`}>Annuler</button><button className={`flex-1 py-3 ${T.accentBg} text-white rounded-lg`}>Valider</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FRIEND */}
      {showFriendModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className={`${T.sidebar} border ${T.border} w-full max-w-sm rounded-2xl p-6 shadow-2xl`}>
            <h3 className="font-bold mb-4">Recruter un allié</h3>
            <p className={`text-xs ${T.textMuted} mb-4`}>Entre l'email de ton ami.</p>
            <form onSubmit={handleAddFriend} className="flex gap-2">
              <input autoFocus value={friendEmail} onChange={e => setFriendEmail(e.target.value)} className={`flex-1 p-3 rounded-lg border ${T.border} ${T.input} outline-none`} placeholder="email@ami.com..." />
              <button className={`p-3 ${T.accentBg} text-white rounded-lg`}><Plus/></button>
            </form>
            <button onClick={() => setShowFriendModal(false)} className={`mt-4 text-xs w-full text-center ${T.textMuted} hover:${T.text}`}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick, T, badge }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${active ? `${T.accentLight} ${T.accentText}` : `${T.textMuted} ${T.hover} hover:${T.text}`}`}>
      {React.cloneElement(icon, { size: 18 })}
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${T.accentBg} text-white`}>{badge}</span>}
    </button>
  );
}
