-- Production Readiness: Subscription & Payment Tables
-- Run this migration after the base schema

-- 1. ADD IS_PRO COLUMN TO PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_since TIMESTAMPTZ;

-- 2. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro')),
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'paused', 'expired', 'trial')),
    auto_pay BOOLEAN DEFAULT FALSE,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    payment_method TEXT,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id) -- One active subscription per user
);

-- Index for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- 3. PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    payment_method TEXT,
    transaction_id TEXT UNIQUE, -- Gateway transaction ID
    gateway_response JSONB, -- Store full gateway response
    invoice_url TEXT,
    invoice_number TEXT,
    description TEXT,
    metadata JSONB, -- Additional data like billing address, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payment transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON public.payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id ON public.payment_transactions(transaction_id);

-- Enable RLS for payment transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
    ON public.payment_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- 4. API RATE LIMITING TABLE
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, endpoint)
);

-- Index for rate limits
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.api_rate_limits(window_start);

-- Enable RLS for rate limits
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
    ON public.api_rate_limits FOR SELECT
    USING (auth.uid() = user_id);

-- 5. TRIGGERS FOR UPDATED_AT
CREATE TRIGGER update_subscriptions_modtime 
    BEFORE UPDATE ON public.subscriptions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_transactions_modtime 
    BEFORE UPDATE ON public.payment_transactions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. FUNCTION TO CHECK PRO STATUS
CREATE OR REPLACE FUNCTION public.is_user_pro(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = check_user_id
        AND status = 'active'
        AND plan_type = 'pro'
        AND (current_period_end IS NULL OR current_period_end > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNCTION TO SYNC PROFILE IS_PRO STATUS
CREATE OR REPLACE FUNCTION public.sync_profile_pro_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET 
        is_pro = public.is_user_pro(NEW.user_id),
        pro_since = CASE 
            WHEN public.is_user_pro(NEW.user_id) AND pro_since IS NULL 
            THEN NOW() 
            ELSE pro_since 
        END
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update profile when subscription changes
CREATE TRIGGER sync_profile_on_subscription_change
    AFTER INSERT OR UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE PROCEDURE public.sync_profile_pro_status();

-- 8. GRANT PERMISSIONS (if needed)
-- GRANT SELECT ON public.subscriptions TO authenticated;
-- GRANT SELECT ON public.payment_transactions TO authenticated;

COMMENT ON TABLE public.subscriptions IS 'User subscription plans and billing information';
COMMENT ON TABLE public.payment_transactions IS 'Payment transaction history and invoices';
COMMENT ON TABLE public.api_rate_limits IS 'API rate limiting per user per endpoint';
