export function AboutStory() {
  return (
    <section className="px-16 py-24">
      <div className="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
        <div className="relative text-center">
          <h2 className="font-bold text-8xl md:text-9xl text-beige- opacity-20">
            2025
          </h2>
          <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl md:text-8xl font-bold text-[var(--color-darkest)]">
            2025
          </h2>
        </div>
        <div>
          <h3 className="mb-4 text-4xl font-bold font-heading text-[var(--color-darkest)]">
            Our Story
          </h3>
          <p className="text-lg leading-relaxed text-[var(--color-mid-dark)]">
            It all started in August 2025 with a simple idea: to create a space
            where book lovers could discover not just bestsellers, but also
            hidden gems with beautiful covers and compelling stories. We believe
            that a book is more than just words on a page; it's an experience,
            an adventure, and a source of lifelong knowledge.
          </p>
        </div>
      </div>
    </section>
  );
}
