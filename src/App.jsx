import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  Dumbbell,
  Users,
  BookOpen,
  History,
  Check,
  Plus,
  Trash2,
  Play,
  Timer,
  ChevronRight,
  Search,
  TrendingUp,
  Edit3,
  MessageSquare,
  Info,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Video,
  AlertCircle,
  Ruler,
  Scale,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Cloud,
  CloudOff,
  RefreshCw,
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  HeartPulse,
  AlertTriangle,
  Film,
  Link,
  Gauge,
  Send
} from 'lucide-react';

// ==========================================
// FIREBASE CLOUD INITIALIZATION (RULE 1-3)
// ==========================================
const firebaseConfig =
  typeof __firebase_config !== 'undefined' && __firebase_config
    ? JSON.parse(__firebase_config)
    : null;
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'bizeps-baer-app';

// Sample fallback MP4 video URL for instant Form-Check Demo testing
const SAMPLE_FORMCHECK_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

// ==========================================
// INITIAL SEED DATA (GERMAN)
// ==========================================

const INITIAL_PROFILES = [
  {
    id: 'coach-self',
    name: 'Ich (Coach / Eigenes Training)',
    shortName: 'Coach (Ich)',
    role: 'coach',
    goal: 'Strength & Hypertrophie / Performance',
    avatar: '🏋️‍♂️',
    weeklyTarget: 4,
    completedThisWeek: 3,
    status: 'On Track',
    notes: 'Fokus auf sauberen Pause-Squat und Schulter-Stabilität.'
  },
  {
    id: 'client-max',
    name: 'Max M.',
    shortName: 'Max M.',
    role: 'client',
    goal: 'Muskelaufbau / Body Recomp',
    avatar: '⚡',
    weeklyTarget: 4,
    completedThisWeek: 4,
    status: 'Sehr stark (100%)',
    notes: 'Steigert sich konstant beim Schrägbankdrücken. Schlaf aktuell 7.5h.'
  },
  {
    id: 'client-sarah',
    name: 'Sarah K.',
    shortName: 'Sarah K.',
    role: 'client',
    goal: 'Kraftaufbau & Schulter-Reha',
    avatar: '🎯',
    weeklyTarget: 3,
    completedThisWeek: 2,
    status: 'Achtung: Schulter-Feedback',
    notes: 'Rechte Schulter bei Überkopfdrücken leicht gereizt -> Landmine Press & Face Pulls priorisieren.'
  },
  {
    id: 'client-lukas',
    name: 'Lukas T.',
    shortName: 'Lukas T.',
    role: 'client',
    goal: 'Hypertrophie Upper / Lower Split',
    avatar: '🔥',
    weeklyTarget: 4,
    completedThisWeek: 3,
    status: 'On Track',
    notes: 'RDL Technik deutlich besser geworden. Zughilfen ab Arbeitssatz 2 nutzen.'
  }
];

// Metadata for Body Weight & 9 Circumference Metrics
const BODY_METRICS = [
  { key: 'weight', label: 'Gewicht', unit: 'kg', goalType: 'neutral', desc: 'Körpergewicht morgens nüchtern' },
  { key: 'shoulders', label: 'Schultern', unit: 'cm', goalType: 'up', desc: 'Umfang breiteste Stelle um die Schultern' },
  { key: 'chest', label: 'Brust', unit: 'cm', goalType: 'up', desc: 'Umfang auf Brustwarzenhöhe (entspannt)' },
  { key: 'abdomen', label: 'Bauch', unit: 'cm', goalType: 'down', desc: 'Umfang direkt auf Bauchnabelhöhe' },
  { key: 'waist', label: 'Taille', unit: 'cm', goalType: 'down', desc: 'Schmalste Stelle des Oberkörpers' },
  { key: 'glutes', label: 'Po / Hüfte', unit: 'cm', goalType: 'up', desc: 'Breiteste Stelle über dem Gesäß' },
  { key: 'upperArm', label: 'Oberarm', unit: 'cm', goalType: 'up', desc: 'Mitte Oberarm (angespannt)' },
  { key: 'forearm', label: 'Unterarm', unit: 'cm', goalType: 'up', desc: 'Breiteste Stelle unterhalb des Ellbogens' },
  { key: 'thigh', label: 'Oberschenkel', unit: 'cm', goalType: 'up', desc: 'Mitte Oberschenkel (Standbein)' },
  { key: 'calf', label: 'Unterschenkel', unit: 'cm', goalType: 'up', desc: 'Breiteste Stelle der Wade' }
];

// Realistic 12-Month + Recent Month Body Measurement Data per Profile
const INITIAL_BODY_MEASUREMENTS = {
  'coach-self': [
    { id: 'bm-1', date: '2025-11-15', weight: 86.4, shoulders: 125.0, chest: 106.5, abdomen: 86.5, waist: 83.2, glutes: 99.0, upperArm: 39.2, forearm: 30.8, thigh: 60.0, calf: 39.2 },
    { id: 'bm-2', date: '2026-01-15', weight: 87.2, shoulders: 126.0, chest: 107.2, abdomen: 86.8, waist: 83.4, glutes: 99.5, upperArm: 39.6, forearm: 31.0, thigh: 60.5, calf: 39.4 },
    { id: 'bm-3', date: '2026-03-15', weight: 86.5, shoulders: 126.5, chest: 107.8, abdomen: 85.8, waist: 82.5, glutes: 99.8, upperArm: 40.0, forearm: 31.2, thigh: 61.0, calf: 39.6 },
    { id: 'bm-4', date: '2026-05-15', weight: 85.8, shoulders: 127.0, chest: 108.2, abdomen: 84.9, waist: 81.8, glutes: 100.0, upperArm: 40.2, forearm: 31.4, thigh: 61.3, calf: 39.8 },
    { id: 'bm-5', date: '2026-07-15', weight: 85.2, shoulders: 127.6, chest: 108.8, abdomen: 84.0, waist: 81.0, glutes: 100.2, upperArm: 40.5, forearm: 31.5, thigh: 61.6, calf: 40.0 },
    { id: 'bm-6', date: '2026-09-10', weight: 85.0, shoulders: 128.0, chest: 109.1, abdomen: 83.5, waist: 80.6, glutes: 100.4, upperArm: 40.7, forearm: 31.6, thigh: 61.8, calf: 40.1 },
    { id: 'bm-7', date: '2026-09-22', weight: 84.8, shoulders: 128.3, chest: 109.4, abdomen: 83.1, waist: 80.3, glutes: 100.5, upperArm: 40.9, forearm: 31.7, thigh: 62.0, calf: 40.2 },
    { id: 'bm-8', date: '2026-10-01', weight: 84.5, shoulders: 128.6, chest: 109.7, abdomen: 82.6, waist: 79.9, glutes: 100.6, upperArm: 41.0, forearm: 31.8, thigh: 62.2, calf: 40.3 },
    { id: 'bm-9', date: '2026-10-10', weight: 84.3, shoulders: 128.9, chest: 110.0, abdomen: 82.2, waist: 79.5, glutes: 100.8, upperArm: 41.2, forearm: 31.9, thigh: 62.4, calf: 40.4 },
    { id: 'bm-10', date: '2026-10-18', weight: 84.1, shoulders: 129.2, chest: 110.3, abdomen: 81.8, waist: 79.2, glutes: 101.0, upperArm: 41.4, forearm: 32.0, thigh: 62.6, calf: 40.5 }
  ],
  'client-max': [
    { id: 'max-1', date: '2025-12-01', weight: 82.5, shoulders: 118.0, chest: 99.5, abdomen: 88.0, waist: 85.0, glutes: 97.0, upperArm: 35.5, forearm: 28.5, thigh: 56.0, calf: 37.5 },
    { id: 'max-2', date: '2026-03-01', weight: 81.4, shoulders: 119.5, chest: 101.0, abdomen: 85.5, waist: 82.8, glutes: 97.4, upperArm: 36.2, forearm: 28.9, thigh: 57.0, calf: 37.8 },
    { id: 'max-3', date: '2026-06-01', weight: 80.5, shoulders: 121.0, chest: 102.4, abdomen: 83.2, waist: 80.9, glutes: 97.8, upperArm: 37.0, forearm: 29.2, thigh: 58.0, calf: 38.1 },
    { id: 'max-4', date: '2026-08-15', weight: 79.9, shoulders: 122.0, chest: 103.2, abdomen: 81.9, waist: 79.6, glutes: 98.0, upperArm: 37.4, forearm: 29.5, thigh: 58.5, calf: 38.3 },
    { id: 'max-5', date: '2026-09-24', weight: 79.6, shoulders: 122.5, chest: 103.6, abdomen: 81.2, waist: 79.0, glutes: 98.2, upperArm: 37.6, forearm: 29.6, thigh: 58.8, calf: 38.4 },
    { id: 'max-6', date: '2026-10-05', weight: 79.3, shoulders: 122.8, chest: 104.0, abdomen: 80.6, waist: 78.5, glutes: 98.4, upperArm: 37.8, forearm: 29.7, thigh: 59.0, calf: 38.5 },
    { id: 'max-7', date: '2026-10-17', weight: 79.0, shoulders: 123.2, chest: 104.4, abdomen: 80.0, waist: 78.0, glutes: 98.5, upperArm: 38.1, forearm: 29.9, thigh: 59.3, calf: 38.6 }
  ],
  'client-sarah': [
    { id: 'sarah-1', date: '2026-01-10', weight: 64.5, shoulders: 101.0, chest: 89.0, abdomen: 75.5, waist: 69.5, glutes: 96.5, upperArm: 28.5, forearm: 23.5, thigh: 53.5, calf: 35.0 },
    { id: 'sarah-2', date: '2026-05-10', weight: 63.8, shoulders: 102.0, chest: 89.5, abdomen: 73.8, waist: 68.0, glutes: 97.5, upperArm: 29.0, forearm: 23.8, thigh: 54.4, calf: 35.3 },
    { id: 'sarah-3', date: '2026-09-22', weight: 63.2, shoulders: 102.5, chest: 89.8, abdomen: 72.5, waist: 67.2, glutes: 98.4, upperArm: 29.4, forearm: 24.0, thigh: 55.0, calf: 35.5 },
    { id: 'sarah-4', date: '2026-10-06', weight: 63.0, shoulders: 102.8, chest: 90.0, abdomen: 72.0, waist: 66.8, glutes: 98.8, upperArm: 29.6, forearm: 24.1, thigh: 55.3, calf: 35.6 },
    { id: 'sarah-5', date: '2026-10-18', weight: 62.8, shoulders: 103.1, chest: 90.2, abdomen: 71.5, waist: 66.4, glutes: 99.2, upperArm: 29.8, forearm: 24.2, thigh: 55.6, calf: 35.7 }
  ],
  'client-lukas': [
    { id: 'lukas-1', date: '2026-02-01', weight: 76.0, shoulders: 119.0, chest: 100.0, abdomen: 79.0, waist: 76.5, glutes: 95.0, upperArm: 36.0, forearm: 29.0, thigh: 56.5, calf: 37.5 },
    { id: 'lukas-2', date: '2026-06-15', weight: 77.8, shoulders: 121.0, chest: 102.0, abdomen: 79.8, waist: 77.0, glutes: 96.2, upperArm: 37.1, forearm: 29.6, thigh: 58.0, calf: 38.1 },
    { id: 'lukas-3', date: '2026-09-25', weight: 78.6, shoulders: 122.2, chest: 103.1, abdomen: 80.1, waist: 77.2, glutes: 96.8, upperArm: 37.6, forearm: 29.9, thigh: 58.7, calf: 38.4 },
    { id: 'lukas-4', date: '2026-10-16', weight: 79.2, shoulders: 122.8, chest: 103.8, abdomen: 80.2, waist: 77.3, glutes: 97.2, upperArm: 38.0, forearm: 30.1, thigh: 59.2, calf: 38.6 }
  ]
};

const INITIAL_EXERCISES = [
  {
    id: 'ex-squat',
    name: 'Langhantel Kniebeuge (High Bar)',
    muscle: 'Beine',
    secondaryMuscles: ['Core', 'Gesäß'],
    equipment: 'Langhantel',
    category: 'Grundübung',
    defaultTempo: '3-1-1-0',
    videoUrl: SAMPLE_FORMCHECK_VIDEO_URL,
    cues: [
      'Stange fest auf dem oberen Trapez positionieren, Ellbogen leicht unter die Stange ziehen',
      'Tief in den Bauch atmen (360° Bracing) vor jeder Wiederholung',
      'Knie aktiv in Richtung der Fußspitzen nach außen schieben',
      'Kontrollierte Exzentrik (3 Sek. abwärts), 1 Sekunde stabile Pause unten'
    ],
    mistakes: [
      'Butt-Wink am untersten Punkt durch fehlende Rumpfspannung',
      'Hüfte schießt zuerst hoch (Good-Morning-Squat)',
      'Knie kollabieren nach innen (Valgus)'
    ]
  },
  {
    id: 'ex-rdl',
    name: 'Rumänisches Kreuzheben (RDL)',
    muscle: 'Beine',
    secondaryMuscles: ['Rücken', 'Gesäß'],
    equipment: 'Langhantel',
    category: 'Grundübung',
    defaultTempo: '3-1-1-0',
    videoUrl: '',
    cues: [
      'Leichte Entriegelung der Knie (Soft Knees), Winkel bleibt danach konstant',
      'Hüfte aktiv nach hinten schieben, als würdest du eine Autotür mit dem Po schließen',
      'Stange eng am Oberschenkel/Schienbein entlangführen (Lats anspannen!)',
      'Bewegung umkehren, sobald die Hüfte nicht mehr weiter nach hinten wandert (meist Mitte Schienbein)'
    ],
    mistakes: [
      'Aus dem unteren Rücken weiter runtergehen, obwohl die Hamstrings am Ende sind',
      'Stange driftet vom Körper weg',
      'Kopf stark in den Nacken überstrecken'
    ]
  },
  {
    id: 'ex-incline-db',
    name: 'Schrägbankdrücken (Kurzhantel)',
    muscle: 'Brust',
    secondaryMuscles: ['Schultern', 'Arme'],
    equipment: 'Kurzhantel',
    category: 'Grundübung',
    defaultTempo: '3-1-1-0',
    videoUrl: '',
    cues: [
      'Bank auf ca. 30° einstellen (nicht zu steil, sonst zu viel vordere Schulter)',
      'Schulterblätter leicht zurückziehen und tief in die Bank drücken',
      'Unterarme im ca. 45-60° Winkel zum Rumpf (Pfeil-Form statt T-Form)',
      'Volle Dehnung unten kurz halten, dann explosiv hochdrücken'
    ],
    mistakes: [
      'Ellbogen im 90° Winkel nach außen abspreizen',
      'Kurzhanteln oben hart aneinanderschlagen (Spannungsverlust)',
      'Abheben des Gesäßes von der Bank'
    ]
  },
  {
    id: 'ex-pullup-neutral',
    name: 'Klimmzüge (Neutralgriff)',
    muscle: 'Rücken',
    secondaryMuscles: ['Arme', 'Core'],
    equipment: 'Bodyweight',
    category: 'Grundübung',
    defaultTempo: '2-1-1-1',
    videoUrl: '',
    cues: [
      'Aus dem aktiven Hang starten: Schulterblätter nach unten ziehen (Depression)',
      'Brustbein aktiv zur Stange führen, Ellbogen Richtung Hüfte ziehen',
      'Beine leicht vor dem Körper geschlossen halten (Hollow Body)',
      'Kontrolliert ablassen bis die Arme fast vollständig gestreckt sind'
    ],
    mistakes: [
      'Mit den Beinen schwingen (Kipping)',
      'Schultern oben zu den Ohren ziehen',
      'Halbe Wiederholungen ohne volle Dehnung unten'
    ]
  },
  {
    id: 'ex-chest-row',
    name: 'Brustgestütztes Rudern (Maschine / Bank)',
    muscle: 'Rücken',
    secondaryMuscles: ['Schultern', 'Arme'],
    equipment: 'Maschine',
    category: 'Grundübung',
    defaultTempo: '2-1-1-1',
    videoUrl: '',
    cues: [
      'Brust fest am Polster lassen – kein Schwung aus dem unteren Rücken',
      'Unten Schulterblätter bewusst nach vorne gleiten lassen (Protraktion / Stretch)',
      'Zug über die Ellbogen einleiten und hinten 1 Sekunde fest kontrahieren'
    ],
    mistakes: [
      'Mit dem Oberkörper vom Polster abheben',
      'Zu viel aus dem Bizeps reißen statt Schulterblatt-Arbeit'
    ]
  },
  {
    id: 'ex-bss',
    name: 'Bulgarische Split Squats',
    muscle: 'Beine',
    secondaryMuscles: ['Gesäß', 'Core'],
    equipment: 'Kurzhantel',
    category: 'Grundübung',
    defaultTempo: '3-1-1-0',
    videoUrl: '',
    cues: [
      'ca. 80-90% des Gewichts auf dem vorderen Fuß lassen',
      'Oberkörper leicht nach vorne neigen für mehr Gluteus-Fokus, aufrecht für mehr Quadrizeps',
      'Hinteres Knie kontrolliert Richtung Boden senken, vorderes Knie bleibt stabil über dem Fuß'
    ],
    mistakes: [
      'Zu viel aus dem hinteren Bein abdrücken',
      'Stand zu eng (Seiltänzer-Stand -> Gleichgewichtsverlust)'
    ]
  },
  {
    id: 'ex-ohp',
    name: 'Überkopfdrücken (Langhantel / Military Press)',
    muscle: 'Schultern',
    secondaryMuscles: ['Arme', 'Core'],
    equipment: 'Langhantel',
    category: 'Grundübung',
    defaultTempo: '2-0-1-0',
    videoUrl: '',
    cues: [
      'Gesäß und Bauch maximal anspannen, um ein Hohlkreuz zu verhindern',
      'Ellbogen leicht vor der Stange positionieren',
      'Kopf kurz zurücknehmen, Stange eng am Gesicht vorbei nach oben drücken, dann Kopf leicht durchs Fenster schieben'
    ],
    mistakes: [
      'Starkes Zurücklehnen (wird zum Schrägbankdrücken im Stehen)',
      'Handgelenke stark abknicken lassen'
    ]
  },
  {
    id: 'ex-facepulls',
    name: 'Face Pulls (mit Außenrotation)',
    muscle: 'Mobility/Prehab',
    secondaryMuscles: ['Schultern', 'Rücken'],
    equipment: 'Kabelzug',
    category: 'Reha/Mobility',
    defaultTempo: '2-2-1-0',
    videoUrl: '',
    cues: [
      'Seil im neutralen Griff (Daumen zeigen nach hinten) greifen',
      'Seil Richtung Stirn/Augenhöhe ziehen und gleichzeitig die Hände nach außen rotieren (Doppel-Bizeps-Pose)',
      'Endposition 2 Sekunden aktiv halten und Schulterblätter kontrollieren'
    ],
    mistakes: [
      'Viel zu viel Gewicht nehmen und mit dem ganzen Körper nach hinten lehnen',
      'Ellbogen fallen nach unten statt auf Schulterhöhe zu bleiben'
    ]
  },
  {
    id: 'ex-y-raise',
    name: 'Y-Raises auf der Schrägbank (Lower Trap)',
    muscle: 'Mobility/Prehab',
    secondaryMuscles: ['Schultern', 'Rücken'],
    equipment: 'Kurzhantel',
    category: 'Reha/Mobility',
    defaultTempo: '2-2-1-1',
    videoUrl: '',
    cues: [
      'Bauch auf einer 30-45° Schrägbank ablegen, Daumen zeigen zur Decke',
      'Schulterblätter zuerst leicht nach hinten-unten setzen (Depression)',
      'Arme gestreckt in einem Y-Winkel (ca. 45°) anheben und oben 2 Sek. halten'
    ],
    mistakes: [
      'Aus dem oberen Nacken (Upper Trap) hochziehen',
      'Schwung holen statt kontrollierte Isometrie oben'
    ]
  },
  {
    id: 'ex-lat-raise-cable',
    name: 'Seitheben am Kabelzug (hinter dem Körper)',
    muscle: 'Schultern',
    secondaryMuscles: [],
    equipment: 'Kabelzug',
    category: 'Isolation',
    defaultTempo: '2-1-1-1',
    videoUrl: '',
    cues: [
      'Kabel auf Handhöhe einstellen, leicht schräg stellen für maximalen Stretch unten',
      'Hand Richtung seitliche Wand schieben (nicht zur Decke ziehen)',
      'Kleiner Finger bleibt leicht kontrolliert, Schulter tief lassen'
    ],
    mistakes: [
      'Nacken zieht hoch Richtung Ohren',
      'Arm komplett anwinkeln und aus dem Schwung arbeiten'
    ]
  },
  {
    id: 'ex-tricep-rope',
    name: 'Trizeps Pushdowns am Kabel (Seil)',
    muscle: 'Arme',
    secondaryMuscles: [],
    equipment: 'Kabelzug',
    category: 'Isolation',
    defaultTempo: '2-1-1-1',
    videoUrl: '',
    cues: [
      'Oberarme wie angeklebt seitlich am Rumpf fixieren',
      'Unten das Seil aktiv auseinanderziehen und den Trizeps 1 Sekunde durchstrecken',
      'Kontrolliert nach oben lassen, ohne dass die Ellbogen nach vorne wandern'
    ],
    mistakes: [
      'Aus den Schultern nach unten drücken',
      'Unvollständige Streckung im Lockout'
    ]
  },
  {
    id: 'ex-incline-curl',
    name: 'Incline Dumbbell Curls (Schrägbank)',
    muscle: 'Arme',
    secondaryMuscles: [],
    equipment: 'Kurzhantel',
    category: 'Isolation',
    defaultTempo: '3-1-1-0',
    videoUrl: '',
    cues: [
      'Schrägbank auf ca. 45-60°, Arme hängen frei hinter dem Körper (langer Bizepskopf im Stretch)',
      'Ellbogen zeigen konstant senkrecht zum Boden',
      'Handflächen nach oben supinieren und kontrolliert beugen'
    ],
    mistakes: [
      'Ellbogen beim Curlen weit nach vorne bringen (nimmt die Dehnung raus)',
      'Unten nicht komplett strecken'
    ]
  },
  {
    id: 'ex-hanging-leg-raise',
    name: 'Hanging Leg Raises (Beinheben hängend)',
    muscle: 'Core',
    secondaryMuscles: [],
    equipment: 'Bodyweight',
    category: 'Isolation',
    defaultTempo: '2-1-1-0',
    videoUrl: '',
    cues: [
      'Wichtig: Becken aktiv einrollen (Posterior Pelvic Tilt), nicht nur Beine aus dem Hüftbeuger heben',
      'Kontrolliert ablassen, um Pendeln zu vermeiden'
    ],
    mistakes: [
      'Nur bis 90° mit geradem Rücken schwingen (trainiert fast nur den Hüftbeuger)'
    ]
  }
];

// Previous performance lookup per profile & exercise
const INITIAL_PREVIOUS_LOGS = {
  'coach-self': {
    'ex-squat': [
      { weight: '130', reps: '6', rpe: '8' },
      { weight: '130', reps: '6', rpe: '8.5' },
      { weight: '125', reps: '7', rpe: '8.5' }
    ],
    'ex-rdl': [
      { weight: '120', reps: '8', rpe: '8' },
      { weight: '120', reps: '8', rpe: '8.5' },
      { weight: '120', reps: '8', rpe: '9' }
    ],
    'ex-incline-db': [
      { weight: '40', reps: '8', rpe: '8' },
      { weight: '40', reps: '8', rpe: '8.5' },
      { weight: '38', reps: '9', rpe: '9' }
    ],
    'ex-pullup-neutral': [
      { weight: '15', reps: '8', rpe: '8' },
      { weight: '15', reps: '7', rpe: '8.5' },
      { weight: '10', reps: '8', rpe: '8.5' }
    ],
    'ex-chest-row': [
      { weight: '85', reps: '10', rpe: '8' },
      { weight: '85', reps: '10', rpe: '9' },
      { weight: '80', reps: '11', rpe: '9' }
    ],
    'ex-facepulls': [
      { weight: '25', reps: '15', rpe: '7.5' },
      { weight: '25', reps: '15', rpe: '8' },
      { weight: '25', reps: '15', rpe: '8' }
    ],
    'ex-lat-raise-cable': [
      { weight: '12.5', reps: '14', rpe: '8.5' },
      { weight: '12.5', reps: '13', rpe: '9' },
      { weight: '12.5', reps: '12', rpe: '9.5' }
    ]
  },
  'client-max': {
    'ex-incline-db': [
      { weight: '32', reps: '8', rpe: '8' },
      { weight: '32', reps: '8', rpe: '8.5' },
      { weight: '30', reps: '9', rpe: '8.5' }
    ],
    'ex-pullup-neutral': [
      { weight: '0', reps: '9', rpe: '8' },
      { weight: '0', reps: '8', rpe: '8.5' },
      { weight: '0', reps: '8', rpe: '9' }
    ],
    'ex-chest-row': [
      { weight: '70', reps: '10', rpe: '8' },
      { weight: '70', reps: '10', rpe: '8.5' },
      { weight: '70', reps: '9', rpe: '9' }
    ],
    'ex-squat': [
      { weight: '100', reps: '6', rpe: '8' },
      { weight: '100', reps: '6', rpe: '8.5' },
      { weight: '95', reps: '8', rpe: '8.5' }
    ]
  },
  'client-sarah': {
    'ex-facepulls': [
      { weight: '17.5', reps: '15', rpe: '7' },
      { weight: '17.5', reps: '15', rpe: '7.5' },
      { weight: '17.5', reps: '15', rpe: '8' }
    ],
    'ex-y-raise': [
      { weight: '3', reps: '12', rpe: '8' },
      { weight: '3', reps: '12', rpe: '8' },
      { weight: '3', reps: '12', rpe: '8.5' }
    ],
    'ex-bss': [
      { weight: '16', reps: '10', rpe: '8' },
      { weight: '16', reps: '10', rpe: '8.5' },
      { weight: '16', reps: '9', rpe: '9' }
    ],
    'ex-rdl': [
      { weight: '65', reps: '8', rpe: '7.5' },
      { weight: '65', reps: '8', rpe: '8' },
      { weight: '65', reps: '8', rpe: '8.5' }
    ]
  },
  'client-lukas': {
    'ex-rdl': [
      { weight: '110', reps: '8', rpe: '8' },
      { weight: '110', reps: '8', rpe: '8.5' },
      { weight: '105', reps: '9', rpe: '9' }
    ],
    'ex-incline-db': [
      { weight: '34', reps: '9', rpe: '8.5' },
      { weight: '34', reps: '8', rpe: '9' },
      { weight: '32', reps: '9', rpe: '9' }
    ]
  }
};

// Assigned workout plans per profile
const INITIAL_PLANS = {
  'coach-self': [
    {
      id: 'plan-upper-a',
      title: 'Upper Body A – Heavy Strength & Hypertrophie',
      subtitle: 'Fokus: Incline Press, Klimmzüge & Schulter-Prehab',
      estimatedDuration: '65 Min.',
      defaultRestSeconds: 120,
      exercises: [
        {
          exerciseId: 'ex-incline-db',
          targetSets: 3,
          targetReps: '6-8',
          targetRpe: '8 - 8.5',
          tempo: '3-1-1-0',
          restSeconds: 150,
          coachNote: 'Top-Satz heute gerne +2 kg testen, wenn das Aufwärmen flüssig läuft. 1 Sekunde Pause unten!'
        },
        {
          exerciseId: 'ex-pullup-neutral',
          targetSets: 3,
          targetReps: '6-8',
          targetRpe: '8.5',
          tempo: '2-1-1-1',
          restSeconds: 150,
          coachNote: 'Zusatzgewicht am Gürtel. Volle Depression der Schulterblätter im Hang.'
        },
        {
          exerciseId: 'ex-chest-row',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: '8.5 - 9',
          tempo: '2-1-1-1',
          restSeconds: 120,
          coachNote: 'Schulterblätter unten bewusst nach vorne ziehen lassen, dann hart kontrahieren.'
        },
        {
          exerciseId: 'ex-lat-raise-cable',
          targetSets: 3,
          targetReps: '12-15',
          targetRpe: '9',
          tempo: '2-1-1-1',
          restSeconds: 75,
          coachNote: 'Sauber aus der seitlichen Schulter führen, kein Schwung aus der Hüfte.'
        },
        {
          exerciseId: 'ex-facepulls',
          targetSets: 3,
          targetReps: '15',
          targetRpe: '8',
          tempo: '2-2-1-0',
          restSeconds: 60,
          coachNote: '2 Sekunden Endkontraktion in Außenrotation halten.'
        }
      ]
    },
    {
      id: 'plan-lower-a',
      title: 'Lower Body A – Squat & Posterior Chain',
      subtitle: 'Fokus: High Bar Squat, RDL & Single Leg',
      estimatedDuration: '70 Min.',
      defaultRestSeconds: 150,
      exercises: [
        {
          exerciseId: 'ex-squat',
          targetSets: 3,
          targetReps: '5-7',
          targetRpe: '8',
          tempo: '3-1-1-0',
          restSeconds: 180,
          coachNote: '360° Bracing vor jeder Wiederholung. Kontrollierte Pause im Loch.'
        },
        {
          exerciseId: 'ex-rdl',
          targetSets: 3,
          targetReps: '7-9',
          targetRpe: '8.5',
          tempo: '3-1-1-0',
          restSeconds: 150,
          coachNote: 'Nur so tief wie die Hüfte aktiv nach hinten wandert. Zughilfen nutzen!'
        },
        {
          exerciseId: 'ex-bss',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: '8.5',
          tempo: '3-1-1-0',
          restSeconds: 120,
          coachNote: 'Mit dem schwächeren Bein starten. 60 Sek. Pause zwischen den Beinen.'
        },
        {
          exerciseId: 'ex-hanging-leg-raise',
          targetSets: 3,
          targetReps: '10-12',
          targetRpe: '8.5',
          tempo: '2-1-1-0',
          restSeconds: 75,
          coachNote: 'Becken einrollen, kein Schwung.'
        }
      ]
    }
  ],
  'client-max': [
    {
      id: 'plan-max-upper',
      title: 'Tag 1: Oberkörper Hypertrophie A',
      subtitle: 'Brust, Breiter Rücken & Schulter-Fokus',
      estimatedDuration: '60 Min.',
      defaultRestSeconds: 120,
      exercises: [
        {
          exerciseId: 'ex-incline-db',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: '8 - 8.5',
          tempo: '3-1-1-0',
          restSeconds: 120,
          coachNote: 'Hey Max! Letzte Woche 2x8 mit 32kg geschafft. Heute 3x8 mit 32kg voll machen!'
        },
        {
          exerciseId: 'ex-pullup-neutral',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: '8.5',
          tempo: '2-1-1-0',
          restSeconds: 120,
          coachNote: 'Sauber bis zum Kinn ziehen, unten komplett aushängen.'
        },
        {
          exerciseId: 'ex-chest-row',
          targetSets: 3,
          targetReps: '10-12',
          targetRpe: '9',
          tempo: '2-1-1-1',
          restSeconds: 90,
          coachNote: 'Brust bleibt fest am Polster.'
        },
        {
          exerciseId: 'ex-tricep-rope',
          targetSets: 3,
          targetReps: '12-15',
          targetRpe: '9',
          tempo: '2-1-1-1',
          restSeconds: 75,
          coachNote: 'Ellbogen fixiert lassen, Seil unten aufspreizen.'
        }
      ]
    },
    {
      id: 'plan-max-lower',
      title: 'Tag 2: Unterkörper Kraft & Hypertrophie',
      subtitle: 'Kniebeuge, Beinbeuger & Core',
      estimatedDuration: '60 Min.',
      defaultRestSeconds: 150,
      exercises: [
        {
          exerciseId: 'ex-squat',
          targetSets: 3,
          targetReps: '6-8',
          targetRpe: '8',
          tempo: '3-1-1-0',
          restSeconds: 150,
          coachNote: 'Tiefe konstant halten, Knie stabil nach außen.'
        },
        {
          exerciseId: 'ex-rdl',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: '8.5',
          tempo: '3-1-1-0',
          restSeconds: 120,
          coachNote: 'Spannung im Lat halten, Stange am Bein entlangführen.'
        }
      ]
    }
  ],
  'client-sarah': [
    {
      id: 'plan-sarah-rehab',
      title: 'Ganzkörper A & Schulter-Stabilität',
      subtitle: 'Schmerzfreie Progression + Scapula-Kontrolle',
      estimatedDuration: '55 Min.',
      defaultRestSeconds: 90,
      exercises: [
        {
          exerciseId: 'ex-facepulls',
          targetSets: 3,
          targetReps: '15',
          targetRpe: '7.5',
          tempo: '2-2-1-0',
          restSeconds: 60,
          coachNote: 'Als Aktivierung & Prehab. Fokus auf saubere Außenrotation ohne Schmerz.'
        },
        {
          exerciseId: 'ex-y-raise',
          targetSets: 3,
          targetReps: '12',
          targetRpe: '8',
          tempo: '2-2-1-1',
          restSeconds: 60,
          coachNote: 'Unterer Trapez aktivieren: Schulterblätter tief lassen!'
        },
        {
          exerciseId: 'ex-bss',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: '8',
          tempo: '3-1-1-0',
          restSeconds: 120,
          coachNote: 'Knie bleibt ruhig in einer Linie mit der Fußspitze.'
        },
        {
          exerciseId: 'ex-rdl',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: '8',
          tempo: '3-1-1-0',
          restSeconds: 120,
          coachNote: 'Rücken neutral, stolze Brust.'
        },
        {
          exerciseId: 'ex-chest-row',
          targetSets: 3,
          targetReps: '10-12',
          targetRpe: '8',
          tempo: '2-1-1-1',
          restSeconds: 90,
          coachNote: 'Schulterblätter kontrolliert zusammenführen.'
        }
      ]
    }
  ],
  'client-lukas': [
    {
      id: 'plan-lukas-pull',
      title: 'Posterior Chain & Upper Pull',
      subtitle: 'Schwere RDLs, Rückenbreite & Bizeps',
      estimatedDuration: '65 Min.',
      defaultRestSeconds: 120,
      exercises: [
        {
          exerciseId: 'ex-rdl',
          targetSets: 3,
          targetReps: '6-8',
          targetRpe: '8.5',
          tempo: '3-1-1-0',
          restSeconds: 150,
          coachNote: 'Zughilfen ab dem 1. Arbeitssatz nutzen, voller Fokus auf Beinbeuger/Glutes.'
        },
        {
          exerciseId: 'ex-pullup-neutral',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: '8.5',
          tempo: '2-1-1-1',
          restSeconds: 120,
          coachNote: 'Volle Range of Motion.'
        },
        {
          exerciseId: 'ex-incline-curl',
          targetSets: 3,
          targetReps: '10-12',
          targetRpe: '9',
          tempo: '3-1-1-0',
          restSeconds: 75,
          coachNote: 'Ellbogen hinten fixiert lassen!'
        }
      ]
    }
  ]
};

// Detailed Workout History with Pain Logs & Form-Check Videos for Weekly Check-Up
const INITIAL_WORKOUT_HISTORY = [
  {
    id: 'hist-1',
    profileId: 'coach-self',
    date: 'Vor 2 Tagen (19.10.26)',
    workoutTitle: 'Lower Body A – Squat & Posterior Chain',
    durationMinutes: 68,
    totalVolumeKg: 8490,
    completedSets: 12,
    prCount: 2,
    energyLevel: 8,
    sleepHours: 7.5,
    athleteNote: 'Kniebeuge 130kg fühlte sich extrem stabil an. RDL Griffkraft mit Straps top.',
    highlights: ['Langhantel Kniebeuge: 130 kg × 6 @ RPE 8', 'Rumänisches Kreuzheben: 120 kg × 8 @ RPE 8.5'],
    exerciseDetails: [
      {
        exerciseId: 'ex-squat',
        name: 'Langhantel Kniebeuge (High Bar)',
        topSet: '130 kg × 6 @ RPE 8',
        painLevel: 2,
        painArea: 'Patellasehne links (nur beim 1. Aufwärmsatz)',
        athleteNote: 'Mit Kniebandagen und 3 Sek. Exzentrik komplett stabil. Video vom 2. Satz angehängt!',
        videoUrl: SAMPLE_FORMCHECK_VIDEO_URL,
        videoName: 'Squat_130kg_Satz2_FormCheck.mp4',
        coachVideoFeedback: 'Tiefe und Bar-Path sind 1A! Ab Wdh. 5 schießt die Hüfte minimal schneller hoch – Ellbogen noch fester unter die Hantel ziehen.'
      },
      {
        exerciseId: 'ex-rdl',
        name: 'Rumänisches Kreuzheben (RDL)',
        topSet: '120 kg × 8 @ RPE 8.5',
        painLevel: 0,
        painArea: '',
        athleteNote: 'Starker Stretch im Beinbeuger, LWS komplett entspannt.',
        videoUrl: '',
        videoName: '',
        coachVideoFeedback: ''
      }
    ]
  },
  {
    id: 'hist-3',
    profileId: 'client-max',
    date: 'Gestern (20.10.26)',
    workoutTitle: 'Tag 1: Oberkörper Hypertrophie A',
    durationMinutes: 58,
    totalVolumeKg: 5240,
    completedSets: 12,
    prCount: 2,
    energyLevel: 7,
    sleepHours: 6.5,
    athleteNote: '32kg beim Schrägbankdrücken im 1. und 2. Satz für 8 Wdh. gepackt! Vordere Schulter hat leicht gezogen.',
    highlights: ['Schrägbankdrücken (KH): 32 kg × 8 @ RPE 8', 'Brustgestütztes Rudern: 70 kg × 10 @ RPE 8'],
    exerciseDetails: [
      {
        exerciseId: 'ex-incline-db',
        name: 'Schrägbankdrücken (Kurzhantel)',
        topSet: '32 kg × 8 @ RPE 8.5',
        painLevel: 4,
        painArea: 'Vordere Schulter rechts im untersten Punkt',
        athleteNote: 'Ab Satz 2 die Ellbogen etwas enger an den Körper genommen, bitte mal im Video prüfen ob der Winkel passt.',
        videoUrl: SAMPLE_FORMCHECK_VIDEO_URL,
        videoName: 'Max_Incline_DB_32kg.mp4',
        coachVideoFeedback: 'Gute Korrektur! Stell die Bank nächste Woche 1 Stufe flacher (ca. 30° statt 45°) und lass den Unterarm im 45°-Winkel.'
      },
      {
        exerciseId: 'ex-chest-row',
        name: 'Brustgestütztes Rudern (Maschine / Bank)',
        topSet: '70 kg × 10 @ RPE 8.5',
        painLevel: 0,
        painArea: '',
        athleteNote: 'Super Muskelgefühl im oberen Rücken.',
        videoUrl: '',
        videoName: '',
        coachVideoFeedback: ''
      }
    ]
  },
  {
    id: 'hist-4',
    profileId: 'client-sarah',
    date: 'Vor 3 Tagen (18.10.26)',
    workoutTitle: 'Ganzkörper A & Schulter-Stabilität',
    durationMinutes: 52,
    totalVolumeKg: 3410,
    completedSets: 15,
    prCount: 1,
    energyLevel: 8,
    sleepHours: 8.0,
    athleteNote: 'Schulter hat bei den Face Pulls & Y-Raises komplett schmerzfrei gearbeitet. BSS brennen ordentlich!',
    highlights: ['Rumänisches Kreuzheben: 65 kg × 8 @ RPE 8', 'Bulgarische Split Squats: 16 kg × 10 @ RPE 8'],
    exerciseDetails: [
      {
        exerciseId: 'ex-bss',
        name: 'Bulgarische Split Squats',
        topSet: '16 kg × 10 @ RPE 8.5',
        painLevel: 1,
        painArea: 'Leichter Zug Kniegelenk vorne rechts',
        athleteNote: 'Habe mein vorderes Standbein etwas weiter nach vorne gestellt, hier ist das Video vom 3. Satz.',
        videoUrl: SAMPLE_FORMCHECK_VIDEO_URL,
        videoName: 'Sarah_BSS_16kg_Satz3.mp4',
        coachVideoFeedback: 'Knieachse bleibt super stabil! Genau diese Schrittlänge beibehalten.'
      },
      {
        exerciseId: 'ex-facepulls',
        name: 'Face Pulls (mit Außenrotation)',
        topSet: '17.5 kg × 15 @ RPE 7.5',
        painLevel: 0,
        painArea: '',
        athleteNote: 'Keinerlei Schulterschmerzen mehr!',
        videoUrl: '',
        videoName: '',
        coachVideoFeedback: ''
      }
    ]
  }
];

const INITIAL_CHECKUP_SUMMARY = {
  'coach-self': 'Kniebeuge-Technik sitzt trotz 130kg sehr sauber. Vor dem Beintraining 5 Min. Spanish Squats als Patellasehnen-Warmup beibehalten.',
  'client-max': 'WICHTIG für Woche 4: Schrägbankwinkel von 45° auf 30° reduzieren (entlastet vordere Schulter rechts). Ansonsten Progression bei 32kg bestätigen!',
  'client-sarah': 'Schulter-Reha schlägt super an (0/10 Schmerz bei Face Pulls & Y-Raises). BSS Standweite aus dem Video exakt so beibehalten.',
  'client-lukas': 'RDL Technik sitzt, nächste Woche +2.5kg steigern.'
};

const MUSCLE_GROUPS = ['Alle', 'Brust', 'Rücken', 'Beine', 'Schultern', 'Arme', 'Core', 'Mobility/Prehab'];
const EQUIPMENT_TYPES = ['Alle', 'Langhantel', 'Kurzhantel', 'Kabelzug', 'Maschine', 'Bodyweight'];

// Helper to calculate estimated 1RM (Epley formula)
const calculateE1RM = (weight, reps) => {
  const w = parseFloat(weight);
  const r = parseFloat(reps);
  if (!w || !r || w <= 0 || r <= 0) return 0;
  if (r === 1) return Math.round(w);
  return Math.round(w * (1 + r / 30));
};

// Format YYYY-MM-DD to German DD.MM.YY
const formatGermanDate = (isoStr) => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length !== 3) return isoStr;
  return `${parts[2]}.${parts[1]}.${parts[0].slice(2)}`;
};

// ==========================================
// SLOW-MOTION FORM-CHECK VIDEO PLAYER COMPONENT
// ==========================================
function FormCheckVideoPlayer({ videoUrl, videoName }) {
  const videoRef = useRef(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handleSpeedChange = (rate) => {
    setPlaybackSpeed(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  if (!videoUrl) return null;

  const isDirectVideo =
    videoUrl.startsWith('blob:') ||
    videoUrl.endsWith('.mp4') ||
    videoUrl.endsWith('.webm') ||
    videoUrl.endsWith('.mov') ||
    videoUrl.includes('commondatastorage.googleapis.com');

  return (
    <div className="bg-zinc-950 border border-violet-500/40 rounded-xl overflow-hidden space-y-2 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded-md bg-violet-600/20 text-violet-300 border border-violet-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Film className="w-3 h-3" />
            Form-Check Video
          </span>
          <span className="text-xs font-semibold text-zinc-300 truncate">
            {videoName || 'Technik-Aufnahme'}
          </span>
        </div>

        {/* Slow-Motion Controls for Biomechanical Analysis */}
        {isDirectVideo && (
          <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
            <Gauge className="w-3.5 h-3.5 text-violet-400 mr-1" />
            <span className="text-[10px] text-zinc-400 mr-1">Speed:</span>
            {[0.25, 0.5, 1].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleSpeedChange(rate)}
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                  playbackSpeed === rate
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-400 hover:text-white bg-zinc-800/60'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        )}
      </div>

      {isDirectVideo ? (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          playsInline
          className="w-full max-h-64 rounded-lg bg-black object-contain border border-zinc-800"
        />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-300 truncate">
            Externer Video-Link: <span className="text-violet-400 underline">{videoUrl}</span>
          </div>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shrink-0"
          >
            Video öffnen ↗
          </a>
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Navigation & Context State
  // 'workout' | 'checkup' | 'body' | 'exercises' | 'coach'
  const [activeTab, setActiveTab] = useState('workout');
  const [appMode, setAppMode] = useState('athlete');
  const [selectedProfileId, setSelectedProfileId] = useState('coach-self');

  // Cloud Persistence & Sync State
  const [user, setUser] = useState(null);
  const [cloudHydrated, setCloudHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState('connecting');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [confirmResetStep, setConfirmResetStep] = useState(false);

  // Core Data State
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [exercises, setExercises] = useState(INITIAL_EXERCISES);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [previousLogs, setPreviousLogs] = useState(INITIAL_PREVIOUS_LOGS);
  const [workoutHistory, setWorkoutHistory] = useState(INITIAL_WORKOUT_HISTORY);
  const [bodyMeasurements, setBodyMeasurements] = useState(INITIAL_BODY_MEASUREMENTS);
  const [checkupSummaries, setCheckupSummaries] = useState(INITIAL_CHECKUP_SUMMARY);

  // Check-Up Filter State ('all' | 'pain' | 'video')
  const [checkupFilter, setCheckupFilter] = useState('all');

  // Body Measurements Tab State
  const [bodyTimeframe, setBodyTimeframe] = useState('month');
  const [selectedBodyMetric, setSelectedBodyMetric] = useState('weight');
  const [showNewMeasurementModal, setShowNewMeasurementModal] = useState(false);
  const [hoveredChartPoint, setHoveredChartPoint] = useState(null);

  const [measurementForm, setMeasurementForm] = useState({
    date: '2026-10-21',
    weight: '',
    shoulders: '',
    chest: '',
    abdomen: '',
    waist: '',
    glutes: '',
    upperArm: '',
    forearm: '',
    thigh: '',
    calf: ''
  });

  // Active Workout Logger State
  const [selectedPlanId, setSelectedPlanId] = useState('plan-upper-a');
  const [activeSessionExercises, setActiveSessionExercises] = useState([]);
  const [sessionNote, setSessionNote] = useState('');
  const [sessionEnergy, setSessionEnergy] = useState(8);
  const [sessionSleep, setSessionSleep] = useState(7.5);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [elapsedMinutes] = useState(12);

  // Rest Timer State
  const [restTimer, setRestTimer] = useState({
    active: false,
    remaining: 0,
    total: 120,
    exerciseName: ''
  });

  // Exercise Database Filter & Modal State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Alle');
  const [selectedEquipment, setSelectedEquipment] = useState('Alle');
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState(null);
  const [showNewExerciseModal, setShowNewExerciseModal] = useState(false);
  const [showAddExerciseToWorkoutModal, setShowAddExerciseToWorkoutModal] = useState(false);

  // New Exercise Form State
  const [newExForm, setNewExForm] = useState({
    name: '',
    muscle: 'Brust',
    equipment: 'Kurzhantel',
    category: 'Grundübung',
    defaultTempo: '3-1-1-0',
    videoUrl: '',
    cuesText: '',
    mistakesText: ''
  });

  // Coach Plan Editor Modal State
  const [editingPlanModal, setEditingPlanModal] = useState(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    goal: '',
    weeklyTarget: 3,
    notes: ''
  });

  // Toast Notification
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // ==========================================
  // 1. FIREBASE AUTHENTICATION (RULE 3)
  // ==========================================
  useEffect(() => {
    if (!auth) {
      setSyncStatus('error');
      setCloudHydrated(true);
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth error:', err);
        setSyncStatus('error');
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // ==========================================
  // 2. CLOUD FIRESTORE SNAPSHOT & SYNC
  // ==========================================
  const persistStateToCloud = async (overrideData = {}) => {
    if (!user || !db) return;
    setSyncStatus('saving');
    try {
      const stateDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'appState', 'main');
      const payload = {
        profilesJson: JSON.stringify(overrideData.profiles ?? profiles),
        exercisesJson: JSON.stringify(overrideData.exercises ?? exercises),
        plansJson: JSON.stringify(overrideData.plans ?? plans),
        previousLogsJson: JSON.stringify(overrideData.previousLogs ?? previousLogs),
        workoutHistoryJson: JSON.stringify(overrideData.workoutHistory ?? workoutHistory),
        bodyMeasurementsJson: JSON.stringify(overrideData.bodyMeasurements ?? bodyMeasurements),
        checkupSummariesJson: JSON.stringify(overrideData.checkupSummaries ?? checkupSummaries),
        updatedAt: new Date().toISOString()
      };
      await setDoc(stateDocRef, payload, { merge: true });
      setLastSavedAt(
        new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setSyncStatus('synced');
    } catch (err) {
      console.error('Cloud save error:', err);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    if (!user || !db) return;

    const stateDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'appState', 'main');
    const unsubscribe = onSnapshot(
      stateDocRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          try {
            const loadedProfiles = data.profilesJson ? JSON.parse(data.profilesJson) : INITIAL_PROFILES;
            const loadedExercises = data.exercisesJson ? JSON.parse(data.exercisesJson) : INITIAL_EXERCISES;
            const loadedPlans = data.plansJson ? JSON.parse(data.plansJson) : INITIAL_PLANS;
            const loadedPrevLogs = data.previousLogsJson
              ? JSON.parse(data.previousLogsJson)
              : INITIAL_PREVIOUS_LOGS;
            const loadedHistory = data.workoutHistoryJson
              ? JSON.parse(data.workoutHistoryJson)
              : INITIAL_WORKOUT_HISTORY;
            const loadedBody = data.bodyMeasurementsJson
              ? JSON.parse(data.bodyMeasurementsJson)
              : INITIAL_BODY_MEASUREMENTS;
            const loadedCheckups = data.checkupSummariesJson
              ? JSON.parse(data.checkupSummariesJson)
              : INITIAL_CHECKUP_SUMMARY;

            setProfiles(loadedProfiles);
            setExercises(loadedExercises);
            setPlans(loadedPlans);
            setPreviousLogs(loadedPrevLogs);
            setWorkoutHistory(loadedHistory);
            setBodyMeasurements(loadedBody);
            setCheckupSummaries(loadedCheckups);

            if (!cloudHydrated) {
              const firstProfId = loadedProfiles[0]?.id || 'coach-self';
              const firstPlanId = (loadedPlans[firstProfId] && loadedPlans[firstProfId][0]?.id) || '';
              setSelectedProfileId(firstProfId);
              setSelectedPlanId(firstPlanId);
              initializeWorkoutSession(firstProfId, firstPlanId, loadedPlans, loadedExercises, loadedPrevLogs);
            }

            if (data.updatedAt) {
              setLastSavedAt(
                new Date(data.updatedAt).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
              );
            }
            setCloudHydrated(true);
            setSyncStatus('synced');
          } catch (parseErr) {
            console.error('Error parsing cloud data:', parseErr);
            setCloudHydrated(true);
            setSyncStatus('error');
          }
        } else {
          try {
            await setDoc(stateDocRef, {
              profilesJson: JSON.stringify(INITIAL_PROFILES),
              exercisesJson: JSON.stringify(INITIAL_EXERCISES),
              plansJson: JSON.stringify(INITIAL_PLANS),
              previousLogsJson: JSON.stringify(INITIAL_PREVIOUS_LOGS),
              workoutHistoryJson: JSON.stringify(INITIAL_WORKOUT_HISTORY),
              bodyMeasurementsJson: JSON.stringify(INITIAL_BODY_MEASUREMENTS),
              checkupSummariesJson: JSON.stringify(INITIAL_CHECKUP_SUMMARY),
              updatedAt: new Date().toISOString()
            });
            setLastSavedAt(
              new Date().toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })
            );
            setCloudHydrated(true);
            setSyncStatus('synced');
          } catch (seedErr) {
            console.error('Error seeding cloud data:', seedErr);
            setCloudHydrated(true);
            setSyncStatus('error');
          }
        }
      },
      (err) => {
        console.error('Firestore listener error:', err);
        setCloudHydrated(true);
        setSyncStatus('error');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Automatic debounced Cloud Save whenever core data changes
  useEffect(() => {
    if (!user || !db || !cloudHydrated) return;

    const timer = setTimeout(() => {
      persistStateToCloud();
    }, 650);

    return () => clearTimeout(timer);
  }, [profiles, exercises, plans, previousLogs, workoutHistory, bodyMeasurements, checkupSummaries, user, cloudHydrated]);

  const currentProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId) || profiles[0],
    [profiles, selectedProfileId]
  );

  const currentProfilePlans = useMemo(
    () => plans[selectedProfileId] || [],
    [plans, selectedProfileId]
  );

  // Build active workout session rows whenever profile or selectedPlanId changes
  const initializeWorkoutSession = (
    profileId,
    planId,
    customPlans = plans,
    customExercises = exercises,
    customPrevLogs = previousLogs
  ) => {
    const profilePlans = customPlans[profileId] || [];
    const targetPlan = profilePlans.find((p) => p.id === planId) || profilePlans[0];

    if (!targetPlan) {
      setActiveSessionExercises([]);
      return;
    }

    const builtExercises = targetPlan.exercises.map((item) => {
      const exObj = customExercises.find((e) => e.id === item.exerciseId) || {
        id: item.exerciseId,
        name: 'Unbekannte Übung',
        muscle: 'Allgemein',
        equipment: 'Frei'
      };
      const prevForEx = (customPrevLogs[profileId] && customPrevLogs[profileId][item.exerciseId]) || [];

      const sets = Array.from({ length: item.targetSets || 3 }).map((_, idx) => {
        const prevSet = prevForEx[idx] || prevForEx[prevForEx.length - 1] || null;
        return {
          id: `${item.exerciseId}-set-${idx}-${Date.now()}`,
          setNumber: idx + 1,
          prevText: prevSet ? `${prevSet.weight} kg × ${prevSet.reps} @ RPE ${prevSet.rpe}` : 'Kein Vorwert',
          weight: prevSet ? prevSet.weight : '',
          reps: prevSet ? prevSet.reps : '',
          rpe: prevSet ? prevSet.rpe : '8',
          completed: false
        };
      });

      return {
        ...item,
        exercise: exObj,
        painLevel: 0,
        painArea: '',
        athleteExerciseNote: '',
        videoUrl: '',
        videoName: '',
        showVideoUrlInput: false,
        sets
      };
    });

    setActiveSessionExercises(builtExercises);
    setSessionNote('');
    setSessionEnergy(8);
    setSessionSleep(7.5);
    setSessionStartTime(Date.now());
  };

  // Update exercise-level feedback (painLevel, painArea, athleteExerciseNote, videoUrl, videoName)
  const handleUpdateExerciseFeedback = (exIndex, field, value) => {
    setActiveSessionExercises((prev) => {
      const updated = [...prev];
      updated[exIndex] = {
        ...updated[exIndex],
        [field]: value
      };
      return updated;
    });
  };

  // Handle smartphone/desktop video file upload for an exercise
  const handleVideoFileUpload = (exIndex, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setActiveSessionExercises((prev) => {
      const updated = [...prev];
      updated[exIndex] = {
        ...updated[exIndex],
        videoUrl: objectUrl,
        videoName: file.name
      };
      return updated;
    });
    triggerToast(`Technik-Video "${file.name}" erfolgreich angehängt! 🎥`);
  };

  // Save coach video feedback inside Workout History (Weekly Check-Up Tab)
  const handleSaveCoachVideoFeedback = (sessionId, exIndex, feedbackText) => {
    setWorkoutHistory((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const updatedDetails = [...(session.exerciseDetails || [])];
        if (updatedDetails[exIndex]) {
          updatedDetails[exIndex] = {
            ...updatedDetails[exIndex],
            coachVideoFeedback: feedbackText
          };
        }
        return {
          ...session,
          exerciseDetails: updatedDetails
        };
      })
    );
    triggerToast('Coach Technik-Feedback zum Video gespeichert! 🎯');
  };

  // Backup Export / Import / Reset Handlers
  const generateBackupJson = () => {
    return JSON.stringify(
      {
        app: 'BIZEPS BÄR - Coaching & Performance',
        exportedAt: new Date().toISOString(),
        profiles,
        exercises,
        plans,
        previousLogs,
        workoutHistory,
        bodyMeasurements,
        checkupSummaries
      },
      null,
      2
    );
  };

  const handleDownloadBackupFile = () => {
    const jsonString = generateBackupJson();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bizeps-baer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('JSON-Backup erfolgreich heruntergeladen! 💾');
  };

  const handleImportBackupJson = () => {
    if (!importJsonText.trim()) {
      triggerToast('Bitte füge zuerst einen gültigen JSON-Backup-Text ein.', 'warning');
      return;
    }
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.profiles || !parsed.exercises || !parsed.plans) {
        triggerToast('Ungültiges Backup-Format: Profile, Übungen oder Pläne fehlen.', 'warning');
        return;
      }
      setProfiles(parsed.profiles);
      setExercises(parsed.exercises);
      setPlans(parsed.plans);
      if (parsed.previousLogs) setPreviousLogs(parsed.previousLogs);
      if (parsed.workoutHistory) setWorkoutHistory(parsed.workoutHistory);
      if (parsed.bodyMeasurements) setBodyMeasurements(parsed.bodyMeasurements);
      if (parsed.checkupSummaries) setCheckupSummaries(parsed.checkupSummaries);

      const firstProf = parsed.profiles[0]?.id || 'coach-self';
      const firstPlan = (parsed.plans[firstProf] && parsed.plans[firstProf][0]?.id) || '';
      setSelectedProfileId(firstProf);
      setSelectedPlanId(firstPlan);
      initializeWorkoutSession(
        firstProf,
        firstPlan,
        parsed.plans,
        parsed.exercises,
        parsed.previousLogs || previousLogs
      );

      setImportJsonText('');
      setShowBackupModal(false);
      triggerToast('Backup erfolgreich importiert & gespeichert! 🐻');
    } catch (e) {
      triggerToast('Fehler beim Lesen des JSON-Backups. Bitte Format prüfen.', 'warning');
    }
  };

  const handleResetToDemoData = () => {
    setProfiles(INITIAL_PROFILES);
    setExercises(INITIAL_EXERCISES);
    setPlans(INITIAL_PLANS);
    setPreviousLogs(INITIAL_PREVIOUS_LOGS);
    setWorkoutHistory(INITIAL_WORKOUT_HISTORY);
    setBodyMeasurements(INITIAL_BODY_MEASUREMENTS);
    setCheckupSummaries(INITIAL_CHECKUP_SUMMARY);
    setSelectedProfileId('coach-self');
    setSelectedPlanId('plan-upper-a');
    initializeWorkoutSession(
      'coach-self',
      'plan-upper-a',
      INITIAL_PLANS,
      INITIAL_EXERCISES,
      INITIAL_PREVIOUS_LOGS
    );
    setConfirmResetStep(false);
    setShowBackupModal(false);
    triggerToast('Alle Daten wurden auf die BIZEPS BÄR Standard-Daten zurückgesetzt.');
  };

  // Switch profile handler
  const handleSelectProfile = (newProfileId) => {
    setSelectedProfileId(newProfileId);
    const pPlans = plans[newProfileId] || [];
    const firstPlanId = pPlans[0]?.id || '';
    setSelectedPlanId(firstPlanId);
    initializeWorkoutSession(newProfileId, firstPlanId);
  };

  // Switch workout plan handler
  const handleSelectPlan = (newPlanId) => {
    setSelectedPlanId(newPlanId);
    initializeWorkoutSession(selectedProfileId, newPlanId);
  };

  // Initial load
  useEffect(() => {
    initializeWorkoutSession('coach-self', 'plan-upper-a');
  }, []);

  // Open new measurement modal pre-filled with latest profile measurement values
  const openMeasurementModal = () => {
    const list = bodyMeasurements[selectedProfileId] || [];
    const latest = list[list.length - 1] || {};
    setMeasurementForm({
      date: '2026-10-21',
      weight: latest.weight ?? '',
      shoulders: latest.shoulders ?? '',
      chest: latest.chest ?? '',
      abdomen: latest.abdomen ?? '',
      waist: latest.waist ?? '',
      glutes: latest.glutes ?? '',
      upperArm: latest.upperArm ?? '',
      forearm: latest.forearm ?? '',
      thigh: latest.thigh ?? '',
      calf: latest.calf ?? ''
    });
    setShowNewMeasurementModal(true);
  };

  // Save new body measurement entry
  const handleSaveMeasurement = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `bm-${Date.now()}`,
      date: measurementForm.date || '2026-10-21',
      weight: parseFloat(measurementForm.weight) || 0,
      shoulders: parseFloat(measurementForm.shoulders) || 0,
      chest: parseFloat(measurementForm.chest) || 0,
      abdomen: parseFloat(measurementForm.abdomen) || 0,
      waist: parseFloat(measurementForm.waist) || 0,
      glutes: parseFloat(measurementForm.glutes) || 0,
      upperArm: parseFloat(measurementForm.upperArm) || 0,
      forearm: parseFloat(measurementForm.forearm) || 0,
      thigh: parseFloat(measurementForm.thigh) || 0,
      calf: parseFloat(measurementForm.calf) || 0
    };

    setBodyMeasurements((prev) => {
      const existing = prev[selectedProfileId] || [];
      const filtered = existing.filter((item) => item.date !== newEntry.date);
      const sorted = [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date));
      return {
        ...prev,
        [selectedProfileId]: sorted
      };
    });

    setShowNewMeasurementModal(false);
    triggerToast('Körperwerte & Umfänge erfolgreich gespeichert! 📏');
  };

  // Delete measurement entry
  const handleDeleteMeasurement = (entryId) => {
    setBodyMeasurements((prev) => {
      const existing = prev[selectedProfileId] || [];
      if (existing.length <= 2) {
        triggerToast('Mindestens 2 Messpunkte werden für das Zeitdiagramm benötigt.', 'warning');
        return prev;
      }
      return {
        ...prev,
        [selectedProfileId]: existing.filter((item) => item.id !== entryId)
      };
    });
  };

  // Filtered measurements based on Monats-Tab vs Jahres-Tab
  const activeMeasurements = useMemo(() => {
    const all = [...(bodyMeasurements[selectedProfileId] || [])].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    if (all.length === 0) return [];

    if (bodyTimeframe === 'month') {
      const latestDate = new Date(all[all.length - 1].date);
      const cutoff = new Date(latestDate);
      cutoff.setDate(cutoff.getDate() - 35);
      const recent = all.filter((m) => new Date(m.date) >= cutoff);
      return recent.length >= 2 ? recent : all.slice(-Math.min(4, all.length));
    } else {
      const latestDate = new Date(all[all.length - 1].date);
      const cutoff = new Date(latestDate);
      cutoff.setDate(cutoff.getDate() - 365);
      const yearly = all.filter((m) => new Date(m.date) >= cutoff);
      return yearly.length >= 2 ? yearly : all;
    }
  }, [bodyMeasurements, selectedProfileId, bodyTimeframe]);

  const activeMetricMeta = useMemo(
    () => BODY_METRICS.find((m) => m.key === selectedBodyMetric) || BODY_METRICS[0],
    [selectedBodyMetric]
  );

  // Rest timer countdown effect
  useEffect(() => {
    if (!restTimer.active) return;
    if (restTimer.remaining <= 0) {
      setRestTimer((prev) => ({ ...prev, active: false, remaining: 0 }));
      triggerToast('Satzpause beendet – Nächster Satz bereit! 💪', 'info');
      return;
    }
    const interval = setInterval(() => {
      setRestTimer((prev) => ({
        ...prev,
        remaining: Math.max(0, prev.remaining - 1)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimer.active, restTimer.remaining]);

  // Format seconds as MM:SS
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Update a set input inside active workout
  const handleUpdateSet = (exIndex, setIndex, field, value) => {
    setActiveSessionExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIndex] };
      const sets = [...ex.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      ex.sets = sets;
      updated[exIndex] = ex;
      return updated;
    });
  };

  // Toggle set completion & start rest timer
  const handleToggleSetComplete = (exIndex, setIndex) => {
    setActiveSessionExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIndex] };
      const sets = [...ex.sets];
      const currentSet = sets[setIndex];
      const nextCompleted = !currentSet.completed;

      sets[setIndex] = {
        ...currentSet,
        completed: nextCompleted,
        weight: currentSet.weight || '0',
        reps: currentSet.reps || '8'
      };
      ex.sets = sets;
      updated[exIndex] = ex;

      if (nextCompleted) {
        const restSec = ex.restSeconds || 120;
        setRestTimer({
          active: true,
          remaining: restSec,
          total: restSec,
          exerciseName: ex.exercise.name
        });
      }

      return updated;
    });
  };

  // Add a set to an exercise in the active workout
  const handleAddSetToExercise = (exIndex) => {
    setActiveSessionExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIndex] };
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet = {
        id: `${ex.exerciseId}-set-${ex.sets.length + 1}-${Date.now()}`,
        setNumber: ex.sets.length + 1,
        prevText: lastSet ? lastSet.prevText : 'Zusatzsatz',
        weight: lastSet ? lastSet.weight : '',
        reps: lastSet ? lastSet.reps : '',
        rpe: lastSet ? lastSet.rpe : '8.5',
        completed: false
      };
      ex.sets = [...ex.sets, newSet];
      updated[exIndex] = ex;
      return updated;
    });
  };

  // Remove last set from an exercise
  const handleRemoveSetFromExercise = (exIndex, setIndex) => {
    setActiveSessionExercises((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exIndex] };
      if (ex.sets.length <= 1) return prev;
      ex.sets = ex.sets
        .filter((_, idx) => idx !== setIndex)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      updated[exIndex] = ex;
      return updated;
    });
  };

  // Add exercise on the fly to current workout
  const handleAddExerciseOnTheFly = (exerciseObj) => {
    const prevForEx = (previousLogs[selectedProfileId] && previousLogs[selectedProfileId][exerciseObj.id]) || [];
    const newSessionEx = {
      exerciseId: exerciseObj.id,
      targetSets: 3,
      targetReps: '8-10',
      targetRpe: '8.5',
      tempo: exerciseObj.defaultTempo || '3-1-1-0',
      restSeconds: 120,
      coachNote: 'Spontan zum heutigen Training hinzugefügt.',
      exercise: exerciseObj,
      painLevel: 0,
      painArea: '',
      athleteExerciseNote: '',
      videoUrl: '',
      videoName: '',
      showVideoUrlInput: false,
      sets: [0, 1, 2].map((idx) => {
        const prevSet = prevForEx[idx] || null;
        return {
          id: `${exerciseObj.id}-fly-${idx}-${Date.now()}`,
          setNumber: idx + 1,
          prevText: prevSet ? `${prevSet.weight} kg × ${prevSet.reps} @ RPE ${prevSet.rpe}` : 'Kein Vorwert',
          weight: prevSet ? prevSet.weight : '',
          reps: prevSet ? prevSet.reps : '',
          rpe: '8',
          completed: false
        };
      })
    };

    setActiveSessionExercises((prev) => [...prev, newSessionEx]);
    setShowAddExerciseToWorkoutModal(false);
    triggerToast(`"${exerciseObj.name}" zum aktuellen Training hinzugefügt!`);
  };

  // Calculate live workout metrics
  const workoutStats = useMemo(() => {
    let totalSets = 0;
    let completedSets = 0;
    let totalVolume = 0;

    activeSessionExercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        totalSets += 1;
        if (s.completed) {
          completedSets += 1;
          const w = parseFloat(s.weight) || 0;
          const r = parseFloat(s.reps) || 0;
          totalVolume += w * r;
        }
      });
    });

    return {
      totalSets,
      completedSets,
      totalVolume: Math.round(totalVolume),
      progressPercent: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0
    };
  }, [activeSessionExercises]);

  // Complete & save workout session (including Pain Logs & Technique Videos!)
  const handleFinishWorkout = () => {
    const hasFeedbackOrVideo = activeSessionExercises.some(
      (ex) => ex.painLevel > 0 || ex.athleteExerciseNote.trim() !== '' || ex.videoUrl !== ''
    );
    if (workoutStats.completedSets === 0 && !hasFeedbackOrVideo) {
      triggerToast('Bitte hake mindestens einen Satz ab oder füge ein Video/Notiz hinzu.', 'warning');
      return;
    }

    const activePlan = currentProfilePlans.find((p) => p.id === selectedPlanId);
    const highlights = [];
    const exerciseDetails = [];
    const updatedPrevForProfile = { ...(previousLogs[selectedProfileId] || {}) };

    activeSessionExercises.forEach((ex) => {
      const doneSets = ex.sets.filter((s) => s.completed);
      const bestSet = doneSets[0] || ex.sets[0];

      if (doneSets.length > 0) {
        updatedPrevForProfile[ex.exerciseId] = doneSets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe
        }));
        highlights.push(`${ex.exercise.name}: ${bestSet.weight || 0} kg × ${bestSet.reps} @ RPE ${bestSet.rpe}`);
      }

      if (
        doneSets.length > 0 ||
        ex.painLevel > 0 ||
        ex.athleteExerciseNote.trim() !== '' ||
        ex.videoUrl !== ''
      ) {
        exerciseDetails.push({
          exerciseId: ex.exerciseId,
          name: ex.exercise.name,
          topSet: bestSet ? `${bestSet.weight || 0} kg × ${bestSet.reps || 0} @ RPE ${bestSet.rpe || 8}` : '-',
          painLevel: Number(ex.painLevel || 0),
          painArea: ex.painArea || '',
          athleteNote: ex.athleteExerciseNote || '',
          videoUrl: ex.videoUrl || '',
          videoName: ex.videoName || '',
          coachVideoFeedback: ''
        });
      }
    });

    setPreviousLogs((prev) => ({
      ...prev,
      [selectedProfileId]: updatedPrevForProfile
    }));

    const newHistoryEntry = {
      id: `hist-${Date.now()}`,
      profileId: selectedProfileId,
      date: 'Gerade eben (Heute)',
      workoutTitle: activePlan ? activePlan.title : 'Freies Training',
      durationMinutes: Math.max(25, Math.round((Date.now() - sessionStartTime) / 60000) + elapsedMinutes),
      totalVolumeKg: workoutStats.totalVolume,
      completedSets: workoutStats.completedSets,
      prCount: Math.min(3, Math.ceil(workoutStats.completedSets / 4)),
      energyLevel: Number(sessionEnergy) || 8,
      sleepHours: Number(sessionSleep) || 7.5,
      athleteNote: sessionNote || 'Starkes Training! Alle Vorgaben, Notizen & Videos gespeichert.',
      highlights: highlights.slice(0, 3),
      exerciseDetails
    };

    setWorkoutHistory((prev) => [newHistoryEntry, ...prev]);

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === selectedProfileId
          ? { ...p, completedThisWeek: Math.min(p.weeklyTarget, p.completedThisWeek + 1) }
          : p
      )
    );

    setRestTimer({ active: false, remaining: 0, total: 120, exerciseName: '' });
    triggerToast('Training inkl. Schmerz-Log & Technik-Videos im Wochen-Check-Up gespeichert! 🏆');
    setActiveTab('checkup');
  };

  // Create a new exercise in the database
  const handleCreateNewExercise = (e) => {
    e.preventDefault();
    if (!newExForm.name.trim()) return;

    const created = {
      id: `ex-custom-${Date.now()}`,
      name: newExForm.name.trim(),
      muscle: newExForm.muscle,
      secondaryMuscles: [],
      equipment: newExForm.equipment,
      category: newExForm.category,
      defaultTempo: newExForm.defaultTempo || '3-1-1-0',
      videoUrl: newExForm.videoUrl.trim(),
      cues: newExForm.cuesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      mistakes: newExForm.mistakesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    };

    if (created.cues.length === 0) {
      created.cues = ['Kontrollierte Ausführung über die volle Range of Motion', 'Rumpfspannung konstant halten'];
    }
    if (created.mistakes.length === 0) {
      created.mistakes = ['Schwung aus dem Körper holen'];
    }

    setExercises((prev) => [created, ...prev]);
    setShowNewExerciseModal(false);
    setNewExForm({
      name: '',
      muscle: 'Brust',
      equipment: 'Kurzhantel',
      category: 'Grundübung',
      defaultTempo: '3-1-1-0',
      videoUrl: '',
      cuesText: '',
      mistakesText: ''
    });
    triggerToast(`Übung "${created.name}" zur Datenbank hinzugefügt!`);
  };

  // Filtered exercises for Database View
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscle === 'Alle' || ex.muscle === selectedMuscle;
      const matchesEquipment = selectedEquipment === 'Alle' || ex.equipment === selectedEquipment;
      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [exercises, searchQuery, selectedMuscle, selectedEquipment]);

  // Save edited plan from Coach View
  const handleSaveCoachPlan = () => {
    if (!editingPlanModal) return;
    const { profileId, plan } = editingPlanModal;

    setPlans((prev) => {
      const existingList = prev[profileId] || [];
      const exists = existingList.some((p) => p.id === plan.id);
      const updatedList = exists
        ? existingList.map((p) => (p.id === plan.id ? plan : p))
        : [...existingList, plan];
      return {
        ...prev,
        [profileId]: updatedList
      };
    });

    if (profileId === selectedProfileId) {
      setSelectedPlanId(plan.id);
      setTimeout(() => initializeWorkoutSession(profileId, plan.id), 50);
    }

    setEditingPlanModal(null);
    triggerToast('Trainingsplan erfolgreich aktualisiert & für Kunden freigegeben!');
  };

  // Add new client in Coach Mode
  const handleCreateClient = (e) => {
    e.preventDefault();
    if (!newClientForm.name.trim()) return;
    const newId = `client-${Date.now()}`;
    const newProfile = {
      id: newId,
      name: newClientForm.name.trim(),
      shortName: newClientForm.name.trim(),
      role: 'client',
      goal: newClientForm.goal.trim() || 'Kraftaufbau & Athletik',
      avatar: '💪',
      weeklyTarget: Number(newClientForm.weeklyTarget) || 3,
      completedThisWeek: 0,
      status: 'Neu gestartet',
      notes: newClientForm.notes.trim() || 'Neuer Kunde – Trainingsplan eingerichtet.'
    };

    const starterPlan = {
      id: `plan-${Date.now()}`,
      title: 'Ganzkörper A – Fundament',
      subtitle: 'Grundübungen & Technik-Fokus',
      estimatedDuration: '55 Min.',
      defaultRestSeconds: 120,
      exercises: [
        {
          exerciseId: 'ex-squat',
          targetSets: 3,
          targetReps: '6-8',
          targetRpe: '7.5',
          tempo: '3-1-1-0',
          restSeconds: 150,
          coachNote: 'Fokus auf saubere Tiefe und Bracing.'
        },
        {
          exerciseId: 'ex-incline-db',
          targetSets: 3,
          targetReps: '8-10',
          targetRpe: '8',
          tempo: '3-1-1-0',
          restSeconds: 120,
          coachNote: 'Schulterblätter stabil auf der Bank lassen.'
        },
        {
          exerciseId: 'ex-chest-row',
          targetSets: 3,
          targetReps: '10-12',
          targetRpe: '8',
          tempo: '2-1-1-1',
          restSeconds: 90,
          coachNote: '1 Sekunde Pause in der Endkontraktion.'
        }
      ]
    };

    setProfiles((prev) => [...prev, newProfile]);
    setPlans((prev) => ({ ...prev, [newId]: [starterPlan] }));
    setBodyMeasurements((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `bm-init-1-${Date.now()}`,
          date: '2026-09-19',
          weight: 78.0,
          shoulders: 118.0,
          chest: 100.0,
          abdomen: 84.0,
          waist: 81.0,
          glutes: 96.0,
          upperArm: 35.0,
          forearm: 28.0,
          thigh: 56.0,
          calf: 37.0
        },
        {
          id: `bm-init-2-${Date.now()}`,
          date: '2026-10-19',
          weight: 77.5,
          shoulders: 118.5,
          chest: 100.5,
          abdomen: 83.2,
          waist: 80.2,
          glutes: 96.3,
          upperArm: 35.3,
          forearm: 28.2,
          thigh: 56.4,
          calf: 37.2
        }
      ]
    }));
    setShowNewClientModal(false);
    setNewClientForm({ name: '', goal: '', weeklyTarget: 3, notes: '' });
    triggerToast(`Kunde "${newProfile.name}" inkl. Start-Trainingsplan angelegt!`);
  };

  // Helper to evaluate improvement vs worsening for a metric delta
  const evaluateDeltaBadge = (metricMeta, delta) => {
    const rounded = Math.round(delta * 10) / 10;
    if (Math.abs(rounded) < 0.05) {
      return {
        text: `0.0 ${metricMeta.unit}`,
        statusText: 'Konstant',
        badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700'
      };
    }
    const sign = rounded > 0 ? '+' : '';
    const formatted = `${sign}${rounded.toFixed(1)} ${metricMeta.unit}`;

    if (metricMeta.goalType === 'down') {
      const isGood = rounded < 0;
      return {
        text: formatted,
        statusText: isGood ? 'Verbesserung (Reduktion)' : 'Zunahme (+Umfang)',
        badgeClass: isGood
          ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
      };
    }

    if (metricMeta.goalType === 'up') {
      const isGood = rounded > 0;
      return {
        text: formatted,
        statusText: isGood ? 'Verbesserung (Zuwachs)' : 'Rückgang (-Umfang)',
        badgeClass: isGood
          ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      };
    }

    return {
      text: formatted,
      statusText: rounded > 0 ? 'Gewichtszunahme' : 'Gewichtsreduktion',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
    };
  };

  // SVG Time-Series Chart Geometry Calculation
  const chartGeometry = useMemo(() => {
    const pts = activeMeasurements;
    if (!pts || pts.length === 0) return null;

    const values = pts.map((p) => Number(p[selectedBodyMetric]) || 0);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const spread = Math.max(1.5, maxVal - minVal);
    const yMin = Math.max(0, Math.floor((minVal - spread * 0.25) * 10) / 10);
    const yMax = Math.ceil((maxVal + spread * 0.25) * 10) / 10;

    const width = 760;
    const height = 260;
    const padLeft = 52;
    const padRight = 28;
    const padTop = 26;
    const padBottom = 42;

    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const coordinates = pts.map((entry, idx) => {
      const val = Number(entry[selectedBodyMetric]) || 0;
      const x =
        pts.length === 1
          ? padLeft + plotW / 2
          : padLeft + (idx / (pts.length - 1)) * plotW;
      const ratio = yMax === yMin ? 0.5 : (val - yMin) / (yMax - yMin);
      const y = padTop + plotH - ratio * plotH;
      const prevVal = idx > 0 ? Number(pts[idx - 1][selectedBodyMetric]) || 0 : val;
      const stepDelta = Math.round((val - prevVal) * 10) / 10;

      return {
        x,
        y,
        val,
        stepDelta,
        date: entry.date,
        labelDate: formatGermanDate(entry.date),
        entry
      };
    });

    const linePath = coordinates
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');

    const areaPath =
      coordinates.length > 1
        ? `${linePath} L ${coordinates[coordinates.length - 1].x.toFixed(1)} ${(
            padTop + plotH
          ).toFixed(1)} L ${coordinates[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
        : '';

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const val = yMin + t * (yMax - yMin);
      const y = padTop + plotH - t * plotH;
      return { val: val.toFixed(1), y };
    });

    const firstVal = values[0];
    const lastVal = values[values.length - 1];
    const totalDelta = Math.round((lastVal - firstVal) * 10) / 10;

    return {
      width,
      height,
      padLeft,
      padRight,
      padTop,
      padBottom,
      plotW,
      plotH,
      coordinates,
      linePath,
      areaPath,
      yTicks,
      firstVal,
      lastVal,
      totalDelta,
      minVal,
      maxVal
    };
  }, [activeMeasurements, selectedBodyMetric]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white">
      {/* ==========================================
          TOP CONTEXT & ROLE SWITCHER BAR
          ========================================== */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Brand Logo: BIZEPS BÄR */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-violet-500/30 border border-violet-400/30">
                🐻
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black tracking-tight text-lg sm:text-xl text-white">
                    BIZEPS BÄR
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                    Coaching & Performance
                  </span>
                </div>
                <p className="text-xs text-zinc-400 hidden sm:block">
                  Workout-Logger, Schmerz-/Video-Check-Up & Körperumfänge
                </p>
              </div>
            </div>

            {/* Mobile Mode Toggle Pill */}
            <div className="flex sm:hidden bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => {
                  setAppMode('athlete');
                  setActiveTab('workout');
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  appMode === 'athlete' ? 'bg-violet-600 text-white' : 'text-zinc-400'
                }`}
              >
                Training
              </button>
              <button
                onClick={() => {
                  setAppMode('coach');
                  setActiveTab('checkup');
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  appMode === 'coach' ? 'bg-violet-600 text-white' : 'text-zinc-400'
                }`}
              >
                Check-Up
              </button>
            </div>
          </div>

          {/* Right Controls: Cloud Sync Status, Backup Button, Profile Selector & Mode Switch */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Cloud Storage Status Pill & Backup Trigger */}
            <button
              type="button"
              onClick={() => {
                setConfirmResetStep(false);
                setShowBackupModal(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-violet-500/50 transition text-left"
              title="Cloud-Speicher & JSON-Backup öffnen"
            >
              {syncStatus === 'saving' || syncStatus === 'connecting' ? (
                <RefreshCw className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
              ) : syncStatus === 'synced' ? (
                <Cloud className="w-4 h-4 text-violet-400 shrink-0" />
              ) : (
                <CloudOff className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-300 flex items-center gap-1">
                  {syncStatus === 'saving'
                    ? 'Speichert...'
                    : syncStatus === 'connecting'
                    ? 'Cloud verbindet...'
                    : syncStatus === 'synced'
                    ? 'Cloud Sync aktiv'
                    : 'Daten & Backup'}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {lastSavedAt ? `Gespeichert ${lastSavedAt}` : 'Daten & Backup'}
                </span>
              </div>
            </button>

            {/* Active Person / Client Dropdown */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 flex-1 sm:flex-initial">
              <span className="text-base">{currentProfile.avatar}</span>
              <div className="flex flex-col flex-1">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                  Aktives Profil (Ich / Kunde)
                </span>
                <select
                  value={selectedProfileId}
                  onChange={(e) => handleSelectProfile(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-bold text-white focus:outline-none cursor-pointer pr-2"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                      {p.name} — {p.goal}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowNewClientModal(true)}
                title="Neuen Kunden anlegen"
                className="p-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Desktop Mode Switcher */}
            <div className="hidden sm:flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => {
                  setAppMode('athlete');
                  setActiveTab('workout');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  appMode === 'athlete'
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                Training
              </button>
              <button
                onClick={() => {
                  setAppMode('coach');
                  setActiveTab('checkup');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  appMode === 'coach'
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                Video-Check-Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================
          FLOATING TOAST NOTIFICATION
          ========================================== */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-zinc-900 border border-violet-500/60 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* ==========================================
          MAIN CONTENT LAYOUT (SIDEBAR + VIEWPORT)
          ========================================== */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Desktop Navigation Sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-zinc-800/80 p-4 justify-between">
          <div className="space-y-6">
            {/* Navigation Links */}
            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab('workout')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                  activeTab === 'workout'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Dumbbell className="w-4 h-4" />
                  Workout-Logger
                </span>
                {workoutStats.completedSets > 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
                      activeTab === 'workout'
                        ? 'bg-white/20 text-white'
                        : 'bg-violet-500/20 text-violet-300'
                    }`}
                  >
                    {workoutStats.completedSets}/{workoutStats.totalSets}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('checkup')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                  activeTab === 'checkup'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <HeartPulse className="w-4 h-4" />
                  Wochen-Check-Up
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'checkup'
                      ? 'bg-white/20 text-white'
                      : 'bg-violet-500/15 text-violet-300'
                  }`}
                >
                  🎥 Video & Physio
                </span>
              </button>

              <button
                onClick={() => setActiveTab('body')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                  activeTab === 'body'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Ruler className="w-4 h-4" />
                  Körper & Umfänge
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    activeTab === 'body'
                      ? 'bg-white/20 text-white'
                      : 'bg-violet-500/15 text-violet-300'
                  }`}
                >
                  Diagramm
                </span>
              </button>

              <button
                onClick={() => setActiveTab('exercises')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                  activeTab === 'exercises'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4" />
                  Übungsdatenbank
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === 'exercises' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {exercises.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('coach')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition ${
                  activeTab === 'coach'
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  Kunden & Pläne
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === 'coach' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {profiles.length}
                </span>
              </button>
            </nav>

            {/* Current Profile Summary Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                  Aktiver Fokus
                </span>
                <span className="text-xs text-zinc-400">
                  {currentProfile.completedThisWeek}/{currentProfile.weeklyTarget} Einh.
                </span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{currentProfile.name}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">{currentProfile.goal}</p>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-violet-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((currentProfile.completedThisWeek / currentProfile.weeklyTarget) * 100)
                    )}%`
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/70">
                <strong className="text-zinc-200 block mb-0.5">Coach-Notiz:</strong>
                {currentProfile.notes}
              </p>
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-2">
            <button
              onClick={openMeasurementModal}
              className="w-full py-2.5 px-3 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/40 text-xs font-bold text-violet-300 flex items-center justify-center gap-2 transition"
            >
              <Ruler className="w-4 h-4 text-violet-400" />
              + Körperumfang messen
            </button>
            <button
              onClick={() => setShowNewExerciseModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-zinc-200 flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4 text-violet-400" />
              Neue Übung anlegen
            </button>
            <button
              onClick={() => {
                setConfirmResetStep(false);
                setShowBackupModal(true);
              }}
              className="w-full py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-400 hover:text-violet-300 flex items-center justify-center gap-2 transition"
            >
              <Database className="w-3.5 h-3.5 text-violet-400" />
              Daten & Cloud-Backup
            </button>
          </div>
        </aside>

        {/* Main Active View Container */}
        <main className="flex-1 p-4 sm:p-6 pb-32 md:pb-24 overflow-y-auto">
          {/* ==========================================
              TAB 1: WORKOUT LOGGER (TRAINING + SCHMERZ + VIDEO-UPLOAD)
              ========================================== */}
          {activeTab === 'workout' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Top Plan Selector & Live Stats Header */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/30">
                        {currentProfile.shortName}
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />~60 Min.
                      </span>
                    </div>
                    <div className="pt-1">
                      <label className="block text-[11px] text-zinc-400 uppercase font-semibold mb-1">
                        Trainingseinheit auswählen:
                      </label>
                      <select
                        value={selectedPlanId}
                        onChange={(e) => handleSelectPlan(e.target.value)}
                        className="w-full sm:w-auto bg-zinc-950 border border-zinc-700 hover:border-violet-500/60 text-white font-extrabold text-base sm:text-lg rounded-xl px-3.5 py-2 focus:outline-none focus:border-violet-500 transition"
                      >
                        {currentProfilePlans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Live Session Metrics */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-zinc-950/90 p-3 rounded-xl border border-zinc-800/90 shrink-0">
                    <div className="text-center px-2">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Sätze</span>
                      <span className="text-base sm:text-lg font-black text-white">
                        {workoutStats.completedSets}
                        <span className="text-zinc-500 text-xs font-normal">/{workoutStats.totalSets}</span>
                      </span>
                    </div>
                    <div className="text-center px-2 border-x border-zinc-800">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Volumen</span>
                      <span className="text-base sm:text-lg font-black text-violet-400">
                        {workoutStats.totalVolume} <span className="text-[10px] font-normal">kg</span>
                      </span>
                    </div>
                    <div className="text-center px-2">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">Fortschritt</span>
                      <span className="text-base sm:text-lg font-black text-white">
                        {workoutStats.progressPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Daily Readiness (Tagesenergie, Schlaf & Notiz) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800/80">
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-400 font-semibold">⚡ Tagesenergie (1–10)</span>
                      <span className="font-black text-violet-400">{sessionEnergy}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={sessionEnergy}
                      onChange={(e) => setSessionEnergy(Number(e.target.value))}
                      className="w-full accent-violet-500 cursor-pointer"
                    />
                  </div>

                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 font-semibold block">💤 Schlaf (Std.)</span>
                      <span className="text-[11px] text-zinc-500">Letzte Nacht</span>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="14"
                      value={sessionSleep}
                      onChange={(e) => setSessionSleep(e.target.value)}
                      className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-center text-sm font-bold text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 flex flex-col justify-center">
                    <span className="text-[11px] text-violet-300 font-bold">
                      🎥 Neu: Technik-Video & Schmerz-Log
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Direkt unter jeder Übung für dein Wochen-Check-Up anhängen!
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/80">
                  <div
                    className="bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-400 h-full transition-all duration-300"
                    style={{ width: `${workoutStats.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Exercise Cards List */}
              <div className="space-y-5">
                {activeSessionExercises.map((exItem, exIndex) => (
                  <div
                    key={`${exItem.exerciseId}-${exIndex}`}
                    className="bg-zinc-900 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-lg"
                  >
                    {/* Exercise Header */}
                    <div className="p-4 sm:p-5 bg-zinc-900/90 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-300 font-black text-xs flex items-center justify-center">
                            {String.fromCharCode(65 + exIndex)}
                          </span>
                          <button
                            onClick={() => setSelectedExerciseDetail(exItem.exercise)}
                            className="font-extrabold text-base sm:text-lg text-white hover:text-violet-400 transition text-left flex items-center gap-1.5"
                          >
                            {exItem.exercise.name}
                            <Info className="w-4 h-4 text-zinc-400 hover:text-violet-400 shrink-0" />
                          </button>
                          {exItem.videoUrl && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-violet-600 text-white flex items-center gap-1">
                              <Video className="w-3 h-3" /> Video angehängt
                            </span>
                          )}
                          {exItem.painLevel > 0 && (
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                exItem.painLevel >= 4
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              <AlertTriangle className="w-3 h-3" /> Schmerz {exItem.painLevel}/10
                            </span>
                          )}
                        </div>

                        {/* Prescription Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200">
                            Ziel: {exItem.targetSets} × {exItem.targetReps} Wdh.
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/30">
                            RPE {exItem.targetRpe}
                          </span>
                          <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-zinc-950 text-zinc-300 border border-zinc-800">
                            Tempo: {exItem.tempo}
                          </span>
                          <button
                            onClick={() =>
                              setRestTimer({
                                active: true,
                                remaining: exItem.restSeconds || 120,
                                total: exItem.restSeconds || 120,
                                exerciseName: exItem.exercise.name
                              })
                            }
                            className="text-xs px-2.5 py-0.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1 transition"
                          >
                            <Timer className="w-3 h-3 text-violet-400" />
                            {exItem.restSeconds || 120}s Pause
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedExerciseDetail(exItem.exercise)}
                        className="self-start sm:self-center text-xs font-semibold text-violet-300 hover:text-violet-200 bg-violet-500/15 hover:bg-violet-500/25 px-3 py-1.5 rounded-lg border border-violet-500/30 transition flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Cues & Technik
                      </button>
                    </div>

                    {/* Coach Cue Banner */}
                    {exItem.coachNote && (
                      <div className="px-4 sm:px-5 py-2.5 bg-violet-950/30 border-b border-zinc-800/70 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-zinc-200 leading-relaxed">
                          <strong className="text-violet-300 font-bold">Coach-Vorgabe: </strong>
                          {exItem.coachNote}
                        </p>
                      </div>
                    )}

                    {/* Set Table Header & Rows */}
                    <div className="p-3 sm:p-4 space-y-2.5">
                      <div className="grid grid-cols-12 gap-2 px-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        <div className="col-span-1 text-center">Satz</div>
                        <div className="col-span-4 sm:col-span-4">Letztes Mal</div>
                        <div className="col-span-2 text-center">kg</div>
                        <div className="col-span-2 text-center">Wdh.</div>
                        <div className="col-span-1 text-center">RPE</div>
                        <div className="col-span-2 text-right pr-1">Check</div>
                      </div>

                      {exItem.sets.map((setRow, setIndex) => (
                        <div
                          key={setRow.id}
                          className={`grid grid-cols-12 gap-1.5 sm:gap-2 items-center p-2 rounded-xl border transition ${
                            setRow.completed
                              ? 'bg-violet-500/15 border-violet-500/50'
                              : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
                          }`}
                        >
                          <div className="col-span-1 flex justify-center">
                            <span
                              className={`w-6 h-6 rounded-md text-xs font-extrabold flex items-center justify-center ${
                                setRow.completed
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              {setRow.setNumber}
                            </span>
                          </div>

                          <div className="col-span-4 sm:col-span-4">
                            <button
                              type="button"
                              title="Klicken um Werte zu übernehmen"
                              onClick={() => {
                                const match = setRow.prevText.match(/([\d.]+)\s*kg\s*×\s*(\d+)/);
                                if (match) {
                                  handleUpdateSet(exIndex, setIndex, 'weight', match[1]);
                                  handleUpdateSet(exIndex, setIndex, 'reps', match[2]);
                                }
                              }}
                              className="text-left text-[11px] sm:text-xs text-zinc-400 hover:text-zinc-200 font-medium truncate block w-full"
                            >
                              {setRow.prevText}
                            </button>
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              step="0.5"
                              placeholder="kg"
                              value={setRow.weight}
                              onChange={(e) =>
                                handleUpdateSet(exIndex, setIndex, 'weight', e.target.value)
                              }
                              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-violet-500 rounded-lg py-1.5 px-1 text-center text-sm font-bold text-white focus:outline-none"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              placeholder="Wdh"
                              value={setRow.reps}
                              onChange={(e) =>
                                handleUpdateSet(exIndex, setIndex, 'reps', e.target.value)
                              }
                              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-violet-500 rounded-lg py-1.5 px-1 text-center text-sm font-bold text-white focus:outline-none"
                            />
                          </div>

                          <div className="col-span-1">
                            <input
                              type="text"
                              placeholder="8"
                              value={setRow.rpe}
                              onChange={(e) =>
                                handleUpdateSet(exIndex, setIndex, 'rpe', e.target.value)
                              }
                              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-violet-500 rounded-lg py-1.5 px-0.5 text-center text-xs font-bold text-violet-300 focus:outline-none"
                            />
                          </div>

                          <div className="col-span-2 flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleSetComplete(exIndex, setIndex)}
                              className={`h-8 px-2.5 sm:px-3 rounded-lg font-bold text-xs flex items-center justify-center transition shadow-sm ${
                                setRow.completed
                                  ? 'bg-violet-600 text-white shadow-violet-500/25'
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                            {exItem.sets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSetFromExercise(exIndex, setIndex)}
                                className="p-1.5 text-zinc-500 hover:text-red-400 transition hidden sm:inline-flex"
                                title="Satz entfernen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add Set Row Button & Live e1RM */}
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddSetToExercise(exIndex)}
                          className="text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                        >
                          <Plus className="w-3.5 h-3.5 text-violet-400" />
                          + Satz hinzufügen
                        </button>

                        {exItem.sets.some((s) => s.completed && parseFloat(s.weight) > 0) && (
                          <span className="text-[11px] text-zinc-400 font-medium">
                            Est. 1RM heute:{' '}
                            <strong className="text-violet-400">
                              {Math.max(
                                ...exItem.sets
                                  .filter((s) => s.completed)
                                  .map((s) => calculateE1RM(s.weight, s.reps))
                              )}{' '}
                              kg
                            </strong>
                          </span>
                        )}
                      </div>

                      {/* ========================================================
                          LIVE SCHMERZ-SKALA, NOTIZEN & TECHNIK-VIDEO (FORM-CHECK)
                          ======================================================== */}
                      <div className="mt-4 pt-4 border-t border-zinc-800/90 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          {/* Pain Slider 0-10 */}
                          <div className="md:col-span-3 bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-2.5">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-zinc-400 font-semibold">Schmerz (0–10):</span>
                              <span
                                className={`font-black ${
                                  exItem.painLevel >= 4
                                    ? 'text-rose-400'
                                    : exItem.painLevel > 0
                                    ? 'text-amber-400'
                                    : 'text-violet-400'
                                }`}
                              >
                                {exItem.painLevel}/10
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={exItem.painLevel || 0}
                              onChange={(e) =>
                                handleUpdateExerciseFeedback(exIndex, 'painLevel', Number(e.target.value))
                              }
                              className="w-full accent-violet-500 cursor-pointer"
                            />
                          </div>

                          {/* Pain Area / Joint */}
                          <div className="md:col-span-4">
                            <label className="text-[11px] text-zinc-400 font-semibold block mb-1">
                              Betroffene Stelle / Gelenk (optional)
                            </label>
                            <input
                              type="text"
                              placeholder="z.B. Vordere Schulter, Patellasehne, LWS..."
                              value={exItem.painArea || ''}
                              onChange={(e) =>
                                handleUpdateExerciseFeedback(exIndex, 'painArea', e.target.value)
                              }
                              className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            />
                          </div>

                          {/* Exercise Note for Check-Up */}
                          <div className="md:col-span-5">
                            <label className="text-[11px] text-zinc-400 font-semibold block mb-1">
                              Übungs-Notiz für Wochen-Check-Up
                            </label>
                            <input
                              type="text"
                              placeholder="z.B. Griff enger gewählt, Satz 3 auf Video aufgenommen..."
                              value={exItem.athleteExerciseNote || ''}
                              onChange={(e) =>
                                handleUpdateExerciseFeedback(exIndex, 'athleteExerciseNote', e.target.value)
                              }
                              className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* 🎥 Technik-Video Upload & Link Bar */}
                        <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-3 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-violet-400 shrink-0" />
                              <span className="text-xs font-bold text-white">
                                🎥 Technik-Video anhängen (Form-Check für Coach)
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* 1. Direct Smartphone/PC Video File Upload */}
                              <label className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold cursor-pointer flex items-center gap-1.5 transition shadow-sm shadow-violet-600/20">
                                <Upload className="w-3.5 h-3.5" />
                                Video vom Gerät wählen
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => handleVideoFileUpload(exIndex, e)}
                                  className="hidden"
                                />
                              </label>

                              {/* 2. Paste Video URL Toggle */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateExerciseFeedback(
                                    exIndex,
                                    'showVideoUrlInput',
                                    !exItem.showVideoUrlInput
                                  )
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1 transition"
                              >
                                <Link className="w-3.5 h-3.5 text-violet-400" />
                                Video-Link
                              </button>

                              {/* 3. Quick Demo Video Load for instant testing */}
                              {!exItem.videoUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateExerciseFeedback(
                                      exIndex,
                                      'videoUrl',
                                      SAMPLE_FORMCHECK_VIDEO_URL
                                    );
                                    handleUpdateExerciseFeedback(
                                      exIndex,
                                      'videoName',
                                      `${exItem.exercise.name.split(' ')[0]}_TechnikCheck.mp4`
                                    );
                                    triggerToast('Demo-Technikvideo geladen! 🎥');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-xs font-bold transition"
                                >
                                  Demo-Technikvideo laden
                                </button>
                              )}

                              {exItem.videoUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateExerciseFeedback(exIndex, 'videoUrl', '');
                                    handleUpdateExerciseFeedback(exIndex, 'videoName', '');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold transition"
                                >
                                  Video entfernen
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Optional External Video Link Input */}
                          {exItem.showVideoUrlInput && (
                            <div className="flex gap-2">
                              <input
                                type="url"
                                placeholder="Link zu Video einfügen (YouTube, Google Drive, iCloud, Loom, MP4)..."
                                value={exItem.videoUrl || ''}
                                onChange={(e) => {
                                  handleUpdateExerciseFeedback(exIndex, 'videoUrl', e.target.value);
                                  handleUpdateExerciseFeedback(exIndex, 'videoName', 'Externer Video-Link');
                                }}
                                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                              />
                            </div>
                          )}

                          {/* Instant Inline Video Preview with Slow-Motion Controls */}
                          {exItem.videoUrl && (
                            <FormCheckVideoPlayer
                              videoUrl={exItem.videoUrl}
                              videoName={exItem.videoName}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Exercise on the Fly & Workout Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-violet-400" />
                      Übung spontan ergänzen
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Wähle eine beliebige Übung aus deiner Übungsdatenbank für das heutige Training aus.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddExerciseToWorkoutModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition"
                  >
                    <BookOpen className="w-4 h-4 text-violet-400" />
                    Übung aus Datenbank wählen
                  </button>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                    Allgemeines Tages-Feedback für das Wochen-Check-Up
                  </label>
                  <textarea
                    rows={2}
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    placeholder="z.B. Guter Fokus heute, Kniebeuge Video im 2. Satz hochgeladen..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Finish Workout Call to Action */}
              <div className="bg-gradient-to-r from-violet-600/25 via-purple-600/15 to-zinc-900 border border-violet-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-white text-base">
                    Training inkl. Schmerz-Log & Technik-Videos abschließen?
                  </h4>
                  <p className="text-xs text-zinc-300">
                    Deine Werte, Notizen und Form-Check-Videos landen sofort im Tab „Wochen-Check-Up“.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFinishWorkout}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition shrink-0"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Training abschließen & ins Check-Up speichern
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: WOCHEN-CHECK-UP, SCHMERZ-ANALYSE & VIDEO-FORM-CHECK
              ========================================== */}
          {activeTab === 'checkup' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Top Check-Up Header */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                        Wochen-Check-Up & Form-Check Analyse
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/30">
                        {currentProfile.name}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      Technik-Videos, Schmerz-Marker & Wochen-Feedback
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                      Prüfe die hochgeladenen Ausführungs-Videos in Zeitlupe (0.25x / 0.5x) und werte Schmerzen für die nächste Trainingswoche aus.
                    </p>
                  </div>

                  {/* Filter Pills: Alle | Nur Technik-Videos | Nur Schmerz-Meldungen */}
                  <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start">
                    <button
                      onClick={() => setCheckupFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        checkupFilter === 'all'
                          ? 'bg-violet-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Alle Logs
                    </button>
                    <button
                      onClick={() => setCheckupFilter('video')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        checkupFilter === 'video'
                          ? 'bg-violet-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      Videos
                    </button>
                    <button
                      onClick={() => setCheckupFilter('pain')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        checkupFilter === 'pain'
                          ? 'bg-violet-600 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Schmerzen
                    </button>
                  </div>
                </div>

                {/* Coach Weekly Check-Up Summary Box */}
                <div className="bg-zinc-950/90 border border-violet-500/40 rounded-xl p-4 space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    Coach-Fazit & Plan-Anpassungen für die kommende Woche ({currentProfile.shortName}):
                  </label>
                  <textarea
                    rows={2}
                    value={checkupSummaries[selectedProfileId] || ''}
                    onChange={(e) =>
                      setCheckupSummaries((prev) => ({
                        ...prev,
                        [selectedProfileId]: e.target.value
                      }))
                    }
                    placeholder="Halte hier deine wichtigsten Erkenntnisse aus den Technik-Videos und Schmerz-Protokollen für das Wochen-Check-Up fest..."
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-violet-500 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Key Lift e1RM Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['ex-squat', 'ex-rdl', 'ex-incline-db'].map((exId) => {
                  const exObj = exercises.find((e) => e.id === exId);
                  const logs = (previousLogs[selectedProfileId] && previousLogs[selectedProfileId][exId]) || [];
                  const bestSet = logs[0];
                  const e1rm = bestSet ? calculateE1RM(bestSet.weight, bestSet.reps) : null;

                  return (
                    <div
                      key={exId}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-1.5"
                    >
                      <span className="text-[11px] font-bold uppercase text-zinc-400 block truncate">
                        {exObj ? exObj.name : exId}
                      </span>
                      {bestSet ? (
                        <>
                          <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-black text-violet-400">{e1rm} kg</span>
                            <span className="text-xs text-zinc-400">Est. 1RM</span>
                          </div>
                          <p className="text-xs text-zinc-300">
                            Top-Satz: <strong>{bestSet.weight} kg × {bestSet.reps}</strong> @ RPE {bestSet.rpe}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-zinc-500 pt-2">Noch kein Satz geloggt</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Logged Workout Sessions with Pain Highlights & Video Analysis Player */}
              <div className="space-y-5">
                {workoutHistory
                  .filter((h) => h.profileId === selectedProfileId)
                  .map((session) => {
                    const details = (session.exerciseDetails || []).filter((d) => {
                      if (checkupFilter === 'video') return Boolean(d.videoUrl);
                      if (checkupFilter === 'pain') return Number(d.painLevel) > 0;
                      return true;
                    });

                    return (
                      <div
                        key={session.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg"
                      >
                        {/* Session Top Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3.5">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                📅 {session.date}
                              </span>
                              <span className="text-xs text-zinc-300 bg-zinc-950 px-2.5 py-0.5 rounded-md border border-zinc-800">
                                ⚡ Energie: <strong>{session.energyLevel ?? 8}/10</strong>
                              </span>
                              <span className="text-xs text-zinc-300 bg-zinc-950 px-2.5 py-0.5 rounded-md border border-zinc-800">
                                💤 Schlaf: <strong>{session.sleepHours ?? 7.5}h</strong>
                              </span>
                            </div>
                            <h3 className="font-extrabold text-base sm:text-lg text-white mt-1.5">
                              {session.workoutTitle}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
                              <span className="text-zinc-400">Volumen: </span>
                              <strong className="text-violet-400">{session.totalVolumeKg} kg</strong>
                            </div>
                            <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs">
                              <span className="text-zinc-400">Sätze: </span>
                              <strong className="text-white">{session.completedSets}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Overall Session Note */}
                        {session.athleteNote && (
                          <div className="text-xs text-zinc-200 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                            <strong className="text-violet-400">Allgemeine Trainings-Notiz: </strong>
                            {session.athleteNote}
                          </div>
                        )}

                        {/* Detailed Exercise Check-Up Cards (Pain + Video Player + Coach Feedback) */}
                        {details.length > 0 ? (
                          <div className="space-y-4">
                            {details.map((exDetail, idx) => {
                              const pain = Number(exDetail.painLevel || 0);
                              return (
                                <div
                                  key={idx}
                                  className={`rounded-2xl p-4 border space-y-3 ${
                                    pain >= 4
                                      ? 'bg-rose-950/20 border-rose-500/50'
                                      : pain > 0
                                      ? 'bg-amber-950/15 border-amber-500/40'
                                      : 'bg-zinc-950/80 border-zinc-800'
                                  }`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-extrabold text-sm sm:text-base text-white">
                                          {exDetail.name}
                                        </h4>
                                        <span className="text-xs font-bold text-violet-300 bg-violet-500/15 px-2.5 py-0.5 rounded-md border border-violet-500/30">
                                          Top-Satz: {exDetail.topSet}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {exDetail.videoUrl && (
                                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-violet-600 text-white flex items-center gap-1 shadow-sm shadow-violet-600/30">
                                          <Video className="w-3.5 h-3.5" />
                                          🎥 Technik-Video vorhanden
                                        </span>
                                      )}

                                      {pain > 0 ? (
                                        <span
                                          className={`text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                            pain >= 4
                                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                          }`}
                                        >
                                          <AlertTriangle className="w-3.5 h-3.5" />
                                          Schmerz: {pain}/10
                                        </span>
                                      ) : (
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                          ✓ Schmerzfrei (0/10)
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Pain Region & Athlete Note */}
                                  {(exDetail.painArea || exDetail.athleteNote) && (
                                    <div className="text-xs space-y-1 bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
                                      {exDetail.painArea && (
                                        <p className="text-rose-300">
                                          <strong>Betroffene Struktur / Gelenk:</strong> {exDetail.painArea}
                                        </p>
                                      )}
                                      {exDetail.athleteNote && (
                                        <p className="text-zinc-200">
                                          <strong>Athleten-Notiz zur Ausführung:</strong> {exDetail.athleteNote}
                                        </p>
                                      )}
                                    </div>
                                  )}

                                  {/* Interactive Video Analysis Player + Coach Video Feedback */}
                                  {exDetail.videoUrl && (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1 items-start">
                                      <div className="lg:col-span-7">
                                        <FormCheckVideoPlayer
                                          videoUrl={exDetail.videoUrl}
                                          videoName={exDetail.videoName}
                                        />
                                      </div>

                                      <div className="lg:col-span-5 bg-zinc-900 border border-violet-500/30 rounded-xl p-3.5 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-extrabold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                                            <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                                            Coach Technik-Feedback zum Video
                                          </span>
                                        </div>
                                        <textarea
                                          rows={3}
                                          defaultValue={exDetail.coachVideoFeedback || ''}
                                          onBlur={(e) =>
                                            handleSaveCoachVideoFeedback(
                                              session.id,
                                              idx,
                                              e.target.value
                                            )
                                          }
                                          placeholder="Schreibe hier deine Technik-Analyse zum Video (z.B. Tiefe, Knieachse, Bar-Path, Tempo-Korrektur)..."
                                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                                        />
                                        <p className="text-[11px] text-zinc-400">
                                          💡 Tipp: Nutze links die <strong>0.25x / 0.5x Zeitlupe</strong> für den Umkehrpunkt. Dein Feedback wird beim Verlassen des Feldes automatisch gespeichert.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 italic">
                            Keine Einträge für den gewählten Filter in dieser Einheit.
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3: KÖRPER & UMFÄNGE (GEWICHT + 9 UMFÄNGE + ZEITDIAGRAMM)
              ========================================== */}
          {activeTab === 'body' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Top Header & Action Bar */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                      Body Tracking & Anthropometrie
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/30">
                      {currentProfile.shortName}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Körpergewicht & Umfänge im Zeitverlauf
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                    Verfolge Gewicht, Schultern, Brust, Bauch, Taille, Po, Oberarm, Unterarm, Oberschenkel & Unterschenkel im Monats- und Jahres-Tab.
                  </p>
                </div>

                <button
                  onClick={openMeasurementModal}
                  className="px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  + Neue Messung eintragen
                </button>
              </div>

              {/* Timeframe Switcher (Monats-Tab vs. Jahres-Tab) + Metric Selector */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block">
                      Zeitraum für Analyse & Diagramm
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                      {bodyTimeframe === 'month'
                        ? 'Monats-Tab (Aktueller Monat / Letzte 30 Tage)'
                        : 'Jahres-Tab (12-Monats-Langzeitverlauf)'}
                    </h3>
                  </div>

                  {/* Monats-Tab / Jahres-Tab Toggle */}
                  <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start sm:self-center">
                    <button
                      onClick={() => setBodyTimeframe('month')}
                      className={`px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                        bodyTimeframe === 'month'
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Monats-Tab
                    </button>
                    <button
                      onClick={() => setBodyTimeframe('year')}
                      className={`px-4 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                        bodyTimeframe === 'year'
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Jahres-Tab
                    </button>
                  </div>
                </div>

                {/* Metric Pills Selector (Gewicht + 9 Umfänge) */}
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block mb-2">
                    Messwert für das Zeitdiagramm auswählen:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {BODY_METRICS.map((m) => {
                      const isSelected = selectedBodyMetric === m.key;
                      return (
                        <button
                          key={m.key}
                          onClick={() => setSelectedBodyMetric(m.key)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                              : 'bg-zinc-950 text-zinc-300 hover:text-white border border-zinc-800 hover:border-violet-500/40'
                          }`}
                        >
                          {m.key === 'weight' ? (
                            <Scale className="w-3.5 h-3.5" />
                          ) : (
                            <Ruler className="w-3.5 h-3.5" />
                          )}
                          {m.label}
                          <span className="text-[10px] opacity-75">({m.unit})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive SVG Time-Series Chart */}
                {chartGeometry && (
                  <div className="space-y-4 pt-2">
                    {(() => {
                      const evalBadge = evaluateDeltaBadge(activeMetricMeta, chartGeometry.totalDelta);
                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 border border-zinc-800/90 rounded-xl p-3.5">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                              Ausgewählter Wert
                            </span>
                            <span className="text-base sm:text-lg font-black text-white">
                              {activeMetricMeta.label}
                            </span>
                            <span className="text-[11px] text-zinc-500 block truncate">
                              {activeMetricMeta.desc}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                              Startwert ({bodyTimeframe === 'month' ? 'Monat' : 'Jahr'})
                            </span>
                            <span className="text-base sm:text-lg font-extrabold text-zinc-300">
                              {chartGeometry.firstVal.toFixed(1)} {activeMetricMeta.unit}
                            </span>
                            <span className="text-[11px] text-zinc-500 block">
                              am {chartGeometry.coordinates[0]?.labelDate}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                              Aktueller Wert
                            </span>
                            <span className="text-base sm:text-lg font-black text-violet-400">
                              {chartGeometry.lastVal.toFixed(1)} {activeMetricMeta.unit}
                            </span>
                            <span className="text-[11px] text-zinc-500 block">
                              am {chartGeometry.coordinates[chartGeometry.coordinates.length - 1]?.labelDate}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                              Entwicklung ({bodyTimeframe === 'month' ? 'Monat' : 'Jahr'})
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className={`text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-lg border ${evalBadge.badgeClass}`}
                              >
                                {evalBadge.text}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-400 block mt-0.5">
                              {evalBadge.statusText}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-3 sm:p-4 overflow-hidden">
                      <svg
                        viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                        className="w-full h-60 sm:h-64 overflow-visible"
                      >
                        <defs>
                          <linearGradient id="violetAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.42" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {chartGeometry.yTicks.map((t, idx) => (
                          <g key={idx}>
                            <line
                              x1={chartGeometry.padLeft}
                              y1={t.y}
                              x2={chartGeometry.width - chartGeometry.padRight}
                              y2={t.y}
                              stroke="#27272a"
                              strokeDasharray="4 4"
                              strokeWidth="1"
                            />
                            <text
                              x={chartGeometry.padLeft - 8}
                              y={t.y + 4}
                              textAnchor="end"
                              className="fill-zinc-500 text-[11px] font-mono"
                            >
                              {t.val}
                            </text>
                          </g>
                        ))}

                        {chartGeometry.areaPath && (
                          <path d={chartGeometry.areaPath} fill="url(#violetAreaGrad)" />
                        )}

                        <path
                          d={chartGeometry.linePath}
                          fill="none"
                          stroke="#8b5cf6"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {chartGeometry.coordinates.map((pt, i) => {
                          const isHovered = hoveredChartPoint === i;
                          return (
                            <g
                              key={i}
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredChartPoint(i)}
                              onMouseLeave={() => setHoveredChartPoint(null)}
                              onClick={() => setHoveredChartPoint(i)}
                            >
                              <text
                                x={pt.x}
                                y={chartGeometry.height - 10}
                                textAnchor="middle"
                                className="fill-zinc-400 text-[11px] font-semibold"
                              >
                                {pt.labelDate}
                              </text>

                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered ? 9 : 6}
                                className="fill-violet-500/30 transition-all"
                              />

                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered ? 5.5 : 4}
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="fill-violet-500 transition-all"
                              />

                              <rect
                                x={pt.x - 26}
                                y={pt.y - 28}
                                width="52"
                                height="18"
                                rx="5"
                                className={
                                  isHovered
                                    ? 'fill-violet-600 stroke-violet-300'
                                    : 'fill-zinc-900/95 stroke-zinc-700'
                                }
                                strokeWidth="1"
                              />
                              <text
                                x={pt.x}
                                y={pt.y - 16}
                                textAnchor="middle"
                                className="fill-white text-[10px] font-bold"
                              >
                                {pt.val.toFixed(1)} {activeMetricMeta.unit}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* All 10 Body Metrics Overview Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Alle Körperwerte & Umfänge im Überblick ({bodyTimeframe === 'month' ? 'Monatsvergleich' : 'Jahresvergleich'})
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Klicke auf eine Karte, um sie oben im Diagramm anzuzeigen
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {BODY_METRICS.map((m) => {
                    const pts = activeMeasurements;
                    const firstVal = pts.length > 0 ? Number(pts[0][m.key]) || 0 : 0;
                    const lastVal = pts.length > 0 ? Number(pts[pts.length - 1][m.key]) || 0 : 0;
                    const delta = Math.round((lastVal - firstVal) * 10) / 10;
                    const badge = evaluateDeltaBadge(m, delta);
                    const isSelected = selectedBodyMetric === m.key;

                    return (
                      <div
                        key={m.key}
                        onClick={() => setSelectedBodyMetric(m.key)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-violet-950/30 border-violet-500 shadow-lg shadow-violet-500/10'
                            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-zinc-300 truncate">{m.label}</span>
                          {delta > 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          ) : delta < 0 ? (
                            <ArrowDownRight className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                          ) : (
                            <Minus className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-white">{lastVal.toFixed(1)}</span>
                            <span className="text-xs text-zinc-400 font-semibold">{m.unit}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block">
                            Start: {firstVal.toFixed(1)} {m.unit}
                          </span>
                        </div>

                        <div className="pt-1">
                          <span
                            className={`inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-md border ${badge.badgeClass}`}
                          >
                            {badge.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complete Measurement History Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      Messprotokoll ({currentProfile.name})
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Alle gespeicherten Messungen für Gewicht und die 9 Körperumfänge
                    </p>
                  </div>
                  <button
                    onClick={openMeasurementModal}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition"
                  >
                    + Messung hinzufügen
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950/80 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                        <th className="py-3 px-3">Datum</th>
                        {BODY_METRICS.map((m) => (
                          <th key={m.key} className="py-3 px-2.5 text-center whitespace-nowrap">
                            {m.label} <span className="text-[10px] text-zinc-500">({m.unit})</span>
                          </th>
                        ))}
                        <th className="py-3 px-3 text-right">Aktion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/70 text-xs">
                      {[...(bodyMeasurements[selectedProfileId] || [])]
                        .reverse()
                        .map((entry) => (
                          <tr key={entry.id} className="hover:bg-zinc-950/50 transition">
                            <td className="py-3 px-3 font-bold text-violet-300 whitespace-nowrap">
                              {formatGermanDate(entry.date)}
                            </td>
                            {BODY_METRICS.map((m) => (
                              <td
                                key={m.key}
                                className={`py-3 px-2.5 text-center font-semibold ${
                                  selectedBodyMetric === m.key ? 'text-white bg-violet-500/10' : 'text-zinc-300'
                                }`}
                              >
                                {Number(entry[m.key] || 0).toFixed(1)}
                              </td>
                            ))}
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleDeleteMeasurement(entry.id)}
                                className="p-1 text-zinc-500 hover:text-red-400 transition"
                                title="Messung löschen"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 4: EXERCISE DATABASE (ÜBUNGSDATENBANK)
              ========================================== */}
          {activeTab === 'exercises' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    BIZEPS BÄR Library
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    Übungsdatenbank & Coaching-Cues
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Alle Übungen mit Technik-Merkmalen, Standard-Tempo und persönlicher Kraft-Historie.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewExerciseModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Neue Übung anlegen
                </button>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Übung suchen (z.B. Kniebeuge, RDL, Face Pulls, Schulter)..."
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-semibold">Equipment:</span>
                    <select
                      value={selectedEquipment}
                      onChange={(e) => setSelectedEquipment(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-white text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
                    >
                      {EQUIPMENT_TYPES.map((eq) => (
                        <option key={eq} value={eq}>
                          {eq}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {MUSCLE_GROUPS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMuscle(m)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        selectedMuscle === m
                          ? 'bg-violet-600 text-white'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((ex) => {
                  const userLogs =
                    (previousLogs[selectedProfileId] && previousLogs[selectedProfileId][ex.id]) || [];
                  const topLog = userLogs[0];

                  return (
                    <div
                      key={ex.id}
                      onClick={() => setSelectedExerciseDetail(ex)}
                      className="group bg-zinc-900 hover:bg-zinc-900/80 border border-zinc-800 hover:border-violet-500/50 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-violet-500/15 text-violet-300 border border-violet-500/30">
                            {ex.muscle}
                          </span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                            {ex.equipment}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-base text-white group-hover:text-violet-400 transition">
                            {ex.name}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {ex.category} • Standard-Tempo: <span className="font-mono">{ex.defaultTempo}</span>
                          </p>
                        </div>

                        <ul className="space-y-1 pt-1">
                          {ex.cues.slice(0, 2).map((cue, idx) => (
                            <li key={idx} className="text-xs text-zinc-300 flex items-start gap-1.5 line-clamp-1">
                              <span className="text-violet-400 font-bold">•</span>
                              <span className="truncate">{cue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                        {topLog ? (
                          <div className="text-xs">
                            <span className="text-zinc-500 block text-[10px]">
                              Letzter Top-Satz ({currentProfile.shortName}):
                            </span>
                            <span className="font-bold text-violet-400">
                              {topLog.weight} kg × {topLog.reps} @ RPE {topLog.rpe}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">Noch keine Logs für {currentProfile.shortName}</span>
                        )}

                        <span className="text-xs font-bold text-zinc-300 group-hover:text-violet-400 flex items-center gap-1">
                          Details <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 5: COACH VIEW (KUNDEN & PLÄNE)
              ========================================== */}
          {activeTab === 'coach' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    Bizeps Bär 1:1 Coaching & Planung
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    Meine Athleten & Trainingspläne
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Verwalte dein eigenes Training und die Pläne deiner Kunden inklusive Tempo-, RPE- und Technik-Vorgaben.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewClientModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  + Neuen Kunden anlegen
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {profiles.map((prof) => {
                  const profPlans = plans[prof.id] || [];
                  const isSelected = prof.id === selectedProfileId;

                  return (
                    <div
                      key={prof.id}
                      className={`bg-zinc-900 rounded-2xl p-5 border transition space-y-4 ${
                        isSelected ? 'border-violet-500/60 shadow-lg shadow-violet-500/5' : 'border-zinc-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl">
                            {prof.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-base text-white">{prof.name}</h3>
                              {prof.role === 'coach' && (
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
                                  Coach
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400">{prof.goal}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              handleSelectProfile(prof.id);
                              setActiveTab('checkup');
                            }}
                            className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-violet-600 hover:text-white text-zinc-300 transition flex items-center gap-1"
                            title="Wochen-Check-Up & Videos ansehen"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Check-Up
                          </button>
                          <button
                            onClick={() => {
                              handleSelectProfile(prof.id);
                              setActiveTab('workout');
                            }}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-violet-600 hover:text-white text-zinc-200 transition flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Training
                          </button>
                        </div>
                      </div>

                      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400 font-medium">Wochen-Fortschritt:</span>
                          <span className="font-bold text-violet-400">
                            {prof.completedThisWeek} von {prof.weeklyTarget} Einheiten ({prof.status})
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 border-t border-zinc-800/80 pt-2">
                          <strong className="text-zinc-400">Status-Notiz: </strong>
                          {prof.notes}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            Zugewiesene Trainingstage ({profPlans.length})
                          </span>
                          <button
                            onClick={() =>
                              setEditingPlanModal({
                                profileId: prof.id,
                                plan: {
                                  id: `plan-${Date.now()}`,
                                  title: 'Neuer Trainingstag',
                                  subtitle: 'Individueller Fokus',
                                  estimatedDuration: '60 Min.',
                                  defaultRestSeconds: 120,
                                  exercises: [
                                    {
                                      exerciseId: exercises[0].id,
                                      targetSets: 3,
                                      targetReps: '6-8',
                                      targetRpe: '8',
                                      tempo: '3-1-1-0',
                                      restSeconds: 150,
                                      coachNote: 'Saubere Technik vor Gewicht!'
                                    }
                                  ]
                                }
                              })
                            }
                            className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />+ Neuer Plan-Tag
                          </button>
                        </div>

                        <div className="space-y-2">
                          {profPlans.map((plan) => (
                            <div
                              key={plan.id}
                              className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-3 flex items-center justify-between gap-2"
                            >
                              <div>
                                <h4 className="font-bold text-xs sm:text-sm text-white">{plan.title}</h4>
                                <p className="text-[11px] text-zinc-400">
                                  {plan.exercises.length} Übungen • {plan.subtitle}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setEditingPlanModal({
                                    profileId: prof.id,
                                    plan: JSON.parse(JSON.stringify(plan))
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 shrink-0 transition"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-violet-400" />
                                Plan bearbeiten
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==========================================
          FLOATING REST TIMER BAR (SATZPAUSEN-TIMER)
          ========================================== */}
      {restTimer.active && (
        <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg bg-zinc-900/95 backdrop-blur-md border-2 border-violet-500 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-600 text-white font-black text-base flex items-center justify-center shrink-0">
              {formatTime(restTimer.remaining)}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-400 block">
                Satzpause läuft
              </span>
              <p className="text-xs font-bold text-white truncate">{restTimer.exerciseName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() =>
                setRestTimer((prev) => ({ ...prev, remaining: Math.max(0, prev.remaining - 15) }))
              }
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200"
            >
              -15s
            </button>
            <button
              onClick={() => setRestTimer((prev) => ({ ...prev, remaining: prev.remaining + 15 }))}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200"
            >
              +15s
            </button>
            <button
              onClick={() => setRestTimer({ active: false, remaining: 0, total: 120, exerciseName: '' })}
              className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-black text-white"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          MOBILE BOTTOM NAVIGATION BAR (5 TABS)
          ========================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 px-1.5 py-1.5 grid grid-cols-5 gap-1">
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex flex-col items-center py-1.5 rounded-xl text-[10px] font-bold ${
            activeTab === 'workout' ? 'text-violet-400' : 'text-zinc-400'
          }`}
        >
          <Dumbbell className="w-5 h-5 mb-0.5" />
          Training
        </button>
        <button
          onClick={() => setActiveTab('checkup')}
          className={`flex flex-col items-center py-1.5 rounded-xl text-[10px] font-bold ${
            activeTab === 'checkup' ? 'text-violet-400' : 'text-zinc-400'
          }`}
        >
          <HeartPulse className="w-5 h-5 mb-0.5" />
          Check-Up
        </button>
        <button
          onClick={() => setActiveTab('body')}
          className={`flex flex-col items-center py-1.5 rounded-xl text-[10px] font-bold ${
            activeTab === 'body' ? 'text-violet-400' : 'text-zinc-400'
          }`}
        >
          <Ruler className="w-5 h-5 mb-0.5" />
          Umfänge
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`flex flex-col items-center py-1.5 rounded-xl text-[10px] font-bold ${
            activeTab === 'exercises' ? 'text-violet-400' : 'text-zinc-400'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          Übungen
        </button>
        <button
          onClick={() => setActiveTab('coach')}
          className={`flex flex-col items-center py-1.5 rounded-xl text-[10px] font-bold ${
            activeTab === 'coach' ? 'text-violet-400' : 'text-zinc-400'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          Kunden
        </button>
      </nav>

      {/* ==========================================
          MODAL: NEUE KÖRPERMESSUNG & UMFÄNGE EINTRAGEN
          ========================================== */}
      {showNewMeasurementModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMeasurement}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-violet-400">
                  {currentProfile.name}
                </span>
                <h3 className="text-lg font-black text-white">
                  Körpergewicht & Umfänge eintragen
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewMeasurementModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Messdatum *</label>
                <input
                  type="date"
                  required
                  value={measurementForm.date}
                  onChange={(e) => setMeasurementForm({ ...measurementForm, date: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-violet-300 block mb-1">
                  Körpergewicht (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={measurementForm.weight}
                  onChange={(e) => setMeasurementForm({ ...measurementForm, weight: e.target.value })}
                  placeholder="z.B. 84.0"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 block mb-3">
                Körperumfänge in cm
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {BODY_METRICS.filter((m) => m.key !== 'weight').map((m) => (
                  <div key={m.key}>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      {m.label} ({m.unit})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={measurementForm[m.key]}
                      onChange={(e) =>
                        setMeasurementForm({ ...measurementForm, [m.key]: e.target.value })
                      }
                      placeholder="cm"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewMeasurementModal(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs shadow-lg shadow-violet-600/25"
              >
                Messung speichern
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          MODAL 1: EXERCISE DETAIL & CUES DRAWER
          ========================================== */}
      {selectedExerciseDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300">
                    {selectedExerciseDetail.muscle}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {selectedExerciseDetail.equipment} • {selectedExerciseDetail.category}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">{selectedExerciseDetail.name}</h3>
              </div>
              <button
                onClick={() => setSelectedExerciseDetail(null)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase text-zinc-400 font-bold block">
                  Empfohlenes Standard-Tempo
                </span>
                <span className="text-lg font-mono font-extrabold text-violet-400">
                  {selectedExerciseDetail.defaultTempo}
                </span>
                <span className="text-xs text-zinc-400 block mt-0.5">
                  (Exzentrik - Pause unten - Konzentrik - Pause oben)
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Video className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Wichtige Coaching-Cues & Ausführung
              </h4>
              <ul className="space-y-2 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4">
                {selectedExerciseDetail.cues.map((cue, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-zinc-200 flex items-start gap-2">
                    <span className="text-violet-400 font-black">{idx + 1}.</span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedExerciseDetail.mistakes && selectedExerciseDetail.mistakes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Typische Fehler vermeiden
                </h4>
                <ul className="space-y-1.5 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4">
                  {selectedExerciseDetail.mistakes.map((m, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-amber-400 font-bold">✕</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  handleAddExerciseOnTheFly(selectedExerciseDetail);
                  setSelectedExerciseDetail(null);
                  setActiveTab('workout');
                }}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                In heutiges Training einfügen
              </button>
              <button
                onClick={() => setSelectedExerciseDetail(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: CREATE NEW EXERCISE
          ========================================== */}
      {showNewExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNewExercise}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Neue Übung zur Datenbank hinzufügen</h3>
              <button
                type="button"
                onClick={() => setShowNewExerciseModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Übungsname *</label>
                <input
                  type="text"
                  required
                  value={newExForm.name}
                  onChange={(e) => setNewExForm({ ...newExForm, name: e.target.value })}
                  placeholder="z.B. Kurzhantel Rudern einarmig, Pause Bench Press..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Muskelgruppe</label>
                  <select
                    value={newExForm.muscle}
                    onChange={(e) => setNewExForm({ ...newExForm, muscle: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                  >
                    {MUSCLE_GROUPS.filter((m) => m !== 'Alle').map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Equipment</label>
                  <select
                    value={newExForm.equipment}
                    onChange={(e) => setNewExForm({ ...newExForm, equipment: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                  >
                    {EQUIPMENT_TYPES.filter((eq) => eq !== 'Alle').map((eq) => (
                      <option key={eq} value={eq}>
                        {eq}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Kategorie</label>
                  <select
                    value={newExForm.category}
                    onChange={(e) => setNewExForm({ ...newExForm, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="Grundübung">Grundübung</option>
                    <option value="Isolation">Isolation</option>
                    <option value="Reha/Mobility">Reha/Mobility</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">Standard-Tempo</label>
                  <input
                    type="text"
                    value={newExForm.defaultTempo}
                    onChange={(e) => setNewExForm({ ...newExForm, defaultTempo: e.target.value })}
                    placeholder="3-1-1-0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Coaching-Cues (1 Punkt pro Zeile)
                </label>
                <textarea
                  rows={3}
                  value={newExForm.cuesText}
                  onChange={(e) => setNewExForm({ ...newExForm, cuesText: e.target.value })}
                  placeholder={"Schulterblatt aktiv nach unten ziehen\nEllbogen eng am Körper führen\n1 Sekunde Pause in der Kontraktion"}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Typische Fehler vermeiden (optional, 1 pro Zeile)
                </label>
                <textarea
                  rows={2}
                  value={newExForm.mistakesText}
                  onChange={(e) => setNewExForm({ ...newExForm, mistakesText: e.target.value })}
                  placeholder={"Schwung aus dem unteren Rücken holen"}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewExerciseModal(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs"
              >
                Übung speichern
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          MODAL 3: PICK EXERCISE FOR ACTIVE WORKOUT
          ========================================== */}
      {showAddExerciseToWorkoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Übung zum heutigen Training hinzufügen</h3>
              <button
                onClick={() => setShowAddExerciseToWorkoutModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1">
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseOnTheFly(ex)}
                  className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{ex.name}</h4>
                    <span className="text-xs text-zinc-400">
                      {ex.muscle} • {ex.equipment}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-xs font-bold">
                    + Wählen
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 4: COACH WORKOUT PLAN EDITOR
          ========================================== */}
      {editingPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-violet-400">Trainingsplan-Editor</span>
                <h3 className="text-lg font-black text-white">Plan anpassen & Übungen zuweisen</h3>
              </div>
              <button
                onClick={() => setEditingPlanModal(null)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Name des Trainingstags</label>
                <input
                  type="text"
                  value={editingPlanModal.plan.title}
                  onChange={(e) =>
                    setEditingPlanModal({
                      ...editingPlanModal,
                      plan: { ...editingPlanModal.plan, title: e.target.value }
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-bold text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">Fokus / Untertitel</label>
                <input
                  type="text"
                  value={editingPlanModal.plan.subtitle}
                  onChange={(e) =>
                    setEditingPlanModal({
                      ...editingPlanModal,
                      plan: { ...editingPlanModal.plan, subtitle: e.target.value }
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-300">
                  Übungen im Plan ({editingPlanModal.plan.exercises.length})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const updatedEx = [
                      ...editingPlanModal.plan.exercises,
                      {
                        exerciseId: exercises[0].id,
                        targetSets: 3,
                        targetReps: '8-10',
                        targetRpe: '8.5',
                        tempo: '3-1-1-0',
                        restSeconds: 120,
                        coachNote: ''
                      }
                    ];
                    setEditingPlanModal({
                      ...editingPlanModal,
                      plan: { ...editingPlanModal.plan, exercises: updatedEx }
                    });
                  }}
                  className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />+ Übung zum Plan hinzufügen
                </button>
              </div>

              {editingPlanModal.plan.exercises.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={item.exerciseId}
                      onChange={(e) => {
                        const copy = [...editingPlanModal.plan.exercises];
                        copy[idx] = { ...copy[idx], exerciseId: e.target.value };
                        setEditingPlanModal({
                          ...editingPlanModal,
                          plan: { ...editingPlanModal.plan, exercises: copy }
                        });
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-bold text-white"
                    >
                      {exercises.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} ({ex.muscle})
                        </option>
                      ))}
                    </select>

                    {editingPlanModal.plan.exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const copy = editingPlanModal.plan.exercises.filter((_, i) => i !== idx);
                          setEditingPlanModal({
                            ...editingPlanModal,
                            plan: { ...editingPlanModal.plan, exercises: copy }
                          });
                        }}
                        className="p-1.5 text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] uppercase text-zinc-400 block">Sätze</label>
                      <input
                        type="number"
                        value={item.targetSets}
                        onChange={(e) => {
                          const copy = [...editingPlanModal.plan.exercises];
                          copy[idx] = { ...copy[idx], targetSets: Number(e.target.value) || 1 };
                          setEditingPlanModal({
                            ...editingPlanModal,
                            plan: { ...editingPlanModal.plan, exercises: copy }
                          });
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-zinc-400 block">Ziel-Wdh.</label>
                      <input
                        type="text"
                        value={item.targetReps}
                        onChange={(e) => {
                          const copy = [...editingPlanModal.plan.exercises];
                          copy[idx] = { ...copy[idx], targetReps: e.target.value };
                          setEditingPlanModal({
                            ...editingPlanModal,
                            plan: { ...editingPlanModal.plan, exercises: copy }
                          });
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-zinc-400 block">Ziel-RPE</label>
                      <input
                        type="text"
                        value={item.targetRpe}
                        onChange={(e) => {
                          const copy = [...editingPlanModal.plan.exercises];
                          copy[idx] = { ...copy[idx], targetRpe: e.target.value };
                          setEditingPlanModal({
                            ...editingPlanModal,
                            plan: { ...editingPlanModal.plan, exercises: copy }
                          });
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-bold text-violet-300"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-zinc-400 block">Tempo</label>
                      <input
                        type="text"
                        value={item.tempo}
                        onChange={(e) => {
                          const copy = [...editingPlanModal.plan.exercises];
                          copy[idx] = { ...copy[idx], tempo: e.target.value };
                          setEditingPlanModal({
                            ...editingPlanModal,
                            plan: { ...editingPlanModal.plan, exercises: copy }
                          });
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={item.coachNote}
                      onChange={(e) => {
                        const copy = [...editingPlanModal.plan.exercises];
                        copy[idx] = { ...copy[idx], coachNote: e.target.value };
                        setEditingPlanModal({
                          ...editingPlanModal,
                          plan: { ...editingPlanModal.plan, exercises: copy }
                        });
                      }}
                      placeholder="Individueller Coaching-Hinweis für diese Übung..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPlanModal(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleSaveCoachPlan}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs"
              >
                Trainingsplan speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 5: ADD NEW CLIENT (NEUEN KUNDEN ANLEGEN)
          ========================================== */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateClient}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Neuen Kunden anlegen</h3>
              <button
                type="button"
                onClick={() => setShowNewClientModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Name des Kunden *</label>
                <input
                  type="text"
                  required
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                  placeholder="z.B. Tim B."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Trainingsziel</label>
                <input
                  type="text"
                  value={newClientForm.goal}
                  onChange={(e) => setNewClientForm({ ...newClientForm, goal: e.target.value })}
                  placeholder="z.B. Hypertrophie & Knie-Stabi"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Geplante Einheiten pro Woche</label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={newClientForm.weeklyTarget}
                  onChange={(e) => setNewClientForm({ ...newClientForm, weeklyTarget: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Anamnese / Coach-Notiz</label>
                <textarea
                  rows={2}
                  value={newClientForm.notes}
                  onChange={(e) => setNewClientForm({ ...newClientForm, notes: e.target.value })}
                  placeholder="Wichtige Infos zu Verletzungen, Fokus oder Alltag..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewClientModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-zinc-300"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-violet-600 text-white font-extrabold text-xs"
              >
                Kunden erstellen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          MODAL 6: DATEN, CLOUD-SYNC & BACKUP CENTER
          ========================================== */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    BIZEPS BÄR Datensicherheit
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    Cloud-Speicherung & Backup-Center
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBackupModal(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-extrabold text-white">
                    {syncStatus === 'synced'
                      ? 'Automatische Cloud-Synchronisation aktiv'
                      : syncStatus === 'saving'
                      ? 'Daten werden gerade in der Cloud gespeichert...'
                      : 'Lokaler Sitzungsmodus aktiv'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Alle Kundenprofile ({profiles.length}), Übungen ({exercises.length}), Trainingspläne, Schmerz-Logs, Video-Feedbacks und Körperumfänge werden automatisch synchronisiert.
                </p>
                {user && (
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Coach-Cloud-ID: {user.uid} {lastSavedAt ? `• Letztes Update: ${lastSavedAt}` : ''}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  persistStateToCloud();
                  triggerToast('Manuelle Cloud-Synchronisation durchgeführt! ☁️');
                }}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Jetzt synchronisieren
              </button>
            </div>

            <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-violet-400" />
                    Komplettes Backup exportieren (JSON)
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Lade alle deine Kunden, Pläne, Übungen, Check-Ups und Körperumfänge als Datei herunter.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBackupFile}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-violet-600 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  .JSON Datei herunterladen
                </button>
              </div>
            </div>

            <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Upload className="w-4 h-4 text-violet-400" />
                  Backup-Daten wiederherstellen / importieren
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Füge hier den Inhalt einer zuvor exportierten BIZEPS BÄR JSON-Datei ein:
                </p>
              </div>
              <textarea
                rows={3}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"app": "BIZEPS BÄR - Coaching & Performance", "profiles": [...]}'
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-violet-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleImportBackupJson}
                  className="px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/40 text-xs font-extrabold transition"
                >
                  JSON-Daten importieren
                </button>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-zinc-300 block">
                  Auf Standard-Demo-Daten zurücksetzen
                </span>
                <span className="text-[11px] text-zinc-500">
                  Setzt alle Kunden, Übungen und Messwerte auf den Ausgangszustand zurück.
                </span>
              </div>

              {!confirmResetStep ? (
                <button
                  type="button"
                  onClick={() => setConfirmResetStep(true)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-rose-950/60 text-zinc-300 hover:text-rose-300 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Demo-Daten wiederherstellen
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetToDemoData}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold"
                  >
                    Ja, jetzt zurücksetzen
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetStep(false)}
                    className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                  >
                    Abbrechen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
