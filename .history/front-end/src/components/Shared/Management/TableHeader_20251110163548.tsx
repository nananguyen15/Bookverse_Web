interface TableHeaderProps {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}

export function TableHeader({ children, align = "left" }: TableHeaderProps) {
  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align];

  return (
    <th className={`px-6 py-3 text-xs font-medium tracking-wider uppercase text-beige-700 ${alignmentClass}`}>
      {children}
    </th>
  );
}
