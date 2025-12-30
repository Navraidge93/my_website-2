import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Calendar, CheckCircle2, Brain, Trophy, Wifi, AlertCircle, Clock, 
  Briefcase, GraduationCap, Dumbbell, Plus, Menu, X, Trash2, ArrowRight, 
  Users, Send, Settings, Mail, Lock, Share2, Key, Sun, Moon, LogOut,
  Maximize2, Minimize2, ArrowLeft, Bot, UserPlus, Fingerprint, Activity
} from 'lucide-react';

// --- CONFIGURATION ---
const API_URL = "https://backend-production-c3b5.up.railway.app";

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
  
  // Data
  const [tasks, setTasks] = useState([]);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([{ id: 1, sender: "Coach IA", text: "Je suis prêt. Quel est ton objectif aujourd'hui ?", isMe: false }]);
  
  // Inputs
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newMessage, setNewMessage] = useState('');
  const [newAiMessage, setNewAiMessage] = useState('');
  const [newTask, setNewTask] = useState({ title: '', time: '08:00', category: 'school' });
  const [newFriendId, setNewFriendId] = useState('');

  const messagesEndRef = useRef(null);
  const aiEndRef = useRef(null);

  // --- INITIALISATION ---
  useEffect(() => {
    checkServer();
    const savedUser = localStorage.getItem('v9_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchTasks(parsedUser.id); // Charger les vraies tâches
      setView('app');
    }
  }, []);

  // --- API CALLS (LE CŒUR DU SYSTÈME) ---

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
    } catch (err) { console.error("Erreur chargement tâches", err); }
  };

  const saveTaskToDb = async (task) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: task.title,
          time: task.time,
          category: task.category
        })
      });
      if (res.ok) {
        const savedTask = await res.json();
        setTasks(prev => [...prev, savedTask]); // On ajoute la version confirmée par la BDD
      }
    } catch (err) { console.error("Erreur sauvegarde", err); }
  };

  const toggleTaskDb = async (taskId) => {
    // Optimistic UI update (on change l'interface tout de suite)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}/toggle`, { method: 'PUT' });
    } catch (err) { console.error("Erreur toggle", err); }
  };

  const deleteTaskDb = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch (err) { console.error("Erreur delete", err); }
  };

  // --- AUTHENTIFICATION ---
  const handleSendEmail = (e) => { e.preventDefault(); if(email) setTimeout(() => setView('otp'), 800); };
  
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    // VRAIE CONNEXION BACKEND
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (data.success) {
        const userData = data.user;
        setUser(userData);
        localStorage.setItem('v9_user', JSON.stringify(userData));
        fetchTasks(userData.id); // Charger ses données
        setView('app');
      } else {
        alert("Erreur de connexion : " + data.error);
      }
    } catch (err) {
      alert("Impossible de joindre le serveur.");
    }
  };
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('v9_user');
    setTasks([]); 
    setView('landing');
    setEmail(''); setOtp(['', '', '', '']);
  };

  // --- FEATURES UI ---
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    // On envoie au backend
    saveTaskToDb(newTask);
    setShowModal(false);
    setNewTask({ title: '', time: '08:00', category: 'school' });
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

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "Moi", text: newMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isMe: true }]);
    setNewMessage('');
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

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value && element.nextSibling) element.nextSibling.focus();
  };

  // --- STYLES ---
  const THEME = {
    bg: 'bg-black',
    text: 'text-zinc-100',
    sidebar: 'bg-zinc-950 border-r border-zinc-800',
    surface: 'bg-zinc-900 border border-zinc-800',
    accent: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    accentText: 'text-emerald-500',
    input: 'bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
    muted: 'text-zinc-500'
  };

  // ================= VUES =================

  // 1. LANDING PAGE
  if (view === 'landing') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white relative overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80"></div>
            <div className="relative z-10 text-center max-w-2xl px-4 animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
                    <LayoutDashboard size={48} className="text-white" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                    Planning OS
                </h1>
                <p className="text-zinc-400 text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed">
                    L'architecture de productivité ultime. <br/> 
                    <span className="text-emerald-500/80">Forgé pour l'élite.</span>
                </p>
                <button onClick={() => setView('login')} className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-white/10 flex items-center gap-2 mx-auto">
                    Connexion Membre <ArrowRight size={20} />
                </button>
                <div className="mt-24 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-bold">ARCHITECTURE BY NATHAN</p>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className="text-[10px] text-zinc-500 font-mono">SERVER STATUS: {serverStatus.toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // 2. LOGIN & OTP
  if (view === 'login' || view === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white">
        <button onClick={() => setView('landing')} className="absolute top-8 left-8 text-zinc-500 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft size={20} /> Retour
        </button>
        
        <div className="w-full max-w-sm p-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 shadow-2xl relative overflow-hidden flex flex-col gap-6">
          <div className="text-center flex flex-col items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Fingerprint className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Identification</h1>
              <p className="text-xs font-medium text-zinc-500 mt-1">Accès Sécurisé V9</p>
            </div>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleSendEmail} className="flex flex-col w-full gap-4 animate-in slide-in-from-right-8 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Email Professionnel</label>
                <div className="flex items-center px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-950 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition duration-200">
                  <Mail size={18} className="text-zinc-500" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="flex-1 bg-transparent border-none outline-none ml-3 text-sm text-white placeholder:text-zinc-700 font-medium" />
                </div>
              </div>
              <button className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-2">
                Connexion <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col w-full gap-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center">
                <p className="text-xs text-zinc-400">Code (Simulé) pour <span className="font-bold text-white">{email}</span></p>
              </div>
              <div className="flex justify-center gap-3">
                {otp.map((d, i) => (
                  <input key={i} type="text" maxLength="1" className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-zinc-800 bg-zinc-950 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white transition-all" value={d} onChange={e => handleOtpChange(e.target, i)} onFocus={e => e.target.select()} />
                ))}
              </div>
              <button className="w-full py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg mt-2">Entrer</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 3. APPLICATION PRINCIPALE
  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-black text-zinc-100 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${THEME.sidebar} flex flex-col transform md:static md:translate-x-0 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shrink-0`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-emerald-600 text-white"><LayoutDashboard size={20} /></div>
            <span className="font-bold text-lg tracking-tight">Planning OS</span>
          </div>
          
          <div className={`p-4 rounded-xl ${THEME.surface} mb-6 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate capitalize">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span className="text-[10px] text-zinc-500">En ligne</span></div>
            </div>
          </div>

          <nav className="space-y-1 overflow-y-auto flex-1">
            <NavItem icon={<Calendar />} label="Planning" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false)}} />
            <NavItem icon={<Bot />} label="Coach IA" active={activeTab === 'ai'} onClick={() => {setActiveTab('ai'); setIsMobileMenuOpen(false)}} badge="PRO" />
            <NavItem icon={<Users />} label="Squad" active={activeTab === 'social'} onClick={() => {setActiveTab('social'); setIsMobileMenuOpen(false)}} />
            <div className="my-4 border-t border-zinc-800"></div>
            <p className="px-4 text-[10px] font-bold uppercase text-zinc-500 mb-2">Focus Zones</p>
            <NavItem icon={<Briefcase />} label="Business" active={activeTab === 'business'} onClick={() => {setActiveTab('business'); setIsMobileMenuOpen(false)}} />
            <NavItem icon={<GraduationCap />} label="Études" active={activeTab === 'school'} onClick={() => {setActiveTab('school'); setIsMobileMenuOpen(false)}} />
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-zinc-800 flex items-center justify-between">
          <button onClick={toggleFullscreen} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition">{isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition"><LogOut size={18} /></button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
          <span className="font-bold">Planning OS</span>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth">
          
          {/* TAB: DASHBOARD */}
          {(activeTab === 'dashboard' || activeTab === 'business' || activeTab === 'school') && (
            <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-1 text-white">Tableau de Bord</h2>
                  <p className="text-zinc-500">Prêt à dominer, <span className="text-emerald-500 font-bold capitalize">{user?.name}</span> ?</p>
                </div>
                <button onClick={() => setShowModal(true)} className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition active:scale-95">
                  <Plus size={20} /> Ajouter
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard icon={<CheckCircle2 />} label="Tâches Finies" value={`${tasks.filter(t => t.done).length}/${tasks.length}`} color="emerald" />
                <StatCard icon={<AlertCircle />} label="Urgence" value="Dossier" color="indigo" />
                <StatCard icon={<Trophy />} label="Mode Focus" value="ACTIVÉ" color="amber" />
              </div>

              <div className={`rounded-2xl ${THEME.surface} overflow-hidden shadow-xl`}>
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                  <h3 className="font-bold flex items-center gap-2"><Clock className="text-emerald-500" size={18} /> Timeline</h3>
                  <span className="text-xs bg-zinc-950 px-2 py-1 rounded text-zinc-500 font-mono">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="divide-y divide-zinc-800">
                  {tasks.length === 0 && <div className="p-12 text-center text-zinc-500 italic">Aucune mission pour le moment.</div>}
                  {tasks.filter(t => activeTab === 'dashboard' || t.category === activeTab).map(task => (
                    <div key={task.id} className="p-5 flex items-center gap-4 hover:bg-zinc-800/50 transition group">
                      <span className="font-mono text-sm font-bold w-12 text-zinc-500 text-right">{task.time}</span>
                      <button 
                        onClick={() => toggleTaskDb(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 hover:border-emerald-500'}`}
                      >
                        {task.done && <CheckCircle2 size={14} className="text-white" />}
                      </button>
                      <div className={`flex-1 ${task.done ? 'line-through opacity-40' : ''}`}>
                        <p className="font-medium text-white">{task.title}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded border border-zinc-700 bg-zinc-800 text-zinc-400">{task.category}</span>
                      <button onClick={() => deleteTaskDb(task.id)} className="text-rose-500 p-2 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: IA */}
          {activeTab === 'ai' && (
            <div className="h-full flex flex-col max-w-3xl mx-auto animate-in slide-in-from-bottom-4">
              <div className="p-4 mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg"><Bot className="text-emerald-500" /></div>
                <div><h3 className="font-bold text-sm text-white">Coach Stratégique</h3><p className="text-xs text-zinc-500">Optimisation tactique activée.</p></div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {aiMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 ${msg.isMe ? 'bg-emerald-600 text-white' : 'bg-zinc-800 border border-zinc-700 text-zinc-200'}`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={aiEndRef} />
              </div>
              <form onSubmit={sendAiMessage} className="p-2 border border-zinc-700 rounded-xl flex gap-2 bg-zinc-900 focus-within:ring-2 focus-within:ring-emerald-500 transition">
                <input value={newAiMessage} onChange={e => setNewAiMessage(e.target.value)} placeholder="Pose une question..." className="flex-1 bg-transparent px-4 outline-none text-white" />
                <button className="p-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"><Send size={18} /></button>
              </form>
            </div>
          )}

          {/* TAB: SOCIAL */}
          {activeTab === 'social' && (
            <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in">
              <div className={`w-full md:w-80 rounded-2xl border border-zinc-800 bg-zinc-900 p-4`}>
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-white flex gap-2 items-center"><Users size={18}/> Ma Squad</h3><button onClick={() => setShowFriendModal(true)} className="text-emerald-500 hover:bg-emerald-500/10 p-1 rounded transition"><UserPlus size={18}/></button></div>
                <div className="space-y-2">{friends.map(f => (
                  <div key={f.id} className="p-3 rounded-xl border border-zinc-800 hover:bg-zinc-800 flex items-center gap-3 cursor-pointer transition">
                    <div className="relative"><div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white">{f.name[0]}</div><div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${f.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'}`}></div></div>
                    <div><p className="text-sm font-bold text-white">{f.name}</p><p className="text-xs text-zinc-500">{f.activity}</p></div>
                  </div>
                ))}</div>
              </div>
              <div className={`flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 flex flex-col overflow-hidden`}>
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/30">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">#</div><div><p className="font-bold text-sm text-white">Général</p><p className="text-xs text-zinc-500">{friends.length + 1} membres</p></div></div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-4 ${msg.isMe ? 'bg-emerald-600 text-white' : 'bg-zinc-800 border border-zinc-700 text-zinc-200'}`}>
                        {!msg.isMe && <p className="text-xs font-bold mb-1 text-emerald-500">{msg.sender}</p>}
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-[10px] opacity-60 text-right mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="p-4 border-t border-zinc-800 bg-zinc-950 flex gap-2">
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Message..." className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-white" />
                  <button className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"><Send size={18} /></button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL TASK */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-white">Ajouter Tâche</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input autoFocus value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full p-3 rounded-lg border border-zinc-700 bg-zinc-950 text-white focus:border-emerald-500 outline-none" placeholder="Titre..." />
              <div className="flex gap-4">
                <input type="time" value={newTask.time} onChange={e => setNewTask({...newTask, time: e.target.value})} className="w-full p-3 rounded-lg border border-zinc-700 bg-zinc-950 text-white outline-none" />
                <select value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} className="w-full p-3 rounded-lg border border-zinc-700 bg-zinc-950 text-white outline-none">
                  <option value="school">Études</option><option value="business">Business</option><option value="health">Sport</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700">Annuler</button><button className="flex-1 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500">Valider</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FRIEND */}
      {showFriendModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold mb-4 text-white">Recruter un allié</h3>
            <form onSubmit={addFriend} className="flex gap-2">
              <input autoFocus value={newFriendId} onChange={e => setNewFriendId(e.target.value)} className="flex-1 p-3 rounded-lg border border-zinc-700 bg-zinc-950 text-white outline-none" placeholder="ID Utilisateur..." />
              <button className="p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"><Plus/></button>
            </form>
            <button onClick={() => setShowFriendModal(false)} className="mt-4 text-xs w-full text-center text-zinc-500 hover:text-white">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${active ? 'bg-emerald-500/10 text-emerald-500' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
      {React.cloneElement(icon, { size: 18 })}
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-600 text-white">{badge}</span>}
    </button>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    emerald: 'text-emerald-500 bg-emerald-500/10',
    indigo: 'text-indigo-500 bg-indigo-500/10',
    amber: 'text-amber-500 bg-amber-500/10'
  };
  return (
    <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-xs font-bold uppercase text-zinc-500 tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}
