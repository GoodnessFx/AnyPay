import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS and logging
app.use('*', cors({ origin: '*' }));
app.use('*', logger(console.log));

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Health check
app.get('/make-server-ed0cf80c/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User authentication routes
app.post('/make-server-ed0cf80c/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user wallet with default balances
    await kv.set(`wallet:${data.user.id}`, JSON.stringify({
      balances: {
        USD: 0,
        BTC: 0,
        ETH: 0,
        USDT: 0,
        NGN: 0
      },
      createdAt: new Date().toISOString()
    }));

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup server error: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Get user wallet
app.get('/make-server-ed0cf80c/wallet/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized access to wallet' }, 401);
    }

    const walletData = await kv.get(`wallet:${userId}`);
    const wallet = walletData ? JSON.parse(walletData) : {
      balances: { USD: 0, BTC: 0, ETH: 0, USDT: 0, NGN: 0 },
      createdAt: new Date().toISOString()
    };

    return c.json({ wallet });
  } catch (error) {
    console.log(`Wallet fetch error: ${error}`);
    return c.json({ error: 'Error fetching wallet data' }, 500);
  }
});

// Create transaction
app.post('/make-server-ed0cf80c/transactions', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return c.json({ error: 'Unauthorized transaction request' }, 401);
    }

    const {
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
      provider,
      fee
    } = await c.req.json();

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction = {
      id: transactionId,
      userId: user.id,
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
      provider,
      fee,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Store transaction
    await kv.set(`transaction:${transactionId}`, JSON.stringify(transaction));
    
    // Add to user's transaction list
    const userTransactionsKey = `transactions:${user.id}`;
    const existingTransactions = await kv.get(userTransactionsKey);
    const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
    transactions.unshift(transactionId);
    await kv.set(userTransactionsKey, JSON.stringify(transactions.slice(0, 100))); // Keep last 100

    // Simulate processing delay
    setTimeout(async () => {
      try {
        const updatedTransaction = { ...transaction, status: 'completed' };
        await kv.set(`transaction:${transactionId}`, JSON.stringify(updatedTransaction));
        
        // Update wallet balances (simplified)
        const walletData = await kv.get(`wallet:${user.id}`);
        if (walletData) {
          const wallet = JSON.parse(walletData);
          if (wallet.balances[fromCurrency] >= fromAmount) {
            wallet.balances[fromCurrency] -= fromAmount;
            wallet.balances[toCurrency] = (wallet.balances[toCurrency] || 0) + toAmount;
            await kv.set(`wallet:${user.id}`, JSON.stringify(wallet));
          }
        }
      } catch (error) {
        console.log(`Transaction completion error: ${error}`);
      }
    }, 2000);

    return c.json({ transaction });
  } catch (error) {
    console.log(`Transaction creation error: ${error}`);
    return c.json({ error: 'Error creating transaction' }, 500);
  }
});

// Get user transactions
app.get('/make-server-ed0cf80c/transactions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized access to transactions' }, 401);
    }

    const transactionIds = await kv.get(`transactions:${userId}`);
    if (!transactionIds) {
      return c.json({ transactions: [] });
    }

    const ids = JSON.parse(transactionIds);
    const transactions = [];
    
    for (const id of ids.slice(0, 10)) { // Get last 10 transactions
      const transactionData = await kv.get(`transaction:${id}`);
      if (transactionData) {
        transactions.push(JSON.parse(transactionData));
      }
    }

    return c.json({ transactions });
  } catch (error) {
    console.log(`Transactions fetch error: ${error}`);
    return c.json({ error: 'Error fetching transactions' }, 500);
  }
});

// Get optimal route for conversion
app.post('/make-server-ed0cf80c/route', async (c) => {
  try {
    const { fromCurrency, toCurrency, amount } = await c.req.json();
    
    // Mock routing logic - in production this would query multiple liquidity providers
    const mockRates: Record<string, Record<string, number>> = {
      USD: { NGN: 45000, KES: 130, GHS: 12 },
      BTC: { USD: 45000, ETH: 26.5 },
      ETH: { USD: 1800, USDT: 1800 },
      USDT: { USD: 1, NGN: 45000 }
    };

    const rate = mockRates[fromCurrency]?.[toCurrency] || 1;
    const fee = Math.max(0.25, amount * 0.001); // 0.1% fee, minimum $0.25
    const outputAmount = amount * rate;
    
    const route = {
      fromCurrency,
      toCurrency,
      fromAmount: amount,
      toAmount: outputAmount,
      rate,
      fee,
      provider: 'Lightning Network',
      estimatedTime: '< 30 seconds',
      confidence: 0.98
    };

    return c.json({ route });
  } catch (error) {
    console.log(`Route calculation error: ${error}`);
    return c.json({ error: 'Error calculating optimal route' }, 500);
  }
});

// Get platform statistics
app.get('/make-server-ed0cf80c/stats', async (c) => {
  try {
    // In production, these would be calculated from real transaction data
    const stats = {
      totalVolume24h: 2400000,
      activeUsers: 45230,
      countriesSupported: 127,
      averageSettlementTime: 28,
      totalTransactions: await kv.get('total_transactions') || '0',
      lastUpdated: new Date().toISOString()
    };

    return c.json({ stats });
  } catch (error) {
    console.log(`Stats fetch error: ${error}`);
    return c.json({ error: 'Error fetching platform statistics' }, 500);
  }
});

Deno.serve(app.fetch);