import { FaCheck, FaTimes } from "react-icons/fa";

interface StatusBadgeProps {
  active: boolean;
  activeText?: string;
  inactiveText?: string;
  activeColor?: "green" | "blue" | "purple";
  inactiveColor?: "red" | "gray" | "yellow";
}

const colorMap = {
  green: { bg: "bg-green-100", text: "text-green-800" },
  blue: { bg: "bg-blue-100", text: "text-blue-800" },
  purple: { bg: "bg-purple-100", text: "text-purple-800" },
  red: { bg: "bg-red-100", text: "text-red-800" },
  gray: { bg: "bg-gray-100", text: "text-gray-800" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-800" },
};

export function StatusBadge({ 
  active, 
  activeText = "Active", 
  inactiveText = "Inactive",
  activeColor = "green",
  inactiveColor = "red"
}: StatusBadgeProps) {
  const color = active ? colorMap[activeColor] : colorMap[inactiveColor];
  const Icon = active ? FaCheck : FaTimes;
  const text = active ? activeText : inactiveText;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${color.bg} ${color.text}`}>
      <Icon className="w-3 h-3" /> {text}
    </span>
  );
}
