import { motion } from "motion/react";
import { ArrowLeftRight, Settings, User, Bell, Menu, Flame } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MobileMenu } from "./MobileMenu";
import { useAppStore } from "../store/useAppStore";
import { TrustScoreRing } from "./TrustComponents";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface HeaderProps {
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
}

export function Header({ onSettingsClick, onProfileClick, onNotificationsClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useAppStore((s) => s.user);

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-200 px-6 py-4"
      >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="w-10 h-10 bg-gradient-to-r from-blue-800 to-purple-600 rounded-xl flex items-center justify-center"
          >
            <ArrowLeftRight className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-blue-800 font-bold text-xl">AnyPay</h1>
            <p className="text-gray-500 text-sm hidden sm:block">Universal Value Router</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-full border border-orange-100">
              <Flame className="size-3 fill-orange-500" />
              <span className="text-[10px] font-bold tabular-nums">{user.streakDays ?? 0}</span>
            </div>
          )}

          <Badge variant="secondary" className="bg-green-100 text-green-800 hidden xs:inline-flex">
            Connected
          </Badge>
          
          {/* Desktop Navigation */}
          <div className="flex items-center gap-1 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-8 w-8 sm:h-10 sm:w-10"
              onClick={onNotificationsClick}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="hidden sm:inline-flex"
              onClick={onSettingsClick}
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            <button 
              className="focus:outline-none ml-1 sm:ml-0"
              onClick={onProfileClick}
            >
              <TrustScoreRing score={user?.trustScore ?? 40} size={36} strokeWidth={2}>
                <Avatar className="size-7">
                  <AvatarFallback className="text-[8px]">{user?.name?.slice(0, 2).toUpperCase() ?? "AP"}</AvatarFallback>
                </Avatar>
              </TrustScoreRing>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden h-8 w-8 sm:h-10 sm:w-10"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
      </motion.header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onSettingsClick={onSettingsClick || (() => {})}
        onProfileClick={onProfileClick || (() => {})}
        onNotificationsClick={onNotificationsClick || (() => {})}
      />
    </>
  );
}