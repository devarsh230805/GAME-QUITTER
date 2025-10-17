import { createClient } from "@supabase/supabase-js";
import * as AuthSession from "expo-auth-session";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const redirectUri = AuthSession.makeRedirectUri({
  scheme: "gameaddapp", // must match app.json "scheme"
});

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUri,
    },
  });
  if (error) console.error("Google Sign-In Error:", error.message);
  return data;
}
