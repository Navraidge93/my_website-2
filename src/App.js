import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, CheckCircle2, Brain, Trophy, Wifi, AlertCircle, Clock, 
  Briefcase, GraduationCap, Dumbbell, Plus, Menu, X, Trash2, ArrowRight, 
  Users, MessageSquare, Sun, Moon, LogOut, User, Send, Settings, Shield
} from 'lucide-react';

// --- CONFIGURATION ---
const API_URL = "https://backend-production-c3b5.up.railway.app";

// --- THÈMES & COULEURS ---
// On utilise des variables CSS dynamiques via React pour gérer le thème
const THEMES = {
  dark: {
    bg: 'bg-zinc-950',
    surface: 'bg-zinc-900',
    border: 'border-zinc-800',
    text: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    accent: 'indigo', // Couleur principale
    input: 'bg-zinc-950/50',
  },
  light: {
    bg: 'bg-slate-50',
    surface: 'bg-white',
    border: 'border-slate-200',
    text: 'text-slate-800',
    textMuted: 'text-slate-500',
    accent: 'violet',
    input: 'bg-slate-100',
  }
};

// --- DONNÉES FICTIVES (MOCK) ---
const MOCK_FRIENDS = [
  { id: 1, name: "Sarah IFSI", status: "online", activity: "Révise UE 2.1" },
  { id: 2, name: "Thomas Biz", status: "offline", activity: "Dernière connexion: 2h" },
  { id: 3, name: "Coach Mike", status: "busy", activity: "À la salle" },
];

const MOCK_MESSAGES = [
  { id: 1, sender: "Sarah IFSI", text: "Tu as fini le dossier 4.6 ?", time: "10:02", isMe: false },
  { id: 2, sender: "Moi", text: "Presque, je suis dessus là !", time: "10:05", isMe: true },
];

export default function App() {
  // --- ÉTATS GLOBAUX ---
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [user, setUser] = useState(null); // null = pas connecté
  const [view, setView] = useState('login'); // 'login', 'register', 'app'
  const [serverStatus, setServerStatus] = useState('checking');
  
  // États de l'App
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Données
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('v4_tasks')) || []);
  const [brainDump, setBrainDump] = useState(() => JSON.parse(localStorage.getItem('v4_brain')) || []);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');

  // Formulaire Tâche
  const [newTask, setNewTask] = useState({ title: '', time: '08:00', category: 'school' });

  // --- EFFETS ---
  useEffect(() => {
    checkServer();
    // Restaurer session si existe (simulation)
    const savedUser = localStorage.getItem('v4_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('app');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('v4_tasks', JSON.stringify(tasks));
    localStorage.setItem('v4_brain', JSON.stringify(brainDump));
  }, [tasks, brainDump]);

  // --- LOGIQUE ---
  const checkServer = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hello`);
      setServerStatus(res.ok ? 'online' : 'offline');
    } catch {
      setServerStatus('offline');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulation Auth (À connecter au backend plus tard)
    const fakeUser = { name: "Navraidge", email: "boss@commando.com", avatar: "https://i.pravatar.cc/150?u=nav" };
    setUser(fakeUser);
    localStorage.setItem('v4_user', JSON.stringify(fakeUser));
    setView('app');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('v4_user');
    setView('login');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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
    setMessages([...messages, { id: Date.now(), sender: "Moi", text: newMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isMe: true }]);
    setNewMessage('');
  };

  // Styles dynamiques selon le thème
  const T = THEMES[theme];

  // --- RENDER : ÉCRAN DE CONNEXION ---
  if (view === 'login' || view === 'register') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${T.bg} ${T.text}`}>
        <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border ${T.border} ${T.surface} relative overflow-hidden`}>
          {/* Effet d'arrière plan */}
          <div className={`absolute top-0 right-0 w-64 h-64 bg-${T.accent}-500/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none`}></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className={`p-4 rounded-2xl bg-${T.accent}-500/10 border border-${T.accent}-500/20 shadow-lg shadow-${T.accent}-500/10`}>
                <LayoutDashboard className={`text-${T.accent}-500`} size={40} />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-center mb-2">Planning OS <span className={`text-${T.accent}-500`}>V4</span></h2>
            <p className={`text-center ${T.textMuted} mb-8 text-sm`}>
              La plateforme ultime pour gérer ta vie, tes cours et ton business.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`text-xs font-bold uppercase ${T.textMuted} ml-1`}>Email</label>
                <input type="email" placeholder="exemple@email.com" className={`w-full p-4 rounded-xl mt-1 outline-none border transition-all focus:ring-2 focus:ring-${T.accent}-500 ${T.input} ${T.border}`} />
              </div>
              <div>
                <label className={`text-xs font-bold uppercase ${T.textMuted} ml-1`}>Mot de passe</label>
                <input type="password" placeholder="••••••••" className={`w-full p-4 rounded-xl mt-1 outline-none border transition-all focus:ring-2 focus:ring-${T.accent}-500 ${T.input} ${T.border}`} />
              </div>
              
              <button className={`w-full py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-${T.accent}-600 to-${T.accent}-500 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2`}>
                {view === 'login' ? 'Se Connecter' : 'Créer un compte'} <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className={`text-sm ${T.textMuted}`}>
                {view === 'login' ? "Pas encore de compte ?" : "Déjà membre ?"}
                <button 
                  onClick={() => setView(view === 'login' ? 'register' : 'login')}
                  className={`ml-2 font-bold text-${T.accent}-500 hover:underline`}
                >
                  {view === 'login' ? "S'inscrire" : "Connexion"}
                </button>
              </p>
            </div>

            <div className={`mt-8 pt-4 border-t ${T.border} flex justify-center items-center gap-2 text-xs ${T.textMuted}`}>
              <Wifi size={12} className={serverStatus === 'online' ? 'text-emerald-500' : 'text-rose-500'} />
              <span>Serveur Railway: {serverStatus === 'online' ? 'Connecté' : 'Hors Ligne'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER : APPLICATION PRINCIPALE ---
  return (
    <div className={`h-screen w-full flex flex-col md:flex-row overflow-hidden transition-colors duration-500 ${T.bg} ${T.text}`}>
      
      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 ${T.surface} border-r ${T.border} transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg bg-${T.accent}-500`}>
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">Planning OS</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full bg-${T.accent}-500/10 text-${T.accent}-500 font-bold border border-${T.accent}-500/20`}>BETA V4.0</span>
            </div>
          </div>
          
          {/* User Profile Mini */}
          <div className={`p-3 rounded-xl border ${T.border} ${T.bg} flex items-center gap-3 mb-6`}>
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${T.accent}-500 to-purple-600 flex items-center justify-center text-white font-bold`}>
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className={`text-xs ${T.textMuted} truncate`}>Productivité: 85%</p>
            </div>
            <button onClick={toggleTheme} className={`p-2 rounded-lg hover:${T.input} transition`}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className={`px-4 text-[10px] font-bold uppercase tracking-wider ${T.textMuted} mb-2 mt-2`}>Principal</p>
          <NavButton icon={<Calendar />} label="Mon Planning" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} theme={T} />
          <NavButton icon={<Users />} label="Squad & Chat" active={activeTab === 'social'} onClick={() => setActiveTab('social')} theme={T} />
          <NavButton icon={<Brain />} label="Brain Dump" active={activeTab === 'brain'} onClick={() => setActiveTab('brain')} theme={T} />
          
          <p className={`px-4 text-[10px] font-bold uppercase tracking-wider ${T.textMuted} mb-2 mt-6`}>Focus Zones</p>
          <NavButton icon={<Briefcase />} label="Business Empire" active={activeTab === 'business'} onClick={() => setActiveTab('business')} theme={T} />
          <NavButton icon={<GraduationCap />} label="Études IFSI" active={activeTab === 'school'} onClick={() => setActiveTab('school')} theme={T} />
          <NavButton icon={<Dumbbell />} label="Santé & Sport" active={activeTab === 'health'} onClick={() => setActiveTab('health')} theme={T} />
        </nav>

        {/* Footer Sidebar */}
        <div className={`p-4 border-t ${T.border}`}>
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition`}>
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 relative overflow-hidden flex flex-col h-full">
        
        {/* Mobile Header */}
        <header className={`md:hidden flex items-center justify-between p-4 border-b ${T.border} ${T.surface}`}>
          <span className="font-bold">Planning OS</span>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
          
          {/* --- VUE SOCIALE --- */}
          {activeTab === 'social' ? (
            <div className="h-[calc(100vh-140px)] flex gap-6">
              {/* Friends List */}
              <div className={`w-1/3 hidden md:block rounded-2xl border ${T.border} ${T.surface} overflow-hidden`}>
                <div className={`p-4 border-b ${T.border} font-bold flex justify-between items-center`}>
                  <span>Ma Squad</span>
                  <span className={`text-xs px-2 py-1 rounded-full bg-${T.accent}-500/10 text-${T.accent}-500`}>3 en ligne</span>
                </div>
                <div className="p-2 space-y-1">
                  {MOCK_FRIENDS.map(friend => (
                    <div key={friend.id} className={`p-3 rounded-xl hover:${T.input} cursor-pointer flex items-center gap-3 transition`}>
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold`}>{friend.name.charAt(0)}</div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-${T.surface.replace('bg-', '')} ${friend.status === 'online' ? 'bg-emerald-500' : friend.status === 'busy' ? 'bg-rose-500' : 'bg-slate-500'}`}></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold">{friend.name}</p>
                        <p className={`text-xs ${T.textMuted}`}>{friend.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`flex-1 rounded-2xl border ${T.border} ${T.surface} flex flex-col overflow-hidden shadow-xl`}>
                <div className={`p-4 border-b ${T.border} flex justify-between items-center`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">S</div>
                    <span className="font-bold">Chat Groupe IFSI</span>
                  </div>
                  <Settings size={18} className={T.textMuted} />
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/5">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl ${msg.isMe ? `bg-${T.accent}-600 text-white rounded-br-none` : `${T.input} rounded-bl-none`}`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendMessage} className={`p-3 border-t ${T.border} flex gap-2`}>
                  <input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrire un message..." 
                    className={`flex-1 ${T.input} rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-${T.accent}-500 transition`} 
                  />
                  <button type="submit" className={`p-3 rounded-xl bg-${T.accent}-600 text-white hover:bg-${T.accent}-500 transition`}>
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          ) : activeTab === 'brain' ? (
            /* --- VUE BRAIN DUMP --- */
            <div className="max-w-2xl mx-auto mt-8">
              <div className="text-center mb-8">
                <Brain size={48} className={`mx-auto mb-4 text-${T.accent}-500`} />
                <h2 className="text-3xl font-bold mb-2">Zone de Vrac</h2>
                <p className={T.textMuted}>Libère ton esprit. Note tout ici, trie plus tard.</p>
              </div>
              
              <div className={`relative mb-8 group`}>
                <input 
                  type="text" 
                  placeholder="Qu'est-ce qui te tracasse ?" 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      setBrainDump([{ id: Date.now(), text: e.target.value }, ...brainDump]);
                      e.target.value = '';
                    }
                  }}
                  className={`w-full p-6 rounded-2xl ${T.surface} border ${T.border} shadow-lg outline-none text-lg focus:ring-2 focus:ring-${T.accent}-500 transition`}
                />
                <div className={`absolute right-6 top-6 p-1 rounded bg-${T.accent}-500/10 text-${T.accent}-500 text-xs font-bold`}>ENTRÉE</div>
              </div>

              <div className="space-y-3">
                {brainDump.map(item => (
                  <div key={item.id} className={`p-4 rounded-xl ${T.surface} border ${T.border} flex justify-between items-center group animate-in fade-in slide-in-from-bottom-2`}>
                    <span>{item.text}</span>
                    <button onClick={() => setBrainDump(brainDump.filter(i => i.id !== item.id))} className="text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* --- VUE DASHBOARD PLANNING --- */
            <>
              <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-1">
                    {activeTab === 'business' ? 'Empire Building 💸' : activeTab === 'school' ? 'Objectif Diplôme 🎓' : 'Vue d\'Ensemble'}
                  </h2>
                  <p className={T.textMuted}>Prêt à dominer cette journée ?</p>
                </div>
                <button 
                  onClick={() => setShowModal(true)}
                  className={`px-5 py-3 rounded-xl bg-${T.accent}-600 text-white font-bold shadow-lg shadow-${T.accent}-500/20 hover:scale-105 transition flex items-center gap-2`}
                >
                  <Plus size={20} /> Nouvelle Tâche
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Tâches du jour" value={tasks.length} icon={<CheckCircle2 />} color="emerald" theme={T} />
                <StatCard title="Prochaine Deadline" value="J-7" sub="IFSI Dossier" icon={<AlertCircle />} color="rose" theme={T} />
                <StatCard title="Mode Focus" value="ON" icon={<Trophy />} color="amber" theme={T} />
              </div>

              {/* Task List */}
              <div className={`rounded-3xl border ${T.border} ${T.surface} shadow-xl overflow-hidden`}>
                <div className={`p-6 border-b ${T.border} flex justify-between items-center`}>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Clock className={`text-${T.accent}-500`} size={20} /> Timeline
                  </h3>
                  <div className={`text-xs font-bold px-3 py-1 rounded-full ${T.input} border ${T.border}`}>
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
                
                <div className="divide-y divide-zinc-800/50">
                  {tasks.length === 0 && (
                    <div className="p-12 text-center opacity-50">
                      <div className="mb-4 text-6xl">✨</div>
                      <p>Aucune tâche. Profite ou prends de l'avance.</p>
                    </div>
                  )}
                  {tasks.map(task => (
                    <div key={task.id} className={`p-5 flex items-center gap-4 hover:${T.input} transition group cursor-pointer`}>
                      <div className={`font-mono text-sm font-bold opacity-60`}>{task.time}</div>
                      <div 
                        onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, done: !t.done} : t))}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.done ? 'bg-emerald-500 border-emerald-500 scale-110' : `border-zinc-600 hover:border-${T.accent}-500`}`}
                      >
                        {task.done && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <div className={`flex-1 ${task.done ? 'line-through opacity-40' : ''}`}>
                        <p className="font-medium">{task.title}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                        task.category === 'business' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        task.category === 'school' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 
                        'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                        {task.category}
                      </span>
                      <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="opacity-0 group-hover:opacity-100 text-rose-500 p-2 transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${T.surface} border ${T.border} w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200`}>
            <h3 className="text-xl font-bold mb-6">Ajouter une mission</h3>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-50 ml-1">Titre</label>
                <input autoFocus value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className={`w-full p-4 rounded-xl mt-1 outline-none border focus:ring-2 focus:ring-${T.accent}-500 ${T.input} ${T.border}`} placeholder="Ex: Réviser l'anatomie..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase opacity-50 ml-1">Heure</label>
                  <input type="time" value={newTask.time} onChange={e => setNewTask({...newTask, time: e.target.value})} className={`w-full p-4 rounded-xl mt-1 outline-none border focus:ring-2 focus:ring-${T.accent}-500 ${T.input} ${T.border}`} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase opacity-50 ml-1">Type</label>
                  <select value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} className={`w-full p-4 rounded-xl mt-1 outline-none border focus:ring-2 focus:ring-${T.accent}-500 ${T.input} ${T.border}`}>
                    <option value="school">🎓 Études</option>
                    <option value="business">💸 Business</option>
                    <option value="health">🏋️ Sport</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-4 font-bold rounded-xl hover:${T.input}`}>Annuler</button>
                <button type="submit" className={`flex-1 py-4 bg-${T.accent}-600 text-white font-bold rounded-xl hover:bg-${T.accent}-500`}>Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---
function NavButton({ icon, label, active, onClick, theme }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? `bg-${theme.accent}-500/10 text-${theme.accent}-500` : `${theme.textMuted} hover:${theme.input} hover:${theme.text}`}`}>
      {React.cloneElement(icon, { size: 20 })}
      {label}
    </button>
  );
}

function StatCard({ title, value, sub, icon, color, theme }) {
  return (
    <div className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} hover:border-${color}-500/50 transition cursor-default group`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        {sub && <span className={`text-xs font-bold px-2 py-1 rounded bg-${theme.bg} ${theme.textMuted}`}>{sub}</span>}
      </div>
      <div>
        <p className={`text-xs font-bold uppercase tracking-wider ${theme.textMuted}`}>{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}
