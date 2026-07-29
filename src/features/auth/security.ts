import { z } from "zod";

const EMAIL_SCHEMA = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .max(254, "Email is too long.")
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

const FULL_NAME_SCHEMA = z
  .string()
  .trim()
  .min(1, "Full name is required.")
  .max(120, "Full name is too long.")
  .regex(
    /^[\p{L}\p{N}\s'.-]+$/u,
    "Use only letters, numbers, spaces, apostrophes, dots, and hyphens.",
  );

const PASSWORD_SCHEMA = z
  .string()
  .min(12, "Password must be at least 12 characters long.")
  .max(128, "Password must be 128 characters or fewer.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character.");

export type AuthCredentials = {
  email: string;
  password: string;
  fullName: string;
  confirmPassword?: string;
};

export function validateCredentials(input: AuthCredentials) {
  const safeEmail = EMAIL_SCHEMA.safeParse(input.email);
  if (!safeEmail.success) {
    return {
      ok: false,
      error: safeEmail.error.issues[0]?.message ?? "Enter a valid email address.",
    };
  }

  const safeFullName = FULL_NAME_SCHEMA.safeParse(input.fullName);
  if (!safeFullName.success) {
    return {
      ok: false,
      error: safeFullName.error.issues[0]?.message ?? "Enter a valid full name.",
    };
  }

  const safePassword = PASSWORD_SCHEMA.safeParse(input.password);
  if (!safePassword.success) {
    return {
      ok: false,
      error: safePassword.error.issues[0]?.message ?? "Choose a stronger password.",
    };
  }

  if (input.confirmPassword !== undefined && input.confirmPassword !== safePassword.data) {
    return { ok: false, error: "Passwords do not match." };
  }

  return {
    ok: true,
    credentials: {
      email: safeEmail.data,
      fullName: safeFullName.data,
      password: safePassword.data,
    },
  };
}

export function validateEmailForSignIn(input: string) {
  const safeEmail = EMAIL_SCHEMA.safeParse(input);
  if (!safeEmail.success) {
    return { ok: false, error: "Invalid email or password." };
  }

  return { ok: true, email: safeEmail.data };
}

export function validatePasswordForSignIn(input: string) {
  if (!input || input.trim().length === 0) {
    return { ok: false, error: "Invalid email or password." };
  }

  return { ok: true, password: input };
}

export function isSafeRedirectPath(input: string) {
  return input.startsWith("/") && !input.startsWith("//");
}
