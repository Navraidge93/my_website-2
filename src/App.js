import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Calendar, CheckCircle2, Brain, Trophy, Wifi, AlertCircle, Clock, 
  Briefcase, GraduationCap, Dumbbell, Plus, Menu, X, Trash2, ArrowRight, 
  Users, Send, Settings, Mail, Lock, Share2, Key, Sun, Moon, LogOut
} from 'lucide-react';

// --- CONFIGURATION ---
const API_URL = "https://backend-production-c3b5.up.railway.app";

// --- THÈMES ROBUSTES (Classes complètes pour Tailwind) ---
const THEMES = {
  dark: {
    bg: 'bg-black',
    sidebar: 'bg-neutral-950',
    surface: 'bg-neutral-900',
    border: 'border-neutral-800',
    text: 'text-neutral-200',
    textMuted: 'text-neutral-500',
    // Accent: Emerald (Vert Commando)
    accentBg: 'bg-emerald-600',
    accentBgHover: 'hover:bg-emerald-500',
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
    // Accent: Indigo (Bleu Pro)
    accentBg: 'bg-indigo-600',
    accentBgHover: 'hover:bg-indigo-500',
    accentText: 'text-indigo-600',
    accentBorder: 'border-indigo-500',
    accentRing: 'focus:ring-indigo-500',
    accentLight: 'bg-indigo-500/10',
    input: 'bg-slate-100',
    hover: 'hover:bg-slate-100'
  }
};

// --- DATA ---
const MOCK_FRIENDS = [
  { id: 1, name: "Sarah IFSI", status: "online", activity: "Révise UE 2.1" },
  { id: 2, name: "Thomas Biz", status: "offline", activity: "Dernière connexion: 2h" },
  { id: 3, name: "Coach Mike", status: "busy", activity: "À la salle" },
];

const INITIAL_TASKS = [
  { id: 1, time: '08:00', title: 'Révision UE 4.6', category: 'school', done: false },
  { id: 2, time: '13:30', title: 'Sourcing Vinted', category: 'business', done: false },
];

export default function App() {
  // --- ÉTATS ---
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState(null); 
  const [view, setView] = useState('login'); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [serverStatus, setServerStatus] = useState('checking'); // checking, online, offline
  
  // App States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('v6_tasks')) || INITIAL_TASKS);
  const [brainDump, setBrainDump] = useState(() => JSON.parse(localStorage.getItem('v6_brain')) || []);
  const [messages, setMessages] = useState([
    { id: 1, sender: "Sarah IFSI", text: "Tu as fini le dossier 4.6 ?", time: "10:02", isMe: false }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [newTask, setNewTask] = useState({ title: '', time: '08:00', category: 'school' });

  const scrollRef = useRef(null);
  // Ref pour scroller le chat en bas automatiquement
  const messagesEndRef = useRef(null);

  // --- EFFETS ---
  useEffect(() => {
    checkServer();
    const savedUser = localStorage.getItem('v6_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('app');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('v6_tasks', JSON.stringify(tasks));
    localStorage.setItem('v6_brain', JSON.stringify(brainDump));
  }, [tasks, brainDump]);

  // Scroll automatique du chat
  useEffect(() => {
    if (activeTab === 'social' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // --- LOGIQUE ---
  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!email) return;
    setTimeout(() => setView('otp'), 1000); 
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const fakeUser = { name: email.split('@')[0], email: email };
    setUser(fakeUser);
    localStorage.setItem('v6_user', JSON.stringify(fakeUser));
    setView('app');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('v6_user');
    setView('login');
    setEmail('');
    setOtp(['', '', '', '']);
  };

  const checkServer = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hello`);
      setServerStatus(res.ok ? 'online' : 'offline');
    } catch {
      setServerStatus('offline');
    }
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    setTasks([...tasks, { id: Date.now(), ...newTask, done: false }]);
    setShowModal(false);
    setNewTask({ title: '', time: '08:00', category: 'school' });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = { id: Date.now(), sender: "Moi", text: newMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isMe: true };
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const sharePlanning = () => {
    const planText = "📅 Mon Planning du jour :\n" + tasks.map(t => `- ${t.time}: ${t.title}`).join('\n');
    setMessages([...messages, { id: Date.now(), sender: "Moi", text: planText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isMe: true, isSystem: true }]);
  };

  // Gestion robuste des inputs OTP
  const handleChangeOtp = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    // Focus next input
    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDownOtp = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const T = THEMES[theme];

  // --- RENDER : LOGIN FLOW ---
  if (view === 'login' || view === 'otp') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${T.bg} ${T.text}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl border ${T.border} ${T.sidebar} shadow-2xl relative overflow-hidden`}>
          
          {/* Status Bar */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
          </div>

          <div className="mb-8 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${T.accentBg} flex items-center justify-center shadow-lg`}>
              <LayoutDashboard className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Planning OS <span className={`${T.accentText}`}>V6</span></h1>
            <p className={`text-sm ${T.textMuted}`}>Connexion sécurisée</p>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className={`text-xs font-bold uppercase ${T.textMuted} ml-1 mb-1 block`}>Email Professionnel</label>
                <div className={`flex items-center px-4 py-3 rounded-xl border ${T.border} ${T.input} focus-within:ring-1 ${T.accentRing} transition`}>
                  <Mail size={18} className={T.textMuted} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com" 
                    className="flex-1 bg-transparent border-none outline-none ml-3 text-sm"
                  />
                </div>
              </div>
              <button className={`w-full py-3.5 rounded-xl font-bold text-white ${T.accentBg} ${T.accentBgHover} active:scale-[0.98] transition shadow-lg flex items-center justify-center gap-2`}>
                Recevoir mon code <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${T.accentLight} ${T.accentText} mb-4`}>
                  <Key size={24} />
                </div>
                <h3 className="font-bold text-lg">Code de sécurité</h3>
                <p className={`text-xs ${T.textMuted} mt-1`}>Envoyé à <span className="font-bold">{email}</span></p>
              </div>

              <div className="flex justify-center gap-3">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    className={`w-12 h-14 text-center text-xl font-bold rounded-lg border ${T.border} ${T.input} focus:ring-2 ${T.accentRing} outline-none transition`}
                    value={data}
                    onChange={(e) => handleChangeOtp(e.target, index)}
                    onKeyDown={(e) => handleKeyDownOtp(e, index)}
                    onFocus={(e) => e.target.select()}
                  />
                ))}
              </div>

              <button className={`w-full py-3.5 rounded-xl font-bold text-white ${T.accentBg} ${T.accentBgHover} active:scale-[0.98] transition shadow-lg`}>
                Valider & Entrer
              </button>
              <button type="button" onClick={() => setView('login')} className={`w-full text-xs ${T.textMuted} hover:underline transition`}>
                Changer d'email
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER : DASHBOARD ---
  return (
    <div className={`h-screen w-full flex flex-col md:flex-row overflow-hidden ${T.bg} ${T.text}`}>
      
      {/* SIDEBAR FIXED */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 ${T.sidebar} border-r ${T.border} flex flex-col 
        transform md:static md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2 rounded-lg ${T.accentBg} text-white`}>
              <LayoutDashboard size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">Planning OS</span>
          </div>

          <div className={`p-4 rounded-xl border ${T.border} ${T.surface} mb-6 flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate capitalize">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className={`text-[10px] ${T.textMuted}`}>En ligne</span>
              </div>
            </div>
          </div>

          <nav className="space-y-1 overflow-y-auto flex-1">
            <NavItem icon={<Calendar />} label="Planning" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} theme={T} />
            <NavItem icon={<Users />} label="Squad & Chat" active={activeTab === 'social'} onClick={() => setActiveTab('social')} theme={T} badge="3" />
            <NavItem icon={<Brain />} label="Brain Dump" active={activeTab === 'brain'} onClick={() => setActiveTab('brain')} theme={T} />
            
            <div className={`my-4 border-t ${T.border}`}></div>
            <p className={`px-4 text-[10px] font-bold uppercase ${T.textMuted} mb-2`}>Zones de Focus</p>
            <NavItem icon={<Briefcase />} label="Business" active={activeTab === 'business'} onClick={() => setActiveTab('business')} theme={T} />
            <NavItem icon={<GraduationCap />} label="Études IFSI" active={activeTab === 'school'} onClick={() => setActiveTab('school')} theme={T} />
          </nav>
        </div>

        <div className={`mt-auto p-4 border-t ${T.border} flex items-center justify-between`}>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-lg ${T.hover} ${T.textMuted}`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleLogout} className={`p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 transition`}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header */}
        <header className={`md:hidden flex items-center justify-between p-4 border-b ${T.border} ${T.sidebar} shrink-0`}>
          <span className="font-bold">Planning OS</span>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth">
          
          {/* --- VUE SOCIALE --- */}
          {activeTab === 'social' ? (
            <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
              {/* Friends List */}
              <div className={`w-full md:w-80 rounded-2xl border ${T.border} ${T.sidebar} p-4 hidden md:block shrink-0`}>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Users size={18} /> Ma Squad</h3>
                <div className="space-y-2">
                  {MOCK_FRIENDS.map(f => (
                    <div key={f.id} className={`p-3 rounded-xl border ${T.border} ${T.hover} flex items-center gap-3 cursor-pointer transition`}>
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-white`}>{f.name.charAt(0)}</div>
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 ${theme === 'dark' ? 'border-black' : 'border-white'} rounded-full ${f.status === 'online' ? 'bg-emerald-500' : 'bg-neutral-500'}`}></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{f.name}</p>
                        <p className={`text-xs ${T.textMuted}`}>{f.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Window */}
              <div className={`flex-1 rounded-2xl border ${T.border} ${T.sidebar} flex flex-col overflow-hidden`}>
                <div className={`p-4 border-b ${T.border} flex justify-between items-center ${T.surface}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${T.accentLight} ${T.accentText} flex items-center justify-center font-bold`}>#</div>
                    <div>
                      <p className="font-bold text-sm">Général / Entraide</p>
                      <p className={`text-xs ${T.textMuted}`}>3 membres en ligne</p>
                    </div>
                  </div>
                  <button onClick={sharePlanning} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${T.accentLight} ${T.accentText} hover:opacity-80 transition flex items-center gap-2`}>
                    <Share2 size={14} /> Partager mon planning
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${
                        msg.isSystem ? `w-full bg-neutral-800/50 border ${T.border} font-mono text-xs whitespace-pre-line text-neutral-400 text-center` :
                        msg.isMe ? `${T.accentBg} text-white rounded-tr-none` : 
                        `${T.input} rounded-tl-none border ${T.border}`
                      }`}>
                        {!msg.isMe && <p className={`text-xs font-bold mb-1 ${T.accentText}`}>{msg.sender}</p>}
                        <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                        <p className={`text-[10px] mt-2 opacity-60 text-right`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className={`p-4 border-t ${T.border} ${T.surface} flex gap-2`}>
                  <input 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Envoyer un message..."
                    className={`flex-1 bg-transparent border-none outline-none text-sm px-2 ${T.text}`}
                  />
                  <button type="submit" className={`p-2 rounded-lg ${T.accentBg} text-white hover:opacity-90 transition`}>
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          ) : activeTab === 'brain' ? (
            /* --- VUE BRAIN DUMP --- */
            <div className="max-w-2xl mx-auto pt-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-2">Zone de Décharge</h2>
                <p className={T.textMuted}>Vide ton cerveau pour mieux te concentrer.</p>
              </div>
              
              <div className="relative mb-8">
                <input 
                  type="text" 
                  placeholder="Écris et appuie sur Entrée..."
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.target.value) {
                      setBrainDump([{id: Date.now(), text: e.target.value}, ...brainDump]);
                      e.target.value = '';
                    }
                  }}
                  className={`w-full p-5 rounded-2xl ${T.sidebar} border ${T.border} outline-none focus:ring-1 ${T.accentRing} transition shadow-xl text-lg`}
                />
              </div>

              <div className="space-y-3">
                {brainDump.map(item => (
                  <div key={item.id} className={`p-4 rounded-xl ${T.sidebar} border ${T.border} flex justify-between items-center group animate-in slide-in-from-bottom-2`}>
                    <span className="text-sm">{item.text}</span>
                    <button onClick={() => setBrainDump(brainDump.filter(i => i.id !== item.id))} className="text-neutral-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* --- VUE DASHBOARD --- */
            <>
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-1">Tableau de Bord</h2>
                  <p className={T.textMuted}>Bienvenue, <span className={`${T.accentText} font-bold capitalize`}>{user?.name}</span>. Prêt à charbonner ?</p>
                </div>
                <button 
                  onClick={() => setShowModal(true)}
                  className={`px-6 py-3 rounded-xl ${T.accentBg} text-white font-bold shadow-lg hover:opacity-90 transition flex items-center gap-2`}
                >
                  <Plus size={20} /> Nouvelle Mission
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`p-6 rounded-2xl border ${T.border} ${T.sidebar}`}>
                  <div className="flex justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-emerald-500/10 text-emerald-500`}><CheckCircle2 /></div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${T.input} ${T.textMuted}`}>Journalier</span>
                  </div>
                  <p className={`text-xs font-bold uppercase ${T.textMuted}`}>Tâches Complétées</p>
                  <p className="text-3xl font-bold mt-1">{tasks.filter(t => t.done).length}/{tasks.length}</p>
                </div>
                <div className={`p-6 rounded-2xl border ${T.border} ${T.sidebar}`}>
                  <div className="flex justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-indigo-500/10 text-indigo-500`}><GraduationCap /></div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${T.input} ${T.textMuted}`}>Urgent</span>
                  </div>
                  <p className={`text-xs font-bold uppercase ${T.textMuted}`}>Prochaine Deadline</p>
                  <p className="text-3xl font-bold mt-1">UE 4.6</p>
                </div>
                <div className={`p-6 rounded-2xl border ${T.border} ${T.sidebar}`}>
                  <div className="flex justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-amber-500/10 text-amber-500`}><Trophy /></div>
                  </div>
                  <p className={`text-xs font-bold uppercase ${T.textMuted}`}>État d'Esprit</p>
                  <p className="text-3xl font-bold mt-1">Guerrier</p>
                </div>
              </div>

              <div className={`rounded-2xl border ${T.border} ${T.sidebar} overflow-hidden`}>
                <div className={`p-6 border-b ${T.border} flex justify-between items-center`}>
                  <h3 className="font-bold flex items-center gap-2"><Clock className={T.accentText} size={18} /> Timeline</h3>
                </div>
                <div className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                  {tasks.map(task => (
                    <div key={task.id} className={`p-5 flex items-center gap-4 ${T.hover} transition group cursor-pointer`}>
                      <span className={`font-mono text-sm font-bold w-12 text-right ${T.textMuted}`}>{task.time}</span>
                      <button 
                        onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, done: !t.done} : t))}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? 'bg-emerald-500 border-emerald-500' : `border-neutral-500 ${T.accentBgHover}`}`}
                      >
                        {task.done && <CheckCircle2 size={14} className="text-white" />}
                      </button>
                      <div className={`flex-1 ${task.done ? 'line-through opacity-40' : ''}`}>
                        <p className="font-medium text-sm">{task.title}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${T.border} ${T.input} ${T.textMuted}`}>
                        {task.category}
                      </span>
                      <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="opacity-0 group-hover:opacity-100 text-rose-500 p-2 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${T.sidebar} border ${T.border} w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95`}>
            <h3 className="text-xl font-bold mb-6">Ajouter une mission</h3>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className={`text-xs font-bold uppercase ${T.textMuted}`}>Titre</label>
                <input autoFocus value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className={`w-full p-3 rounded-lg mt-1 outline-none border ${T.border} ${T.input} focus:ring-1 ${T.accentRing} transition`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold uppercase ${T.textMuted}`}>Heure</label>
                  <input type="time" value={newTask.time} onChange={e => setNewTask({...newTask, time: e.target.value})} className={`w-full p-3 rounded-lg mt-1 outline-none border ${T.border} ${T.input} focus:ring-1 ${T.accentRing} transition`} />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase ${T.textMuted}`}>Catégorie</label>
                  <select value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} className={`w-full p-3 rounded-lg mt-1 outline-none border ${T.border} ${T.input} focus:ring-1 ${T.accentRing} transition`}>
                    <option value="school">Études</option>
                    <option value="business">Business</option>
                    <option value="health">Sport</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-3 rounded-lg font-bold ${T.input} hover:opacity-80`}>Annuler</button>
                <button type="submit" className={`flex-1 py-3 rounded-lg font-bold ${T.accentBg} text-white hover:opacity-90`}>Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick, theme, badge }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${active ? `${theme.accentLight} ${theme.accentText}` : `${theme.textMuted} ${theme.hover} hover:${theme.text}`}`}>
      {React.cloneElement(icon, { size: 18 })}
      <span className="flex-1 text-left">{label}</span>
      {badge && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${theme.accentBg} text-white`}>{badge}</span>}
    </button>
  );
}
