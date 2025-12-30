import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Calendar, CheckCircle2, Brain, Trophy, Wifi, AlertCircle, Clock, 
  Briefcase, GraduationCap, Dumbbell, Plus, Menu, X, Trash2, ArrowRight, 
  Users, Send, Settings, Mail, Lock, Share2, Key, Sun, Moon, LogOut,
  Maximize2, Minimize2, ArrowLeft, Bot, UserPlus, Fingerprint, Eye, EyeOff
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
  // --- STATES ---
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null); 
  const [view, setView] = useState('landing'); // landing, login, otp, app
  const [serverStatus, setServerStatus] = useState('checking');
  
  // App Core
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Data (Initialement vide pour la sécurité)
  const [tasks, setTasks] = useState([]);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([{ id: 1, sender: "Coach IA", text: "Je suis prêt. Donne-moi tes objectifs du jour.", isMe: false }]);
  
  // Inputs
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newMessage, setNewMessage] = useState('');
  const [newAiMessage, setNewAiMessage] = useState('');
  const [newTask, setNewTask] = useState({ title: '', time: '08:00', category: 'school' });
  const [newFriendId, setNewFriendId] = useState('');

  const messagesEndRef = useRef(null);
  const aiEndRef = useRef(null);

  // --- EFFECTS ---
  useEffect(() => {
    checkServer();
    // On ne charge les données QUE si un utilisateur est connecté
    const savedUser = localStorage.getItem('v9_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      loadUserData(); // Charger les données privées
      setView('app');
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('v9_tasks', JSON.stringify(tasks));
      // Scroll auto chat
      if (activeTab === 'social' && messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      if (activeTab === 'ai' && aiEndRef.current) aiEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tasks, messages, aiMessages, activeTab, user]);

  // --- ACTIONS ---
  
  const loadUserData = () => {
    // Simulation : Récupération des données depuis le LocalStorage (ou Backend plus tard)
    // C'est ici qu'on protège les données : on ne les charge que si Auth OK
    const savedTasks = JSON.parse(localStorage.getItem('v9_tasks')) || [];
    setTasks(savedTasks);
    // Mock Friends pour la démo
    setFriends([
      { id: 1, name: "Sarah IFSI", status: "online", activity: "Révise UE 2.1" },
      { id: 2, name: "Thomas Biz", status: "offline", activity: "Dernière connexion: 2h" },
    ]);
  };

  const checkServer = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hello`);
      setServerStatus(res.ok ? 'online' : 'offline');
    } catch { setServerStatus('offline'); }
  };

  // Auth Flow
  const handleSendEmail = (e) => { e.preventDefault(); if(email) setTimeout(() => setView('otp'), 800); };
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const fakeUser = { name: email.split('@')[0], email, id: "user_" + Date.now() };
    setUser(fakeUser);
    localStorage.setItem('v9_user', JSON.stringify(fakeUser));
    loadUserData();
    setView('app');
  };
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('v9_user');
    // On vide la mémoire vive pour la sécurité
    setTasks([]);
    setFriends([]);
    setMessages([]);
    setView('landing'); // Retour à la page publique vierge
    setEmail('');
    setOtp(['', '', '', '']);
  };

  // Features
  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    const task = { id: Date.now(), ...newTask, done: false };
    setTasks(prev => [...prev, task]);
    setShowModal(false);
    setNewTask({ title: '', time: '08:00', category: 'school' });
  };

  const addFriend = (e) => {
    e.preventDefault();
    if (!newFriendId) return;
    // Simulation appel API recherche ami
    setFriends([...friends, { id: Date.now(), name: `Utilisateur #${newFriendId.slice(0,4)}`, status: 'offline', activity: 'Ajouté à l\'instant' }]);
    setShowFriendModal(false);
    setNewFriendId('');
  };

  const sendAiMessage = (e) => {
    e.preventDefault();
    if (!newAiMessage.trim()) return;
    const userMsg = { id: Date.now(), sender: "Moi", text: newAiMessage, isMe: true };
    setAiMessages(prev => [...prev, userMsg]);
    setNewAiMessage('');
    
    // IA COACH INTELLIGENT (Simulation logique)
    setTimeout(() => {
        let response = "Je n'ai pas compris.";
        const lowerMsg = userMsg.text.toLowerCase();
        
        if (lowerMsg.includes('planning') || lowerMsg.includes('organisation')) {
            const taskCount = tasks.length;
            const undone = tasks.filter(t => !t.done).length;
            response = `Analyse de ton planning : Tu as ${taskCount} tâches, dont ${undone} restantes. Concentre-toi sur la priorité n°1.`;
        } else if (lowerMsg.includes('fatigue') || lowerMsg.includes('pause')) {
            response = "La récupération fait partie de la performance. Prends 20min de sieste ou de marche sans téléphone.";
        } else if (lowerMsg.includes('suggère') || lowerMsg.includes('aide')) {
            response = "Basé sur tes objectifs, je te suggère d'ajouter une session de 'Deep Work' de 90min demain matin à 08:00.";
        } else {
            response = "Reçu. N'oublie pas : L'action bat toujours la réflexion. Au travail.";
        }
        
      setAiMessages(prev => [...prev, { id: Date.now()+1, sender: "Coach IA", text: response, isMe: false }]);
    }, 1000);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "Moi", text: newMessage, time: "Now", isMe: true }]);
    setNewMessage('');
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

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value && element.nextSibling) element.nextSibling.focus();
  };

  const T = THEMES[theme];

  // --- VIEW: LANDING PAGE (Publique & Vierge) ---
  if (view === 'landing') {
      return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white relative overflow-hidden`}>
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black opacity-80"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            
            <div className="relative z-10 text-center max-w-2xl px-4">
                <div className="w-20 h-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/10 animate-in fade-in zoom-in duration-1000">
                    <LayoutDashboard size={40} className="text-white" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
                    Planning OS
                </h1>
                <p className="text-neutral-400 text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed">
                    L'architecture de productivité ultime. <br/> 
                    Conçu pour l'élite, forgé dans le code.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button onClick={() => setView('login')} className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-white/10 flex items-center gap-2">
                        Connexion Membre <ArrowRight size={20} />
                    </button>
                    <a href="mailto:contact@nathan-dev.com" className="px-8 py-4 rounded-full border border-white/20 text-neutral-300 font-bold text-lg hover:bg-white/5 transition-colors">
                        Me Contacter
                    </a>
                </div>

                <div className="mt-24 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                    <p className="text-xs text-neutral-600 uppercase tracking-widest font-bold">Créé par Nathan</p>
                    <div className="flex gap-2">
                        <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-neutral-600 font-mono">SYSTEM STATUS: {serverStatus.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- VIEW: LOGIN / OTP ---
  if (view === 'login' || view === 'otp') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 bg-black text-white`}>
        <button onClick={() => setView('landing')} className="absolute top-8 left-8 text-neutral-500 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft size={20} /> Retour
        </button>
        
        <div className={`w-full max-w-sm p-8 rounded-3xl border border-neutral-800 bg-neutral-900/50 shadow-2xl relative overflow-hidden flex flex-col gap-6`}>
          <div className="text-center flex flex-col items-center gap-4 mb-2">
            <div className={`w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20`}>
              <Fingerprint className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Identification</h1>
              <p className="text-xs font-medium text-neutral-500 mt-1">Accès Sécurisé V9</p>
            </div>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleSendEmail} className="flex flex-col w-full gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 ml-1">Email</label>
                <div className="flex items-center px-4 py-3.5 rounded-xl border border-neutral-800 bg-neutral-950 focus-within:ring-2 focus-within:ring-emerald-500/50 transition duration-200">
                  <Mail size={18} className="text-neutral-500" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="flex-1 bg-transparent border-none outline-none ml-3 text-sm text-white placeholder:text-neutral-700 font-medium" />
                </div>
              </div>
              <button className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-2">
                Envoyer le code <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col w-full gap-6">
              <div className="text-center">
                <p className="text-xs text-neutral-400">Code envoyé à <span className="font-bold text-white">{email}</span></p>
              </div>
              <div className="flex justify-center gap-3">
                {otp.map((d, i) => (
                  <input key={i} type="text" maxLength="1" className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-neutral-800 bg-neutral-950 focus:ring-2 focus:ring-emerald-500 outline-none text-white transition-all" value={d} onChange={e => handleOtpChange(e.target, i)} onFocus={e => e.target.select()} />
                ))}
              </div>
              <button className="w-full py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg mt-2">Déverrouiller</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW: APP ---
  return (
    <div className={`h-screen w-full flex flex-col md:flex-row overflow-hidden ${T.bg} ${T.text}`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${T.sidebar} border-r ${T.border} flex flex-col transform md:static md:translate-x-0 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shrink-0`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2 rounded-lg ${T.accentBg} text-white`}><LayoutDashboard size={20} /></div>
            <span className="font-bold text-lg tracking-tight">Planning OS</span>
          </div>
          <div className={`p-4 rounded-xl border ${T.border} ${T.surface} mb-6 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white`}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate capitalize">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className={`text-[10px] ${T.textMuted}`}>ID: {user?.id?.slice(-4)}</span></div>
            </div>
          </div>
          <nav className="space-y-1 overflow-y-auto flex-1">
            <NavItem icon={<Calendar />} label="Planning" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false)}} T={T} />
            <NavItem icon={<Bot />} label="Coach IA" active={activeTab === 'ai'} onClick={() => {setActiveTab('ai'); setIsMobileMenuOpen(false)}} T={T} badge="PRO" />
            <NavItem icon={<Users />} label="Squad" active={activeTab === 'social'} onClick={() => {setActiveTab('social'); setIsMobileMenuOpen(false)}} T={T} />
            <div className={`my-4 border-t ${T.border}`}></div>
            <p className={`px-4 text-[10px] font-bold uppercase ${T.textMuted} mb-2`}>Focus</p>
            <NavItem icon={<Briefcase />} label="Business" active={activeTab === 'business'} onClick={() => {setActiveTab('business'); setIsMobileMenuOpen(false)}} T={T} />
            <NavItem icon={<GraduationCap />} label="Études IFSI" active={activeTab === 'school'} onClick={() => {setActiveTab('school'); setIsMobileMenuOpen(false)}} T={T} />
          </nav>
        </div>
        <div className={`mt-auto p-4 border-t ${T.border} flex items-center justify-between`}>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-lg ${T.hover} ${T.textMuted}`}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button onClick={handleLogout} className={`p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition`}><LogOut size={18} /></button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className={`md:hidden flex items-center justify-between p-4 border-b ${T.border} ${T.sidebar} shrink-0`}>
          {activeTab !== 'dashboard' && <button onClick={() => setActiveTab('dashboard')} className={T.textMuted}><ArrowLeft /></button>}
          <span className="font-bold">Planning OS</span>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' || activeTab === 'business' || activeTab === 'school' ? (
            <>
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-1">Tableau de Bord</h2>
                  <p className={T.textMuted}>Prêt à dominer, <span className={`${T.accentText} font-bold capitalize`}>{user?.name}</span> ?</p>
                </div>
                <button onClick={() => setShowModal(true)} className={`px-6 py-3 rounded-xl ${T.accentBg} text-white font-bold shadow-lg flex items-center gap-2`}>
                  <Plus size={20} /> Ajouter
                </button>
              </div>
              <div className={`rounded-2xl border ${T.border} ${T.sidebar} overflow-hidden shadow-xl`}>
                <div className={`p-4 border-b ${T.border} flex justify-between items-center bg-neutral-900/30`}>
                  <h3 className="font-bold flex items-center gap-2"><Clock className={T.accentText} size={18} /> Timeline</h3>
                  <button onClick={toggleFullscreen} className={T.textMuted}>{isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
                </div>
                <div className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                  {tasks.length === 0 && <div className="p-8 text-center text-neutral-500">Aucune tâche. Ajoute quelque chose !</div>}
                  {tasks.filter(t => activeTab === 'dashboard' || t.category === activeTab).map(task => (
                    <div key={task.id} className={`p-5 flex items-center gap-4 ${T.hover} transition group`}>
                      <span className={`font-mono text-sm font-bold w-12 ${T.textMuted}`}>{task.time}</span>
                      <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, done: !t.done} : t))} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? 'bg-emerald-500 border-emerald-500' : `border-neutral-500 hover:border-emerald-500`}`}>
                        {task.done && <CheckCircle2 size={14} className="text-white" />}
                      </button>
                      <div className={`flex-1 ${task.done ? 'line-through opacity-40' : ''}`}><p className="font-medium">{task.title}</p></div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${T.border} ${T.input} ${T.textMuted}`}>{task.category}</span>
                      <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-rose-500 p-2 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : activeTab === 'ai' ? (
            /* TAB: IA */
            <div className="h-full flex flex-col">
              <div className={`p-4 mb-4 rounded-xl border ${T.border} ${T.input} flex items-center gap-3`}>
                <Bot className={T.accentText} />
                <p className="text-sm">Je peux analyser ton planning et te suggérer des optimisations.</p>
              </div>
              <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                {aiMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.isMe ? `${T.accentBg} text-white` : `${T.input} border ${T.border}`}`}>
                      <div className="flex items-center gap-2 mb-1"><Bot size={14} className={msg.isMe ? 'hidden' : ''} /><span className="text-xs font-bold">{msg.sender}</span></div>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={aiEndRef} />
              </div>
              <form onSubmit={sendAiMessage} className={`p-2 border ${T.border} rounded-xl flex gap-2 ${T.surface}`}>
                <input value={newAiMessage} onChange={e => setNewAiMessage(e.target.value)} placeholder="Demande un conseil..." className={`flex-1 bg-transparent px-4 outline-none ${T.text}`} />
                <button className={`p-3 rounded-lg ${T.accentBg} text-white`}><Send size={18} /></button>
              </form>
            </div>
          ) : activeTab === 'social' ? (
            /* TAB: SOCIAL */
            <div className="h-full flex flex-col md:flex-row gap-6">
              <div className={`w-full md:w-72 rounded-2xl border ${T.border} ${T.sidebar} p-4`}>
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold flex gap-2"><Users size={18}/> Amis</h3><button onClick={() => setShowFriendModal(true)} className={T.accentText}><UserPlus size={18}/></button></div>
                <div className="space-y-2">
                    {friends.length === 0 && <p className="text-xs text-neutral-500 italic">Aucun ami pour l'instant.</p>}
                    {friends.map(f => (
                  <div key={f.id} className={`p-3 rounded-xl border ${T.border} ${T.hover} flex items-center gap-3`}>
                    <div className={`w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center font-bold`}>{f.name[0]}</div>
                    <div><p className="text-sm font-bold">{f.name}</p><p className={`text-xs ${T.textMuted}`}>{f.status}</p></div>
                  </div>
                ))}</div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      {/* MODAL TASK */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`${T.sidebar} border ${T.border} w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95`}>
            <h3 className="text-xl font-bold mb-6">Ajouter Tâche</h3>
            <form onSubmit={addTask} className="space-y-4">
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
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className={`${T.sidebar} border ${T.border} w-full max-w-sm rounded-2xl p-6 shadow-2xl`}>
            <h3 className="font-bold mb-4">Ajouter un allié</h3>
            <form onSubmit={addFriend} className="flex gap-2">
              <input autoFocus value={newFriendId} onChange={e => setNewFriendId(e.target.value)} className={`flex-1 p-3 rounded-lg border ${T.border} ${T.input} outline-none`} placeholder="ID Utilisateur (ex: 8329)..." />
              <button className={`p-3 ${T.accentBg} text-white rounded-lg`}><Plus/></button>
            </form>
            <button onClick={() => setShowFriendModal(false)} className="mt-4 text-xs w-full text-center opacity-50">Fermer</button>
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
