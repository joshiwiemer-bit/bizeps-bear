import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { 
  Dumbbell, Users, Calendar, Plus, Check, Clock, 
  Activity, Save, Download, Trash2, HeartPulse, Video, 
  Share2, KeyRound, Eye, Award, AlertTriangle, LogOut, ShieldCheck, Lock, TrendingUp
} from 'lucide-react';

const INITIAL_CLIENTS = [
  { id: 'coach', name: 'Ich (Coach / Eigenes Training)', role: 'Coach', pin: '9999' },
  { id: 'cassian', name: 'Cassian', role: 'Kunde', pin: '1001' },
  { id: 'sky', name: 'Sky', role: 'Kunde', pin: '1002' },
  { id: 'aaron', name: 'Aaron', role: 'Kunde', pin: '1003' },
  { id: 'pookiepavel', name: 'Pookiepavel', role: 'Kunde', pin: '1004' },
  { id: 'celina', name: 'Celina', role: 'Kunde', pin: '1005' },
  { id: 'tester6', name: 'Tester 6', role: 'Kunde', pin: '1006' },
  { id: 'tester7', name: 'Tester 7', role: 'Kunde', pin: '1007' },
  { id: 'tester8', name: 'Tester 8', role: 'Kunde', pin: '1008' },
  { id: 'tester9', name: 'Tester 9', role: 'Kunde', pin: '1009' },
  { id: 'tester10', name: 'Tester 10', role: 'Kunde', pin: '1010' },
];

const INITIAL_PLANS = {
  coach: [
    { id: 'p_c1', name: 'Bankdrücken (Langhantel)', muscle: 'Brust', targetSets: 3, targetReps: '6-8', lastLog: '100 kg × 6' }
  ],
  cassian: [
    { id: 'p_cas1', name: 'Kniebeuge', muscle: 'Beine', targetSets: 3, targetReps: '8-10', lastLog: 'Noch kein Eintrag' }
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
      const saved = localStorage.getItem('bb_v13_session');
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
  const [activeWorkoutSets, setActiveWorkoutSets] = useState({});

  const [customPlanEx, setCustomPlanEx] = useState({
    name: '', muscle: 'Brust', targetSets: 3, targetReps: '8-10', note: ''
  });

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

  useEffect(() => {
    const currentPlan = plans[selectedClient] || [];
    setActiveWorkoutSets(prev => {
      const nextSets = {};
      currentPlan.forEach(item => {
        if (prev[item.id] && prev[item.id].length > 0) {
          nextSets[item.id] = prev[item.id];
        } else {
          nextSets[item.id] = Array.from({ length: Number(item.targetSets) || 3 }, () => ({
            weight: '', reps: '', rpe: '', done: false
          }));
        }
      });
      return nextSets;
    });
  }, [selectedClient, plans]);

  const handlePinLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const cleanPin = pinInput.trim();

    if (cleanPin === coachPin) {
      const session = { role: 'coach', clientId: 'coach' };
      setAuthSession(session);
      setSelectedClient('coach');
      localStorage.setItem('bb_v13_session', JSON.stringify(session));
      return;
    }

    const matchedClient = clients.find(c => c.pin === cleanPin);
    if (matchedClient) {
      const session = { role: 'client', clientId: matchedClient.id };
      setAuthSession(session);
      setSelectedClient(matchedClient.id);
      localStorage.setItem('bb_v13_session', JSON.stringify(session));
      return;
    }

    setLoginError('Ungültiger PIN! (Coach: 9999, Tester: 1001-1010)');
  };

  const handleLogout = () => {
    localStorage.removeItem('bb_v13_session');
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

  const handleAddCustomExerciseToPlan = (e) => {
    e.preventDefault();
    if (!customPlanEx.name.trim()) return;

    const newPlanItem = {
      id: 'plan_ex_' + Date.now(),
      name: customPlanEx.name.trim(),
      muscle: customPlanEx.muscle,
      targetSets: Number(customPlanEx.targetSets) || 3,
      targetReps: customPlanEx.targetReps || '8-10',
      note: customPlanEx.note || '',
      lastLog: 'Neu'
    };

    const updatedPlans = {
      ...plans,
      [selectedClient]: [...(plans[selectedClient] || []), newPlanItem]
    };
    setPlans(updatedPlans);
    saveDataToCloud({ plans: updatedPlans });
    setCustomPlanEx({ name: '', muscle: 'Brust', targetSets: 3, targetReps: '8-10', note: '' });
  };

  const handleRemovePlanItem = (itemId) => {
    const updatedPlans = {
      ...plans,
      [selectedClient]: (plans[selectedClient] || []).filter(item => item.id !== itemId)
    };
    setPlans(updatedPlans);
    saveDataToCloud({ plans: updatedPlans });
  };

  const handleSetChange = (planItemId, setIndex, field, value) => {
    setActiveWorkoutSets(prev => {
      const updated = [...(prev[planItemId] || [])];
      updated[setIndex] = { ...updated[setIndex], [field]: value };
      return { ...prev, [planItemId]: updated };
    });
  };

  const toggleSetDone = (planItemId, setIndex) => {
    setActiveWorkoutSets(prev => {
      const updated = [...(prev[planItemId] || [])];
      updated[setIndex] = { ...updated[setIndex], done: !updated[setIndex].done };
      return { ...prev, [planItemId]: updated };
    });
  };

  const finishWorkout = () => {
    const currentPlan = plans[selectedClient] || [];
    if (currentPlan.length === 0) return alert('Keine Übungen im Plan.');

    const loggedExercises = currentPlan.map(item => ({
      id: item.id,
      name: item.name,
      sets: (activeWorkoutSets[item.id] || []).filter(s => s.done || s.weight || s.reps)
    }));

    const newLog = {
      id: 'w_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      exercises: loggedExercises
    };

    const updatedLogs = {
      ...workoutLogs,
      [selectedClient]: [newLog, ...(workoutLogs[selectedClient] || [])]
    };

    setWorkoutLogs(updatedLogs);
    saveDataToCloud({ workoutLogs: updatedLogs });
    alert('Training gespeichert! +5 Wochen-Bonus gutgeschrieben.');
    setActiveTab('ranks');
  };

  if (!authSession) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-7 space-y-6 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-4xl shadow-xl">🐻</div>
            <h1 className="text-2xl font-black text-white pt-2">BIZEPS BÄR</h1>
            <p className="text-xs text-zinc-400">PIN eingeben (Coach: <code className="text-violet-400 font-bold">9999</code> | Cassian: <code className="text-violet-400 font-bold">1001</code>)</p>
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

  const visibleTabs = isCoach
    ? [
        { id: 'workout', label: 'Workout-Logger', icon: Dumbbell },
        { id: 'plans', label: 'Plan verwalten', icon: Calendar },
        { id: 'ranks', label: 'Muskel-Ranks (1-100)', icon: Award },
      ]
    : [
        { id: 'workout', label: 'Mein Training', icon: Dumbbell },
        { id: 'ranks', label: '🏆 Meine Muskel-Ranks', icon: Award },
      ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900/90 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-xl">🐻</div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">BIZEPS BÄR</h1>
                {isCoach && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold">COACH</span>}
              </div>
              <span className="text-[11px] text-emerald-400">{syncStatus}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCoach && (
              <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5">
                <Users className="w-4 h-4 text-violet-400" />
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-white focus:outline-none"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id} className="bg-zinc-900 text-white">
                      {c.name} (PIN: {c.pin})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-xl bg-zinc-800 text-xs text-zinc-300">
              Sperren
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-3 flex gap-2 overflow-x-auto pb-1">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
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
        {/* RANKS TAB */}
        {activeTab === 'ranks' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Ranks für: {currentClientObj?.name}</h2>
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
          </div>
        )}

        {/* WORKOUT TAB */}
        {activeTab === 'workout' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Workout – {currentClientObj?.name}</h2>
                <p className="text-xs text-zinc-400">Trage deine Sätze ein und speichere das Training.</p>
              </div>
              <button onClick={finishWorkout} className="px-4 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm">
                Training abschließen & speichern
              </button>
            </div>

            {(plans[selectedClient] || []).length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 text-sm">
                Keine Übungen im Plan für diesen Tester. Wechsel als Coach in den Tab „Plan verwalten“, um Übungen hinzuzufügen!
              </div>
            ) : (
              (plans[selectedClient] || []).map((planItem, idx) => {
                const sets = activeWorkoutSets[planItem.id] || [];
                return (
                  <div key={planItem.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{idx + 1}. {planItem.name} ({planItem.muscle})</span>
                      <span className="text-xs text-violet-300 bg-violet-950 px-2.5 py-1 rounded-lg">Ziel: {planItem.targetSets} Sätze</span>
                    </div>
                    <div className="space-y-2">
                      {sets.map((s, sIdx) => (
                        <div key={sIdx} className="grid grid-cols-12 gap-2 items-center bg-zinc-800/40 p-2 rounded-xl">
                          <span className="col-span-2 text-xs font-bold text-zinc-400">#{sIdx + 1}</span>
                          <input
                            type="number" placeholder="kg" value={s.weight}
                            onChange={(e) => handleSetChange(planItem.id, sIdx, 'weight', e.target.value)}
                            className="col-span-4 bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-sm text-white"
                          />
                          <input
                            type="number" placeholder="Wdh" value={s.reps}
                            onChange={(e) => handleSetChange(planItem.id, sIdx, 'reps', e.target.value)}
                            className="col-span-4 bg-zinc-900 border border-zinc-700 rounded-lg p-1.5 text-sm text-white"
                          />
                          <button
                            onClick={() => toggleSetDone(planItem.id, sIdx)}
                            className={`col-span-2 h-9 rounded-lg flex items-center justify-center ${s.done ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PLANS TAB (NUR FÜR COACH) */}
        {isCoach && activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-lg font-bold text-white">Trainingsplan erstellen für {currentClientObj?.name}</h2>
              <form onSubmit={handleAddCustomExerciseToPlan} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text" required placeholder="Übungsname (z.B. Bankdrücken)"
                    value={customPlanEx.name} onChange={e => setCustomPlanEx({ ...customPlanEx, name: e.target.value })}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white"
                  />
                  <select
                    value={customPlanEx.muscle} onChange={e => setCustomPlanEx({ ...customPlanEx, muscle: e.target.value })}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white"
                  >
                    {MUSCLE_GROUPS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <button type="submit" className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">
                  + Übung zum Plan hinzufügen
                </button>
              </form>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white">Aktueller Plan von {currentClientObj?.name}</h3>
              {(plans[selectedClient] || []).length === 0 ? (
                <p className="text-xs text-zinc-500">Noch keine Übungen eingetragen.</p>
              ) : (
                (plans[selectedClient] || []).map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      <span className="text-xs text-violet-300 ml-2">({item.muscle})</span>
                    </div>
                    <button onClick={() => handleRemovePlanItem(item.id)} className="p-2 rounded-lg bg-zinc-800 text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
