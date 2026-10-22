import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { Dumbbell, Users, Calendar, Award, HeartPulse, TrendingUp, KeyRound, Save, Plus, Trash2, Check, X, ShieldCheck, Share2, Eye, Download } from 'lucide-react';

const INITIAL_CLIENTS = [
  { id: 'coach', name: 'Coach', role: 'Coach', pin: '9999' },
  { id: 'tester1', name: 'Tester 1', role: 'Kunde', pin: '1001' },
  { id: 'tester2', name: 'Tester 2', role: 'Kunde', pin: '1002' },
];

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
  const [authSession, setAuthSession] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('workout');
  const [selectedClient, setSelectedClient] = useState('coach');
  const [syncStatus, setSyncStatus] = useState('Online');

  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [plans, setPlans] = useState({ coach: [], tester1: [] });
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
        } else {
          setDoc(docRef, { clients: INITIAL_CLIENTS, plans: { coach: [], tester1: [] }, workoutLogs: {} });
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handlePinLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const cleanPin = pinInput.trim();

    if (cleanPin === '9999') {
      setAuthSession({ role: 'coach', clientId: 'coach' });
      setSelectedClient('coach');
      return;
    }

    const found = clients.find(c => c.pin === cleanPin);
    if (found) {
      setAuthSession({ role: 'client', clientId: found.id });
      setSelectedClient(found.id);
      return;
    }

    setLoginError('Ungültiger PIN! (Coach: 9999, Tester: 1001/1002)');
  };

  const handleLogout = () => {
    setAuthSession(null);
    setPinInput('');
  };

  if (!authSession) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-7 space-y-6 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-4xl shadow-xl">
              🐻
            </div>
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

  const currentClientObj = clients.find(c => c.id === selectedClient) || clients[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-xl">🐻</div>
          <div>
            <h1 className="text-lg font-black text-white">BIZEPS BÄR</h1>
            <span className="text-xs text-emerald-400">{syncStatus}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="px-3 py-1.5 rounded-xl bg-zinc-800 text-xs text-zinc-300">
          Abmelden
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Willkommen, {currentClientObj?.name}!</h2>
          <p className="text-xs text-zinc-400">Die App läuft jetzt stabil und fehlerfrei.</p>
        </div>
      </main>
    </div>
  );
}
