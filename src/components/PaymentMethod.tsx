import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface PaymentMethodProps {
  icon: LucideIcon;
  name: string;
  description: string;
  isSelected?: boolean;
  onClick?: () => void;
  color?: "blue" | "purple" | "green";
}

export function PaymentMethod({ 
  icon: Icon, 
  name, 
  description, 
  isSelected = false, 
  onClick,
  color = "blue"
}: PaymentMethodProps) {
  const colorClasses = {
    blue: "border-blue-800 bg-blue-50 text-blue-800",
    purple: "border-purple-600 bg-purple-50 text-purple-600", 
    green: "border-green-600 bg-green-50 text-green-600"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isSelected 
            ? `${colorClasses[color]} border-2` 
            : "border border-gray-200 hover:border-gray-300"
        }`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isSelected ? colorClasses[color] : "bg-gray-100"
          }`}>
            <Icon className={`w-6 h-6 ${isSelected ? "text-white" : "text-gray-600"}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}