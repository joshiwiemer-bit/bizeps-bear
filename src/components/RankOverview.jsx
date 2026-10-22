import React from 'react';
import { Award, AlertTriangle } from 'lucide-react';

export default function RankOverview({ clientName, muscleRanks, muscleGroups }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-900/40 via-zinc-900 to-zinc-900 border border-violet-500/30 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-violet-400" />
          <div>
            <h2 className="text-xl font-black text-white">Muskel-Ranks (1–100 Pkt) – {clientName}</h2>
            <p className="text-xs text-zinc-400">
              Jeder Rang hat 100 Punkte. +5 Bonus bei Wochen-Abschluss! ⚠️ 4 Tage Inaktivität = Abzug.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {muscleGroups.map(mg => {
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
  );
}
