import { motion } from "motion/react";
import { Plus, RefreshCw, Send, Download, QrCode, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: "Add Funds",
      description: "Top up your wallet",
      color: "from-blue-500 to-blue-600",
      onClick: () => console.log("Add funds")
    },
    {
      icon: Send,
      label: "Send Money",
      description: "Transfer to anyone",
      color: "from-green-500 to-green-600",
      onClick: () => console.log("Send money")
    },
    {
      icon: RefreshCw,
      label: "Convert",
      description: "Exchange currencies",
      color: "from-purple-500 to-purple-600",
      onClick: () => console.log("Convert")
    },
    {
      icon: Download,
      label: "Withdraw",
      description: "Cash out funds",
      color: "from-yellow-500 to-yellow-600",
      onClick: () => console.log("Withdraw")
    },
    {
      icon: QrCode,
      label: "Scan QR",
      description: "Pay with QR code",
      color: "from-indigo-500 to-indigo-600",
      onClick: () => console.log("Scan QR")
    },
    {
      icon: CreditCard,
      label: "Pay Bills",
      description: "Utilities & services",
      color: "from-red-500 to-red-600",
      onClick: () => console.log("Pay bills")
    },
  ];

  return (
    <Card className="p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <span className="font-medium text-gray-900 text-sm mb-1">{action.label}</span>
            <span className="text-xs text-gray-500 text-center">{action.description}</span>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}