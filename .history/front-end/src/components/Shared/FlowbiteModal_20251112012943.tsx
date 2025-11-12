import React, { useEffect, useRef } from 'react';
import { Modal } from 'flowbite';
import type { ModalOptions, ModalInterface } from 'flowbite';

interface FlowbiteModalProps {
  children: React.ReactNode;
  triggerText?: string;
  modalOptions?: ModalOptions;
}

const FlowbiteModal: React.FC<FlowbiteModalProps> = ({
  children,
  triggerText = "Open Modal",
  modalOptions
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalInstanceRef = useRef<ModalInterface | null>(null);

  useEffect(() => {
    if (modalRef.current) {
      // Create modal instance with TypeScript types
      const defaultOptions: ModalOptions = {
        placement: 'center',
        backdrop: 'dynamic',
        backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
        closable: true,
        ...modalOptions
      };

      modalInstanceRef.current = new Modal(modalRef.current, defaultOptions);
    }

    return () => {
      // Cleanup modal instance
      if (modalInstanceRef.current) {
        modalInstanceRef.current.destroy();
      }
    };
  }, [modalOptions]);

  const handleOpenModal = () => {
    if (modalInstanceRef.current) {
      modalInstanceRef.current.show();
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpenModal}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        {triggerText}
      </button>

      {/* Modal */}
      <div
        ref={modalRef}
        id="flowbite-modal"
        tabIndex={-1}
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-50 hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative w-full max-w-2xl max-h-full">
          <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default FlowbiteModal;