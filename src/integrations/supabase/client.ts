import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Type definitions for database tables
export type Subscription = {
  id: string;
  user_id: string;
  plan_type: "free" | "pro";
  billing_cycle: "monthly" | "yearly" | null;
  status: "active" | "cancelled" | "paused" | "expired" | "trial";
  auto_pay: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  payment_method: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentTransaction = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded" | "cancelled";
  payment_method: string | null;
  transaction_id: string | null;
  gateway_response: Record<string, any> | null;
  invoice_url: string | null;
  invoice_number: string | null;
  description: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};
