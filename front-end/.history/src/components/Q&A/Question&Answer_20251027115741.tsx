import { Navbar } from "../Navbar/Navbar";
import { Footer } from "../Footer/Footer";
export function QuestionAndAnswer() {
  const qa = "py-4 border grid-span-1 b"
  return (
    <div>
      <Navbar />
      <div className="my-10 text-center">
        <h1 className="text-5xl font-heading">FAQs</h1>
        <p>Answer to Frequently Asked Questions</p>
      </div>
      <div className="grid grid-rows-4 gap-4 py-6 px-96">
        <div className="py-4 border grid-span-1 rounded-2xl">Question 1
          
        </div>
        <div className="py-4 border grid-span-1">Question 2</div>
        <div className="py-4 border grid-span-1">Question 3</div>
        <div className="py-4 border grid-span-1">Question 4</div>
      </div>
      <Footer />
    </div>
  );
}
