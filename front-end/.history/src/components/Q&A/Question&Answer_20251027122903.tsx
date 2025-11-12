import { useState } from "react";
import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";
import { AccordionItem } from "./AccordionItem";
import { faqData } from "../../data/faqData";

export function QuestionAndAnswer() {
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  return (
    <>
    <Navbar />
    <div className="bg-linear-to-t from-beige-500 to-beige-50">

      <div className="max-w-4xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
        <div className="my-10 text-center">
          <h1 className="text-5xl font-bold text-beige-700 font-heading">
            FAQs
          </h1>
          <p className="mt-2 text-lg text-bei-300">
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
    </div>
          <Footer />
    </>
  );
}
