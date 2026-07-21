import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { profile: remoteProfile } = useAuth();
  const [streak, setStreak] = useState(0);
  const quotes = [
    "The first step is deciding you can.",
    "Small wins today become big wins tomorrow.",
    "You are stronger than the urge.",
    "Replace the habit, don't just remove it.",
    "Choose progress over perfection.",
  ];
  const [quoteIdx, setQuoteIdx] = useState(0);
  const dailyQuote = quotes[quoteIdx % quotes.length];
  const [points, setPoints] = useState(0);
  const [themeMode, setThemeMode] = useState("light");
  const [timeTick, setTimeTick] = useState(0);

  // --- user onboarding + profile
  const [firstOpenDone, setFirstOpenDone] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [dailyTargetHours, setDailyTargetHours] = useState(0);

  // Sync with remote profile if available
  useEffect(() => {
    if (remoteProfile) {
      if (remoteProfile.display_name)
        setProfileName(remoteProfile.display_name);
      if (remoteProfile.email) setProfileEmail(remoteProfile.email);
    }
  }, [remoteProfile]);

  // --- daily schedule slots and tasks
  const [schedule, setSchedule] = useState([
    {
      id: "slot-morning",
      startMin: 10 * 60,
      endMin: 11 * 60,
      status: "planned",
    },
    {
      id: "slot-evening",
      startMin: 21 * 60,
      endMin: 22 * 60,
      status: "planned",
    },
  ]);
  const [tasks, setTasks] = useState([
    { id: "t1", text: "Drink water", completed: false },
    { id: "t2", text: "10 pushups", completed: false },
  ]);

  const [playLogs, setPlayLogs] = useState([]);
  const [motivations, setMotivations] = useState("");

  const [challenges, setChallenges] = useState([
    {
      id: "walk-30",
      title: "Walk for 30 minutes",
      completed: false,
      reward: 5,
    },
    {
      id: "text-friend",
      title: "Text a friend to make plans",
      completed: false,
      reward: 5,
    },
    { id: "read-10", title: "Read 10 pages", completed: false, reward: 5 },
  ]);

  const [sessions, setSessions] = useState([]);
  const [running, setRunning] = useState(false);
  const [currentStart, setCurrentStart] = useState(null);
  const tick = useRef(null);

  const STORE_KEY = "gamequittr_store";

  // -- Robust Rehydration (Load from Device)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          console.log("[Storage] Loading persistent data...");

          if (Array.isArray(data.sessions)) setSessions(data.sessions);
          setRunning(!!data.running);
          setCurrentStart(data.currentStart || null);
          setStreak(typeof data.streak === "number" ? data.streak : 0);
          setPoints(typeof data.points === "number" ? data.points : 0);

          if (Array.isArray(data.challenges)) setChallenges(data.challenges);
          if (Array.isArray(data.schedule)) setSchedule(data.schedule);
          if (Array.isArray(data.tasks)) setTasks(data.tasks);
          if (Array.isArray(data.playLogs)) setPlayLogs(data.playLogs);

          if (typeof data.firstOpenDone === "boolean")
            setFirstOpenDone(data.firstOpenDone);
          if (typeof data.signedIn === "boolean") setSignedIn(data.signedIn);
          if (typeof data.profileName === "string")
            setProfileName(data.profileName);
          if (typeof data.profileEmail === "string")
            setProfileEmail(data.profileEmail);
          if (typeof data.motivations === "string")
            setMotivations(data.motivations);
          if (typeof data.dailyTargetHours === "number")
            setDailyTargetHours(data.dailyTargetHours);
          setThemeMode("light");

          console.log("[Storage] Data loaded successfully.");
        } else {
          console.log("[Storage] No existing data found.");
        }
      } catch (e) {
        console.error("[Storage] Rehydration failed:", e);
      }
    })();
  }, []);

  // -- Reliable Persistence (Save to Device)
  useEffect(() => {
    const saveData = async () => {
      try {
        const payload = JSON.stringify({
          sessions,
          running,
          currentStart,
          streak,
          points,
          challenges,
          schedule,
          tasks,
          playLogs,
          firstOpenDone,
          signedIn,
          profileName,
          profileEmail,
          motivations,
          dailyTargetHours,
          themeMode,
        });
        await AsyncStorage.setItem(STORE_KEY, payload);
      } catch (e) {
        console.error("[Storage] Save failed:", e);
      }
    };
    saveData();
  }, [
    sessions,
    running,
    currentStart,
    streak,
    points,
    challenges,
    schedule,
    tasks,
    playLogs,
    firstOpenDone,
    signedIn,
    profileName,
    profileEmail,
    motivations,
    dailyTargetHours,
    themeMode,
  ]);

  // --- Session Management (Gaming / Focus Tracking)
  function startSession() {
    if (running) return;
    console.log("[Session] Starting new session...");
    const now = Date.now();
    setRunning(true);
    setCurrentStart(now);
    setPlayLogs((prev) => [
      ...prev,
      { id: "log-" + now, start: now, end: null, onPlan: false },
    ]);
  }

  function stopSession() {
    if (!running || !currentStart) return;
    const now = Date.now();
    console.log(
      "[Session] Stopping session. Duration:",
      Math.round((now - currentStart) / 1000),
      "s",
    );
    setRunning(false);
    setSessions((prev) => [...prev, { start: currentStart, end: now }]);
    setCurrentStart(null);
    setPlayLogs((prev) => {
      // Find the most recent active log and close it
      const last = prev[prev.length - 1];
      if (last && !last.end) {
        const updated = [...prev];
        updated[updated.length - 1] = { ...last, end: now };
        return updated;
      }
      return prev;
    });
  }

  function clearAllData() {
    console.log("[Storage] Clearing all local data...");
    setSessions([]);
    setRunning(false);
    setCurrentStart(null);
    setStreak(0);
    setPoints(0);
    setPlayLogs([]);
  }

  useEffect(() => {
    if (!running) {
      if (tick.current) {
        clearInterval(tick.current);
        tick.current = null;
      }
      return;
    }
    tick.current = setInterval(() => {
      setTimeTick((t) => t + 1);
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
      tick.current = null;
    };
  }, [running]);

  function msToday() {
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    let total = 0;
    for (const s of sessions) {
      const st = s.start,
        en = s.end || now;
      if (st >= startOfDay.getTime()) total += Math.max(0, en - st);
    }
    if (running && currentStart && currentStart >= startOfDay.getTime())
      total += Math.max(0, now - currentStart);
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
        const st = s.start,
          en = s.end || now;
        const overlap = Math.max(
          0,
          Math.min(en, dayEnd) - Math.max(st, dayStart),
        );
        t += overlap;
      }
      if (running && currentStart) {
        const en = now;
        const overlap = Math.max(
          0,
          Math.min(en, dayEnd) - Math.max(currentStart, dayStart),
        );
        t += overlap;
      }
      return t;
    });
    return totals;
  }

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

  function minutesNow() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function isNowInScheduledSlot() {
    const nowM = minutesNow();
    return schedule.find((s) => nowM >= s.startMin && nowM < s.endMin);
  }

  function markSlotDone(slotId) {
    setSchedule((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, status: "done" } : s)),
    );
  }

  function markMissedSlotsUpToNow() {
    const nowM = minutesNow();
    setSchedule((prev) =>
      prev.map((s) =>
        s.endMin <= nowM && s.status === "planned"
          ? { ...s, status: "missed" }
          : s,
      ),
    );
  }

  function addSlot(startMin, endMin) {
    const id = "slot-" + Math.random().toString(36).slice(2, 8);
    setSchedule((prev) => [
      ...prev,
      { id, startMin, endMin, status: "planned" },
    ]);
  }

  function removeSlot(id) {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }
  function addTask(text) {
    const id = "task-" + Math.random().toString(36).slice(2, 8);
    setTasks((prev) => [...prev, { id, text, completed: false }]);
  }
  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }
  function resetTasksForNewDay() {
    setTasks((prev) => prev.map((t) => ({ ...t, completed: false })));
  }

  function startGamingOnPlan() {
    const slot = isNowInScheduledSlot();
    const now = Date.now();
    if (slot) {
      setRunning(true);
      setCurrentStart(now);
      setPlayLogs((prev) => [
        ...prev,
        { id: "log-" + now, start: now, onPlan: true },
      ]);
      return { ok: true, onPlan: true, slot };
    }
    return { ok: false, onPlan: false };
  }

  function forceStartGamingUnplanned(reason) {
    const now = Date.now();
    setRunning(true);
    setCurrentStart(now);
    setPlayLogs((prev) => [
      ...prev,
      { id: "log-" + now, start: now, onPlan: false, reason },
    ]);
    return { ok: true };
  }

  function stopGamingWithOptionalConfession(confessionText) {
    if (!running || !currentStart) return;
    const now = Date.now();
    setRunning(false);
    setSessions((prev) => [...prev, { start: currentStart, end: now }]);
    setPlayLogs((prev) => {
      const lastIdx = [...prev].reverse().findIndex((l) => l.end == null);
      const realIdx = lastIdx >= 0 ? prev.length - 1 - lastIdx : -1;
      if (realIdx === -1) return prev;
      const last = prev[realIdx];
      const updated = {
        ...last,
        end: now,
        confession: confessionText || last.confession,
      };
      const copy = [...prev];
      copy[realIdx] = updated;
      return copy;
    });
    const slot = isNowInScheduledSlot();
    if (slot) markSlotDone(slot.id);
    setCurrentStart(null);
  }

  function retroMarkSlotAsDone(slotId) {
    markSlotDone(slotId);
    const now = Date.now();
    setPlayLogs((prev) => [
      ...prev,
      { id: "log-" + now, start: now, end: now, onPlan: true, reason: "retro" },
    ]);
  }

  const plannedToday = useMemo(() => schedule.length, [schedule]);
  const doneToday = useMemo(
    () => schedule.filter((s) => s.status === "done").length,
    [schedule],
  );
  const plannedHoursSum = useMemo(
    () =>
      schedule.reduce(
        (sum, s) => sum + Math.max(0, (s.endMin - s.startMin) / 60),
        0,
      ),
    [schedule],
  );
  const remainingPlannedHours = useMemo(
    () => Math.max(0, dailyTargetHours - plannedHoursSum),
    [dailyTargetHours, plannedHoursSum],
  );

  const value = useMemo(
    () => ({
      streak,
      incrementStreak,
      dailyQuote,
      rotateQuote,
      points,
      setPoints,
      themeMode,
      setThemeMode,
      profileName,
      setProfileName,
      profileEmail,
      setProfileEmail,
      challenges,
      toggleChallenge,
      sessions,
      running,
      startSession,
      stopSession,
      currentStart,
      msToday,
      msByDayForLast7,
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
    }),
    [
      streak,
      dailyQuote,
      points,
      themeMode,
      challenges,
      sessions,
      running,
      currentStart,
      firstOpenDone,
      signedIn,
      profileName,
      profileEmail,
      dailyTargetHours,
      schedule,
      tasks,
      playLogs,
      remoteProfile,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
