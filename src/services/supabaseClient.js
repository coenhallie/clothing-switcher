import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your-supabase-url' &&
  supabaseAnonKey !== 'your-supabase-anon-key' &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseUrl !== 'not-configured' &&
  supabaseAnonKey !== 'not-configured' &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co');

// Create a mock client for development when not configured
const createMockClient = () => ({
  auth: {
    signUp: () =>
      Promise.resolve({
        data: null,
        error: {
          message:
            'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
        },
      }),
    signInWithPassword: () =>
      Promise.resolve({
        data: null,
        error: {
          message:
            'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
        },
      }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    resetPasswordForEmail: () =>
      Promise.resolve({
        error: {
          message:
            'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
        },
      }),
    updateUser: () =>
      Promise.resolve({
        error: {
          message:
            'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
        },
      }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () =>
          Promise.resolve({
            data: null,
            error: {
              message:
                'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
            },
          }),
        range: () =>
          Promise.resolve({
            data: [],
            error: {
              message:
                'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
            },
          }),
      }),
      order: () => ({
        range: () =>
          Promise.resolve({
            data: [],
            error: {
              message:
                'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
            },
          }),
      }),
    }),
    insert: () => ({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: null,
            error: {
              message:
                'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
            },
          }),
      }),
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: null,
              error: {
                message:
                  'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.',
              },
            }),
        }),
      }),
    }),
  }),
  channel: () => ({
    on: () => ({
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
  }),
});

// Create the Supabase client or mock client
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
      global: {
        headers: {
          'X-Client-Info': 'supabase-js-web',
        },
      },
    })
  : createMockClient();

// Export configuration status
export const isSupabaseConfigured = isConfigured;

// Log configuration status for debugging
if (!isConfigured) {
  console.warn(
    '⚠️ Supabase not configured. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. See SETUP_GUIDE.md for instructions.'
  );
}

// Database table names
export const TABLES = {
  CREDITS: 'credits',
  CREDIT_TRANSACTIONS: 'credit_transactions',
  GALLERY_IMAGES: 'gallery_images',
};

// Credit transaction types (matching the enum in database)
export const TRANSACTION_TYPES = {
  EARNED: 'earned',
  PURCHASED: 'purchased',
  CONSUMED: 'consumed',
  REFUNDED: 'refunded',
  EXPIRED: 'expired',
};

// Image generation statuses
export const GENERATION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};
