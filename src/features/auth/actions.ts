"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { env, isSupabaseConfigured } from "@/lib/env";
import {
  isSafeRedirectPath,
  validateCredentials,
  validateEmailForSignIn,
  validatePasswordForSignIn,
} from "./security";
import {
  clearFailedSignInAttempts,
  getFailedSignInAttempts,
  getSignInAttemptsLimit,
  registerFailedSignInAttempt,
} from "./sign-in-attempts";

export interface AuthResult {
  error?: string;
  success?: boolean;
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    fullName: String(formData.get("fullName") ?? "").trim(),
  };
}

function getSafeRedirectPath(locale: Locale, nextPath?: string) {
  const candidate = nextPath?.startsWith("/") ? nextPath : "/dashboard";
  return isSafeRedirectPath(candidate)
    ? { href: candidate, locale }
    : { href: "/dashboard", locale };
}

function getConfiguredOAuthRedirect(locale: Locale) {
  return `${env.appUrl}/${locale}/dashboard`;
}

export async function signInAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { error: "Authentication is not configured. Add Supabase keys to .env.local." };
  }

  const { email, password } = readCredentials(formData);
  const locale = (String(formData.get("locale") ?? "en") || "en") as Locale;

  const emailValidation = validateEmailForSignIn(email);
  const passwordValidation = validatePasswordForSignIn(password);

  if (
    !emailValidation.ok ||
    !emailValidation.email ||
    !passwordValidation.ok ||
    !passwordValidation.password
  ) {
    return { error: "Invalid email or password." };
  }

  const failedAttempts = await getFailedSignInAttempts(emailValidation.email);
  const attemptsLimit = getSignInAttemptsLimit();
  if (failedAttempts >= attemptsLimit) {
    return {
      error:
        "Too many failed sign-in attempts. Please reset your password or create a new account.",
    };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Authentication is not configured." };

  const { error } = await supabase.auth.signInWithPassword({
    email: emailValidation.email,
    password: passwordValidation.password,
  });
  if (error) {
    const nextFailedAttempts = await registerFailedSignInAttempt(emailValidation.email);
    if (nextFailedAttempts >= attemptsLimit) {
      return {
        error:
          "Too many failed sign-in attempts. Please reset your password or create a new account.",
      };
    }
    return { error: "Invalid email or password." };
  }

  await clearFailedSignInAttempts(emailValidation.email);

  revalidatePath("/", "layout");
  const { href, locale: redirectLocale } = getSafeRedirectPath(locale, "/dashboard");
  redirect({ href, locale: redirectLocale });
  return { success: true };
}

export async function signUpAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { error: "Authentication is not configured. Add Supabase keys to .env.local." };
  }

  const { email, password, fullName, confirmPassword } = readCredentials(formData);
  const locale = (String(formData.get("locale") ?? "en") || "en") as Locale;

  const validation = validateCredentials({ email, password, fullName, confirmPassword });
  if (!validation.ok || !validation.credentials) {
    return { error: validation.error };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Authentication is not configured." };

  const { error } = await supabase.auth.signUp({
    email: validation.credentials.email,
    password: validation.credentials.password,
    options: {
      data: { full_name: validation.credentials.fullName },
      emailRedirectTo: getConfiguredOAuthRedirect(locale),
    },
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
  const emailValidation = validateEmailForSignIn(email);
  if (!emailValidation.ok || !emailValidation.email) {
    return { error: "Invalid email or password." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Authentication is not configured." };

  const { error } = await supabase.auth.resetPasswordForEmail(emailValidation.email, {
    redirectTo: `${env.appUrl}/${locale}/reset-password`,
  });
  if (error) return { error: error.message };
  await clearFailedSignInAttempts(emailValidation.email);
  return { success: true };
}

export async function resetPasswordAction(
  _prev: AuthResult,
  formData: FormData,
): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { error: "Authentication is not configured. Add Supabase keys to .env.local." };
  }

  const password = String(formData.get("password") ?? "");
  const locale = (String(formData.get("locale") ?? "en") || "en") as Locale;
  const passwordValidation = validatePasswordForSignIn(password);
  if (!passwordValidation.ok || !passwordValidation.password) {
    return { error: "Choose a stronger password." };
  }

  const supabase = await createClient();
  if (!supabase) return { error: "Authentication is not configured." };

  const { error } = await supabase.auth.updateUser({ password: passwordValidation.password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  const { href, locale: redirectLocale } = getSafeRedirectPath(locale, "/dashboard");
  redirect({ href, locale: redirectLocale });
  return { success: true };
}
