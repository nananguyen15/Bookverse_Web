interface TableCellProps {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export function TableCell({ children, align = "left", className = "" }: TableCellProps) {
  const alignmentClass = {
    left: "",
    center: "text-center",
    right: "text-right",
  }[align];

  return (
    <td className={`px-6 py-4 whitespace-nowrap ${alignmentClass} ${className}`}>
      {children}
    </td>
  );
}

interface TableCellTextProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export function TableCellText({ children, variant = "primary", className = "" }: TableCellTextProps) {
  const baseClass = variant === "primary" ? "text-gray-900" : "text-gray-500";
  return <div className={`${baseClass} ${className}`}>{children}</div>;
}
