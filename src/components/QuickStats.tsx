import { motion } from "motion/react";
import { TrendingUp, Users, Globe, Zap } from "lucide-react";
import { Card } from "./ui/card";

const stats = [
  {
    icon: TrendingUp,
    label: "24h Volume",
    value: "$2.4M",
    change: "+12.5%",
    color: "green"
  },
  {
    icon: Users,
    label: "Active Users",
    value: "45,230",
    change: "+8.2%", 
    color: "blue"
  },
  {
    icon: Globe,
    label: "Countries",
    value: "127",
    change: "+3",
    color: "purple"
  },
  {
    icon: Zap,
    label: "Avg. Speed",
    value: "< 30s",
    change: "-5s",
    color: "green"
  }
];

export function QuickStats() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="p-4 text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
              stat.color === "green" ? "bg-green-100" :
              stat.color === "blue" ? "bg-blue-100" :
              stat.color === "purple" ? "bg-purple-100" : "bg-gray-100"
            }`}>
              <stat.icon className={`w-6 h-6 ${
                stat.color === "green" ? "text-green-600" :
                stat.color === "blue" ? "text-blue-600" :
                stat.color === "purple" ? "text-purple-600" : "text-gray-600"
              }`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <span className={`text-xs px-2 py-1 rounded-full ${
              stat.change.startsWith("+") || stat.change.startsWith("-") 
                ? "bg-green-100 text-green-800" 
                : "bg-blue-100 text-blue-800"
            }`}>
              {stat.change}
            </span>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}