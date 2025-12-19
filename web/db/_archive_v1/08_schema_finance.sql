-- =============================================================================
-- 08_SCHEMA_FINANCE.SQL
-- =============================================================================
-- Financial management: expenses and loyalty programs.
-- =============================================================================

-- =============================================================================
-- A. EXPENSES
-- =============================================================================
-- Track clinic operational expenses.

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id TEXT NOT NULL REFERENCES tenants(id),

    -- Expense Details
    category TEXT NOT NULL CHECK (category IN (
        'rent', 'utilities', 'supplies', 'payroll', 'marketing', 'software', 'other'
    )),
    amount NUMERIC(12,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Proof
    proof_url TEXT,                         -- Receipt image

    -- Audit
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- B. LOYALTY POINTS (Balance)
-- =============================================================================
-- Current loyalty points balance per user.

CREATE TABLE IF NOT EXISTS loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Balance
    points INTEGER NOT NULL DEFAULT 0,

    -- Metadata
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One balance per user
    UNIQUE(user_id)
);

-- =============================================================================
-- C. LOYALTY TRANSACTIONS (Ledger)
-- =============================================================================
-- Immutable log of all points earned/spent.

CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id TEXT REFERENCES tenants(id),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,

    -- Transaction
    points INTEGER NOT NULL,                -- Positive = earn, Negative = spend
    description TEXT,                       -- e.g., 'Vaccine Reward', 'Redeemed for Shampoo'

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- SCHEMA FINANCE COMPLETE
-- =============================================================================
