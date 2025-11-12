import React from "react";

interface ViewDetailsRowProps {
  label: string;
  value: string | number | React.ReactNode;
}

export function ViewDetailsRow({ label, value }: ViewDetailsRowProps) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

interface ViewDetailsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
}

export function ViewDetailsGrid({ children, columns = 2 }: ViewDetailsGridProps) {
  return (
    <div className={`grid ${columns === 2 ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
      {children}
    </div>
  );
}

interface ViewDetailsContainerProps {
  children: React.ReactNode;
}

export function ViewDetailsContainer({ children }: ViewDetailsContainerProps) {
  return <div className="space-y-3">{children}</div>;
}
