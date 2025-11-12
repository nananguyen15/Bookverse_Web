import { motion, AnimatePresence } from "framer-motion";

type AccordionItemProps = {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
};

export function AccordionItem({
  question,
  answer,
  isOpen,
  onClick,
}: AccordionItemProps) {
  return (
    <div
      className={`rounded-xl transition-all duration-300 ${
        isOpen ? "bg-beige-500" : "bg-beige-700 hover:bg-beige-700/50"
      }`}
    >
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full p-6 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-white">{question}</span>
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 ${
            isOpen ? "bg-beige-500" : "bg-beige-500"
          }`}
        >
          <span className="text-2xl font-light text-white">
            {isOpen ? "−" : "+"}
          </span>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-white-300">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
