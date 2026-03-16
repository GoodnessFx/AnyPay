import { motion } from "motion/react";
import { Eye, EyeOff, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "./AuthWrapper";
import { useApi } from "../hooks/useApi";

interface Balance {
  currency: string;
  amount: number;
  usdValue: number;
  change24h?: number;
}

export function WalletBalance() {
  const [isVisible, setIsVisible] = useState(true);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { getWallet } = useApi();

  useEffect(() => {
    const fetchWallet = async () => {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await getWallet(user.id);
      
      if (data && data.wallet) {
        // Convert wallet balances to display format
        const walletBalances = Object.entries(data.wallet.balances).map(([currency, amount]) => ({
          currency,
          amount: amount as number,
          usdValue: (amount as number) * (currency === 'USD' ? 1 : 
                   currency === 'BTC' ? 45000 :
                   currency === 'ETH' ? 1800 :
                   currency === 'USDT' ? 1 :
                   currency === 'NGN' ? 0.0022 : 1),
        }));

        setBalances(walletBalances);
      } else {
        console.log("Wallet fetch error:", error);
        setBalances([]);
      }
      setLoading(false);
    };

    fetchWallet();
  }, [user, getWallet]);
  
  const totalUsdValue = balances.reduce((sum, balance) => sum + balance.usdValue, 0);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Wallet Balance</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button size="sm" className="bg-blue-800 hover:bg-blue-900">
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Total Balance</p>
          <p className="text-3xl font-bold text-gray-900">
            {isVisible ? `$${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••"}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div>
                    <div className="w-12 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {balances.map((balance, index) => (
            <motion.div
              key={balance.currency}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-800 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{balance.currency.slice(0, 2)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{balance.currency}</p>
                  <p className="text-sm text-gray-500">
                    {isVisible ? balance.amount.toLocaleString() : "••••"}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {isVisible ? `$${balance.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••"}
                </p>
                {typeof balance.change24h === "number" && (
                  <Badge
                    variant={balance.change24h >= 0 ? "default" : "destructive"}
                    className={`text-xs ${balance.change24h >= 0 ? "bg-green-100 text-green-800" : ""}`}
                  >
                    {balance.change24h >= 0 ? "+" : ""}{balance.change24h.toFixed(2)}%
                  </Badge>
                )}
              </div>
            </motion.div>
            ))}
          </div>
        )}

        {!loading && balances.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-gray-600">No wallet data yet.</p>
            <p className="text-xs text-gray-500 mt-1">Add funds to get started.</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}