import React from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, Dumbbell } from 'lucide-react';

export default function ProgressHistory({ clientName, clientLogs }) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-400" />
          Verlauf & Fortschritt – {clientName}
        </h2>
        <p className="text-xs text-zinc-400">
          Hier siehst du im Detail, wie sich deine Leistungen im Vergleich zum letzten Training entwickelt haben.
        </p>
      </div>

      {(!clientLogs || clientLogs.length === 0) ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center text-zinc-500 text-sm">
          Noch keine abgeschlossenen Workouts im Verlauf vorhanden.
        </div>
      ) : (
        clientLogs.map((log, index) => {
          // Vorheriges Workout für diesen Kunden finden (um Vergleiche zu ziehen)
          const prevLog = clientLogs[index + 1];

          return (
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
                <div className="text-xs text-zinc-400">
                  Schlaf: <span className="text-white font-bold">{log.sleepHours || '-'}h</span> | 
                  Energie: <span className="text-white font-bold">{log.energyLevel || '-'}/10</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5" /> Übungsvergleich
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(log.exercises || []).map((ex, eIdx) => {
                    // Passende Übung aus dem vorherigen Log suchen
                    const prevEx = prevLog?.exercises?.find(p => p.name === ex.name);

                    return (
                      <div key={eIdx} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 space-y-2">
                        <div className="font-bold text-white text-sm">{ex.name}</div>
                        
                        <div className="space-y-1.5">
                          {(ex.sets || []).map((set, sIdx) => {
                            const prevSet = prevEx?.sets?.[sIdx];
                            
                            // Vergleich berechnen
                            let diffWeight = 0;
                            let diffReps = 0;
                            let hasComparison = false;

                            if (prevSet && set.weight && prevSet.weight) {
                              diffWeight = parseFloat(set.weight) - parseFloat(prevSet.weight);
                              diffReps = parseInt(set.reps || 0) - parseInt(prevSet.reps || 0);
                              hasComparison = true;
                            }

                            return (
                              <div key={sIdx} className="flex justify-between items-center text-xs bg-zinc-900/60 px-3 py-1.5 rounded border border-zinc-800">
                                <span className="text-zinc-400 font-semibold">Satz {sIdx + 1}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-white font-bold">
                                    {set.weight ? `${set.weight} kg` : '–'} × {set.reps ? `${set.reps} Wdh.` : '–'}
                                  </span>

                                  {hasComparison && (
                                    <div className="flex items-center gap-1 text-[11px]">
                                      {diffWeight > 0 ? (
                                        <span className="text-emerald-400 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" /> +{diffWeight}kg</span>
                                      ) : diffWeight < 0 ? (
                                        <span className="text-rose-400 flex items-center"><TrendingDown className="w-3 h-3 mr-0.5" /> {diffWeight}kg</span>
                                      ) : diffReps > 0 ? (
                                        <span className="text-emerald-400 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" /> +{diffReps} Wdh</span>
                                      ) : diffReps < 0 ? (
                                        <span className="text-rose-400 flex items-center"><TrendingDown className="w-3 h-3 mr-0.5" /> {diffReps} Wdh</span>
                                      ) : (
                                        <span className="text-zinc-500 flex items-center"><Minus className="w-3 h-3" /> gleich</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
