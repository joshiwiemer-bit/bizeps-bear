import React, { useState } from 'react';
import { Trash2, Plus, Edit2, Save, X } from 'lucide-react';

export default function PlanManager({ clientName, plan, muscleGroups, customPlanEx, setCustomPlanEx, handleAddCustomExerciseToPlan, handleRemovePlanItem, handleUpdatePlanItem }) {
  
  // State, um zu verfolgen, welche Übung gerade bearbeitet wird (ID oder null)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const toggleMuscleSelection = (muscleId, isEdit = false) => {
    if (isEdit) {
      const current = editForm.muscles || [];
      if (current.includes(muscleId)) {
        setEditForm({ ...editForm, muscles: current.filter(m => m !== muscleId) });
      } else {
        setEditForm({ ...editForm, muscles: [...current, muscleId] });
      }
    } else {
      const current = customPlanEx.muscles || [];
      if (current.includes(muscleId)) {
        setCustomPlanEx({ ...customPlanEx, muscles: current.filter(m => m !== muscleId) });
      } else {
        setCustomPlanEx({ ...customPlanEx, muscles: [...current, muscleId] });
      }
    }
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      muscles: item.muscles || [item.muscle || 'Brust'],
      targetSets: item.targetSets,
      targetReps: item.targetReps,
      rir: item.rir || '',
      note: item.note || ''
    });
  };

  const saveEditing = (itemId) => {
    handleUpdatePlanItem(itemId, editForm);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Neue Übung hinzufügen */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-white">Trainingsplan erstellen für {clientName}</h2>
        
        <form onSubmit={handleAddCustomExerciseToPlan} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Übungsname</label>
            <input
              type="text" required placeholder="z.B. Bankdrücken"
              value={customPlanEx.name} 
              onChange={e => setCustomPlanEx({ ...customPlanEx, name: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-2">Muskelgruppen (Mehrfachauswahl möglich)</label>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map(m => {
                const isSelected = (customPlanEx.muscles || []).includes(m.id);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => toggleMuscleSelection(m.id, false)}
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
                type="text" placeholder="z.B. 8-10"
                value={customPlanEx.targetReps} 
                onChange={e => setCustomPlanEx({ ...customPlanEx, targetReps: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">RIR</label>
              <input
                type="text" placeholder="z.B. 2"
                value={customPlanEx.rir} 
                onChange={e => setCustomPlanEx({ ...customPlanEx, rir: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Notiz / Ausführungshinweis</label>
            <input
              type="text" placeholder="z.B. Saubere ROM..."
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

      {/* Plan-Liste mit Bearbeiten-Funktion */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Aktueller Plan von {clientName}</h3>
        {(!plan || plan.length === 0) ? (
          <p className="text-xs text-zinc-500">Noch keine Übungen eingetragen.</p>
        ) : (
          plan.map(item => {
            const isEditing = editingId === item.id;

            return (
              <div key={item.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                {isEditing ? (
                  /* BEARBEITUNGS-MODUS */
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-zinc-900 border border-violet-500 rounded-lg p-2 text-sm text-white font-bold"
                    />

                    <div className="flex flex-wrap gap-1.5">
                      {muscleGroups.map(m => {
                        const isSel = (editForm.muscles || []).includes(m.id);
                        return (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => toggleMuscleSelection(m.id, true)}
                            className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                              isSel ? 'bg-violet-600 border-violet-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                            }`}
                          >
                            {m.label} {isSel && '✓'}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number" placeholder="Sätze"
                        value={editForm.targetSets}
                        onChange={e => setEditForm({ ...editForm, targetSets: e.target.value })}
                        className="bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white"
                      />
                      <input
                        type="text" placeholder="Wdh"
                        value={editForm.targetReps}
                        onChange={e => setEditForm({ ...editForm, targetReps: e.target.value })}
                        className="bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white"
                      />
                      <input
                        type="text" placeholder="RIR"
                        value={editForm.rir}
                        onChange={e => setEditForm({ ...editForm, rir: e.target.value })}
                        className="bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white"
                      />
                    </div>

                    <input
                      type="text" placeholder="Notiz"
                      value={editForm.note}
                      onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white"
                    />

                    <div className="flex justify-end gap-2 pt-1">
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded bg-zinc-800 text-xs text-zinc-300 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Abbrechen
                      </button>
                      <button onClick={() => saveEditing(item.id)} className="px-3 py-1.5 rounded bg-violet-600 text-xs text-white font-bold flex items-center gap-1">
                        <Save className="w-3.5 h-3.5" /> Speichern
                      </button>
                    </div>
                  </div>
                ) : (
                  /* NORMALER ANZEIGE-MODUS */
                  <div className="flex justify-between items-start gap-3">
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

                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditing(item)} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-violet-300" title="Bearbeiten">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRemovePlanItem(item.id)} className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-950 text-rose-400" title="Löschen">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
