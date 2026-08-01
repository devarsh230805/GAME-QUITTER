import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
 
WebBrowser.maybeCompleteAuthSession();
 
const AuthContext = createContext();
 
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
 
  // Fetch profile from Supabase 'profiles' table
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
 
      if (error && error.code === "PGRST116") {
        // Profile doesn't exist, maybe create it?
        console.log("[AuthContext] Profile not found, creating one...");
        return null;
      } else if (error) {
        console.error("[AuthContext] Error fetching profile:", error.message);
        return null;
      }
      setProfile(data);
      return data;
    } catch (err) {
      console.error("[AuthContext] Unexpected error fetching profile:", err);
      return null;
    }
  };
 
  // Update profile in Supabase (or locally for guest)
  const updateProfile = async (updates) => {
    if (!user) return { error: "No user logged in" };
    if (user.id === "guest-user") {
      const updated = {
        ...profile,
        display_name: updates.display_name,
        email: updates.email || profile?.email,
      };
      setProfile(updated);
      return { data: updated, error: null };
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
 
      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error("[AuthContext] updateProfile error:", error.message);
      return { data: null, error };
    }
  };
 
  // Implement the Deep Link interception logic
  useEffect(() => {
    const handleDeepLink = async (url) => {
      if (!url || !url.includes("auth/callback")) return;
 
      try {
        const parsed = Linking.parse(url);
        const code = parsed.queryParams?.code;
        const errorDescription = parsed.queryParams?.error_description;
 
        if (errorDescription) {
          console.error("[AuthLayout] Auth provider error:", errorDescription);
          Alert.alert("Google Sign-In Error", errorDescription);
          return;
        }
 
        if (!code) {
          console.warn("[AuthLayout] No code found in URL.");
          return;
        }
 
        const { data, error } =
          await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[AuthLayout] Exchange failed:", error);
          Alert.alert("Google Sign-In Error", error.message || JSON.stringify(error));
          return;
        }
      } catch (err) {
        console.error("[AuthLayout] Deep link processing error:", err);
        Alert.alert("Google Sign-In Error", err.message || JSON.stringify(err));
      }
    };
 
    const subscription = Linking.addEventListener("url", (e) =>
      handleDeepLink(e.url),
    );
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });
 
    return () => subscription.remove();
  }, []);
 
  // Standard Session Tracking
  useEffect(() => {
    let mounted = true;
 
    async function loadInitialSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            await fetchProfile(currentUser.id);
          }
        }
      } catch (err) {
        console.warn("[AuthContext] Failed to get initial session:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
 
    loadInitialSession();
 
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted && !isLoggingOut) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            await fetchProfile(currentUser.id);
          } else {
            setProfile(null);
          }
        }
      },
    );
 
    return () => {
      mounted = false;
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
 
  const signOut = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      console.log("[Auth] Signed out from Supabase");
    } catch (e) {
      console.error("[Auth] SignOut error:", e);
    } finally {
      // Explicitly clear state and reset flag
      setUser(null);
      setProfile(null);
      setTimeout(() => setIsLoggingOut(false), 1000); // Small buffer for events
    }
  };
 
  const signInWithGoogle = async () => {
    try {
      const redirectUrl = Linking.createURL("auth/callback", {
        scheme: "gamequitter",
      });
 
      if (Platform.OS === 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectUrl,
          },
        });
        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
        }
        return;
      }
 
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
 
      if (error) throw error;
      if (!data?.url) throw new Error("No auth URL returned from Supabase");
 
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
      );
      if (result.type === "success") {
        console.log("[Auth] Browser flow success.");
      }
    } catch (e) {
      console.error("[Auth] signInWithGoogle Error:", e);
      Alert.alert("Google Sign-In Error", e.message || JSON.stringify(e));
    }
  };
 
  const signInWithGitHub = async () => {
    try {
      const redirectUrl = Linking.createURL("auth/callback", {
        scheme: "gamequitter",
      });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
 
      if (error) throw error;
      if (!data?.url) throw new Error("No auth URL returned from Supabase");
 
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl,
      );
      if (result.type === "success") {
        console.log("[Auth] Browser flow success.");
      }
    } catch (e) {
      console.error("[Auth] signInWithGitHub Error:", e);
      Alert.alert("GitHub Sign-In Error", e.message || JSON.stringify(e));
    }
  };
 
  const signInAsGuest = async () => {
    let savedName = "Guest Explorer";
    try {
      const raw = await AsyncStorage.getItem("gamequittr_store");
      if (raw) {
        const data = JSON.parse(raw);
        if (data && typeof data.profileName === "string" && data.profileName) {
          savedName = data.profileName;
        }
      }
    } catch (e) {
      console.warn("[Auth] Failed to load guest name from storage:", e);
    }

    setUser({ id: "guest-user", email: "guest@gamequitter.com" });
    setProfile({
      display_name: savedName,
      email: "guest@gamequitter.com",
    });
  };
 
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithGitHub,
        signOut,
        updateProfile,
        fetchProfile,
        signInAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
 
export function useAuth() {
  return useContext(AuthContext);
}
