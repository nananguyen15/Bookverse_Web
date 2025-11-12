import { FaCheck, FaTimes } from "react-icons/fa";

interface StatusBadgeProps {
  active: boolean;
  activeText?: string;
  inactiveText?: string;
}

export function StatusBadge({ 
  active, 
  activeText = "Hoạt động", 
  inactiveText = "Đã khóa" 
}: StatusBadgeProps) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
      <FaCheck className="w-3 h-3" /> {activeText}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
      <FaTimes className="w-3 h-3" /> {inactiveText}
    </span>
  );
}
