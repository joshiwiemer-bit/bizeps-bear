import React, { useState } from 'react';
import { Trash2, Plus, Edit2, Save, X, Calendar } from 'lucide-react';

export default function PlanManager({ clientName, plan, muscleGroups, customPlanEx, setCustomPlanEx, handleAddCustomExerciseToPlan, handleRemovePlanItem, handleUpdatePlanItem }) {
  
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedDay, setSelectedDay] = useState('Montag');

  const daysOfWeek = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

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

  const handleDayChange = (day) => {
    setSelectedDay(day);
    setCustomPlanEx({ ...customPlanEx, day: day });
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      muscles: item.muscles || [item.muscle || 'Brust'],
      targetSets: item.targetSets,
      targetReps: item.targetReps,
      rir: item.rir || '',
      note: item.note || '',
      day: item.day || 'Montag'
    });
  };

  const saveEditing = (itemId) => {
    handleUpdatePlanItem(itemId, editForm);
    setEditingId(null);
  };

  // Gefilterter Plan für den aktuell ausgewählten Wochentag
  const filteredPlan = (plan || []).filter(item => (item.day || 'Montag') === selectedDay);

  return (
    <div className="space-y-6">
      {/* Wochentag-Auswahl Tabs */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet-400" /> Wochentag auswählen für {clientName}
        </h2>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {daysOfWeek.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayChange(day)}
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

      {/* Übung für den ausgewählten Tag hinzufügen */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-lg font-bold text-white">Übung hinzufügen für {selectedDay}</h3>
        
        <form onSubmit={handleAddCustomExerciseToPlan} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Übungsname</label>
            <input
              type="text" required placeholder="z.B. Schrägbank"
              value={customPlanEx.name} 
              onChange={e => setCustomPlanEx({ ...customPlanEx, name: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-2">Muskelgruppen (Mehrfachauswahl)</label>
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
              <label className="text-xs text-zinc-400 block mb-1">Wiederholungen / Zeit</label>
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
            <label className="text-xs text-zinc-400 block mb-1">Notiz / Hinweis</label>
            <input
              type="text" placeholder="z.B. Saubere Ausführung..."
              value={customPlanEx.note} 
              onChange={e => setCustomPlanEx({ ...customPlanEx, note: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 text-sm text-white"
            />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/25 flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> Übung zu {selectedDay} hinzufügen
          </button>
        </form>
      </div>

      {/* Plan-Liste für den ausgewählten Tag */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">Übungen am {selectedDay}</h3>
        {filteredPlan.length === 0 ? (
          <p className="text-xs text-zinc-500">Keine Übungen für {selectedDay} eingetragen.</p>
        ) : (
          filteredPlan.map(item => {
            const isEditing = editingId === item.id;

            return (
              <div key={item.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-zinc-900 border border-violet-500 rounded-lg p-2 text-sm text-white font-bold"
                    />

                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Wochentag zuweisen:</label>
                      <select
                        value={editForm.day || 'Montag'}
                        onChange={e => setEditForm({ ...editForm, day: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-xs text-white"
                      >
                        {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

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
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.name}</span>
                        <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-semibold">{item.day || 'Montag'}</span>
                      </div>
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
