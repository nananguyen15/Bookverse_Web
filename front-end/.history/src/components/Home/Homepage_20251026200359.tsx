import { Navbar } from "../Navbar/Navbar";
import HeroSlider from "./HeroSlider";
import { Somebooks } from "./Somebooks";
import { heroBookGroups } from "../../data/books";
import { Footer } from "../Footer/Footer";

export function Homepage() {
  // Số hàng nội dung (không tính navbar & footer). Thay đổi giá trị này để tăng/giảm hàng.
  const sectionCount = 5; // <-- tăng lên 6 nếu muốn thêm 1 hàng nữa

  // gridTemplateRows: navbar auto, repeat(sectionCount, 1fr) -> chia đều phần nội dung,
  // footer auto. Điều này đảm bảo footer luôn nằm cuối màn hình.
  const gridTemplateRows = `auto repeat(${sectionCount}, 1fr) auto`;

  return (
    <div
      className="min-h-screen grid"
      style={{ gridTemplateRows }}
    >
      <Navbar />

      {/* Hàng nội dung 1: HeroSlider */}
      <section className="w-full">
        <HeroSlider
          booksData={heroBookGroups}
          autoIntervalMs={5000}
          onGetStartedHref="/browse"
        />
      </section>

      {/* Hàng nội dung 2: Best Sellers */}
      <section className="w-full">
        <Somebooks />
      </section>

      {/* Các hàng nội dung còn lại (placeholder). Thay đổi nội dung bên trong từng section khi cần */}
      {Array.from({ length: Math.max(0, sectionCount - 2) }).map((_, idx) => (
        <section
          key={idx}
          className="w-full flex items-center justify-center px-6 py-8"
          aria-label={`Homepage section ${idx + 3}`}
        >
          <div className="max-w-5xl w-full">
            <div className="text-center text-beige-900">
              <h2 className="text-2xl font-bold mb-2">Section {idx + 3}</h2>
              <p className="text-beige-700">
                Nội dung demo cho hàng thứ {idx + 3}. Thay thế khi cần.
              </p>
            </div>
          </div>
        </section>
      ))}

      <Footer />
    </div>
  );
}
