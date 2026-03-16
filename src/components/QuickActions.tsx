import { motion } from "motion/react";
import { Plus, RefreshCw, Send, Download, QrCode, CreditCard } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { useAuth } from "./AuthWrapper";
import { useApi } from "../hooks/useApi";
import { toast } from "sonner";

export function QuickActions() {
  const { user } = useAuth();
  const { topUpWallet, withdrawWallet } = useApi();
  const [topUpCurrency, setTopUpCurrency] = useState("USD");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [withdrawCurrency, setWithdrawCurrency] = useState("USD");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const doTopUp = async () => {
    if (!user) return;
    const amount = Number(topUpAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    setBusy(true);
    const { data, error } = await topUpWallet(user.id, { currency: topUpCurrency, amount });
    setBusy(false);
    if (data?.wallet) {
      setTopUpAmount("");
      toast.success("Funds added.");
    } else {
      toast.error(error ?? "Top up failed");
    }
  };

  const doWithdraw = async () => {
    if (!user) return;
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    setBusy(true);
    const { data, error } = await withdrawWallet(user.id, { currency: withdrawCurrency, amount });
    setBusy(false);
    if (data?.wallet) {
      setWithdrawAmount("");
      toast.success("Withdraw submitted.");
    } else {
      toast.error(error ?? "Withdraw failed");
    }
  };

  return (
    <Card className="p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-gray-900 text-sm mb-1">Add Funds</span>
              <span className="text-xs text-gray-500 text-center">Top up your wallet</span>
            </motion.button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add funds</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={topUpCurrency} onChange={(e) => setTopUpCurrency(e.target.value.toUpperCase())} />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
              </div>
              <Button onClick={doTopUp} disabled={!user || busy}>
                Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-3">
                <Download className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-gray-900 text-sm mb-1">Withdraw</span>
              <span className="text-xs text-gray-500 text-center">Cash out funds</span>
            </motion.button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={withdrawCurrency} onChange={(e) => setWithdrawCurrency(e.target.value.toUpperCase())} />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
              </div>
              <Button onClick={doWithdraw} disabled={!user || busy} variant="outline">
                Withdraw
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="col-span-2 md:col-span-1 lg:col-span-4 flex items-center justify-center text-sm text-gray-500"
        >
          Use “Execute Swap” to convert value.
        </motion.div>
      </div>
    </Card>
  );
}