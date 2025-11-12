import React, { useState, useRef } from "react";

export function AboutStory() {
  // State để lưu trữ style transform
  const [style, setStyle] = useState({ main: "", shadow: "" });
  // Ref để lấy kích thước của container
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    // Tính toán vị trí chuột (từ -0.5 đến 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Di chuyển chữ chính (ít)
    const mainMove = 10;
    const mainTransform = `translate(${x * -mainMove}px, ${y * -mainMove}px)`;

    // Di chuyển bóng (nhiều và ngược lại để "né")
    const shadowMove = 40;
    const shadowTransform = `translate(${x * -shadowMove}px, ${
      y * -shadowMove
    }px)`;

    setStyle({ main: mainTransform, shadow: shadowTransform });
  };

  const handleMouseLeave = () => {
    // Reset về vị trí cũ
    setStyle({ main: "translate(0, 0)", shadow: "translate(0, 0)" });
  };

  return (
    <section className="py-20 overflow-hidden md:py-32 bg-linear-to-b from-amber-100 to-beige-200">
      <div className="container px-6 mx-auto">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          {/* (CẬP NHẬT) Thêm ref và event handlers */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative flex justify-center flex-shrink-0 w-full lg:w-1/3 lg:justify-start"
          >
            {/* (CẬP NHẬT) Thêm style và transition */}
            <span
              style={{ transform: style.shadow }}
              className="absolute -top-12 left-0 text-[180px] font-bold text-beige-800/5 opacity-30 select-none hidden lg:block transition-transform duration-100 ease-out"
            >
              2025
            </span>
            {/* (CẬP NHẬT) Thêm style và transition */}
            <h2
              style={{ transform: style.main }}
              className="z-10 font-bold text-transparent transition-transform duration-100 ease-out text-8xl md:text-9xl bg-clip-text bg-linear-to-t from-beige-500 to-beige-200"
            >
              2025
            </h2>
          </div>

          <div>
            <h2 className="mb-4 text-6xl font-bold font-heading text-beige-800">
              Our Story
            </h2>
            <p className="text-2xl leading-relaxed text-beige-700">
              It all started in August 2025 with a simple idea: to create a
              space where book lovers could discover not just bestsellers, but
              also hidden gems with beautiful covers and compelling stories. We
              believe that a book is more than just words on a page; it's an
              experience, an adventure, and a source of lifelong knowledge.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
