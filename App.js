import React, { useState, useEffect } from 'react';
import { Activity, Server, Wifi, AlertCircle, CheckCircle, Lock, Layout, User, RefreshCw, Database } from 'lucide-react';

// --- CONFIGURATION ---
// C'est l'adresse officielle de ton serveur Railway (récupérée de tes logs)
const API_URL = "https://backend-production-c3b5.up.railway.app";

export default function App() {
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [serverData, setServerData] = useState(null);
  const [pingTime, setPingTime] = useState(0);

  // 1. Au chargement de la page, on lance le test
  useEffect(() => {
    checkServer();
  }, []);

  // Fonction qui tente de contacter ton backend
  const checkServer = async () => {
    setServerStatus('checking');
    const start = Date.now();
    
    try {
      // On appelle la route que tu as débuggée hier soir !
      const res = await fetch(`${API_URL}/api/hello`);
      
      if (res.ok) {
        const data = await res.json();
        setServerData(data);
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setServerStatus('offline');
    } finally {
      setPingTime(Date.now() - start);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Layout className="text-emerald-400" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Planning OS</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono tracking-wider">V1.0 ALPHA</span>
                <span className="text-[10px] text-emerald-500 font-mono">by Navraidge93</span>
              </div>
            </div>
          </div>
          
          {/* Badge de statut en haut à droite */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-500 ${
            serverStatus === 'online' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 
            serverStatus === 'checking' ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' :
            'bg-red-500/10 border-red-500/50 text-red-400'
          }`}>
            {serverStatus === 'online' ? <Wifi size={14} /> : <Activity size={14} className={serverStatus === 'checking' ? 'animate-spin' : ''} />}
            {serverStatus === 'online' ? 'SYSTÈME EN LIGNE' : serverStatus === 'checking' ? 'INITIALISATION...' : 'DÉCONNECTÉ'}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8">
        
        {/* --- SECTION 1 : LE TEST DE CONNEXION --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
              <Server size={24} className="text-indigo-400" /> 
              Diagnostic Liaison Backend
            </h2>
            <button 
              onClick={checkServer}
              disabled={serverStatus === 'checking'}
              className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={serverStatus === 'checking' ? 'animate-spin' : ''} />
              Relancer le test
            </button>
          </div>

          <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
             serverStatus === 'online' ? 'bg-slate-800/50 border-emerald-500/30 shadow-lg' : 
             'bg-slate-800/30 border-slate-700'
          }`}>
            {/* Background Glow Effect */}
            {serverStatus === 'online' && <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>}

            <div className="p-6 md:p-8">
              {serverStatus === 'online' ? (
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <CheckCircle size={40} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Connexion Établie ! 🚀</h3>
                      <p className="text-slate-400">Ton frontend React communique parfaitement avec ton backend Railway.</p>
                    </div>
                    
                    {/* La preuve technique */}
                    <div className="bg-slate-950/80 rounded-lg p-4 font-mono text-sm border border-slate-700/50 relative group">
                      <div className="absolute top-2 right-2 text-[10px] text-slate-500 uppercase font-bold">Réponse JSON du Serveur</div>
                      <div className="text-emerald-400 mb-1">// GET {API_URL}/api/hello</div>
                      <div className="text-indigo-300 mb-1">// Latence: {pingTime}ms</div>
                      <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap">
                        {serverData ? JSON.stringify(serverData, null, 2) : "..."}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : serverStatus === 'offline' ? (
                <div className="flex items-center gap-6 text-red-400">
                  <AlertCircle size={48} />
                  <div>
                    <h3 className="text-xl font-bold text-white">Échec de connexion</h3>
                    <p className="text-slate-400">Le backend ne répond pas. Vérifie que Railway n'est pas en "Redeploy".</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-4">
                  <Activity size={48} className="animate-bounce text-indigo-500" />
                  <p className="font-mono animate-pulse">Établissement de la liaison satellite...</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* --- SECTION 2 : TEASER PROCHAINES ÉTAPES --- */}
        <section className="grid md:grid-cols-2 gap-6">
          
          {/* Card: Base de données */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/50 transition duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <Database size={100} />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Database className="text-indigo-400" size={20} /> Base de Données
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Ta base PostgreSQL est prête. La table <code className="bg-slate-800 px-1 rounded text-indigo-300">users</code> attend ton premier inscrit.
              </p>
              <div className="flex gap-2">
                <span className="text-xs bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20">PostgreSQL</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">Connecté</span>
              </div>
            </div>
          </div>

          {/* Card: Authentification */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition duration-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <Lock size={100} />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <User className="text-purple-400" size={20} /> Espace Membre
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Le système d'inscription est la prochaine étape. Nous allons créer le formulaire pour envoyer des données au backend.
              </p>
              <button className="text-xs bg-slate-800 text-slate-500 cursor-not-allowed px-3 py-1.5 rounded border border-slate-700 flex items-center gap-2">
                <Lock size={12} />
                Module verrouillé
              </button>
            </div>
          </div>

        </section>
      </main>

      <footer className="p-6 text-center text-slate-600 text-xs font-mono border-t border-slate-900">
        SYSTEM STATUS: {serverStatus.toUpperCase()} • LATENCY: {pingTime}ms • CONNECTED TO: RAILWAY
      </footer>
    </div>
  );
}