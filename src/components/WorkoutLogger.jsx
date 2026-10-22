import React, { useState } from 'react';
import { Dumbbell, Check, Calendar } from 'lucide-react';

export default function WorkoutLogger({ clientName, plan, activeWorkoutSets, handleSetChange, toggleSetDone, finishWorkout, sessionMeta, setSessionMeta }) {
  const [selectedDay, setSelectedDay] = useState('Montag');
  const daysOfWeek = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

  const filteredPlan = (plan || []).filter(item => (item.day || 'Montag') === selectedDay);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet-400" /> Welchen Wochentag trainierst du?
        </h2>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {daysOfWeek.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedDay === day 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' 
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-white">Tagesform ({selectedDay}) – {clientName}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Schlaf (Stunden)</label>
            <input
              type="number" step="0.5" placeholder="z.B. 8"
              value={sessionMeta.sleepHours}
              onChange={e => setSessionMeta({ ...sessionMeta, sleepHours: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Energie-Level (1-10)</label>
            <input
              type="number" min="1" max="10" placeholder="z.B. 8"
              value={sessionMeta.energyLevel}
              onChange={e => setSessionMeta({ ...sessionMeta, energyLevel: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Schmerzen (1-10)</label>
            <input
              type="number" min="1" max="10" placeholder="z.B. 1 (keine)"
              value={sessionMeta.painLevel}
              onChange={e => setSessionMeta({ ...sessionMeta, painLevel: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-sm text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Sätze für {selectedDay}</h2>
          <p className="text-xs text-zinc-400">Nach dem Speichern wird der Logger für das nächste Mal zurückgesetzt.</p>
        </div>
        <button 
          onClick={() => finishWorkout(selectedDay)} 
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/25 transition"
        >
          {selectedDay}-Training abschließen & speichern
        </button>
      </div>

      {filteredPlan.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400 text-sm">
          Keine Übungen für {selectedDay} im Plan eingetragen.
        </div>
      ) : (
        filteredPlan.map((planItem, idx) => {
          const sets = activeWorkoutSets[planItem.id] || [];
          return (
            <div key={planItem.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <span className="font-bold text-white text-base">{idx + 1}. {planItem.name}</span>
                  <div className="flex gap-1 mt-1">
                    {(planItem.muscles || ['Brust']).map(mId => (
                      <span key={mId} className="text-[10px] bg-violet-950 text-violet-300 px-2 py-0.5 rounded">
                        {mId}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-zinc-400 bg-zinc-800 px-3 py-1.5 rounded-lg">
                  Ziel: {planItem.targetSets} Sätze × {planItem.targetReps} | RIR: {planItem.rir || '-'}
                </div>
              </div>

              {planItem.note && (
                <div className="text-xs text-zinc-400 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 italic">
                  💡 {planItem.note}
                </div>
              )}

              <div className="space-y-2 pt-2">
                {sets.map((s, sIdx) => (
                  <div key={sIdx} className="grid grid-cols-12 gap-2 items-center bg-zinc-800/40 p-2.5 rounded-xl">
                    <span className="col-span-2 text-xs font-bold text-zinc-400">Satz #{sIdx + 1}</span>
                    <input
                      type="number" placeholder="kg" value={s.weight}
                      onChange={(e) => handleSetChange(planItem.id, sIdx, 'weight', e.target.value)}
                      className="col-span-4 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white"
                    />
                    <input
                      type="number" placeholder="Wdh" value={s.reps}
                      onChange={(e) => handleSetChange(planItem.id, sIdx, 'reps', e.target.value)}
                      className="col-span-4 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-sm text-white"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSetDone(planItem.id, sIdx)}
                      className={`col-span-2 h-10 rounded-lg flex items-center justify-center transition ${s.done ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
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
