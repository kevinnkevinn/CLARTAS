"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export interface AuthResult {
  error?: string;
  success?: boolean;
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    fullName: String(formData.get("fullName") ?? "").trim(),
  };
}

export async function signInAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { error: "Authentication is not configured. Add Supabase keys to .env.local." };
  }
  const { email, password } = readCredentials(formData);
  const locale = (String(formData.get("locale") ?? "en") || "en") as Locale;

  const supabase = await createClient();
  if (!supabase) return { error: "Authentication is not configured." };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect({ href: "/dashboard", locale });
  return { success: true };
}

export async function signUpAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { error: "Authentication is not configured. Add Supabase keys to .env.local." };
  }
  const { email, password, fullName } = readCredentials(formData);

  const supabase = await createClient();
  if (!supabase) return { error: "Authentication is not configured." };

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { error: error.message };

  return { success: true };
}

export async function signOutAction(locale: Locale) {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect({ href: "/sign-in", locale });
}

export async function forgotPasswordAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { error: "Authentication is not configured." };
  }
  const email = String(formData.get("email") ?? "").trim();
  const locale = (String(formData.get("locale") ?? "en") || "en") as Locale;
  const supabase = await createClient();
  if (!supabase) return { error: "Authentication is not configured." };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/${locale}/reset-password`,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function resetPasswordAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { error: "Authentication is not configured." };
  }
  const password = String(formData.get("password") ?? "");
  const locale = (String(formData.get("locale") ?? "en") || "en") as Locale;
  const supabase = await createClient();
  if (!supabase) return { error: "Authentication is not configured." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect({ href: "/dashboard", locale });
  return { success: true };
}
