-- Migration: Create credits table for tracking user credit balances
-- Description: Creates the credits table to manage user credit balances and statistics

-- Create credits table
CREATE TABLE IF NOT EXISTS credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_balance INTEGER DEFAULT 0 CHECK (current_balance >= 0),
    total_purchased INTEGER DEFAULT 0 CHECK (total_purchased >= 0),
    total_consumed INTEGER DEFAULT 0 CHECK (total_consumed >= 0),
    balance_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_current_balance ON credits(current_balance);
CREATE INDEX IF NOT EXISTS idx_credits_balance_updated_at ON credits(balance_updated_at);

-- Create trigger to automatically update updated_at and balance_updated_at on row updates
CREATE TRIGGER update_credits_updated_at 
    BEFORE UPDATE ON credits
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update balance_updated_at when balance changes
CREATE OR REPLACE FUNCTION update_balance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.current_balance != NEW.current_balance THEN
        NEW.balance_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update balance_updated_at when current_balance changes
CREATE TRIGGER update_credits_balance_updated_at 
    BEFORE UPDATE ON credits
    FOR EACH ROW 
    EXECUTE FUNCTION update_balance_updated_at();

-- Add comments for documentation
COMMENT ON TABLE credits IS 'User credit balances and statistics tracking';
COMMENT ON COLUMN credits.id IS 'Unique credit record identifier (UUID)';
COMMENT ON COLUMN credits.user_id IS 'Foreign key reference to users table';
COMMENT ON COLUMN credits.current_balance IS 'Current available credit balance';
COMMENT ON COLUMN credits.total_purchased IS 'Total credits purchased by user';
COMMENT ON COLUMN credits.total_consumed IS 'Total credits consumed by user';
COMMENT ON COLUMN credits.balance_updated_at IS 'Timestamp when balance was last modified';
COMMENT ON COLUMN credits.created_at IS 'Timestamp when credit record was created';
COMMENT ON COLUMN credits.updated_at IS 'Timestamp when record was last updated';