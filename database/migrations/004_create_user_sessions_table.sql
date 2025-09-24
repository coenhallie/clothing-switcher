-- Migration: Create user_sessions table for session management
-- Description: Creates the user_sessions table for secure session tracking

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(session_token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active ON user_sessions(user_id, is_active);

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR is_active = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Create function to update last_accessed_at on session use
CREATE OR REPLACE FUNCTION update_session_access()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_accessed_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update last_accessed_at when session is updated
CREATE TRIGGER update_session_last_accessed 
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW 
    EXECUTE FUNCTION update_session_access();

-- Add comments for documentation
COMMENT ON TABLE user_sessions IS 'User session management for secure authentication';
COMMENT ON COLUMN user_sessions.id IS 'Unique session identifier (UUID)';
COMMENT ON COLUMN user_sessions.user_id IS 'Foreign key reference to users table';
COMMENT ON COLUMN user_sessions.session_token_hash IS 'Hashed session token for security';
COMMENT ON COLUMN user_sessions.ip_address IS 'IP address where session was created';
COMMENT ON COLUMN user_sessions.user_agent IS 'Browser/client user agent string';
COMMENT ON COLUMN user_sessions.created_at IS 'Timestamp when session was created';
COMMENT ON COLUMN user_sessions.expires_at IS 'Timestamp when session expires';
COMMENT ON COLUMN user_sessions.last_accessed_at IS 'Timestamp when session was last used';
COMMENT ON COLUMN user_sessions.is_active IS 'Whether session is currently active';