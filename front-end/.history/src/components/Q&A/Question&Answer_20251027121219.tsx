import { useState } from "react";
import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";
import { AccordionItem } from "./AccordionItem";

export function QuestionAndAnswer() {
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  const faqData = [
    {
      question: "Do I need an account to buy books on BookVerse?",
      answer:
        "Yes, you must purchase as a guest. However, creating an account allows you to track your orders, save your favorite books, and manage your personal information easily.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Standard delivery typically takes 3–5 business days, depending on your location. You will receive a tracking code via email once your order is shipped.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept all major credit cards, PayPal, and local bank transfers to ensure a smooth and secure payment process.",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "You can reach our support team through the 'Contact Us' page on our website or by sending an email directly to support@bookverse.com. We're happy to help!",
    },
  ];

  return (
    <div className="bg-slate-900">
      <Navbar />
      <div className="max-w-4xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
        <div className="my-10 text-center">
          <h1 className="text-5xl font-bold text-cyan-400 font-heading">FAQs</h1>
          <p className="mt-2 text-lg text-gray-300">
            Answers to Frequently Asked Questions
          </p>
        </div>
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <AccordionItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
