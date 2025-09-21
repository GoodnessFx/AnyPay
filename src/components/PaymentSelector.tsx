import { motion } from "motion/react";
import { useState } from "react";
import { 
  CreditCard, 
  Smartphone, 
  Bitcoin, 
  Banknote, 
  Gift, 
  Zap,
  Wallet,
  Globe
} from "lucide-react";
import { Card } from "./ui/card";
import { PaymentMethod } from "./PaymentMethod";

const paymentMethods = [
  {
    id: "card",
    icon: CreditCard,
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, Apple Pay",
    color: "blue" as const
  },
  {
    id: "crypto",
    icon: Bitcoin,
    name: "Cryptocurrency", 
    description: "BTC, ETH, USDT, Stablecoins",
    color: "purple" as const
  },
  {
    id: "mobile",
    icon: Smartphone,
    name: "Mobile Money",
    description: "M-Pesa, Airtel Money, MTN",
    color: "green" as const
  },
  {
    id: "bank",
    icon: Banknote,
    name: "Bank Transfer",
    description: "Direct bank account transfer",
    color: "blue" as const
  },
  {
    id: "airtime",
    icon: Zap,
    name: "Airtime Credit",
    description: "Convert airtime to cash",
    color: "purple" as const
  },
  {
    id: "gift",
    icon: Gift,
    name: "Gift Cards",
    description: "Amazon, iTunes, Google Play",
    color: "green" as const
  },
  {
    id: "wallet",
    icon: Wallet,
    name: "Digital Wallet",
    description: "PayPal, Skrill, Payoneer",
    color: "blue" as const
  },
  {
    id: "ussd",
    icon: Globe,
    name: "USSD Banking",
    description: "*123# banking codes",
    color: "purple" as const
  }
];

export function PaymentSelector() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay With</h3>
        <div className="grid grid-cols-1 gap-3">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <PaymentMethod
                icon={method.icon}
                name={method.name}
                description={method.description}
                isSelected={selectedMethod === method.id}
                onClick={() => setSelectedMethod(method.id)}
                color={method.color}
              />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}