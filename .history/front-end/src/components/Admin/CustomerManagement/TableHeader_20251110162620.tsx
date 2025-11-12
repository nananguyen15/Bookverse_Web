interface TableHeaderProps {
  children: React.ReactNode;
  align?: "left" | "center";
}

export function TableHeader({ children, align = "left" }: TableHeaderProps) {
  return (
    <th
      className={`px-6 py-3 text-xs font-medium tracking-wider uppercase text-beige-700 ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
