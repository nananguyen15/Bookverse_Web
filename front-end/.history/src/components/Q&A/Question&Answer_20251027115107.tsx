import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";
export function QuestionAndAnswer() {
  return (
    <div>
      <Navbar />
      <div className="my-10 text-center">
        <h1 className="text-5xl font-heading">FAQs</h1>
        <p>Answer to Frequently Asked Questions</p>
      </div>
      <div className="grid grid-rows-4 px-16 py-6 ga">
        <div className="py-4 border grid-span-1">Question 1</div>
        <div className="py-4 border grid-span-1">Question 2</div>
        <div className="py-4 border grid-span-1">Question 3</div>
        <div className="py-4 border grid-span-1">Question 4</div>
      </div>
      <Footer />
    </div>
  );
}
