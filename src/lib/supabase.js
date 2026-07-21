import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || "").trim();
const supabaseAnonKey = (
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ""
).trim();

console.log("[Supabase] Initializing with URL:", supabaseUrl);
// console.log("[Supabase] Using Key (first 10 chars):", supabaseAnonKey.substring(0, 10));

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] WARNING: Supabase URL or Anon Key is missing from .env!",
  );
}

// Custom storage adapter that swallows errors (like missing window in SSR)
const ExpoStorage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === "web" && typeof window === "undefined") {
        return null;
      }
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error("ExpoStorage getItem error:", e);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      if (Platform.OS === "web" && typeof window === "undefined") {
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("ExpoStorage setItem error:", e);
    }
  },
  removeItem: async (key) => {
    try {
      if (Platform.OS === "web" && typeof window === "undefined") {
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("ExpoStorage removeItem error:", e);
    }
  },
};

let supabaseInstance;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] WARNING: Supabase URL or Anon Key is missing from .env! App will run in Offline/Guest mode.",
  );

  supabaseInstance = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signOut: async () => {},
      signInWithOAuth: async () => ({
        data: {},
        error: new Error("Supabase is missing from .env"),
      }),
      exchangeCodeForSession: async () => ({
        data: {},
        error: new Error("Supabase is missing from .env"),
      }),
      startAutoRefresh: () => {},
      stopAutoRefresh: () => {},
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: null,
            error: { code: "PGRST116", message: "No session" },
          }),
        }),
      }),
      upsert: () => ({
        select: () => ({
          single: async () => ({
            data: null,
            error: new Error("Supabase is missing from .env"),
          }),
        }),
      }),
    }),
  };
} else {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: ExpoStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Explicitly false per template, we handle deep links via PKCE manually
        flowType: "pkce",
        lock: (name, acquireTimeout, fn) => fn(),
      },
    });
  } catch (err) {
    console.error("[Supabase] Error creating client:", err);
    supabaseInstance = {
      auth: {
        getSession: async () => ({ data: { session: null }, error: err }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signOut: async () => {},
        signInWithOAuth: async () => ({ data: {}, error: err }),
        exchangeCodeForSession: async () => ({ data: {}, error: err }),
        startAutoRefresh: () => {},
        stopAutoRefresh: () => {},
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: err }),
          }),
        }),
        upsert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: err }),
          }),
        }),
      }),
    };
  }
}

export const supabase = supabaseInstance;

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
