import {
  supabase,
  Subscription,
  PaymentTransaction,
} from "@/integrations/supabase/client";

/**
 * Subscription Service
 * Handles all subscription-related operations with the database
 */
export const subscriptionService = {
  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        // Handle missing table gracefully (migration not applied yet)
        if (
          error.code === "42P01" ||
          error.message?.includes("does not exist")
        ) {
          console.warn(
            "⚠️ Subscriptions table does not exist. Please apply the database migration. See MIGRATION_INSTRUCTIONS.md",
          );
          return null;
        }

        if (error.code === "PGRST116") {
          // No subscription found - user is on free plan
          return null;
        }
        console.error("Error fetching subscription:", error);
        throw error;
      }

      return data;
    } catch (error: any) {
      // Catch network or unexpected errors
      if (
        error?.code === "42P01" ||
        error?.message?.includes("does not exist")
      ) {
        console.warn(
          "⚠️ Subscriptions table does not exist. Please apply the database migration.",
        );
        return null;
      }
      throw error;
    }
  },

  /**
   * Check if user has active Pro subscription
   */
  async isUserPro(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);

      if (!subscription) return false;

      return (
        subscription.status === "active" &&
        subscription.plan_type === "pro" &&
        (!subscription.current_period_end ||
          new Date(subscription.current_period_end) > new Date())
      );
    } catch (error: any) {
      // Gracefully handle missing table error
      if (
        error?.code === "42P01" ||
        error?.message?.includes("does not exist")
      ) {
        return false;
      }
      console.error("Error checking Pro status:", error);
      return false;
    }
  },

  /**
   * Create or update subscription
   */
  async upsertSubscription(
    userId: string,
    subscriptionData: Partial<Subscription>,
  ): Promise<Subscription> {
    const { data, error } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        ...subscriptionData,
      })
      .select()
      .single();

    if (error) {
      console.error("Error upserting subscription:", error);
      throw error;
    }

    return data;
  },

  /**
   * Cancel subscription (mark for cancellation at period end)
   */
  async cancelSubscription(userId: string): Promise<void> {
    const { error } = await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        cancelled_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }
  },

  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(userId: string): Promise<void> {
    const { error } = await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: false,
        cancelled_at: null,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Error reactivating subscription:", error);
      throw error;
    }
  },

  /**
   * Update AutoPay setting
   */
  async updateAutoPay(userId: string, autoPay: boolean): Promise<void> {
    const { error } = await supabase
      .from("subscriptions")
      .update({ auto_pay: autoPay })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating AutoPay:", error);
      throw error;
    }
  },

  /**
   * Get user's payment transactions
   */
  async getPaymentTransactions(
    userId: string,
    limit: number = 50,
  ): Promise<PaymentTransaction[]> {
    const { data, error } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Create payment transaction record
   */
  async createTransaction(
    transactionData: Omit<
      PaymentTransaction,
      "id" | "created_at" | "updated_at"
    >,
  ): Promise<PaymentTransaction> {
    const { data, error } = await supabase
      .from("payment_transactions")
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }

    return data;
  },

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: PaymentTransaction["status"],
    gatewayResponse?: Record<string, any>,
  ): Promise<void> {
    const updateData: any = { status };
    if (gatewayResponse) {
      updateData.gateway_response = gatewayResponse;
    }

    const { error } = await supabase
      .from("payment_transactions")
      .update(updateData)
      .eq("id", transactionId);

    if (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },

  /**
   * Upgrade user to Pro
   */
  async upgradeToPro(
    userId: string,
    billingCycle: "monthly" | "yearly",
    transactionId: string,
  ): Promise<Subscription> {
    const now = new Date();
    const periodEnd = new Date(now);

    // Calculate period end based on billing cycle
    if (billingCycle === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    return await this.upsertSubscription(userId, {
      plan_type: "pro",
      billing_cycle: billingCycle,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      payment_method: "UPI",
    });
  },
};
