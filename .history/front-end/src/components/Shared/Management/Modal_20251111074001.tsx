
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export function Modal({ isOpen, onClose, title, children, maxWidth = "2xl" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className={`w-full ${maxWidthMap[maxWidth]} p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-2xl font-bold text-beige-900">{title}</h2>
        {children}
      </div>
    </div>
  );
}

interface ModalActionsProps {
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmDisabled?: boolean;
  confirmVariant?: "primary" | "danger" | "success";
}

export function ModalActions({
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmDisabled = false,
  confirmVariant = "primary",
}: ModalActionsProps) {
  const variantClasses = {
    primary: "bg-beige-700 hover:bg-beige-800 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
  };

  return (
    <div className="flex gap-2 pt-4">
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className={`flex-1 px-4 py-2 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[confirmVariant]}`}
      >
        {confirmText}
      </button>
      <button
        onClick={onCancel}
        className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        {cancelText}
      </button>
    </div>
  );
}
