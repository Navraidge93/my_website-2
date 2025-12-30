import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Calendar, CheckCircle2, Brain, Trophy, Wifi, AlertCircle, Clock, 
  Briefcase, GraduationCap, Dumbbell, Plus, Menu, X, Trash2, ArrowRight, 
  Users, Send, Mail, Lock, Share2, Key, Sun, Moon, LogOut,
  Maximize2, Minimize2, ArrowLeft, Bot, UserPlus, Fingerprint, Bell
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
  const [loading, setLoading] = useState(false); // État de chargement
  
  // App States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  
  // Data
  const [tasks, setTasks] = useState([]);
  const [friends, setFriends] = useState([]);
  const [messages, setMessages] = useState([]);
  const [aiMessages, setAiMessages] = useState([{ id: 1, sender: "Coach IA", text: "Prêt à optimiser ton temps ?", isMe: false }]);
  
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
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [user, view, activeTab]);

  const loadAllData = (userId) => {
    fetchTasks(userId);
    fetchFriends(userId);
    fetchMessages();
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

  // LOGIN SIMPLIFIÉ (Correction Bug #1)
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

  // AJOUT TÂCHE
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    
    // Optimistic
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
      if (res.ok) {
          fetchTasks(user.id); // Recharger pour avoir le bon ID
      }
    } catch (err) { console.error(err); }
  };

  // COCHER TÂCHE (Correction Bug #2)
  const toggleTask = async (taskId) => {
    // On met à jour l'interface tout de suite
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
    
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}/toggle`, { method: 'PUT' });
    } catch (err) {
      console.error("Erreur toggle", err);
      // Si erreur, on annule le changement visuel
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch (err) { console.error("Erreur delete", err); }
  };

  // AJOUT AMI (Correction Bug #3)
  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!friendEmail) return;

    if (friendEmail === user.email) {
        alert("Tu ne peux pas t'ajouter toi-même ! Crée un 2ème compte pour tester.");
        return;
    }

    try {
      const res = await fetch(`${API_URL}/api/social/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, friendEmail })
      });
      
      const data = await res.json();
      if (data.success) {
        alert("Demande envoyée ! L'autre personne doit l'accepter (bientôt dispo). Pour l'instant, c'est auto-accepté pour le test.");
        setShowFriendModal(false);
        setFriendEmail('');
        fetchFriends(user.id);
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
        body: JSON.stringify({ senderId: user.id, senderName: user.name, content: msgContent })
      });
      fetchMessages(); 
    } catch (err) { console.error(err); }
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

  // 2. LOGIN (Simplifié)
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
          </div>

          <nav className="space-y-1">
            <NavItem icon={<Calendar />} label="Planning" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false)}} T={T} />
            <NavItem icon={<Users />} label="Squad & Chat" active={activeTab === 'social'} onClick={() => {setActiveTab('social'); setIsMobileMenuOpen(false)}} T={T} />
            <NavItem icon={<Bot />} label="Coach IA" active={activeTab === 'ai'} onClick={() => {setActiveTab('ai'); setIsMobileMenuOpen(false)}} T={T} badge="PRO" />
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

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 scroll-smooth">
          
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-1 text-white">Tableau de Bord</h2>
                  <p className={T.textMuted}>Prêt à dominer la journée, <span className={`font-bold capitalize ${T.accentText}`}>{user?.name}</span> ?</p>
                </div>
                <button onClick={() => setShowModal(true)} className={`px-6 py-3 rounded-xl ${T.accentBg} text-white font-bold shadow-lg flex items-center gap-2 transition active:scale-95`}>
                  <Plus size={20} /> Ajouter
                </button>
              </div>

              <div className={`rounded-2xl ${T.surface} border ${T.border} overflow-hidden shadow-xl`}>
                <div className={`p-4 border-b ${T.border} flex justify-between items-center ${T.input} bg-opacity-50`}>
                  <h3 className="font-bold flex items-center gap-2"><Clock className={T.accentText} size={18} /> Timeline</h3>
                  <button onClick={toggleFullscreen} className={T.textMuted}>{isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
                </div>
                <div className={`divide-y ${theme === 'dark' ? 'divide-neutral-800' : 'divide-slate-200'}`}>
                  {tasks.length === 0 && <div className={`p-12 text-center ${T.textMuted} italic`}>Aucune mission. Ajoute quelque chose !</div>}
                  {tasks.map(task => (
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
                  {friends.length === 0 && <p className={`text-xs ${T.textMuted} italic text-center py-4`}>Invite des amis pour discuter.</p>}
                  {friends.map(f => (
                    <div key={f.id} className={`p-3 rounded-xl border ${T.border} ${T.hover} flex items-center gap-3`}>
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
            <p className={`text-xs ${T.textMuted} mb-4`}>Entre l'email de ton ami. (Il doit avoir créé un compte !)</p>
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
