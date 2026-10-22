import React from 'react';
import { HeartPulse, Dumbbell, Calendar, Moon, Zap, AlertTriangle } from 'lucide-react';

export default function CoachFeedback({ clientName, clientLogs }) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-violet-400" />
          Trainings-Check-Up & Historie – {clientName}
        </h2>
        <p className="text-xs text-zinc-400">
          Hier siehst du alle absolvierten Einheiten, getrennt nach Wochentagen, Tagesformen und Leistungen.
        </p>
      </div>

      {(!clientLogs || clientLogs.length === 0) ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center text-zinc-500 text-sm">
          Noch keine abgeschlossenen Workouts von diesem Tester vorhanden.
        </div>
      ) : (
        clientLogs.map((log) => (
          <div key={log.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center flex-wrap gap-2 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-lg">
                  {log.day || 'Training'}
                </span>
                <span className="text-zinc-400 text-xs flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {log.date}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-300 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" /> Schlaf: {log.sleepHours || '-'} Std.
                </span>
                <span className="bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Energie: {log.energyLevel || '-'}/10
                </span>
                <span className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold ${
                  (log.painLevel || 1) >= 4 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Schmerzen: {log.painLevel || 1}/10
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5" /> Absolvierte Übungen
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(log.exercises || []).map((ex, eIdx) => (
                  <div key={eIdx} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
                    <div className="font-bold text-white text-sm">{ex.name}</div>
                    
                    <div className="space-y-1">
                      {(ex.sets || []).length === 0 ? (
                        <div className="text-xs text-zinc-500 italic">Keine Sätze eingetragen.</div>
                      ) : (
                        ex.sets.map((set, sIdx) => (
                          <div key={sIdx} className="flex justify-between text-xs bg-zinc-900/60 px-2.5 py-1 rounded border border-zinc-800">
                            <span className="text-zinc-400 font-semibold">Satz {sIdx + 1}</span>
                            <span className="text-white font-bold">
                              {set.weight ? `${set.weight} kg` : '–'} × {set.reps ? `${set.reps} Wdh.` : '–'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
