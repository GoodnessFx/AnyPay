import { useState, useCallback } from "react";
import { useAuth } from "../components/AuthWrapper";
import {
  mockCreateTransaction,
  mockGetStats,
  mockGetTransactions,
  mockGetWallet,
  mockRoute,
  mockTopUpWallet,
  mockWithdrawWallet,
} from "../mocks/mockBackend";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useApi() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Wallet operations (pure mock, no Supabase/network)
  const getWallet = useCallback(async (userId: string) => {
    try {
      const wallet = mockGetWallet(userId);
      return { data: { wallet }, error: null, loading: false };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : "Failed to load wallet",
        loading: false,
      };
    }
  }, []);

  const topUpWallet = useCallback(
    async (userId: string, payload: { currency: string; amount: number }) => {
      try {
        const wallet = mockTopUpWallet(userId, payload.currency, payload.amount);
        return { data: { wallet }, error: null, loading: false };
      } catch (e) {
        return {
          data: null,
          error: e instanceof Error ? e.message : "Top up failed",
          loading: false,
        };
      }
    },
    []
  );

  const withdrawWallet = useCallback(
    async (userId: string, payload: { currency: string; amount: number }) => {
      try {
        const wallet = mockWithdrawWallet(userId, payload.currency, payload.amount);
        return { data: { wallet }, error: null, loading: false };
      } catch (e) {
        return {
          data: null,
          error: e instanceof Error ? e.message : "Withdraw failed",
          loading: false,
        };
      }
    },
    []
  );

  // Transaction operations
  const createTransaction = useCallback(async (transactionData: any) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      const tx = mockCreateTransaction({ ...transactionData, userId: user.id });
      return { data: { transaction: tx }, error: null, loading: false };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : "Create transaction failed",
        loading: false,
      };
    }
  }, [user]);

  const getTransactions = useCallback(async (userId: string) => {
    try {
      const transactions = mockGetTransactions(userId);
      return { data: { transactions }, error: null, loading: false };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : "Failed to load transactions",
        loading: false,
      };
    }
  }, []);

  // Route calculation
  const calculateRoute = useCallback(async (routeData: any) => {
    try {
      const route = mockRoute(routeData.fromCurrency, routeData.toCurrency, routeData.amount);
      return { data: { route }, error: null, loading: false };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : "Route calculation failed",
        loading: false,
      };
    }
  }, []);

  // Platform stats
  const getStats = useCallback(async () => {
    try {
      const stats = mockGetStats();
      return { data: { stats }, error: null, loading: false };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : "Failed to load stats",
        loading: false,
      };
    }
  }, []);

  const apiCall = useCallback(
    async <T,>(): Promise<ApiResponse<T>> => {
      // Kept for compatibility; never calls network now.
      setLoading(true);
      try {
        return { data: null, error: "Remote API disabled in mock-only mode", loading: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    getWallet,
    topUpWallet,
    withdrawWallet,
    createTransaction,
    getTransactions,
    calculateRoute,
    getStats,
    apiCall,
  };
}