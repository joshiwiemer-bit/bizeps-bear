import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { 
  Dumbbell, Users, Calendar, Plus, Check, Clock, 
  Activity, Save, Download, Trash2, HeartPulse, Video, 
  Share2, KeyRound, Eye, Award, AlertTriangle
} from 'lucide-react';

const INITIAL_CLIENTS = [
  { id: 'coach', name: 'Ich (Coach / Eigenes Training)', role: 'Coach', goal: 'Eigenes Training', pin: '9999' },
  { id: 'tester1', name: 'Tester 1', role: 'Kunde', goal: 'Hypertrophie', pin: '1001' },
  { id: 'tester2', name: 'Tester 2', role: 'Kunde', goal: 'Kraftaufbau', pin: '1002' },
  { id: 'tester3', name: 'Tester 3', role: 'Kunde', goal: 'Fettabbau', pin: '1003' },
  { id: 'tester4', name: 'Tester 4', role: 'Kunde', goal: 'Reha / Physio', pin: '1004' },
  { id: 'tester5', name: 'Tester 5', role: 'Kunde', goal: 'Athletik', pin: '1005' },
  { id: 'tester6', name: 'Tester 6', role: 'Kunde', goal: 'Hypertrophie', pin: '1006' },
  { id: 'tester7', name: 'Tester 7', role: 'Kunde', goal: 'Kraftaufbau', pin: '1007' },
  { id: 'tester8', name: 'Tester 8', role: 'Kunde', goal: 'Fettabbau', pin: '1008' },
  { id: 'tester9', name: 'Tester 9', role: 'Kunde', goal: 'Reha / Physio', pin: '1009' },
  { id: 'tester10', name: 'Tester 10', role: 'Kunde', goal: 'Athletik', pin: '1010' },
  { id: 'tester11', name: 'Tester 11', role: 'Kunde', goal: 'Hypertrophie', pin: '1011' },
  { id: 'tester12', name: 'Tester 12', role: 'Kunde', goal: 'Kraftaufbau', pin: '1012' },
  { id: 'tester13', name: 'Tester 13', role: 'Kunde', goal: 'Fettabbau', pin: '1013' },
  { id: 'tester14', name: 'Tester 14', role: 'Kunde', goal: 'Reha / Physio', pin: '1014' },
  { id: 'tester15', name: 'Tester 15', role: 'Kunde', goal: 'Athletik', pin: '1015' },
  { id: 'tester16', name: 'Tester 16', role: 'Kunde', goal: 'Hypertrophie', pin: '1016' },
  { id: 'tester17', name: 'Tester 17', role: 'Kunde', goal: 'Kraftaufbau', pin: '1017' },
  { id: 'tester18', name: 'Tester 18', role: 'Kunde', goal: 'Fettabbau', pin: '1018' },
  { id: 'tester19', name: 'Tester 19', role: 'Kunde', goal: 'Reha / Physio', pin: '1019' },
  { id: 'tester20', name: 'Tester 20', role: 'Kunde', goal: 'Athletik', pin: '1020' },
];

const INITIAL_PLANS = {
  coach: [
    { id: 'p_c1', name: 'Bankdrücken (Langhantel)', muscle: 'Brust', equipment: 'Langhantel', targetSets: 3, targetReps: '6-8', targetRpe: '8.5', tempo: '3-1-1-0', note: 'Saubere Ablage auf der Brust', lastLog: '100 kg × 6' }
  ],
  tester1: [
    { id: 'p_t1_1', name: 'Kniebeuge', muscle: 'Beine', equipment: 'Langhantel', targetSets: 3, targetReps: '8-10', targetRpe: '8', tempo: '3-0-1-0', note: 'Tiefe halten', lastLog: 'Noch kein Eintrag' }
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

const MEASUREMENT_METRICS = [
  { key: 'weight', label: 'Gewicht', unit: 'kg' },
  { key: 'shoulders', label: 'Schultern', unit: 'cm' },
  { key: 'chest', label: 'Brust', unit: 'cm' },
  { key: 'waist', label: 'Taille', unit: 'cm' },
  { key: 'belly', label: 'Bauch', unit: 'cm' },
  { key: 'hips', label: 'Po / Hüfte', unit: 'cm' },
  { key: 'upperArm', label: 'Oberarm', unit: 'cm' },
  { key: 'forearm', label: 'Unterarm', unit: 'cm' },
  { key: 'thigh', label: 'Oberschenkel', unit: 'cm' },
  { key: 'calf', label: 'Unterschenkel', unit: 'cm' },
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

function getExercisePointValue(exerciseName = '') {
  const name = exerciseName.toLowerCase();
  if (name.includes('bankdrücken') || name.includes('kniebeuge') || name.includes('kreuzheben') || name.includes('klimmzug')) {
    return 3.0;
  }
  if (name.includes('rudern') || name.includes('schulterdrücken') || name.includes('dips') || name.includes('beinpresse')) {
    return 2.5;
  }
  return 1.5;
}

function calculateMuscleRank(clientPlans, clientLogs, muscleId) {
  let earnedPoints = 10;

  clientLogs.forEach(log => {
    log.exercises?.forEach(ex => {
      const planItem = clientPlans.find(p => p.id === ex.id || p.name.toLowerCase() === ex.name.toLowerCase());
      const muscle = planItem ? planItem.muscle : 'Brust';

      if (muscle === muscleId) {
        const baseVal = getExercisePointValue(ex.name);
        ex.sets?.forEach(s => {
          const w = parseFloat(s.weight);
          const r = parseInt(s.reps);
          if (!isNaN(w) && !isNaN(r) && s.done) {
            earnedPoints += baseVal * (w > 0 ? Math.min(1.5, 0.5 + (w / 100)) : 1);
          }
        });
      }
    });
  });

  let penaltyPoints = 0;
  if (clientLogs.length > 0) {
    const lastLog = clientLogs[0];
    const lastDate = new Date(lastLog.date);
    const today = new Date();
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 4) {
      penaltyPoints += (diffDays - 4) * 5;
    }
  }

  let bonusPoints = clientLogs.length * 5;
  const netPoints = Math.max(1, earnedPoints + bonusPoints - penaltyPoints);

  let rankIndex = Math.floor((netPoints - 1) / 100);
  if (rankIndex >= RANKS_LIST.length) rankIndex = RANKS_LIST.length - 1;

  let currentRankPoints = Math.round((netPoints - 1) % 100) + 1;
  if (currentRankPoints > 100) currentRankPoints = 100;

  return {
    rankTitle: RANKS_LIST[rankIndex].name,
    color: RANKS_LIST[rankIndex].color,
    points: currentRankPoints,
    totalNet: netPoints,
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
    const saved = localStorage.getItem('bb_v10_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [coachPin, setCoachPin] = useState('9999');

  const [activeTab, setActiveTab] = useState('workout');
  const [selectedClient, setSelectedClient] = useState('coach');
  const [syncStatus, setSyncStatus] = useState('Lade Cloud...');

  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [measurements, setMeasurements] = useState({});
  const [workoutLogs, setWorkoutLogs] = useState({});
  const [checkupNotes, setCheckupNotes] = useState({});

  useEffect(() => {
    const docRef = doc(db, "bizeps_baer", "database");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.clients) setClients(data.clients);
        if (data.plans) setPlans(data.plans);
        if (data.measurements) setMeasurements(data.measurements);
        if (data.workoutLogs) setWorkoutLogs(data.workoutLogs);
        if (data.checkupNotes) setCheckupNotes(data.checkupNotes);
        if (data.coachPin) setCoachPin(data.coachPin);
        setSyncStatus('Live Sync aktiv');
      } else {
        setDoc(docRef, {
          clients: INITIAL_CLIENTS,
          plans: INITIAL_PLANS,
          measurements: {},
          workoutLogs: {},
          checkupNotes: {},
          coachPin: '9999'
        });
        setSyncStatus('Initiiert');
      }
    }, (error) => {
      console.error(error);
      setSyncStatus('Offline-Modus');
    });

    return () => unsubscribe();
  }, []);

  const saveDataToCloud = async (newStates) => {
    setSyncStatus('Speichere...');
    try {
      const docRef = doc(db, "bizeps_baer", "database");
      await setDoc(docRef, {
        clients: newStates.clients || clients,
        plans: newStates.plans || plans,
        measurements: newStates.measurements || measurements,
        workoutLogs: newStates.workoutLogs || workoutLogs,
        checkupNotes: newStates.checkupNotes || checkupNotes,
        coachPin: newStates.coachPin || coachPin
      }, { merge: true });
      setSyncStatus('Live Sync aktiv');
    } catch (err) {
      console.error(err);
      setSyncStatus('Fehler beim Speichern');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlClient = params.get('client');
    if (urlClient && clients.some(c => c.id === urlClient)) {
      const session = { role: 'client', clientId: urlClient };
      setAuthSession(session);
      setSelectedClient(urlClient);
      localStorage.setItem('bb_v10_session', JSON.stringify(session));
    }
  }, [clients]);

  useEffect(() => {
    if (authSession?.role === 'client') {
      setSelectedClient(authSession.clientId);
      if (activeTab === 'plans') {
        setActiveTab('workout');
      }
    }
  }, [authSession, activeTab]);

  const isCoach = authSession?.role === 'coach';

  const handlePinLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const cleanPin = pinInput.trim();

    if (cleanPin === coachPin) {
      const session = { role: 'coach', clientId: 'coach' };
      setAuthSession(session);
      setSelectedClient('coach');
      localStorage.setItem('bb_v10_session', JSON.stringify(session));
      setPinInput('');
      return;
    }

    const matchedClient = clients.find(c => c.id !== 'coach' && c.pin === cleanPin);
    if (matchedClient) {
      const session = { role: 'client', clientId: matchedClient.id };
      setAuthSession(session);
      setSelectedClient(matchedClient.id);
      localStorage.setItem('bb_v10_session', JSON.stringify(session));
      setPinInput('');
      return;
    }

    setLoginError('Ungültiger PIN! (Coach: 9999, Tester: 1001-1020)');
  };

  const handleLogout = () => {
    localStorage.removeItem('bb_v10_session');
    setAuthSession(null);
    setPinInput('');
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const switchToClientPreview = () => {
    if (selectedClient === 'coach') {
      alert('Bitte wähle oben einen Tester aus.');
      return;
    }
    const session = { role: 'client', clientId: selectedClient };
    setAuthSession(session);
    localStorage.setItem('bb_v10_session', JSON.stringify(session));
  };

  const copyClientLink = (clientId) => {
    const url = `${window.location.origin}${window.location.pathname}?client=${clientId}`;
    navigator.clipboard.writeText(url);
    const c = clients.find(x => x.id === clientId);
    alert(`Link für ${c?.name} kopiert!\nPIN: ${c?.pin}\n\nLink: ${url}`);
  };

  const muscleRanks = useMemo(() => {
    const clientPlans = plans[selectedClient] || [];
    const clientLogs = workoutLogs[selectedClient] || [];

    const ranks = {};
    MUSCLE_GROUPS.forEach(m => {
      ranks[m.id] = calculateMuscleRank(clientPlans, clientLogs, m.id);
    });

    return ranks;
  }, [plans, workoutLogs, selectedClient]);

  const [activeWorkoutSets, setActiveWorkoutSets] = useState({});
  const [exerciseFeedback, setExerciseFeedback] = useState({});
  const [sessionMeta, setSessionMeta] = useState({ energyLevel: 8, sleepHours: 7.5, sessionNote: '' });
  const [restTimer, setRestTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const [customPlanEx, setCustomPlanEx] = useState({
    name: '', muscle: 'Brust', equipment: 'Frei',
    targetSets: 3, targetReps: '8-10', targetRpe: '8', tempo: '3-1-1-0', note: ''
  });

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

    setExerciseFeedback(prev => {
      const nextFb = {};
      currentPlan.forEach(item => {
        nextFb[item.id] = prev[item.id] || { painLevel: 0, painArea: '', note: '', videoUrl: '', videoName: '' };
      });
      return nextFb;
    });
  }, [selectedClient, plans]);

  useEffect(() => {
    if (!timerActive || restTimer <= 0) {
      if (restTimer <= 0) setTimerActive(false);
      return;
    }
    const interval = setInterval(() => setRestTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive, restTimer]);

  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [chartRange, setChartRange] = useState('month');
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [newMeasure, setNewMeasure] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '', shoulders: '', chest: '', waist: '', belly: '', hips: '', upperArm: '', forearm: '', thigh: '', calf: ''
  });

  const [showBackupModal, setShowBackupModal] = useState(false);

  const handleAddCustomExerciseToPlan = (e) => {
    e.preventDefault();
    if (!customPlanEx.name.trim()) return;

    const planEntryId = 'plan_ex_' + Date.now();
    const newPlanItem = {
      id: planEntryId,
      name: customPlanEx.name.trim(),
      muscle: customPlanEx.muscle.trim() || 'Allgemein',
      equipment: customPlanEx.equipment.trim() || 'Frei',
      targetSets: Number(customPlanEx.targetSets) || 3,
      targetReps: customPlanEx.targetReps || '8-10',
      targetRpe: customPlanEx.targetRpe || '8',
      tempo: customPlanEx.tempo || '',
      note: customPlanEx.note || '',
      lastLog: 'Neu'
    };

    const updatedPlans = {
      ...plans,
      [selectedClient]: [...(plans[selectedClient] || []), newPlanItem]
    };
    setPlans(updatedPlans);
    saveDataToCloud({ plans: updatedPlans });

    setCustomPlanEx({
      name: '', muscle: 'Brust', equipment: 'Frei',
      targetSets: 3, targetReps: '8-10', targetRpe: '8', tempo: '3-1-1-0', note: ''
    });
  };

  const handleUpdatePlanItem = (itemId, field, value) => {
    const updatedPlans = {
      ...plans,
      [selectedClient]: (plans[selectedClient] || []).map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    };
    setPlans(updatedPlans);
    saveDataToCloud({ plans: updatedPlans });
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

  const addSetToWorkoutExercise = (planItemId) => {
    setActiveWorkoutSets(prev => ({
      ...prev,
      [planItemId]: [...(prev[planItemId] || []), { weight: '', reps: '', rpe: '', done: false }]
    }));
  };

  const removeSetFromWorkoutExercise = (planItemId, setIndex) => {
    setActiveWorkoutSets(prev => ({
      ...prev,
      [planItemId]: (prev[planItemId] || []).filter((_, idx) => idx !== setIndex)
    }));
  };

  const toggleSetDone = (planItemId, setIndex) => {
    setActiveWorkoutSets(prev => {
      const updated = [...(prev[planItemId] || [])];
      const newDone = !updated[setIndex].done;
      updated[setIndex] = { ...updated[setIndex], done: newDone };
      if (newDone) {
        setRestTimer(120);
        setTimerActive(true);
      }
      return { ...prev, [planItemId]: updated };
    });
  };

  const updateExerciseFeedback = (planItemId, field, value) => {
    setExerciseFeedback(prev => ({
      ...prev,
      [planItemId]: { ...(prev[planItemId] || {}), [field]: value }
    }));
  };

  const handleVideoFileUpload = (planItemId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setExerciseFeedback(prev => ({
      ...prev,
      [planItemId]: {
        ...(prev[planItemId] || {}),
        videoUrl: url,
        videoName: file.name
      }
    }));
  };

  const finishWorkout = () => {
    const currentPlan = plans[selectedClient] || [];
    if (currentPlan.length === 0) {
      alert('Es sind keine Übungen im Training vorhanden.');
      return;
    }

    const loggedExercises = currentPlan.map(item => {
      const fb = exerciseFeedback[item.id] || { painLevel: 0, painArea: '', note: '', videoUrl: '', videoName: '' };
      const sets = (activeWorkoutSets[item.id] || []).filter(s => s.done || s.weight || s.reps);
      return {
        id: item.id,
        name: item.name,
        painLevel: Number(fb.painLevel || 0),
        painArea: fb.painArea || '',
        note: fb.note || '',
        videoUrl: fb.videoUrl || '',
        videoName: fb.videoName || '',
        sets
      };
    });

    const updatedPlansForClient = (plans[selectedClient] || []).map(item => {
      const sets = (activeWorkoutSets[item.id] || []).filter(s => s.weight || s.reps);
      if (sets.length > 0) {
        const topSet = sets[sets.length - 1];
        return {
          ...item,
          lastLog: `${topSet.weight || 0} kg × ${topSet.reps || 0}${topSet.rpe ? ` @ RPE ${topSet.rpe}` : ''}`
        };
      }
      return item;
    });

    const updatedPlans = { ...plans, [selectedClient]: updatedPlansForClient };
    const newLog = {
      id: 'w_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      energyLevel: Number(sessionMeta.energyLevel),
      sleepHours: Number(sessionMeta.sleepHours),
      sessionNote: sessionMeta.sessionNote,
      exercises: loggedExercises
    };

    const updatedLogs = {
      ...workoutLogs,
      [selectedClient]: [newLog, ...(workoutLogs[selectedClient] || [])]
    };

    setPlans(updatedPlans);
    setWorkoutLogs(updatedLogs);
    saveDataToCloud({ plans: updatedPlans, workoutLogs: updatedLogs });

    alert('Training erfolgreich abgeschlossen! +5 Wochen-Bonus gutgeschrieben & Ranks aktualisiert.');
    setActiveTab('ranks');
  };

  const handleSaveMeasurement = (e) => {
    e.preventDefault();
    const parsed = { date: newMeasure.date };
    MEASUREMENT_METRICS.forEach(m => {
      parsed[m.key] = newMeasure[m.key] !== '' ? parseFloat(newMeasure[m.key]) : 0;
    });

    const clientList = [...(measurements[selectedClient] || []), parsed].sort((a, b) => a.date.localeCompare(b.date));
    const updatedMeasurements = { ...measurements, [selectedClient]: clientList };
    setMeasurements(updatedMeasurements);
    saveDataToCloud({ measurements: updatedMeasurements });
    setShowMeasureModal(false);
  };

  const handleUpdateCheckupNote = (val) => {
    const updatedNotes = { ...checkupNotes, [selectedClient]: val };
    setCheckupNotes(updatedNotes);
    saveDataToCloud({ checkupNotes: updatedNotes });
  };

  const clientMeasurements = useMemo(() => {
    const list = measurements[selectedClient] || [];
    return chartRange === 'month' ? list.slice(-4) : list;
  }, [measurements, selectedClient, chartRange]);

  const currentMetricObj = MEASUREMENT_METRICS.find(m => m.key === selectedMetric) || MEASUREMENT_METRICS[0];
  const currentClientObj = clients.find(c => c.id === selectedClient) || clients[0];

  if (!authSession) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-7 space-y-6 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-4xl shadow-xl shadow-violet-600/30">
              🐻
            </div>
            <h1 className="text-2xl font-black tracking-wider text-white pt-2">BIZEPS BÄR</h1>
            <span className="text-xs px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
              Cloud Coaching Portal
            </span>
            <p className="text-xs text-zinc-400 pt-1">
              Gib deinen PIN ein (Coach: <code className="text-violet-400 font-bold">9999</code> | Tester 1–20: <code className="text-violet-400 font-bold">1001</code> bis <code className="text-violet-400 font-bold">1020</code>).
            </p>
          </div>

          <form onSubmit={handlePinLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                Zugangs-PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-violet-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="PIN eingeben..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500 rounded-xl pl-10 pr-4 py-2.5 text-center text-lg tracking-widest font-bold text-white focus:outline-none"
                  autoFocus
                />
              </div>
              {loginError && (
                <p className="text-xs text-rose-400 mt-2 text-center font-medium">{loginError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/25 transition"
            >
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
        { id: 'checkup', label: 'Check-Up & Videos', icon: HeartPulse },
        { id: 'body', label: 'Körper & Umfänge', icon: TrendingUp },
      ]
    : [
        { id: 'workout', label: 'Mein Training', icon: Dumbbell },
        { id: 'ranks', label: '🏆 Meine Muskel-Ranks', icon: Award },
        { id: 'body', label: 'Meine Umfänge', icon: TrendingUp },
        { id: 'checkup', label: 'Mein Check-Up', icon: HeartPulse },
      ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center text-2xl shadow-lg shadow-violet-600/30">
              🐻
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wider text-white">BIZEPS BÄR</h1>
                {isCoach ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> COACH-MODUS
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                    {currentClientObj?.name} (PIN: {currentClientObj?.pin})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-zinc-400">{syncStatus}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isCoach ? (
              <>
                <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5">
                  <Users className="w-4 h-4 text-violet-400" />
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-white focus:outline-none max-w-[160px]"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id} className="bg-zinc-900 text-white">
                        {c.name} (PIN: {c.pin})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedClient !== 'coach' && (
                  <>
                    <button
                      onClick={() => copyClientLink(selectedClient)}
                      title="Direkt-Link kopieren"
                      className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-violet-300 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Link
                    </button>
                    <button
                      onClick={switchToClientPreview}
                      title="Tester-Ansicht testen"
                      className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Testen
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
                <Lock className="w-3.5 h-3.5 text-violet-400" />
                <span>Eingeloggt als <strong>{currentClientObj?.name}</strong></span>
              </div>
            )}

            <button
              onClick={() => setShowBackupModal(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition"
            >
              <Download className="w-3.5 h-3.5 text-violet-400" /> Cloud Info
            </button>

            <button
              onClick={handleLogout}
              title="Abmelden"
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl bg-zinc-800 hover:bg-rose-950 border border-zinc-700 text-zinc-400 hover:text-rose-300 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Sperren
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-3 flex gap-2 overflow-x-auto pb-1">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                  active
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {activeTab === 'ranks' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-violet-900/40 via-zinc-900 to-zinc-900 border border-violet-500/30 rounded-3xl p-6 shadow-xl flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-violet-400" />
                <div>
                  <h2 className="text-xl font-black text-white">Muskel-Ranks (1–100 Pkt) – {currentClientObj?.name}</h2>
                  <p className="text-xs text-zinc-400">
                    Jeder Rang hat 100 Punkte. Jede Übung gibt gezielt Punkte. +5 Bonus bei Wochen-Abschluss! ⚠️ 4 Tage Inaktivität = Abzug.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MUSCLE_GROUPS.map(mg => {
                const rank = muscleRanks[mg.id] || { rankTitle: 'Holz 🪵', points: 1, isPenalized: false };
                return (
                  <div key={mg.id} className={`p-5 rounded-2xl border ${rank.color} shadow-lg space-y-3 relative overflow-hidden`}>
                    {rank.isPenalized && (
                      <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-xl flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Inaktivitäts-Malus aktiv!
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase tracking-wider font-bold opacity-80">{mg.label}</span>
                      <span className="text-sm font-black px-2.5 py-1 rounded-full bg-black/40 border border-white/10">
                        {rank.points} / 100 Pkt
                      </span>
                    </div>

                    <div className="text-2xl font-black tracking-wide text-white">
                      {rank.rankTitle}
                    </div>

                    <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10">
                      <div 
                        className="bg-gradient-to-r from-violet-500 to-amber-400 h-full transition-all duration-500" 
                        style={{ width: `${rank.points}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'workout' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-violet-400" />
                    {isCoach ? `Training loggen – ${currentClientObj?.name}` : 'Mein heutiges Training'}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Jede Übung bringt Punkte. Schließe das Training ab, um den +5 Wochen-Bonus einzustasseln!
                  </p>
                </div>
                <button
                  onClick={finishWorkout}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-violet-600/25 transition"
                >
                  <Save className="w-4 h-4" /> Training abschließen & +5 Bonus holen
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-zinc-800">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Tagesenergie (1–10)</label>
                  <input
                    type="number" min="1" max="10"
                    value={sessionMeta.energyLevel}
                    onChange={(e) => setSessionMeta({ ...sessionMeta, energyLevel: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Schlaf letzte Nacht (Std.)</label>
                  <input
                    type="number" step="0.5"
                    value={sessionMeta.sleepHours}
                    onChange={(e) => setSessionMeta({ ...sessionMeta, sleepHours: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Notiz für den Coach</label>
                  <input
                    type="text"
                    placeholder="z.B. Starker Pump heute..."
                    value={sessionMeta.sessionNote}
                    onChange={(e) => setSessionMeta({ ...sessionMeta, sessionNote: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleAddCustomExerciseToPlan} className="bg-zinc-900/90 border border-violet-500/30 rounded-2xl p-4 space-y-3">
              <div className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Übung hinzufügen oder tauschen
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <input
                  type="text" required placeholder="Übungsname (z.B. Bankdrücken)..."
                  value={customPlanEx.name}
                  onChange={(e) => setCustomPlanEx({ ...customPlanEx, name: e.target.value })}
                  className="sm:col-span-3 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                />
                <select
                  value={customPlanEx.muscle}
                  onChange={(e) => setCustomPlanEx({ ...customPlanEx, muscle: e.target.value })}
                  className="sm:col-span-3 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  {MUSCLE_GROUPS.map(m => (
                    <option key={m.id} value={m.id} className="bg-zinc-900">{m.label}</option>
                  ))}
                </select>
                <input
                  type="number" min="1" placeholder="Sätze"
                  value={customPlanEx.targetSets}
                  onChange={(e) => setCustomPlanEx({ ...customPlanEx, targetSets: e.target.value })}
                  className="sm:col-span-1 bg-zinc-800 border border-zinc-700 rounded-xl px-2.5 py-2 text-sm text-white"
                />
                <input
                  type="text" placeholder="Wdh"
                  value={customPlanEx.targetReps}
                  onChange={(e) => setCustomPlanEx({ ...customPlanEx, targetReps: e.target.value })}
                  className="sm:col-span-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                />
                <input
                  type="text" placeholder="Notiz"
                  value={customPlanEx.note}
                  onChange={(e) => setCustomPlanEx({ ...customPlanEx, note: e.target.value })}
                  className="sm:col-span-3 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button type="submit" className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Übung zum Training hinzufügen
                </button>
              </div>
            </form>

            {(plans[selectedClient] || []).length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center space-y-3">
                <Dumbbell className="w-10 h-10 text-violet-400 mx-auto opacity-80" />
                <h3 className="text-base font-bold text-white">Keine Übungen im Plan</h3>
                <p className="text-xs text-zinc-400">Füge oben deine erste Übung hinzu!</p>
              </div>
            ) : (
              (plans[selectedClient] || []).map((planItem, idx) => {
                const sets = activeWorkoutSets[planItem.id] || [];
                const fb = exerciseFeedback[planItem.id] || { painLevel: 0, painArea: '', note: '', videoUrl: '', videoName: '' };

                return (
                  <div key={planItem.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-400 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={planItem.name}
                            onChange={(e) => handleUpdatePlanItem(planItem.id, 'name', e.target.value)}
                            className="text-base font-bold text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-violet-500 focus:outline-none"
                          />
                          <span className="text-xs px-2 py-0.5 rounded bg-violet-950 text-violet-300 font-bold">{planItem.muscle}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          Vorgabe: <strong className="text-zinc-200">{planItem.targetSets} Sätze × {planItem.targetReps} Wdh.</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-zinc-400 block">Letztes Mal:</span>
                          <span className="text-xs font-semibold text-violet-300 bg-violet-950/50 border border-violet-800/50 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                            {planItem.lastLog || 'Neu'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemovePlanItem(planItem.id)}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-xs text-zinc-400 font-semibold px-2">
                        <div className="col-span-2">Satz</div>
                        <div className="col-span-3">Gewicht (kg)</div>
                        <div className="col-span-3">Wdh.</div>
                        <div className="col-span-2">RPE</div>
                        <div className="col-span-2 text-right">Fertig</div>
                      </div>

                      {sets.map((s, sIdx) => (
                        <div
                          key={sIdx}
                          className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition ${
                            s.done ? 'bg-violet-950/30 border-violet-600/40' : 'bg-zinc-800/40 border-zinc-800'
                          }`}
                        >
                          <div className="col-span-2 text-sm font-bold text-zinc-300 pl-1">#{sIdx + 1}</div>
                          <div className="col-span-3">
                            <input
                              type="number" step="0.5" placeholder="kg"
                              value={s.weight}
                              onChange={(e) => handleSetChange(planItem.id, sIdx, 'weight', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number" placeholder="Wdh"
                              value={s.reps}
                              onChange={(e) => handleSetChange(planItem.id, sIdx, 'reps', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number" step="0.5" placeholder="RPE"
                              value={s.rpe}
                              onChange={(e) => handleSetChange(planItem.id, sIdx, 'rpe', e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white"
                            />
                          </div>
                          <div className="col-span-2 flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => toggleSetDone(planItem.id, sIdx)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                                s.done ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSetFromWorkoutExercise(planItem.id, sIdx)}
                              className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-500 hover:text-rose-400 flex items-center justify-center"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addSetToWorkoutExercise(planItem.id)}
                        className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 pt-1 pl-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Satz hinzufügen
                      </button>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-3">
                          <label className="text-xs text-zinc-400 flex items-center justify-between mb-1">
                            <span>Schmerz (0–10):</span>
                            <span className={`font-bold ${fb.painLevel >= 4 ? 'text-rose-400' : 'text-violet-400'}`}>
                              {fb.painLevel}/10
                            </span>
                          </label>
                          <input
                            type="range" min="0" max="10"
                            value={fb.painLevel}
                            onChange={(e) => updateExerciseFeedback(planItem.id, 'painLevel', Number(e.target.value))}
                            className="w-full accent-violet-500 cursor-pointer"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="text-xs text-zinc-400 block mb-1">Betroffene Stelle</label>
                          <input
                            type="text" placeholder="z.B. Knie..."
                            value={fb.painArea}
                            onChange={(e) => updateExerciseFeedback(planItem.id, 'painArea', e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="md:col-span-5">
                          <label className="text-xs text-zinc-400 block mb-1">Notiz</label>
                          <input
                            type="text" placeholder="Feedback..."
                            value={fb.note}
                            onChange={(e) => updateExerciseFeedback(planItem.id, 'note', e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {timerActive && (
              <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-violet-950 border border-violet-500 rounded-2xl p-4 shadow-2xl flex items-center justify-between z-40">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-violet-300 animate-spin" />
                  <div>
                    <div className="text-xs text-violet-200">Satzpause</div>
                    <div className="text-xl font-black text-white">
                      {Math.floor(restTimer / 60)}:{String(restTimer % 60).padStart(2, '0')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setRestTimer(r => Math.max(0, r - 15))} className="px-2.5 py-1 rounded-lg bg-violet-800 text-xs">-15s</button>
                  <button onClick={() => setRestTimer(r => r + 15)} className="px-2.5 py-1 rounded-lg bg-violet-800 text-xs">+15s</button>
                  <button onClick={() => setTimerActive(false)} className="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs">Skip</button>
                </div>
              </div>
            )}
          </div>
        )}

        {isCoach && activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-lg font-bold text-white">Plan verwalten für {currentClientObj?.name}</h2>
              <form onSubmit={handleAddCustomExerciseToPlan} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-violet-300">✍️ Übung hinzufügen</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text" required placeholder="Übungsname"
                    value={customPlanEx.name}
                    onChange={e => setCustomPlanEx({ ...customPlanEx, name: e.target.value })}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  />
                  <select
                    value={customPlanEx.muscle}
                    onChange={e => setCustomPlanEx({ ...customPlanEx, muscle: e.target.value })}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    {MUSCLE_GROUPS.map(m => (
                      <option key={m.id} value={m.id} className="bg-zinc-900">{m.label}</option>
                    ))}
                  </select>
                  <input
                    type="text" placeholder="Equipment"
                    value={customPlanEx.equipment}
                    onChange={e => setCustomPlanEx({ ...customPlanEx, equipment: e.target.value })}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold">
                  + Hinzufügen
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'checkup' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-violet-400" />
                Check-Up – {currentClientObj?.name}
              </h2>
              <div className="mt-4">
                <label className="text-xs font-semibold text-violet-300 block mb-1.5">Coach-Feedback:</label>
                {isCoach ? (
                  <textarea
                    rows={3}
                    value={checkupNotes[selectedClient] || ''}
                    onChange={(e) => handleUpdateCheckupNote(e.target.value)}
                    placeholder="Feedback für Tester..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-white"
                  />
                ) : (
                  <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200">
                    {checkupNotes[selectedClient] || 'Noch kein Feedback vom Coach.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'body' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Körperumfänge – {currentClientObj?.name}</h2>
              <button onClick={() => setShowMeasureModal(true)} className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">
                + Messung eintragen
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {MEASUREMENT_METRICS.map(m => {
                const list = clientMeasurements;
                const latest = list.length > 0 ? list[list.length - 1][m.key] : '-';
                return (
                  <button
                    key={m.key}
                    onClick={() => setSelectedMetric(m.key)}
                    className={`p-3.5 rounded-2xl border text-left ${selectedMetric === m.key ? 'bg-violet-950/40 border-violet-500' : 'bg-zinc-900 border-zinc-800'}`}
                  >
                    <div className="text-xs text-zinc-400">{m.label}</div>
                    <div className="text-lg font-black text-white mt-1">{latest} {m.unit}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {showMeasureModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveMeasurement} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Umfänge eintragen</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-zinc-400">Datum</label>
                <input type="date" value={newMeasure.date} onChange={e => setNewMeasure({ ...newMeasure, date: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white text-sm" />
              </div>
              {MEASUREMENT_METRICS.map(m => (
                <div key={m.key}>
                  <label className="text-xs text-zinc-400">{m.label}</label>
                  <input type="number" step="0.1" value={newMeasure[m.key]} onChange={e => setNewMeasure({ ...newMeasure, [m.key]: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-white text-sm" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={() => setShowMeasureModal(false)} className="px-4 py-2 rounded-xl bg-zinc-800 text-xs">Abbrechen</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Speichern</button>
            </div>
          </form>
        </div>
      )}

      {showBackupModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Cloud Status & Ranks</h3>
            <p className="text-xs text-zinc-400">Jeder Rang hat volle 100 Punkte. Jede Übung gibt exakte Punkte, am Ende der Woche winken +5 Bonus-Punkte und bei 4+ Tagen Inaktivität gibt es Punktabzug! Status: <strong className="text-emerald-400">{syncStatus}</strong></p>
            <div className="flex justify-end pt-2">
              <button onClick={() => setShowBackupModal(false)} className="px-4 py-1.5 rounded-lg bg-zinc-800 text-xs">Schließen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
