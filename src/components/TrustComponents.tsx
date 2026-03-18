import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "./ui/utils";

interface TrustScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function TrustScoreRing({ score, size = 48, strokeWidth = 3, children }: TrustScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? "var(--ap-success)" : score >= 50 ? "var(--ap-accent-alt)" : "var(--ap-error)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(var(--ap-border-rgb), 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

interface TrustCardProps {
  user: {
    name: string;
    trustScore: number;
    completedSwaps?: number;
    memberSince?: string;
    isIdVerified?: boolean;
    isPhoneVerified?: boolean;
    disputes?: number;
    lastActive?: string;
  };
  className?: string;
}

export function TrustCard({ user, className }: TrustCardProps) {
  const label = user.trustScore >= 80 ? "Trusted Swapper" : user.trustScore >= 50 ? "Rising Trader" : "New Member";
  
  return (
    <div className={cn("ap-card p-4 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <TrustScoreRing score={user.trustScore} size={40}>
          <Avatar className="size-8">
            <AvatarFallback className="text-[10px]">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </TrustScoreRing>
        <div>
          <div className="font-medium text-sm">{user.name}</div>
          <div className="text-[10px] text-[color:var(--ap-text-muted)] flex items-center gap-1">
            <span className="text-yellow-500">⭐ 4.9</span>
            <span>·</span>
            <span>{user.completedSwaps ?? 0} swaps</span>
            <span>·</span>
            <span>Member since {user.memberSince ?? "Jan 2024"}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {user.isIdVerified && (
          <span className="flex items-center gap-1 text-[10px] text-[color:var(--ap-success)] font-medium">
            ✅ ID Verified
          </span>
        )}
        {user.isPhoneVerified && (
          <span className="flex items-center gap-1 text-[10px] text-[color:var(--ap-success)] font-medium">
            ✅ Phone Verified
          </span>
        )}
        <span className="flex items-center gap-1 text-[10px] text-[color:var(--ap-text-muted)] font-medium">
          ✅ {user.disputes ?? 0} disputes
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[color:var(--ap-border)]/10">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          user.trustScore >= 80 ? "text-[color:var(--ap-success)]" : user.trustScore >= 50 ? "text-[color:var(--ap-accent-alt)]" : "text-[color:var(--ap-text-muted)]"
        )}>
          {label}
        </span>
        <span className="text-[10px] text-[color:var(--ap-text-muted)]">
          Last active: {user.lastActive ?? "2 hours ago"}
        </span>
      </div>
    </div>
  );
}
