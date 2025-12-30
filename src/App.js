import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, CheckCircle2, Brain, Trophy, Wifi, AlertCircle, Clock, 
  Briefcase, GraduationCap, Dumbbell, Plus, Menu, X, Trash2, Save, ArrowRight
} from 'lucide-react';

// --- CONFIGURATION ---
const API_URL = "https://backend-production-c3b5.up.railway.app";

// --- DONNÉES PAR DÉFAUT (Pour ne pas démarrer à vide) ---
const INITIAL_TASKS = [
  { id: 1, time: '08:00', title: 'Révision UE 4.6 (Urgent)', category: 'school', done: false, date: new Date().toISOString().split('T')[0] },
  { id: 2, time: '13:30', title: 'Sourcing Vinted', category: 'business', done: false, date: new Date().toISOString().split('T')[0] },
  { id: 3, time: '18:30', title: 'Salle de Sport', category: 'health', done: false, date: new Date().toISOString().split('T')[0] },
];

export default function App() {
  // --- ÉTATS (MÉMOIRE DU SITE) ---
  const [serverStatus, setServerStatus] = useState('checking');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Données persistantes
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('commando_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [brainDump, setBrainDump] = useState(() => {
    const saved = localStorage.getItem('commando_brain');
    return saved ? JSON.parse(saved) : [];
  });

  // Formulaire d'ajout
  const [newTask, setNewTask] = useState({ title: '', time: '08:00', category: 'school' });
  const [newBrainItem, setNewBrainItem] = useState('');

  // --- EFFETS ---
  useEffect(() => {
    checkServer();
  }, []);

  useEffect(() => {
    localStorage.setItem('commando_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('commando_brain', JSON.stringify(brainDump));
  }, [brainDump]);

  // --- LOGIQUE ---
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
    const task = {
      id: Date.now(),
      ...newTask,
      done: false,
      date: new Date().toISOString().split('T')[0]
    };
    setTasks([...tasks, task]);
    setNewTask({ title: '', time: '08:00', category: 'school' });
    setShowModal(false);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addBrainItem = (e) => {
    e.preventDefault();
    if (!newBrainItem.trim()) return;
    setBrainDump([{ id: Date.now(), text: newBrainItem }, ...brainDump]);
    setNewBrainItem('');
  };

  const deleteBrainItem = (id) => {
    setBrainDump(brainDump.filter(i => i.id !== id));
  };

  // --- FILTRES ---
  const getFilteredTasks = () => {
    let filtered = tasks;
    if (activeTab === 'business') filtered = tasks.filter(t => t.category === 'business');
    if (activeTab === 'school') filtered = tasks.filter(t => t.category === 'school');
    // Tri par heure
    return filtered.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'school': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'business': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'health': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col md:flex-row overflow-hidden relative">
      
      {/* --- MODAL AJOUT TÂCHE --- */}
      {showModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Nouvelle Mission</h3>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold">Titre</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ex: Relancer fournisseur..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold">Heure</label>
                  <input 
                    type="time" 
                    value={newTask.time}
                    onChange={e => setNewTask({...newTask, time: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold">Catégorie</label>
                  <select 
                    value={newTask.category}
                    onChange={e => setNewTask({...newTask, category: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="school">🎓 Études</option>
                    <option value="business">💸 Business</option>
                    <option value="health">🏋️ Sport</option>
                    <option value="other">⚡ Autre</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-400 font-bold hover:bg-slate-800 rounded-lg">Annuler</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500">Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- HEADER MOBILE --- */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-50">
        <div className="font-bold text-white flex items-center gap-2">
          <LayoutDashboard className="text-emerald-500" size={20} />
          <span>COMMANDO</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:block">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="text-emerald-500" />
            <span>COMMANDO</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Planning OS v3.0</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-20 md:mt-0">
          <SidebarItem icon={<Calendar />} label="Planning" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false)}} />
          <SidebarItem icon={<Briefcase />} label="Business Focus" active={activeTab === 'business'} onClick={() => {setActiveTab('business'); setIsMobileMenuOpen(false)}} />
          <SidebarItem icon={<GraduationCap />} label="IFSI Focus" active={activeTab === 'school'} onClick={() => {setActiveTab('school'); setIsMobileMenuOpen(false)}} />
          <SidebarItem icon={<Brain />} label="Brain Dump" active={activeTab === 'brain'} onClick={() => {setActiveTab('brain'); setIsMobileMenuOpen(false)}} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono border transition-colors ${
            serverStatus === 'online' ? 'bg-emerald-950/30 border-emerald-900 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-500'
          }`}>
            <Wifi size={12} className={serverStatus === 'online' ? '' : 'animate-pulse'} />
            {serverStatus === 'online' ? 'BACKEND LINKED' : 'OFFLINE MODE'}
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-60px)] md:h-screen bg-slate-950">
        
        <div className="max-w-6xl mx-auto p-4 md:p-8 pb-32">
          
          {/* HEADER SECTION */}
          <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {activeTab === 'dashboard' ? 'Vue d\'Ensemble' : 
                 activeTab === 'brain' ? 'Zone de Vrac 🧠' : 
                 activeTab === 'business' ? 'QG Business 💸' : 'QG Études 🎓'}
              </h2>
              <p className="text-slate-400 text-sm md:text-base">
                {activeTab === 'dashboard' ? 'Ta feuille de route pour dominer la journée.' : 
                 activeTab === 'brain' ? 'Décharge ton esprit ici. Ne laisse rien traîner.' :
                 'Focus total sur cet objectif.'}
              </p>
            </div>
            
            {activeTab !== 'brain' && (
              <button 
                onClick={() => setShowModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition active:scale-95"
              >
                <Plus size={18} /> Ajouter Tâche
              </button>
            )}
          </div>

          {/* VUE BRAIN DUMP */}
          {activeTab === 'brain' ? (
            <div className="space-y-6">
              <form onSubmit={addBrainItem} className="flex gap-2">
                <input 
                  type="text" 
                  value={newBrainItem}
                  onChange={e => setNewBrainItem(e.target.value)}
                  placeholder="Une idée ? Une peur ? Une tâche en vrac ? Écris-la..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button type="submit" className="bg-indigo-600 text-white p-4 rounded-xl hover:bg-indigo-500 transition">
                  <ArrowRight />
                </button>
              </form>

              <div className="grid gap-3">
                {brainDump.length === 0 && <div className="text-center text-slate-600 py-12">Ton esprit est vide (pour l'instant).</div>}
                {brainDump.map(item => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center group hover:border-indigo-500/30 transition">
                    <span className="text-slate-300">{item.text}</span>
                    <button onClick={() => deleteBrainItem(item.id)} className="text-slate-600 hover:text-rose-500 transition p-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* VUE PLANNING (Dashboard, Business, School) */
            <>
              {/* KPI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <KpiCard title="Avancement" value={`${getFilteredTasks().filter(t => t.done).length}/${getFilteredTasks().length}`} icon={<CheckCircle2 className="text-emerald-400" />} />
                <KpiCard title="Prochaine Deadline" value="07 JAN" sub="Dossier UE 4.6" icon={<AlertCircle className="text-rose-400" />} />
                <KpiCard title="Mode Actuel" value={activeTab.toUpperCase()} sub="Full Focus" icon={<Trophy className="text-amber-400" />} />
              </div>

              {/* LISTE DES TÂCHES */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Clock size={18} className="text-indigo-400" /> 
                    Timeline
                  </h3>
                </div>

                <div className="divide-y divide-slate-800/50">
                  {getFilteredTasks().length === 0 && (
                    <div className="p-8 text-center text-slate-500">Aucune tâche prévue ici. Ajoutes-en une !</div>
                  )}
                  
                  {getFilteredTasks().map((task) => (
                    <div 
                      key={task.id}
                      className={`p-4 flex items-center gap-3 md:gap-4 hover:bg-slate-800/50 transition group ${task.done ? 'opacity-50' : ''}`}
                    >
                      <div className="font-mono text-xs md:text-sm text-slate-500 w-10 md:w-12 shrink-0">{task.time}</div>
                      
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                        task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 hover:border-emerald-400'
                      }`}>
                        {task.done && <CheckCircle2 size={14} className="text-white" />}
                      </button>

                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleTask(task.id)}>
                        <p className={`font-medium text-sm md:text-base truncate ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {task.title}
                        </p>
                      </div>

                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border flex items-center gap-1.5 shrink-0 ${getCategoryColor(task.category)}`}>
                        <span className="hidden sm:inline">{task.category}</span>
                      </span>
                      
                      <button onClick={() => deleteTask(task.id)} className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition p-2">
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
    </div>
  );
}

// --- COMPOSANTS UI ---
function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {React.cloneElement(icon, { size: 18 })}
      {label}
    </button>
  );
}

function KpiCard({ title, value, sub, icon }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-start justify-between hover:border-slate-700 transition">
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className="bg-slate-800/50 p-2.5 rounded-lg">{icon}</div>
    </div>
  );
}
