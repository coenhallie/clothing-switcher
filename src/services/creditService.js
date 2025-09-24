import {
  supabase,
  TABLES,
  TRANSACTION_TYPES,
  isSupabaseConfigured,
} from './supabaseClient.js';
import authService from './authService.js';

class CreditService {
  constructor() {
    this.creditPackages = [
      { credits: 5, price: 4.99, pricePerCredit: 0.998 },
      { credits: 10, price: 8.99, pricePerCredit: 0.899 },
      { credits: 25, price: 19.99, pricePerCredit: 0.8 },
      { credits: 50, price: 34.99, pricePerCredit: 0.7 },
      { credits: 100, price: 59.99, pricePerCredit: 0.6 },
    ];
  }

  /**
   * Get available credit packages
   */
  getCreditPackages() {
    return this.creditPackages;
  }

  /**
   * Get user's current credit balance
   */
  async getCreditBalance() {
    const user = authService.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.CREDITS)
        .select('current_balance')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return {
        success: true,
        credits: data.current_balance || 0,
      };
    } catch (error) {
      console.error('Get credit balance error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Use credits for image generation
   */
  async useCredits(amount = 1, description = 'Image generation') {
    const user = authService.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Check current balance
      const { data: creditData, error: creditError } = await supabase
        .from(TABLES.CREDITS)
        .select('current_balance')
        .eq('user_id', user.id)
        .single();

      if (creditError) throw creditError;

      if (creditData.current_balance < amount) {
        return {
          success: false,
          error: 'Insufficient credits',
          currentCredits: creditData.current_balance,
          requiredCredits: amount,
        };
      }

      // Record transaction (this will automatically update the balance via trigger)
      const { error: transactionError } = await supabase
        .from(TABLES.CREDIT_TRANSACTIONS)
        .insert({
          user_id: user.id,
          transaction_type: TRANSACTION_TYPES.CONSUMED,
          credit_amount: -amount, // Negative for consumption
          transaction_description: description,
        });

      if (transactionError) throw transactionError;

      const newBalance = creditData.current_balance - amount;

      // Update local profile
      const profile_data = authService.getProfile();
      if (profile_data) {
        profile_data.credits = newBalance;
      }

      return {
        success: true,
        creditsUsed: amount,
        newBalance,
        message: `${amount} credit${amount > 1 ? 's' : ''} used successfully`,
      };
    } catch (error) {
      console.error('Use credits error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Add credits to user account (for purchases or bonuses)
   */
  async addCredits(
    amount,
    type = TRANSACTION_TYPES.PURCHASED,
    description = '',
    metadata = {}
  ) {
    const user = authService.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Get current balance
      const { data: creditData, error: creditError } = await supabase
        .from(TABLES.CREDITS)
        .select('current_balance')
        .eq('user_id', user.id)
        .single();

      if (creditError) throw creditError;

      // Record transaction (this will automatically update the balance via trigger)
      const { error: transactionError } = await supabase
        .from(TABLES.CREDIT_TRANSACTIONS)
        .insert({
          user_id: user.id,
          transaction_type: type,
          credit_amount: amount,
          transaction_description: description,
          reference_id: metadata.paymentIntentId || null,
          metadata: metadata,
        });

      if (transactionError) throw transactionError;

      const newBalance = creditData.current_balance + amount;

      // Update local profile
      const profile_data = authService.getProfile();
      if (profile_data) {
        profile_data.credits = newBalance;
      }

      return {
        success: true,
        creditsAdded: amount,
        newBalance,
        message: `${amount} credit${amount > 1 ? 's' : ''} added successfully`,
      };
    } catch (error) {
      console.error('Add credits error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user's credit transaction history
   */
  async getTransactionHistory(limit = 50, offset = 0) {
    const user = authService.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.CREDIT_TRANSACTIONS)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        transactions: data || [],
      };
    } catch (error) {
      console.error('Get transaction history error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if user has sufficient credits
   */
  async hasCredits(amount = 1) {
    const balance = await this.getCreditBalance();
    if (!balance.success) return false;

    return balance.credits >= amount;
  }

  /**
   * Get credit package by credits amount
   */
  getCreditPackage(credits) {
    return this.creditPackages.find((pkg) => pkg.credits === credits);
  }

  /**
   * Calculate total price for credits
   */
  calculatePrice(credits) {
    const package_data = this.getCreditPackage(credits);
    return package_data ? package_data.price : null;
  }

  /**
   * Subscribe to credit balance changes
   */
  subscribeToCredits(callback) {
    const user = authService.getUser();
    if (!user) return null;

    return supabase
      .channel('credit-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.PROFILES,
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          callback(payload.new?.credits || 0);
        }
      )
      .subscribe();
  }

  /**
   * Subscribe to transaction changes
   */
  subscribeToTransactions(callback) {
    const user = authService.getUser();
    if (!user) return null;

    return supabase
      .channel('transaction-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.CREDIT_TRANSACTIONS,
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  }
}

export default new CreditService();
