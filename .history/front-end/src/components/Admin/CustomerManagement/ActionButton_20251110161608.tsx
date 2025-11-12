import { FaEye, FaEdit, FaUserShield, FaTrash, FaUndo } from "react-icons/fa";

interface ActionButtonProps {
  onClick: () => void;
  icon: "view" | "edit" | "role" | "deactivate" | "activate";
  title: string;
}

const iconMap = {
  view: FaEye,
  edit: FaEdit,
  role: FaUserShield,
  deactivate: FaTrash,
  activate: FaUndo,
};

const colorMap = {
  view: "text-blue-600 hover:bg-blue-50",
  edit: "text-yellow-600 hover:bg-yellow-50",
  role: "text-purple-600 hover:bg-purple-50",
  deactivate: "text-red-600 hover:bg-red-50",
  activate: "text-green-600 hover:bg-green-50",
};

export function ActionButton({ onClick, icon, title }: ActionButtonProps) {
  const Icon = iconMap[icon];
  const colorClass = colorMap[icon];

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded transition-colors ${colorClass}`}
      title={title}
    >
      <Icon />
    </button>
  );
}
