/**
 * Database types mirroring the Supabase schema in /supabase/migrations.
 * Hand-maintained. Regenerate with `supabase gen types typescript` once the
 * project is linked to a real Supabase instance.
 */

export type ProcessingStatus = "pending" | "processing" | "ready" | "failed";
export type JobStatus = "queued" | "processing" | "succeeded" | "failed";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "free";
export type MemberRole = "owner" | "admin" | "editor" | "viewer";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan_status: string;
  preferred_locale: string;
  ai_credits: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  role_map: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
}

export interface Asset {
  id: string;
  user_id: string;
  workspace_id: string | null;
  file_url: string | null;
  file_path: string;
  file_type: string;
  original_filename: string;
  processing_status: ProcessingStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AIJob {
  id: string;
  user_id: string;
  workspace_id: string | null;
  asset_id: string | null;
  action: string;
  provider: string;
  status: JobStatus;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown> | null;
  error_message: string | null;
  credit_cost: number;
  created_at: string;
  updated_at: string;
}

export interface AICreditTransaction {
  id: string;
  user_id: string;
  workspace_id: string | null;
  amount: number;
  module: string;
  description: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  paddle_customer_id: string | null;
  paddle_subscription_id: string | null;
  status: SubscriptionStatus;
  plan_name: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string | null;
  amount: number;
  currency: string;
  status: string;
  gateway_ref: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
}

export interface BrandKit {
  id: string;
  workspace_id: string;
  name: string;
  logo_url: string | null;
  brand_colors: string[];
  brand_fonts: string[];
  brand_voice: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRequest {
  id: string;
  workspace_id: string;
  asset_id: string | null;
  requested_by: string;
  status: ApprovalStatus;
  reviewer_id: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface ErrorLog {
  id: string;
  user_id: string | null;
  scope: string;
  message: string;
  context: Record<string, unknown> | null;
  created_at: string;
}
