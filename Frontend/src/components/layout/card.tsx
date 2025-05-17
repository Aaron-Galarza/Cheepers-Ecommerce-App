// src/components/ui/card.tsx
import React from "react";

export const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="rounded-lg border bg-white p-4 shadow">
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`p-2 ${className}`}>
      {children}
    </div>
  );
};
