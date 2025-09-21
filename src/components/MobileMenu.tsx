import { motion, AnimatePresence } from "motion/react";
import { X, Home, Settings, User, Bell, TrendingUp, CreditCard, History } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  onNotificationsClick: () => void;
}

export function MobileMenu({ 
  isOpen, 
  onClose, 
  onSettingsClick, 
  onProfileClick, 
  onNotificationsClick 
}: MobileMenuProps) {
  const menuItems = [
    { icon: Home, label: "Dashboard", onClick: onClose, badge: null },
    { icon: TrendingUp, label: "Analytics", onClick: onClose, badge: null },
    { icon: CreditCard, label: "Payment Methods", onClick: onClose, badge: null },
    { icon: History, label: "Transaction History", onClick: onClose, badge: null },
    { icon: Bell, label: "Notifications", onClick: () => { onNotificationsClick(); onClose(); }, badge: "3" },
    { icon: Settings, label: "Settings", onClick: () => { onSettingsClick(); onClose(); }, badge: null },
    { icon: User, label: "Profile", onClick: () => { onProfileClick(); onClose(); }, badge: null },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          
          {/* Menu */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Menu Items */}
              <nav className="space-y-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="flex-1 font-medium text-gray-900">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-red-100 text-red-800">
                        {item.badge}
                      </Badge>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* User Info */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">JD</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">John Doe</p>
                    <p className="text-sm text-gray-600">Premium Account</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-3">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  New Transaction
                </Button>
                <Button variant="outline" className="w-full">
                  Add Payment Method
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}