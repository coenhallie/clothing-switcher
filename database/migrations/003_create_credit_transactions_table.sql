-- Migration: Create credit_transactions table for audit trail
-- Description: Creates the credit_transactions table to log all credit-related activities

-- Create enum for transaction types
CREATE TYPE transaction_type AS ENUM ('earned', 'purchased', 'consumed', 'refunded', 'expired');

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type transaction_type NOT NULL,
    credit_amount INTEGER NOT NULL CHECK (credit_amount != 0),
    transaction_description TEXT,
    reference_id VARCHAR(255), -- For purchase references, order IDs, etc.
    metadata JSONB, -- Additional transaction metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_reference_id ON credit_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_type ON credit_transactions(user_id, transaction_type);

-- Create function to update credit balance after transaction
CREATE OR REPLACE FUNCTION update_credit_balance_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the credits table based on transaction type
    IF NEW.transaction_type IN ('earned', 'purchased', 'refunded') THEN
        -- Add credits
        UPDATE credits 
        SET 
            current_balance = current_balance + NEW.credit_amount,
            total_purchased = CASE 
                WHEN NEW.transaction_type = 'purchased' THEN total_purchased + NEW.credit_amount
                ELSE total_purchased
            END,
            balance_updated_at = NOW(),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
    ELSIF NEW.transaction_type IN ('consumed', 'expired') THEN
        -- Subtract credits (credit_amount should be negative for these types)
        UPDATE credits 
        SET 
            current_balance = current_balance + NEW.credit_amount, -- credit_amount is negative
            total_consumed = total_consumed + ABS(NEW.credit_amount),
            balance_updated_at = NOW(),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update credit balance after transaction insert
CREATE TRIGGER update_balance_after_transaction 
    AFTER INSERT ON credit_transactions
    FOR EACH ROW 
    EXECUTE FUNCTION update_credit_balance_after_transaction();

-- Add comments for documentation
COMMENT ON TABLE credit_transactions IS 'Audit trail for all credit-related transactions';
COMMENT ON COLUMN credit_transactions.id IS 'Unique transaction identifier (UUID)';
COMMENT ON COLUMN credit_transactions.user_id IS 'Foreign key reference to users table';
COMMENT ON COLUMN credit_transactions.transaction_type IS 'Type of credit transaction';
COMMENT ON COLUMN credit_transactions.credit_amount IS 'Amount of credits (positive for additions, negative for subtractions)';
COMMENT ON COLUMN credit_transactions.transaction_description IS 'Human-readable description of the transaction';
COMMENT ON COLUMN credit_transactions.reference_id IS 'External reference ID (payment ID, order ID, etc.)';
COMMENT ON COLUMN credit_transactions.metadata IS 'Additional transaction metadata in JSON format';
COMMENT ON COLUMN credit_transactions.created_at IS 'Timestamp when transaction was created';
COMMENT ON COLUMN credit_transactions.processed_at IS 'Timestamp when transaction was processed';