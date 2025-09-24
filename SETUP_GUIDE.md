# Credit System Setup Guide

This guide will help you set up the credit-based authentication and payment system for the Clothing Switcher app.

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Stripe Account**: Sign up at [stripe.com](https://stripe.com)
3. **Node.js**: Version 16 or higher

## Step 1: Supabase Setup

### 1.1 Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key from the project settings

### 1.2 Set Up Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 1,
  total_credits_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create credit transactions table
CREATE TABLE credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'bonus')),
  credits_amount INTEGER NOT NULL,
  credits_balance_after INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for credit transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Create image generations table
CREATE TABLE image_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  credits_used INTEGER DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  source_image_url TEXT,
  target_image_url TEXT,
  result_image_url TEXT,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for image generations
ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for image generations
CREATE POLICY "Users can view own generations" ON image_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" ON image_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profile changes
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

### 1.3 Configure Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your site URL (e.g., `http://localhost:5173` for development)
3. Add any additional redirect URLs you need
4. Configure email templates if desired

## Step 2: Stripe Setup

### 2.1 Create Stripe Account

1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Get your publishable and secret keys from the dashboard

### 2.2 Set Up Webhooks (for production)

1. Go to Developers > Webhooks in Stripe dashboard
2. Add endpoint: `https://your-domain.com/api/stripe-webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Note the webhook signing secret

## Step 3: Environment Configuration

### 3.1 Create Environment File

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 3.2 Update Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key

# Development
VITE_APP_ENV=development
```

## Step 4: Install Dependencies

The required dependencies are already included in package.json:

```bash
npm install
```

## Step 5: Development Server

Start the development server:

```bash
npm run dev
```

## Step 6: Testing the System

### 6.1 Test User Registration

1. Open the app in your browser
2. Click "Sign Up"
3. Create a new account
4. Check that the user receives 1 free credit
5. Verify the profile is created in Supabase

### 6.2 Test Image Generation

1. Upload two images
2. Click "Generate Try-On"
3. Verify that 1 credit is deducted
4. Check that the transaction is recorded

### 6.3 Test Credit Purchase (Mock)

1. Click "Buy Credits"
2. Select a package
3. Note: Actual Stripe integration requires server-side implementation

## Step 7: Production Deployment

### 7.1 Supabase Edge Functions (Optional)

For production, consider implementing server-side functions:

1. **Purchase Credits Function**: Handle Stripe checkout sessions
2. **Webhook Handler**: Process payment confirmations
3. **Image Generation Function**: Move OpenRouter API calls server-side

### 7.2 Environment Variables

Update your production environment variables:

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-live-key
VITE_APP_ENV=production
```

## Security Considerations

1. **API Keys**: Never expose secret keys in frontend code
2. **RLS Policies**: Ensure all database tables have proper Row Level Security
3. **Input Validation**: Validate all user inputs on both client and server
4. **Rate Limiting**: Implement rate limiting for API calls
5. **Image Storage**: Consider using Supabase Storage for uploaded images

## Troubleshooting

### Common Issues

1. **Authentication not working**: Check Supabase URL and keys
2. **Database errors**: Verify RLS policies are set up correctly
3. **Credit deduction failing**: Check user authentication and credit balance
4. **Stripe errors**: Verify publishable key and webhook configuration

### Debug Mode

Enable debug logging by setting:

```env
VITE_APP_ENV=development
```

This will show additional console logs for debugging.

## Next Steps

1. **Implement Stripe Integration**: Add server-side payment processing
2. **Add Email Notifications**: Send emails for purchases and low credits
3. **Admin Dashboard**: Create admin interface for user management
4. **Analytics**: Track usage patterns and revenue metrics
5. **Mobile App**: Consider React Native or Flutter implementation

## Support

For issues with this implementation:

1. Check the browser console for errors
2. Verify Supabase database logs
3. Test API endpoints individually
4. Review the architecture documentation in `CREDIT_SYSTEM_ARCHITECTURE.md`
