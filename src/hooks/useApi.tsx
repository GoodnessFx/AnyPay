import { useState, useCallback } from "react";
import { functionsPrefix, publicAnonKey, supabaseUrl } from "../utils/supabase/info";
import { useAuth } from "../components/AuthWrapper";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useApi() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const apiCall = useCallback(
    async function apiCallGeneric<T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
      setLoading(true);
      
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || publicAnonKey}`,
          ...options.headers,
        };

        const response = await fetch(
          `${supabaseUrl}/functions/v1/${functionsPrefix}${endpoint}`,
          {
            ...options,
            headers,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return {
            data: null,
            error: data.error || `HTTP ${response.status}: ${response.statusText}`,
            loading: false
          };
        }

        return {
          data,
          error: null,
          loading: false
        };
      } catch (error) {
        console.log(`API call error for ${endpoint}:`, error);
        return {
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          loading: false
        };
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  // Wallet operations
  const getWallet = useCallback(async (userId: string) => {
    return apiCall<{ wallet: { balances: Record<string, number> } }>(`/wallet/${userId}`);
  }, [apiCall]);

  const topUpWallet = useCallback(async (userId: string, payload: { currency: string; amount: number }) => {
    return apiCall<{ wallet: { balances: Record<string, number> } }>(`/wallet/${userId}/topup`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }, [apiCall]);

  const withdrawWallet = useCallback(async (userId: string, payload: { currency: string; amount: number }) => {
    return apiCall<{ wallet: { balances: Record<string, number> } }>(`/wallet/${userId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }, [apiCall]);

  // Transaction operations
  const createTransaction = useCallback(async (transactionData: any) => {
    return apiCall<{ transaction: any }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }, [apiCall]);

  const getTransactions = useCallback(async (userId: string) => {
    return apiCall<{ transactions: any[] }>(`/transactions/${userId}`);
  }, [apiCall]);

  // Route calculation
  const calculateRoute = useCallback(async (routeData: any) => {
    return apiCall<{ route: any }>('/route', {
      method: 'POST',
      body: JSON.stringify(routeData)
    });
  }, [apiCall]);

  // Platform stats
  const getStats = useCallback(async () => {
    return apiCall<{ stats: any }>('/stats');
  }, [apiCall]);

  return {
    loading,
    getWallet,
    topUpWallet,
    withdrawWallet,
    createTransaction,
    getTransactions,
    calculateRoute,
    getStats,
    apiCall
  };
}