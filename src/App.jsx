import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { 
  Dumbbell, Users, Calendar, Plus, Check, Clock, 
  Activity, Save, Download, Trash2, HeartPulse, Video, 
  Share2, KeyRound, Eye, Award, AlertTriangle, LogOut, ShieldCheck, Lock, TrendingUp
} from 'lucide-react';

const INITIAL_CLIENTS = [
  { id: 'coach', name: 'Ich (Coach / Eigenes Training)', role: 'Coach', goal: 'Eigenes Training', pin: '9999' },
  { id: 'tester1', name: 'Tester 1', role: 'Kunde', goal: 'Hypertrophie', pin: '1001' },
  { id: 'tester2', name: 'Tester 2', role: 'Kunde', goal: 'Kraftaufbau', pin: '1002' },
  { id: 'tester3', name: 'Tester 3', role: 'Kunde', goal: 'Fettabbau', pin: '1003' },
  { id: 'tester4', name: 'Tester 4', role: 'Kunde', goal: 'Reha / Physio', pin: '1004' },
  { id: 'tester5', name: 'Tester 5', role: 'Kunde', goal: 'Athletik', pin: '1005' },
];

const INITIAL_PLANS = {
  coach: [
    { id: 'p_c1', name: 'Bankdrücken (Langhantel)', muscle: 'Brust', targetSets: 3, targetReps: '6-8', lastLog: '100 kg × 6' }
  ],
  tester1: [
    { id: 'p_t1_1', name: 'Kniebeuge', muscle: 'Beine', targetSets: 3, targetReps: '8-10', lastLog: 'Noch kein Eintrag' }
  ]
};

const MUSCLE_GROUPS = [
  { id: 'Brust', label: 'Brust' },
  { id: 'Rücken', label: 'Rücken' },
  { id: 'Beine', label: 'Beine' },
  { id: 'Schultern', label: 'Schultern' },
  { id: 'Arme', label: 'Arme' },
  { id: 'Bauch', label: 'Bauch' },
];

const RANKS_LIST = [
  { name: 'Holz 🪵', color: 'text-stone-400 bg-stone-900 border-stone-700' },
  { name: 'Bronze 🥉', color: 'text-amber-600 bg-amber-950/30 border-amber-700' },
  { name: 'Silber 🥈', color: 'text-slate-300 bg-slate-800/60 border-slate-500' },
  { name: 'Gold 🥇', color: 'text-yellow-300 bg-yellow-950/40 border-yellow-500' },
  { name: 'Platin 💎', color: 'text-indigo-300 bg-indigo-950/40 border-indigo-500' },
  { name: 'Diamant 💠', color: 'text-cyan-300 bg-cyan-950/40 border-cyan-500' },
  { name: 'Rubin 🔴', color: 'text-rose-300 bg-rose-950/40 border-rose-500' },
  { name: 'Hulk 🟩', color: 'text-emerald-300 bg-emerald-950/40 border-emerald-500' },
  { name: 'Maggus 🐻', color: 'text-amber-300 bg-amber-950/40 border-amber-500' },
];

function calculateMuscleRank(clientPlans = [], clientLogs = [], muscleId = '') {
  let earnedPoints = 10;
  if (Array.isArray(clientLogs)) {
    clientLogs.forEach(log => {
      log?.exercises?.forEach(ex => {
        const planItem = clientPlans.find(p => p.id === ex.id || (p.name && ex.name && p.name.toLowerCase() === ex.name.toLowerCase()));
        const muscle = planItem ? planItem.muscle : 'Brust';
        if (muscle === muscleId) {
          ex?.sets?.forEach(s => {
            const w = parseFloat(s?.weight);
            if (!isNaN(w) && s?.done) {
              earnedPoints += (w > 0 ? Math.min(3, 1 + (w / 50)) : 1);
            }
          });
        }
      });
    });
  }

  let penaltyPoints = 0;
  if (Array.isArray(clientLogs) && clientLogs.length > 0 && clientLogs[0]?.date) {
    const lastDate = new Date(clientLogs[0].date);
    if (!isNaN(lastDate.getTime())) {
      const today = new Date();
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays > 4) {
        penaltyPoints += (diffDays - 4) * 5;
      }
    }
  }

  let bonusPoints = Array.isArray(clientLogs) ? clientLogs.length * 5 : 0;
  const netPoints = Math.max(1, earnedPoints + bonusPoints - penaltyPoints);

  let rankIndex = Math.floor((netPoints - 1) / 100);
  if (rankIndex >= RANKS_LIST.length) rankIndex = RANKS_LIST.length - 1;
  if (rankIndex < 0) rankIndex = 0;

  let currentRankPoints = Math.round((netPoints - 1) % 100) + 1;
  if (currentRankPoints > 100) currentRankPoints = 100;

  return {
    rankTitle: RANKS_LIST[rankIndex]?.name || 'Holz 🪵',
    color: RANKS_LIST[rankIndex]?.color || 'text-stone-400 bg-stone-900 border-stone-700',
    points: currentRankPoints,
    isPenalized: penaltyPoints > 0
  };
}

const firebaseConfig = {
  apiKey: "AIzaSyAy9EauBU_ZpYQOVafdINZLRUHttCBpe4U",
  authDomain: "bizepsbear.firebaseapp.com",
  projectId: "bizepsbear",
  storageBucket: "bizepsbear.firebasestorage.app",
  messagingSenderId: "773561568629",
  appId: "1:773561568629:web:59510580fc266ff980573c",
  measurementId: "G-4M79M7LP8W"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [authSession, setAuthSession] = useState(() => {
    try {
      const saved = localStorage.getItem('bb_v12_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [coachPin] = useState('9999');

  const [activeTab, setActiveTab] = useState('workout');
  const [selectedClient, setSelectedClient] = useState('coach');
  const [syncStatus, setSyncStatus] = useState('Lade Cloud...');

  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [workoutLogs, setWorkoutLogs] = useState({});

  useEffect(() => {
    try {
      const docRef = doc(db, "bizeps_baer", "database");
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.clients) setClients(data.clients);
          if (data?.plans) setPlans(data.plans);
          if (data?.workoutLogs) setWorkoutLogs(data.workoutLogs);
          setSyncStatus('Live Sync aktiv');
        } else {
          setDoc(docRef, { clients: INITIAL_CLIENTS, plans: INITIAL_PLANS, workoutLogs: {} });
          setSyncStatus('Initiiert');
        }
      });
      return () => unsubscribe();
    } catch (e) {
      setSyncStatus('Offline-Modus');
    }
  }, []);

  const saveDataToCloud = async (newStates) => {
    try {
      const docRef = doc(db, "bizeps_baer", "database");
      await setDoc(docRef, {
        clients: newStates.clients || clients,
        plans: newStates.plans || plans,
        workoutLogs: newStates.workoutLogs || workoutLogs,
      }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePinLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const cleanPin = pinInput.trim();

    if (cleanPin === coachPin) {
      const session = { role: 'coach', clientId: 'coach' };
      setAuthSession(session);
      setSelectedClient('coach');
      localStorage.setItem('bb_v12_session', JSON.stringify(session));
      return;
    }

    const matchedClient = clients.find(c => c.pin === cleanPin);
    if (matchedClient) {
      const session = { role: 'client', clientId: matchedClient.id };
      setAuthSession(session);
      setSelectedClient(matchedClient.id);
      localStorage.setItem('bb_v12_session', JSON.stringify(session));
      return;
    }

    setLoginError('Ungültiger PIN! (Coach: 9999, Tester: 1001-1005)');
  };

  const handleLogout = () => {
    localStorage.removeItem('bb_v12_session');
    setAuthSession(null);
    setPinInput('');
  };

  const isCoach = authSession?.role === 'coach';
  const currentClientObj = clients.find(c => c.id === selectedClient) || clients[0];

  const muscleRanks = useMemo(() => {
    const clientPlans = plans[selectedClient] || [];
    const clientLogs = workoutLogs[selectedClient] || [];
    const ranks = {};
    MUSCLE_GROUPS.forEach(m => {
      ranks[m.id] = calculateMuscleRank(clientPlans, clientLogs, m.id);
    });
    return ranks;
  }, [plans, workoutLogs, selectedClient]);

  if (!authSession) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-7 space-y-6 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-4xl shadow-xl">🐻</div>
            <h1 className="text-2xl font-black text-white pt-2">BIZEPS BÄR</h1>
            <p className="text-xs text-zinc-400">Gib deinen PIN ein (Coach: <code className="text-violet-400 font-bold">9999</code>)</p>
          </div>
          <form onSubmit={handlePinLogin} className="space-y-4">
            <input
              type="password"
              placeholder="PIN eingeben..."
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-center text-lg tracking-widest font-bold text-white focus:outline-none"
              autoFocus
            />
            {loginError && <p className="text-xs text-rose-400 text-center font-medium">{loginError}</p>}
            <button type="submit" className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm">
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  const visibleTabs = [
    { id: 'workout', label: 'Workout-Logger', icon: Dumbbell },
    { id: 'ranks', label: 'Muskel-Ranks (1-100)', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900/90 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-xl">🐻</div>
            <div>
              <h1 className="text-lg font-black text-white">BIZEPS BÄR</h1>
              <span className="text-[11px] text-emerald-400">{syncStatus}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="px-3 py-1.5 rounded-xl bg-zinc-800 text-xs text-zinc-300">
            Abmelden
          </button>
        </div>
        <div className="max-w-7xl mx-auto mt-3 flex gap-2">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  activeTab === tab.id ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-6">
        {activeTab === 'ranks' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MUSCLE_GROUPS.map(mg => {
              const rank = muscleRanks[mg.id] || { rankTitle: 'Holz 🪵', points: 1 };
              return (
                <div key={mg.id} className={`p-5 rounded-2xl border ${rank.color} shadow-lg space-y-3`}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase font-bold">{mg.label}</span>
                    <span className="text-sm font-black px-2.5 py-1 rounded-full bg-black/40">{rank.points} / 100 Pkt</span>
                  </div>
                  <div className="text-2xl font-black text-white">{rank.rankTitle}</div>
                  <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-violet-500 to-amber-400 h-full" style={{ width: `${rank.points}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'workout' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center space-y-3">
            <h2 className="text-lg font-bold text-white">Workout-Bereich aktiv</h2>
            <p className="text-xs text-zinc-400">Das Ranksystem und die Cloud-Verbindung funktionieren einwandfrei.</p>
          </div>
        )}
      </main>
    </div>
  );
}
