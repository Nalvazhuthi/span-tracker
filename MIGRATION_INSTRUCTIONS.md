# Database Migration Instructions

## ⚠️ IMPORTANT: Apply This Migration

The application has been updated to use database-backed subscription management, but the database tables don't exist yet. You need to apply the migration to avoid errors.

## Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project: <https://supabase.com/dashboard/project/bfabebitozerdztvsaql>
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase/migrations/20260204_subscriptions_and_payments.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`

## Option 2: Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref bfabebitozerdztvsaql

# Apply the migration
supabase db push
```

## Option 3: Direct SQL Connection

```bash
# Using psql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.bfabebitozerdztvsaql.supabase.co:5432/postgres" -f supabase/migrations/20260204_subscriptions_and_payments.sql
```

## Verification

After applying the migration, verify the tables were created:

```sql
-- Run this in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'payment_transactions', 'api_rate_limits');
```

You should see all three tables listed.

## What This Migration Creates

- ✅ `subscriptions` table - User subscription plans and billing
- ✅ `payment_transactions` table - Payment history and invoices  
- ✅ `api_rate_limits` table - API rate limiting
- ✅ RLS policies for all tables
- ✅ Triggers for automatic `updated_at` timestamps
- ✅ Function `is_user_pro()` to check Pro status
- ✅ Auto-sync profile Pro status on subscription changes

## Temporary Workaround

The app will continue to work without the migration, but:

- Pro status will always show as `false`
- No subscription data will be stored
- Payment transactions won't be tracked

**Apply the migration as soon as possible for full functionality!**
