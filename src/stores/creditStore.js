import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import creditService from '../services/creditService.js';
import { useAuthStore } from './authStore.js';

export const useCreditStore = defineStore('credit', () => {
  // State
  const credits = ref(0);
  const transactions = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const creditSubscription = ref(null);
  const transactionSubscription = ref(null);

  // Getters
  const creditPackages = computed(() => creditService.getCreditPackages());
  const hasCredits = computed(() => credits.value > 0);
  const canGenerate = computed(() => credits.value >= 1);

  // Actions
  const setLoading = (loading) => {
    isLoading.value = loading;
  };

  const setError = (errorMessage) => {
    error.value = errorMessage;
  };

  const clearError = () => {
    error.value = null;
  };

  const setCredits = (amount) => {
    credits.value = amount;
  };

  const setTransactions = (transactionList) => {
    transactions.value = transactionList;
  };

  const addTransaction = (transaction) => {
    transactions.value.unshift(transaction);
  };

  const loadCredits = async () => {
    setLoading(true);
    clearError();

    try {
      const result = await creditService.getCreditBalance();

      if (result.success) {
        setCredits(result.credits);
        return {
          success: true,
          credits: result.credits,
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load credits';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const useCredit = async (amount = 1, description = 'Image generation') => {
    setLoading(true);
    clearError();

    try {
      const result = await creditService.useCredits(amount, description);

      if (result.success) {
        setCredits(result.newBalance);

        // Refresh transactions to show the new usage
        await loadTransactions();

        return {
          success: true,
          creditsUsed: result.creditsUsed,
          newBalance: result.newBalance,
          message: result.message,
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
          currentCredits: result.currentCredits,
          requiredCredits: result.requiredCredits,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to use credits';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const addCredits = async (
    amount,
    type = 'purchased',
    description = '',
    metadata = {}
  ) => {
    setLoading(true);
    clearError();

    try {
      const result = await creditService.addCredits(
        amount,
        type,
        description,
        metadata
      );

      if (result.success) {
        setCredits(result.newBalance);

        // Refresh transactions to show the new purchase
        await loadTransactions();

        return {
          success: true,
          creditsAdded: result.creditsAdded,
          newBalance: result.newBalance,
          message: result.message,
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to add credits';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (limit = 50, offset = 0) => {
    try {
      const result = await creditService.getTransactionHistory(limit, offset);

      if (result.success) {
        if (offset === 0) {
          setTransactions(result.transactions);
        } else {
          // Append to existing transactions for pagination
          transactions.value.push(...result.transactions);
        }
        return {
          success: true,
          transactions: result.transactions,
        };
      } else {
        setError(result.error);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load transactions';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const checkCredits = async (amount = 1) => {
    try {
      return await creditService.hasCredits(amount);
    } catch (err) {
      console.error('Failed to check credits:', err);
      return false;
    }
  };

  const getCreditPackage = (creditAmount) => {
    return creditService.getCreditPackage(creditAmount);
  };

  const calculatePrice = (creditAmount) => {
    return creditService.calculatePrice(creditAmount);
  };

  const subscribeToCreditChanges = async () => {
    if (creditSubscription.value) {
      creditSubscription.value.unsubscribe();
    }

    creditSubscription.value = await creditService.subscribeToCredits(
      (newCredits) => {
        setCredits(newCredits);
      }
    );
  };

  const subscribeToTransactionChanges = async () => {
    if (transactionSubscription.value) {
      transactionSubscription.value.unsubscribe();
    }

    transactionSubscription.value = await creditService.subscribeToTransactions(
      (newTransaction) => {
        addTransaction(newTransaction);
      }
    );
  };

  const unsubscribeFromChanges = () => {
    if (creditSubscription.value) {
      creditSubscription.value.unsubscribe();
      creditSubscription.value = null;
    }

    if (transactionSubscription.value) {
      transactionSubscription.value.unsubscribe();
      transactionSubscription.value = null;
    }
  };

  const initializeSubscriptions = async () => {
    const authStore = useAuthStore();

    if (authStore.isAuthenticated) {
      await subscribeToCreditChanges();
      await subscribeToTransactionChanges();
    }
  };

  const refreshData = async () => {
    await Promise.all([loadCredits(), loadTransactions()]);
  };

  const reset = () => {
    setCredits(0);
    setTransactions([]);
    clearError();
    unsubscribeFromChanges();
  };

  return {
    // State
    credits,
    transactions,
    isLoading,
    error,

    // Getters
    creditPackages,
    hasCredits,
    canGenerate,

    // Actions
    setLoading,
    setError,
    clearError,
    setCredits,
    setTransactions,
    addTransaction,
    loadCredits,
    useCredit,
    addCredits,
    loadTransactions,
    checkCredits,
    getCreditPackage,
    calculatePrice,
    subscribeToCreditChanges,
    subscribeToTransactionChanges,
    unsubscribeFromChanges,
    initializeSubscriptions,
    refreshData,
    reset,
  };
});
