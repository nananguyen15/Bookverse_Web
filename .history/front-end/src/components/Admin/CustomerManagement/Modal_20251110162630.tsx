interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function Modal({ isOpen, onClose, title, children, maxWidth = "2xl" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-full ${maxWidthMap[maxWidth]} p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto`}>
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
}

export function ModalActions({
  onConfirm,
  onCancel,
  confirmText = "Xác Nhận",
  cancelText = "Hủy",
  confirmDisabled = false,
}: ModalActionsProps) {
  return (
    <div className="flex gap-2 pt-4">
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-beige-700 hover:bg-beige-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
