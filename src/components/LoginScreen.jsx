import React from 'react';
import { KeyRound } from 'lucide-react';

export default function LoginScreen({ pinInput, setPinInput, handlePinLogin, loginError }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-7 space-y-6 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-4xl shadow-xl">🐻</div>
          <h1 className="text-2xl font-black text-white pt-2">BIZEPS BÄR</h1>
          <p className="text-xs text-zinc-400">
            PIN eingeben (Coach: <code className="text-violet-400 font-bold">9999</code> | Cassian: <code className="text-violet-400 font-bold">1001</code>, Sky: <code className="text-violet-400 font-bold">1002</code>, Aaron: <code className="text-violet-400 font-bold">1003</code>, Pookiepavel: <code className="text-violet-400 font-bold">1004</code>, Celina: <code className="text-violet-400 font-bold">1005</code>)
          </p>
        </div>
        <form onSubmit={handlePinLogin} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-violet-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              placeholder="PIN eingeben..."
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-center text-lg tracking-widest font-bold text-white focus:outline-none"
              autoFocus
            />
          </div>
          {loginError && <p className="text-xs text-rose-400 text-center font-medium">{loginError}</p>}
          <button type="submit" className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/25 transition">
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
}
