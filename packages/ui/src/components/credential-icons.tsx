"use client";

import * as React from "react";
import { Smartphone, Hash, CreditCard, QrCode } from "lucide-react";
import { cn } from "../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export type CredentialType = "mobile" | "pin" | "card" | "qr";

export interface CredentialIconsProps {
  credentials: {
    mobile: boolean;
    pin: boolean;
    card: boolean;
    qr?: boolean;
  };
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  className?: string;
}

const credentialConfig: Record<
  CredentialType,
  {
    Icon: React.ElementType;
    label: string;
  }
> = {
  mobile: {
    Icon: Smartphone,
    label: "Mobile",
  },
  pin: {
    Icon: Hash,
    label: "PIN",
  },
  card: {
    Icon: CreditCard,
    label: "Card",
  },
  qr: {
    Icon: QrCode,
    label: "QR Code",
  },
};

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function CredentialIcons({
  credentials,
  size = "md",
  showTooltip = true,
  activeColor = "text-gray-700",
  inactiveColor = "text-gray-300",
  className,
}: CredentialIconsProps) {
  const renderIcon = (type: CredentialType, isActive: boolean) => {
    const config = credentialConfig[type];
    const Icon = config.Icon;

    const icon = (
      <Icon
        className={cn(
          sizeClasses[size],
          isActive ? activeColor : inactiveColor,
          "transition-colors"
        )}
      />
    );

    if (!showTooltip) {
      return icon;
    }

    return (
      <Tooltip key={type}>
        <TooltipTrigger asChild>
          <span>{icon}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const icons = (
    <>
      {renderIcon("mobile", credentials.mobile)}
      {renderIcon("pin", credentials.pin)}
      {renderIcon("card", credentials.card)}
      {credentials.qr !== undefined && renderIcon("qr", credentials.qr)}
    </>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-2", className)}>{icons}</div>
      </TooltipProvider>
    );
  }

  return <div className={cn("flex items-center gap-2", className)}>{icons}</div>;
}
