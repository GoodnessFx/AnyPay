import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ArrowRight, Zap, Clock, Shield, CheckCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useAuth } from "./AuthWrapper";
import { useApi } from "../hooks/useApi";
import { toast } from "sonner";

interface RouteInfo {
  provider: string;
  fee: number;
  time: string;
  rate: number;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
}

export function TransactionForm() {
  const [payAmount, setPayAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const { calculateRoute, createTransaction } = useApi();

  const handleAmountChange = async (value: string) => {
    setPayAmount(value);
    
    if (!value || parseFloat(value) <= 0) {
      setReceiveAmount("");
      setRoute(null);
      return;
    }

    // Calculate optimal route
    const { data, error } = await calculateRoute({
      fromCurrency: "USD",
      toCurrency: "NGN", 
      amount: parseFloat(value)
    });

    if (data && data.route) {
      const normalizedRoute: RouteInfo = {
        provider: data.route.provider,
        fee: data.route.fee,
        time: data.route.time ?? data.route.estimatedTime ?? "< 30 seconds",
        rate: data.route.rate,
        fromCurrency: data.route.fromCurrency,
        toCurrency: data.route.toCurrency,
        fromAmount: data.route.fromAmount,
        toAmount: data.route.toAmount
      };
      setRoute(normalizedRoute);
      setReceiveAmount(normalizedRoute.toAmount.toLocaleString());
    } else {
      console.log("Route calculation error:", error);
      setReceiveAmount("");
    }
  };

  const handleSubmit = async () => {
    if (!route || !user) return;
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await createTransaction({
        fromCurrency: route.fromCurrency,
        toCurrency: route.toCurrency,
        fromAmount: route.fromAmount,
        toAmount: route.toAmount,
        provider: route.provider,
        fee: route.fee
      });

      if (data) {
        setSuccess(true);
        toast.success("Transaction initiated successfully!");
        
        // Reset form after success
        setTimeout(() => {
          setSuccess(false);
          setPayAmount("");
          setReceiveAmount("");
          setRoute(null);
        }, 3000);
      } else {
        toast.error(`Transaction failed: ${error}`);
      }
    } catch (error) {
      console.log("Transaction submission error:", error);
      toast.error("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Universal Value Router</h2>
          <p className="text-gray-600">Convert any value to any value, instantly</p>
        </div>

        <div className="space-y-6">
          {/* Pay Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">You Pay</label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={payAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="text-2xl h-16 pr-20"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Badge variant="secondary" className="bg-blue-800 text-white">USD</Badge>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-800 rounded-full flex items-center justify-center cursor-pointer"
            >
              <ArrowRight className="w-6 h-6 text-white" />
            </motion.div>
          </div>

          {/* Receive Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">You Receive</label>
            <div className="relative">
              <Input
                placeholder="0.00"
                value={receiveAmount}
                readOnly
                className="text-2xl h-16 pr-20 bg-gray-50"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Badge variant="secondary" className="bg-green-600 text-white">NGN</Badge>
              </div>
            </div>
          </div>

          {/* Route Information */}
          {route && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-gray-900">Optimal Route Found</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-gray-500">Provider</p>
                    <p className="font-medium">{route.provider}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="font-medium">{route.time}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-500">Fee</p>
                  <p className="font-medium">${route.fee}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="border border-green-200 rounded-lg p-4 bg-green-50"
            >
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Transaction Successful!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Your payment is being processed and will be completed shortly.
              </p>
            </motion.div>
          )}

          <Separator />

          {/* Action Button */}
          <Button
            onClick={handleSubmit}
            disabled={!route || isProcessing || success}
            className="w-full h-14 bg-gradient-to-r from-blue-800 to-purple-600 hover:from-blue-900 hover:to-purple-700 text-lg disabled:opacity-50"
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
            ) : success ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Transaction Complete
              </>
            ) : (
              "Execute Swap"
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}