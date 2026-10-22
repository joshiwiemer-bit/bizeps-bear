import React from 'react';
import { Dumbbell, Check } from 'lucide-react';

export default function WorkoutLogger({ clientName, plan, activeWorkoutSets, handleSetChange, toggleSetDone, finishWorkout }) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Workout – {clientName}</h2>
          <p className="text-xs text-zinc-400">Trage deine Sätze ein und speichere das Training für den +5 Bonus.</p>
        </div>
        <button onClick={finishWorkout} className="px-4 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm shadow-lg shadow-violet-600/25">
          Training abschließen & speichern
        </button>
      </div>

      {(!plan || plan.length === 0) ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 text-sm">
          Keine Übungen im Plan für dieses Profil. Der Coach kann im Tab „Plan verwalten“ Übungen hinzufügen!
        </div>
      ) : (
        plan.map((planItem, idx) => {
          const sets = activeWorkoutSets[planItem.id] || [];
          return (
            <div key={planItem.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{idx + 1}. {planItem.name} <span className="text-xs text-violet-300 font-normal">({planItem.muscle})</span></span>
                <span className="text-xs text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-lg">Ziel: {planItem.targetSets} Sätze</span>
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
                      className={`col-span-2 h-9 rounded-lg flex items-center justify-center transition ${s.done ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
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
  );
}
