import React from 'react';
import { Trash2, Plus } from 'lucide-react';

export default function PlanManager({ clientName, plan, muscleGroups, customPlanEx, setCustomPlanEx, handleAddCustomExerciseToPlan, handleRemovePlanItem }) {
  
  // Funktion zum An- und Abwählen mehrerer Muskelgruppen
  const toggleMuscleSelection = (muscleId) => {
    const current = customPlanEx.muscles || [];
    if (current.includes(muscleId)) {
      setCustomPlanEx({
        ...customPlanEx,
        muscles: current.filter(m => m !== muscleId)
      });
    } else {
      setCustomPlanEx({
        ...customPlanEx,
        muscles: [...current, muscleId]
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-white">Trainingsplan erstellen für {clientName}</h2>
        
        <form onSubmit={handleAddCustomExerciseToPlan} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
          
          {/* Übungsname */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Übungsname</label>
            <input
              type="text" required placeholder="z.B. Bankdrücken"
              value={customPlanEx.name} 
              onChange={e => setCustomPlanEx({ ...customPlanEx, name: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white"
            />
          </div>

          {/* Mehrfachauswahl der Muskelgruppen */}
          <div>
            <label className="text-xs text-zinc-400 block mb-2">Muskelgruppen (Mehrfachauswahl möglich)</label>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map(m => {
                const isSelected = (customPlanEx.muscles || []).includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleMuscleSelection(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      isSelected 
                        ? 'bg-violet-600 border-violet-500 text-white shadow-md' 
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m.label} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Felder für Sätze, Wdh/Zeit und RIR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Sätze</label>
              <input
                type="number" min="1" placeholder="z.B. 3"
                value={customPlanEx.targetSets} 
                onChange={e => setCustomPlanEx({ ...customPlanEx, targetSets: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Wiederholungen oder Zeit</label>
              <input
                type="text" placeholder="z.B. 8-10 oder 45 Sek."
                value={customPlanEx.targetReps} 
                onChange={e => setCustomPlanEx({ ...customPlanEx, targetReps: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">RIR (Reps in Reserve)</label>
              <input
                type="text" placeholder="z.B. 2"
                value={customPlanEx.rir} 
                onChange={e => setCustomPlanEx({ ...customPlanEx, rir: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white"
              />
            </div>
          </div>

          {/* Notizen-Feld für die Übung */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Notiz / Ausführungshinweis</label>
            <input
              type="text" placeholder="z.B. Volle ROM, sauberer Stopp..."
              value={customPlanEx.note} 
              onChange={e => setCustomPlanEx({ ...customPlanEx, note: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/25 flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> Übung zum Plan hinzufügen
          </button>
        </form>
      </div>

      {/* Plan-Liste */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Aktueller Plan von {clientName}</h3>
        {(!plan || plan.length === 0) ? (
          <p className="text-xs text-zinc-500">Noch keine Übungen eingetragen.</p>
        ) : (
          plan.map(item => (
            <div key={item.id} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center gap-3">
              <div className="space-y-1">
                <div className="font-bold text-white text-sm">{item.name}</div>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {(item.muscles || ['Brust']).map(mId => (
                    <span key={mId} className="bg-violet-950 text-violet-300 border border-violet-800/50 px-2 py-0.5 rounded">
                      {mId}
                    </span>
                  ))}
                  <span className="text-zinc-400 ml-1">
                    | {item.targetSets} Sätze × {item.targetReps} | RIR: {item.rir || '-'}
                  </span>
                </div>
                {item.note && <div className="text-xs text-zinc-400 italic">Notiz: {item.note}</div>}
              </div>
              <button onClick={() => handleRemovePlanItem(item.id)} className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-950 text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
