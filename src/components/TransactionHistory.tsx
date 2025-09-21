import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthWrapper";
import { useApi } from "../hooks/useApi";

interface Transaction {
  id: string;
  type: "sent" | "received";
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  fee: number;
  provider: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "tx_001",
    type: "sent",
    fromCurrency: "USD",
    toCurrency: "NGN",
    fromAmount: 100,
    toAmount: 45000,
    status: "completed",
    timestamp: "2024-01-15T14:30:00Z",
    fee: 0.25,
    provider: "Lightning Network"
  },
  {
    id: "tx_002",
    type: "received",
    fromCurrency: "BTC",
    toCurrency: "USD",
    fromAmount: 0.002,
    toAmount: 90,
    status: "pending",
    timestamp: "2024-01-15T13:15:00Z",
    fee: 0.50,
    provider: "DEX Bridge"
  },
  {
    id: "tx_003",
    type: "sent",
    fromCurrency: "ETH",
    toCurrency: "USDT",
    fromAmount: 0.05,
    toAmount: 89.50,
    status: "completed",
    timestamp: "2024-01-15T11:45:00Z",
    fee: 1.25,
    provider: "Uniswap V3"
  },
  {
    id: "tx_004",
    type: "sent",
    fromCurrency: "USD",
    toCurrency: "KES",
    fromAmount: 50,
    toAmount: 6500,
    status: "failed",
    timestamp: "2024-01-15T10:20:00Z",
    fee: 0.15,
    provider: "M-Pesa Bridge"
  }
];

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { getTransactions } = useApi();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await getTransactions(user.id);
      
      if (data && data.transactions) {
        setTransactions(data.transactions);
      } else {
        console.log("Transactions fetch error:", error);
        // Use mock data as fallback
        setTransactions(mockTransactions);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [user, getTransactions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div>
                    <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === "sent" ? "bg-red-100" : "bg-green-100"
                }`}>
                  {transaction.type === "sent" ? (
                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                  ) : (
                    <ArrowDownLeft className="w-5 h-5 text-green-600" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {transaction.fromAmount} {transaction.fromCurrency}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-gray-900">
                      {transaction.toAmount.toLocaleString()} {transaction.toCurrency}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">{transaction.provider}</p>
                    <span className="text-gray-300">•</span>
                    <p className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Fee: ${transaction.fee}</p>
                </div>
                
                <Badge className={getStatusColor(transaction.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(transaction.status)}
                    <span className="capitalize">{transaction.status}</span>
                  </div>
                </Badge>
              </div>
            </motion.div>
            ))}
          </div>
        )}

        {!loading && transactions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-500">Your transaction history will appear here</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}