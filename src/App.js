import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Calendar, CheckCircle2, Brain, Trophy, Wifi, AlertCircle, Clock, 
  Briefcase, GraduationCap, Dumbbell, Plus, Menu, X, Trash2, ArrowRight, 
  Users, Send, Settings, Mail, Lock, Share2, Key, Sun, Moon, LogOut,
  Maximize2, Minimize2, ArrowLeft, Bot, UserPlus, Fingerprint, Activity, Bell
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
    accentGradient: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
    accentText: 'text-emerald-500',
    accentBorder: 'border-emerald-500',
    accentRing: 'focus:ring-emerald-500',
    accentLight: 'bg-emerald-500/10',
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
    accentGradient: 'bg-gradient-to-r from-indigo-600 to-indigo-500',
    accentText: 'text-indigo-600',
    accentBorder: 'border-indigo-500',
    accentRing: 'focus:ring-indigo-500',
    accentLight: 'bg-indigo-500/10',
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
  
  // App States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); // Panneau notifs
  
  // Data
  const [tasks, setTasks] = useState([]);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [aiMessages, setAiMessages] = useState([{ id: 1, sender: "Coach IA", text: "Je suis prêt. Quel est ton objectif aujourd'hui ?", isMe: false }]);
  
  // Inputs
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newMessage, setNewMessage] = useState('');
  const [newAiMessage, setNewAiMessage] = useState('');
  const [newTask, setNewTask] = useState({ title: '', time: '08:00', category: 'school' });
  const [friendEmail, setFriendEmail] = useState('');

  const messagesEndRef = useRef(null);
  const aiEndRef = useRef(null);

  // --- INITIALISATION ---
  useEffect(() => {
    checkServer();
    const savedUser = localStorage.getItem('v9_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadAllData(parsedUser.id);
      setView('app');
    }
  }, []);

  // Polling pour simuler le temps réel (toutes les 5s)
  useEffect(() => {
    let interval;
    if (user && view === 'app') {
      interval = setInterval(() => {
        if (activeTab === 'social') fetchMessages();
        fetchNotifications(user.id);
        fetchFriends(user.id); // Met à jour le statut en ligne
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [user, view, activeTab]);

  const loadAllData = (userId) => {
    fetchTasks(userId);
    fetchFriends(userId);
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
        // Simulation statut en ligne basé sur last_active (ou aléatoire pour la démo si pas dispo)
        const enrichedData = data.map(f => ({
            ...f,
            status: Math.random() > 0.5 ? 'online' : 'offline' // Remplacer par vraie logique plus tard
        }));
        setFriends(enrichedData);
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
          isMe: msg.sender_id === user.id
        }));
        setMessages(formatted);
      }
    } catch (err) { console.error("Erreur messages", err); }
  };

  // --- ACTIONS ---

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    const tempTask = { ...newTask, id: Date.now(), done: false };
    setTasks(prev => [...prev, tempTask]);
    setShowModal(false);
    setNewTask({ title: '', time: '08:00', category: 'school' });

    try {
      await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, userId: user.id })
      });
      fetchTasks(user.id);
    } catch (err) { console.error(err); }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendEmail) return;

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgContent = newMessage;
    setNewMessage(''); 

    try {
      await fetch(`${API_URL}/api/social/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          senderId: user.id, 
          senderName: user.name, 
          content: msgContent 
        })
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
    
    setTimeout(() => {
        let response = "Je n'ai pas compris.";
        const lowerMsg = userMsg.text.toLowerCase();
        if (lowerMsg.includes('planning') || lowerMsg.includes('tache')) {
            const undone = tasks.filter(t => !t.done).length;
            response = `Analyse tactique : Tu as ${undone} tâches critiques restantes.`;
        } else if (lowerMsg.includes('fatigué')) {
            response = "Prends 15min de repos sans écran.";
        } else {
            response = "Reçu. L'action bat la réflexion.";
        }
      setAiMessages(prev => [...prev, { id: Date.now()+1, sender: "Coach IA", text: response, isMe: false }]);
    }, 1200);
  };

  // --- AUTH ---
  const handleSendEmail = (e) => { e.preventDefault(); if(email) setTimeout(() => setView('otp'), 800); };
  
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('v9_user', JSON.stringify(data.user));
        loadAllData(data.user.id);
        setView('app');
      }
    } catch (err) { alert("Erreur connexion serveur"); }
  };
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('v9_user');
    setTasks([]); setFriends([]); setMessages([]); setNotifications([]);
    setView('landing');
    setEmail(''); setOtp(['', '', '', '']);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value && element.nextSibling) element.nextSibling.focus();
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

  // ================= VUES =================

  // 1. LANDING PAGE
  if (view === 'landing') {
      return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${T.bg} ${T.text} relative overflow-hidden font-sans`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>
            <div className="relative z-10 text-center max-w-2xl px-4 animate-in fade-in zoom-in duration-700">
                <div className={`w-24 h-24 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-${T.accentText}/20`}>
                    <LayoutDashboard size={48} className="text-white" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
                    Planning OS
                </h1>
                <p className={`text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed ${T.textMuted}`}>
                    L'architecture de productivité ultime. <br/> 
                    <span className={`${T.accentText}`}>Forgé pour l'élite.</span>
                </p>
                <button onClick={() => setView('login')} className={`px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-white/10 flex items-center gap-2 mx-auto`}>
                    Connexion Membre <ArrowRight size={20} />
                </button>
                <div className="mt-24 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                    <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${T.textMuted}`}>ARCHITECTURE BY NATHAN</p>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className={`text-[10px] font-mono ${T.textMuted}`}>SERVER STATUS: {serverStatus.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // 2. LOGIN & OTP
  if (view === 'login' || view === 'otp') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${T.bg} ${T.text}`}>
        <button onClick={() => setView('landing')} className={`absolute top-8 left-8 hover:text-white flex items-center gap-2 transition-colors ${T.textMuted}`}>
            <ArrowLeft size={20} /> Retour
        </button>
        
        <div className={`w-full max-w-sm p-8 rounded-3xl border ${T.border} ${T.surface} shadow-2xl relative overflow-hidden flex flex-col gap-6`}>
          <div className="text-center flex flex-col items-center gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl ${T.accentBg} flex items-center justify-center shadow-lg shadow-${T.accentText}/20`}>
              <Fingerprint className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Identification</h1>
              <p className={`text-xs font-medium ${T.textMuted} mt-1`}>Accès Sécurisé V11</p>
            </div>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleSendEmail} className="flex flex-col w-full gap-4 animate-in slide-in-from-right-8 duration-300">
              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold uppercase tracking-wider ml-1 ${T.textMuted}`}>Email Professionnel</label>
                <div className={`flex items-center px-4 py-3.5 rounded-xl border ${T.border} ${T.input} focus-within:ring-1 ${T.accentRing} transition duration-200`}>
                  <Mail size={18} className={T.textMuted} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className={`flex-1 bg-transparent border-none outline-none ml-3 text-sm font-medium placeholder:${T.textMuted} ${T.text}`} />
                </div>
              </div>
              <button className={`w-full py-4 rounded-xl font-bold text-white ${T.accentGradient} hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-${T.accentText}/20 flex items-center justify-center gap-2 mt-2`}>
                Envoyer le code <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col w-full gap-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center">
                <p className={`text-xs ${T.textMuted}`}>Code (Simulé) pour <span className="font-bold text-white">{email}</span></p>
              </div>
              <div className="flex justify-center gap-3">
                {otp.map((d, i) => (
                  <input key={i} type="text" maxLength="1" className={`w-12 h-14 text-center text-xl font-bold rounded-xl border ${T.border} ${T.input} focus:ring-1 ${T.accentRing} outline-none transition-all ${T.text}`} value={d} onChange={e => handleOtpChange(e.target, i)} onFocus={e => e.target.select()} />
                ))}
              </div>
              <button className={`w-full py-4 rounded-xl font-bold text-white ${T.accentBg} hover:opacity-90 transition shadow-lg mt-2`}>Entrer</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 3. APPLICATION PRINCIPALE
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
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
          </div>

          <nav className="space-y-1 overflow-y-auto flex-1">
            <NavItem icon={<Calendar />} label="Planning" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false)}} T={T} />
            <NavItem icon={<Bot />} label="Coach IA" active={activeTab === 'ai'} onClick={() => {setActiveTab('ai'); setIsMobileMenuOpen(false)}} T={T} badge="PRO" />
            <NavItem icon={<Users />} label="Squad & Chat" active={activeTab === 'social'} onClick={() => {setActiveTab('social'); setIsMobileMenuOpen(false)}} T={T} />
            
            <div className={`my-4 border-t ${T.border}`}></div>
            <p className={`px-4 text-[10px] font-bold uppercase ${T.textMuted} mb-2`}>Focus Zones</p>
            
            <NavItem icon={<Briefcase />} label="Business" active={activeTab === 'business'} onClick={() => {setActiveTab('business'); setIsMobileMenuOpen(false)}} T={T} />
            <NavItem icon={<GraduationCap />} label="Études" active={activeTab === 'school'} onClick={() => {setActiveTab('school'); setIsMobileMenuOpen(false)}} T={T} />
          </nav>
        </div>
        <div className={`mt-auto p-4 border-t ${T.border} flex items-center justify-between`}>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-lg ${T.hover} ${T.textMuted}`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition"><LogOut size={18} /></button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className={`md:hidden flex items-center justify-between p-4 border-b ${T.border} ${T.sidebar} shrink-0`}>
          <span className="font-bold">Planning OS</span>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
        </header>

        {/* PANNEAU NOTIFICATIONS (OVERLAY) */}
        {showNotifications && (
            <div className={`absolute top-4 right-4 w-80 z-50 p-4 rounded-2xl border ${T.border} ${T.sidebar} shadow-2xl animate-in slide-in-from-top-2`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                </div>
                <div className="space-y-2">
                    {notifications.length === 0 && <p className={`text-xs ${T.textMuted}`}>Rien à signaler.</p>}
                    {notifications.map(n => (
                        <div key={n.id} className={`p-3 rounded-xl ${T.input} text-sm`}>
                            <span className="font-bold">{n.from_name}</span> {n.content}
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth">
          
          {/* TAB: DASHBOARD */}
          {(activeTab === 'dashboard' || activeTab === 'business' || activeTab === 'school') && (
            <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-1 text-white">Tableau de Bord</h2>
                  <p className={T.textMuted}>Prêt à dominer la journée, <span className={`font-bold capitalize ${T.accentText}`}>{user?.name}</span> ?</p>
                </div>
                <button onClick={() => setShowModal(true)} className={`px-6 py-3 rounded-xl ${T.accentBg} text-white font-bold shadow-lg shadow-${T.accentText}/20 flex items-center gap-2 transition active:scale-95`}>
                  <Plus size={20} /> Nouvelle Tâche
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard icon={<CheckCircle2 />} label="Tâches Finies" value={`${tasks.filter(t => t.done).length}/${tasks.length}`} color="emerald" T={T} />
                <StatCard icon={<AlertCircle />} label="Urgence" value="Dossier" color="indigo" T={T} />
                <StatCard icon={<Trophy />} label="Mode Focus" value="ACTIVÉ" color="amber" T={T} />
              </div>

              {/* Liste des tâches */}
              <div className={`rounded-2xl ${T.surface} border ${T.border} overflow-hidden shadow-xl`}>
                <div className={`p-4 border-b ${T.border} flex justify-between items-center ${T.input} bg-opacity-50`}>
                  <h3 className="font-bold flex items-center gap-2"><Clock className={T.accentText} size={18} /> Timeline</h3>
                  <button onClick={toggleFullscreen} className={T.textMuted}>{isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
                </div>
                <div className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                  {tasks.length === 0 && <div className={`p-12 text-center ${T.textMuted} italic`}>Aucune mission. Ajoute quelque chose !</div>}
                  {tasks.filter(t => activeTab === 'dashboard' || t.category === activeTab).map(task => (
                    <div key={task.id} className={`p-5 flex items-center gap-4 ${T.hover} transition group`}>
                      <span className={`font-mono text-sm font-bold w-12 ${T.textMuted} text-right`}>{task.time}</span>
                      <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? 'bg-emerald-500 border-emerald-500' : `border-neutral-500 hover:${T.accentBorder}`}`}>
                        {task.done && <CheckCircle2 size={14} className="text-white" />}
                      </button>
                      <div className={`flex-1 ${task.done ? 'line-through opacity-40' : ''}`}>
                        <p className="font-medium">{task.title}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${T.border} ${T.input} ${T.textMuted}`}>{task.category}</span>
                      <button className="text-rose-500 p-2 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: IA */}
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
                <div ref={aiEndRef} />
              </div>
              <form onSubmit={sendAiMessage} className={`p-2 border ${T.border} rounded-xl flex gap-2 ${T.surface} focus-within:ring-1 ${T.accentRing} transition`}>
                <input value={newAiMessage} onChange={e => setNewAiMessage(e.target.value)} placeholder="Pose une question..." className={`flex-1 bg-transparent px-4 outline-none ${T.text}`} />
                <button className={`p-3 rounded-lg ${T.accentBg} text-white hover:opacity-90 transition`}><Send size={18} /></button>
              </form>
            </div>
          )}

          {/* TAB: SOCIAL */}
          {activeTab === 'social' && (
            <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in">
              {/* LISTE AMIS */}
              <div className={`w-full md:w-80 rounded-2xl border ${T.border} ${T.sidebar} p-4`}>
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold flex gap-2 items-center"><Users size={18}/> Ma Squad</h3><button onClick={() => setShowFriendModal(true)} className={`${T.accentText} hover:${T.accentLight} p-1 rounded transition`}><UserPlus size={18}/></button></div>
                <div className="space-y-2">
                  {friends.length === 0 && <p className={`text-xs ${T.textMuted} italic text-center py-4`}>Invite des amis avec leur email.</p>}
                  {friends.map(f => (
                    <div key={f.id} className={`p-3 rounded-xl border ${T.border} ${T.hover} flex items-center gap-3 cursor-pointer transition`}>
                      <div className="relative"><div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center font-bold text-white">{f.name[0]}</div><div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${f.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'}`}></div></div>
                      <div className='overflow-hidden'><p className="text-sm font-bold truncate">{f.name}</p><p className={`text-xs ${T.textMuted} truncate`}>{f.status === 'online' ? 'En ligne' : 'Hors ligne'}</p></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CHAT */}
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
            <p className={`text-xs ${T.textMuted} mb-4`}>Entre l'email de ton ami pour l'ajouter.</p>
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

// --- SUB COMPONENTS ---
function NavItem({ icon, label, active, onClick, T, badge }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${active ? `${T.accentLight} ${T.accentText}` : `${T.textMuted} ${T.hover} hover:${T.text}`}`}>
      {React.cloneElement(icon, { size: 18 })}
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${T.accentBg} text-white`}>{badge}</span>}
    </button>
  );
}

function StatCard({ icon, label, value, color, T }) {
  const colors = {
    emerald: `text-emerald-500 bg-emerald-500/10`,
    indigo: `text-indigo-500 bg-indigo-500/10`,
    amber: `text-amber-500 bg-amber-500/10`
  };
  return (
    <div className={`p-5 rounded-2xl border ${T.border} ${T.sidebar} hover:${T.border.replace('border-','border-opacity-50 ')} transition`}>
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
      <p className={`text-xs font-bold uppercase ${T.textMuted} tracking-wider`}>{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
