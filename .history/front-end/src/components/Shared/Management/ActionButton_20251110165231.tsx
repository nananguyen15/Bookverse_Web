import { FaEye, FaEdit, FaUserShield, FaTrash, FaUndo } from "react-icons/fa";
import { ReactNode } from "react";

export type ActionType = "view" | "edit" | "role" | "deactivate" | "activate" | "delete" | "custom";

interface ActionButtonProps {
  onClick: () => void;
  icon: ActionType | ReactNode;
  title: string;
  variant?: "view" | "edit" | "role" | "danger" | "success" | "purple" | "custom";
  className?: string;
}

const defaultIconMap: Record<string, any> = {
  view: FaEye,
  edit: FaEdit,
  role: FaUserShield,
  deactivate: FaTrash,
  activate: FaUndo,
  delete: FaTrash,
};

const defaultColorMap: Record<string, string> = {
  view: "text-blue-600 hover:bg-blue-50",
  edit: "text-yellow-600 hover:bg-yellow-50",
  role: "text-purple-600 hover:bg-purple-50",
  danger: "text-red-600 hover:bg-red-50",
  success: "text-green-600 hover:bg-green-50",
  purple: "text-purple-600 hover:bg-purple-50",
};

export function ActionButton({ onClick, icon, title, variant, className = "" }: ActionButtonProps) {
  // If icon is a string (ActionType), use default icon
  const IconComponent = typeof icon === "string" ? defaultIconMap[icon] : null;
  
  // Determine color class
  let colorClass = "";
  if (variant) {
    colorClass = defaultColorMap[variant];
  } else if (typeof icon === "string") {
    // Auto-detect color from icon type
    colorClass = defaultColorMap[icon] || "text-gray-600 hover:bg-gray-50";
  }

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded transition-colors ${colorClass} ${className}`}
      title={title}
    >
      {IconComponent ? <IconComponent /> : icon}
    </button>
  );
}

interface ActionButtonGroupProps {
  children: ReactNode;
}

export function ActionButtonGroup({ children }: ActionButtonGroupProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {children}
    </div>
  );
}
