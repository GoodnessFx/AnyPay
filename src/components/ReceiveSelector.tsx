import { motion } from "motion/react";
import { useState } from "react";
import { 
  Banknote, 
  Smartphone, 
  Bitcoin, 
  Zap, 
  ShoppingCart,
  Home,
  CreditCard,
  Gift
} from "lucide-react";
import { Card } from "./ui/card";
import { PaymentMethod } from "./PaymentMethod";

const settlementMethods = [
  {
    id: "mpesa",
    icon: Smartphone,
    name: "M-Pesa",
    description: "Direct to mobile wallet",
    color: "green" as const
  },
  {
    id: "bank",
    icon: Banknote,
    name: "Bank Transfer",
    description: "Direct bank deposit",
    color: "blue" as const
  },
  {
    id: "crypto",
    icon: Bitcoin,
    name: "Cryptocurrency",
    description: "ETH, BTC, Stablecoins",
    color: "purple" as const
  },
  {
    id: "electricity",
    icon: Zap,
    name: "Electricity Bills",
    description: "Pay utility bills directly",
    color: "green" as const
  },
  {
    id: "vouchers",
    icon: ShoppingCart,
    name: "Food Vouchers",
    description: "Grocery & restaurant credits",
    color: "blue" as const
  },
  {
    id: "housing",
    icon: Home,
    name: "Rent Payment",
    description: "Direct to landlord",
    color: "purple" as const
  },
  {
    id: "topup",
    icon: CreditCard,
    name: "Credit Top-up",
    description: "Airtime & data bundles",
    color: "green" as const
  },
  {
    id: "gift-out",
    icon: Gift,
    name: "Gift Cards",
    description: "Generate gift cards",
    color: "blue" as const
  }
];

export type ReceiveMethodId = (typeof settlementMethods)[number]["id"];

export function ReceiveSelector({
  value,
  onChange,
}: {
  value: ReceiveMethodId | null;
  onChange: (value: ReceiveMethodId) => void;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState<ReceiveMethodId | null>(null);
  const selectedMethod = value ?? uncontrolledValue;

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receive As</h3>
        <div className="grid grid-cols-1 gap-3">
          {settlementMethods.map((method, index) => (
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
                onClick={() => {
                  setUncontrolledValue(method.id);
                  onChange(method.id);
                }}
                color={method.color}
              />
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}