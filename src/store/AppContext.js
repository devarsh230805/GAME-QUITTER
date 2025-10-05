import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as FileSystem from 'expo-file-system';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [streak, setStreak] = useState(0);
  const quotes = [
    'The first step is deciding you can.',
    'Small wins today become big wins tomorrow.',
    'You are stronger than the urge.',
    'Replace the habit, don\'t just remove it.',
    'Choose progress over perfection.',
  ];
  const [quoteIdx, setQuoteIdx] = useState(0);
  const dailyQuote = quotes[quoteIdx % quotes.length];
  const [points, setPoints] = useState(0);
  const [themeMode, setThemeMode] = useState('dark');

  // --- New: user onboarding + profile (MVP local only)
  const [firstOpenDone, setFirstOpenDone] = useState(false);
  const [signedIn, setSignedIn] = useState(false); // local stub auth
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [dailyTargetHours, setDailyTargetHours] = useState(0);

  // --- New: daily schedule slots and tasks
  // slot: { id, startMin, endMin, status: 'planned'|'done'|'missed' }
  const [schedule, setSchedule] = useState([
    { id: 'slot-morning', startMin: 10 * 60, endMin: 11 * 60, status: 'planned' },
    { id: 'slot-evening', startMin: 21 * 60, endMin: 22 * 60, status: 'planned' },
  ]);
  // task: { id, text, completed }
  const [tasks, setTasks] = useState([
    { id: 't1', text: 'Drink water', completed: false },
    { id: 't2', text: '10 pushups', completed: false },
  ]);

  // --- New: play logs (+ confession)
  // log: { id, start: ms, end: ms, onPlan: boolean, reason?: string, confession?: string }
  const [playLogs, setPlayLogs] = useState([]);

  // --- New: user motivations (free text)
  const [motivations, setMotivations] = useState('');

  const [challenges, setChallenges] = useState([
    { id: 'walk-30', title: 'Walk for 30 minutes', completed: false, reward: 5 },
    { id: 'text-friend', title: 'Text a friend to make plans', completed: false, reward: 5 },
    { id: 'read-10', title: 'Read 10 pages', completed: false, reward: 5 },
  ]);

  // --- Real tracking engine ---
  const [sessions, setSessions] = useState([]); // { start: number, end?: number }
  const [running, setRunning] = useState(false);
  const [currentStart, setCurrentStart] = useState(null);
  const tick = useRef(null);

  // Persistence
  const STORE_FILE = FileSystem.documentDirectory + 'gamequittr_store.json';
  useEffect(() => {
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(STORE_FILE);
        if (info.exists) {
          const raw = await FileSystem.readAsStringAsync(STORE_FILE);
          const data = JSON.parse(raw);
          setSessions(Array.isArray(data.sessions) ? data.sessions : []);
          setRunning(!!data.running);
          setCurrentStart(data.currentStart || null);
          setStreak(typeof data.streak === 'number' ? data.streak : 0);
          setPoints(typeof data.points === 'number' ? data.points : 0);
          if (Array.isArray(data.challenges)) setChallenges(data.challenges);
          if (Array.isArray(data.schedule)) setSchedule(data.schedule);
          if (Array.isArray(data.tasks)) setTasks(data.tasks);
          if (Array.isArray(data.playLogs)) setPlayLogs(data.playLogs);
          if (typeof data.firstOpenDone === 'boolean') setFirstOpenDone(data.firstOpenDone);
          if (typeof data.signedIn === 'boolean') setSignedIn(data.signedIn);
          if (typeof data.profileName === 'string') setProfileName(data.profileName);
          if (typeof data.profileEmail === 'string') setProfileEmail(data.profileEmail);
          if (typeof data.motivations === 'string') setMotivations(data.motivations);
          if (typeof data.dailyTargetHours === 'number') setDailyTargetHours(data.dailyTargetHours);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const payload = JSON.stringify({ sessions, running, currentStart, streak, points, challenges, schedule, tasks, playLogs, firstOpenDone, signedIn, profileName, profileEmail, motivations, dailyTargetHours });
        await FileSystem.writeAsStringAsync(STORE_FILE, payload);
      } catch (e) {
        // ignore
      }
    })();
  }, [sessions, running, currentStart, streak, points, challenges, schedule, tasks, playLogs, firstOpenDone, signedIn, profileName, profileEmail, motivations, dailyTargetHours]);

  // start/stop timer
  function startSession() {
    if (running) return;
    const now = Date.now();
    setRunning(true);
    setCurrentStart(now);
    // create a new unplanned log entry for budget-based flow
    setPlayLogs((prev) => [...prev, { id: 'log-' + now, start: now, onPlan: false }]);
  }

  function stopSession() {
    if (!running || !currentStart) return;
    const now = Date.now();
    setRunning(false);
    setSessions((prev) => [...prev, { start: currentStart, end: now }]);
    setCurrentStart(null);
    // close the last open play log
    setPlayLogs((prev) => {
      const idxFromEnd = [...prev].reverse().findIndex((l) => l.end == null);
      const realIdx = idxFromEnd >= 0 ? prev.length - 1 - idxFromEnd : -1;
      if (realIdx === -1) return prev;
      const copy = [...prev];
      copy[realIdx] = { ...copy[realIdx], end: now };
      return copy;
    });
  }

  // --- Auth/profile helpers ---
  function logout() {
    setSignedIn(false);
    // keep local data; optionally clear sensitive fields
  }

  // live ticker to force re-render each second while running
  useEffect(() => {
    if (!running) {
      if (tick.current) {
        clearInterval(tick.current);
        tick.current = null;
      }
      return;
    }
    tick.current = setInterval(() => {
      // no-op state update: rotate quote index modulo to trigger rerender minimally
      setQuoteIdx((i) => i);
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
      tick.current = null;
    };
  }, [running]);

  // helpers: totals
  function isSameDay(a, b) {
    const da = new Date(a), db = new Date(b);
    return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
  }

  function msToday() {
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    let total = 0;
    for (const s of sessions) {
      const st = s.start, en = s.end || now;
      if (st >= startOfDay.getTime()) total += Math.max(0, en - st);
    }
    if (running && currentStart && currentStart >= startOfDay.getTime()) total += Math.max(0, now - currentStart);
    return total;
  }

  function msByDayForLast7() {
    const now = Date.now();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return { dayStart: d.getTime(), dayEnd: d.getTime() + 24 * 3600 * 1000 };
    });
    const totals = days.map(({ dayStart, dayEnd }) => {
      let t = 0;
      for (const s of sessions) {
        const st = s.start, en = s.end || now;
        const overlap = Math.max(0, Math.min(en, dayEnd) - Math.max(st, dayStart));
        t += overlap;
      }
      if (running && currentStart) {
        const en = now;
        const overlap = Math.max(0, Math.min(en, dayEnd) - Math.max(currentStart, dayStart));
        t += overlap;
      }
      return t;
    });
    return totals;
  }

  // Daily budget helpers (based on dailyTargetHours and msToday)
  function remainingBudgetMs() {
    const budget = Math.max(0, (dailyTargetHours || 0) * 3600000);
    return Math.max(0, budget - msToday());
  }

  function shouldGatePlay() {
    return remainingBudgetMs() <= 0;
  }

  function rotateQuote() {
    setQuoteIdx((i) => (i + 1) % quotes.length);
  }

  function incrementStreak() {
    setStreak((s) => s + 1);
  }

  function toggleChallenge(id) {
    setChallenges((prev) => {
      return prev.map((c) => {
        if (c.id !== id) return c;
        const nextCompleted = !c.completed;
        if (nextCompleted) setPoints((p) => p + (c.reward || 1));
        else setPoints((p) => Math.max(0, p - (c.reward || 1)));
        return { ...c, completed: nextCompleted };
      });
    });
  }

  // --- New: helper utilities ---
  function minutesNow() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function isNowInScheduledSlot() {
    const nowM = minutesNow();
    return schedule.find((s) => nowM >= s.startMin && nowM < s.endMin);
  }

  function markSlotDone(slotId) {
    setSchedule((prev) => prev.map((s) => (s.id === slotId ? { ...s, status: 'done' } : s)));
  }

  function markMissedSlotsUpToNow() {
    const nowM = minutesNow();
    setSchedule((prev) => prev.map((s) => (s.endMin <= nowM && s.status === 'planned' ? { ...s, status: 'missed' } : s)));
  }

  function addSlot(startMin, endMin) {
    const id = 'slot-' + Math.random().toString(36).slice(2, 8);
    setSchedule((prev) => [...prev, { id, startMin, endMin, status: 'planned' }]);
  }

  function removeSlot(id) {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  }

  // --- New: tasks helpers ---
  function toggleTask(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }
  function addTask(text) {
    const id = 'task-' + Math.random().toString(36).slice(2, 8);
    setTasks((prev) => [...prev, { id, text, completed: false }]);
  }
  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }
  function resetTasksForNewDay() {
    setTasks((prev) => prev.map((t) => ({ ...t, completed: false })));
  }

  // --- New: Game Mode logic ---
  function startGamingOnPlan() {
    const slot = isNowInScheduledSlot();
    const now = Date.now();
    if (slot) {
      // mark slot done when stopping
      setRunning(true);
      setCurrentStart(now);
      setPlayLogs((prev) => [...prev, { id: 'log-' + now, start: now, onPlan: true }]);
      return { ok: true, onPlan: true, slot };
    }
    return { ok: false, onPlan: false };
  }

  function forceStartGamingUnplanned(reason) {
    const now = Date.now();
    setRunning(true);
    setCurrentStart(now);
    setPlayLogs((prev) => [...prev, { id: 'log-' + now, start: now, onPlan: false, reason }]);
    return { ok: true };
  }

  function stopGamingWithOptionalConfession(confessionText) {
    if (!running || !currentStart) return;
    const now = Date.now();
    setRunning(false);
    setSessions((prev) => [...prev, { start: currentStart, end: now }]);
    setPlayLogs((prev) => {
      // attach end time and confession to last open log
      const lastIdx = [...prev].reverse().findIndex((l) => l.end == null);
      const realIdx = lastIdx >= 0 ? prev.length - 1 - lastIdx : -1;
      if (realIdx === -1) return prev;
      const last = prev[realIdx];
      const updated = { ...last, end: now, confession: confessionText || last.confession };
      const copy = [...prev];
      copy[realIdx] = updated;
      return copy;
    });
    // mark slot done if onPlan and within a slot
    const slot = isNowInScheduledSlot();
    if (slot) markSlotDone(slot.id);
    setCurrentStart(null);
  }

  function retroMarkSlotAsDone(slotId) {
    markSlotDone(slotId);
    // add a zero-length log entry to reflect completion
    const now = Date.now();
    setPlayLogs((prev) => [...prev, { id: 'log-' + now, start: now, end: now, onPlan: true, reason: 'retro' }]);
  }

  // derived stats
  const plannedToday = useMemo(() => schedule.length, [schedule]);
  const doneToday = useMemo(() => schedule.filter((s) => s.status === 'done').length, [schedule]);
  const plannedHoursSum = useMemo(() => schedule.reduce((sum, s) => sum + Math.max(0, (s.endMin - s.startMin) / 60), 0), [schedule]);
  const remainingPlannedHours = useMemo(() => Math.max(0, dailyTargetHours - plannedHoursSum), [dailyTargetHours, plannedHoursSum]);

  const value = useMemo(() => ({
    streak,
    incrementStreak,
    dailyQuote,
    rotateQuote,
    points,
    setPoints,
    themeMode,
    setThemeMode,
    // profile
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    logout,
    challenges,
    toggleChallenge,
    // tracker
    sessions,
    running,
    startSession,
    stopSession,
    currentStart,
    msToday,
    msByDayForLast7,
    // new state
    firstOpenDone,
    setFirstOpenDone,
    signedIn,
    setSignedIn,
    dailyTargetHours,
    setDailyTargetHours,
    schedule,
    setSchedule,
    tasks,
    setTasks,
    playLogs,
    setPlayLogs,
    motivations,
    setMotivations,
    // helpers
    minutesNow,
    isNowInScheduledSlot,
    remainingBudgetMs,
    shouldGatePlay,
    markSlotDone,
    markMissedSlotsUpToNow,
    addSlot,
    removeSlot,
    addTask,
    removeTask,
    toggleTask,
    resetTasksForNewDay,
    startGamingOnPlan,
    forceStartGamingUnplanned,
    stopGamingWithOptionalConfession,
    retroMarkSlotAsDone,
    plannedToday,
    doneToday,
    plannedHoursSum,
    remainingPlannedHours,
  }), [streak, dailyQuote, points, themeMode, challenges, sessions, running, currentStart
  , firstOpenDone, signedIn, profileName, profileEmail, dailyTargetHours, schedule, tasks, playLogs]);

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
