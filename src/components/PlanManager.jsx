import React from 'react';
import { Trash2 } from 'lucide-react';

export default function PlanManager({ clientName, plan, muscleGroups, customPlanEx, setCustomPlanEx, handleAddCustomExerciseToPlan, handleRemovePlanItem }) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-white">Trainingsplan erstellen für {clientName}</h2>
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
              {muscleGroups.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold shadow-lg shadow-violet-600/25">
            + Übung zum Plan hinzufügen
          </button>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Aktueller Plan von {clientName}</h3>
        {(!plan || plan.length === 0) ? (
          <p className="text-xs text-zinc-500">Noch keine Übungen eingetragen.</p>
        ) : (
          plan.map(item => (
            <div key={item.id} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white text-sm">{item.name}</span>
                <span className="text-xs text-violet-300 ml-2 bg-violet-950/60 px-2 py-0.5 rounded">({item.muscle})</span>
              </div>
              <button onClick={() => handleRemovePlanItem(item.id)} className="p-2 rounded-lg bg-zinc-800 text-rose-400 hover:bg-rose-950">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
