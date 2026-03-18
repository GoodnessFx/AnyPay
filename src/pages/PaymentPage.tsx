import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { TrustScoreRing } from "../components/TrustComponents";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { CheckCircle2, ShieldCheck, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PaymentPage() {
  const { username } = useParams();
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("USD");
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock trust score for the user being paid
  const trustScore = 94;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[color:var(--ap-bg)]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="ap-card w-full max-w-md p-10 text-center space-y-6"
        >
          <div className="mx-auto size-20 bg-[color:var(--ap-success)]/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="text-[color:var(--ap-success)] size-10" />
          </div>
          <h1 className="ap-heading text-2xl uppercase tracking-widest font-bold">Sent!</h1>
          <p className="text-[color:var(--ap-text-muted)]">
            You successfully sent {parseFloat(amount).toLocaleString()} {asset} to {username}.
          </p>
          <button onClick={() => window.location.reload()} className="ap-btn ap-btn-primary w-full">Send Again</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[color:var(--ap-bg)]">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="ap-card w-full max-w-md p-8 space-y-8 shadow-2xl border-[color:var(--ap-border)]/5"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <TrustScoreRing score={trustScore} size={80} strokeWidth={4}>
            <Avatar className="size-16">
              <AvatarFallback className="text-xl uppercase">{username?.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </TrustScoreRing>
          <div>
            <h1 className="ap-heading text-xl font-bold uppercase tracking-tight">Send money to {username}</h1>
            <div className="mt-1 flex items-center justify-center gap-2 text-[10px] uppercase font-bold text-[color:var(--ap-text-muted)]">
              <span className="text-[color:var(--ap-success)]">Trust Score: {trustScore}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[color:var(--ap-success)]"><CheckCircle2 className="size-2.5" /> Verified Member</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSend} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-bold text-[color:var(--ap-text-muted)] mb-1 block px-1">Amount</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="ap-input text-lg font-bold"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[color:var(--ap-text-muted)] mb-1 block px-1">Asset</label>
                <select 
                  className="ap-input text-sm font-bold"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="NGN">NGN</option>
                  <option value="USDT">USDT</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[color:var(--ap-text-muted)] mb-1 block px-1">Note (Optional)</label>
              <textarea 
                placeholder="What's this for?"
                className="ap-input text-xs min-h-[80px] resize-none"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-[color:var(--ap-bg)]/50 p-4 rounded-xl border border-dashed border-[color:var(--ap-border)]/10 text-center">
            <p className="text-[10px] uppercase font-bold text-[color:var(--ap-text-muted)] mb-1">{username} will receive in</p>
            <p className="text-sm font-bold text-[color:var(--ap-accent-alt)] uppercase">NGN (Auto-converted)</p>
          </div>

          <button 
            type="submit" 
            disabled={isSending}
            className="ap-btn ap-btn-primary w-full py-4 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {isSending ? "Processing..." : <>Send Now <Send className="size-4" /></>}
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-[color:var(--ap-text-muted)] uppercase font-bold">
            <ShieldCheck className="size-3 text-[color:var(--ap-success)]" />
            Powered by AnyPay Security
          </div>
        </form>
      </motion.div>
    </div>
  );
}
