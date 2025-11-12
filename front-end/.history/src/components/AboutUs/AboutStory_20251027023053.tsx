export function AboutStory() {
  return (
    <section className="px-16 py-24 bg-linear-to-b from-amber-100 to-amber-">
      <div className="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
        <div className="relative text-center">
          <h2 className="font-bold text-8xl md:text-9xl text-beige-700 opacity-20">
            2025
          </h2>
          <h2 className="absolute font-bold -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-7xl md:text-8xl text-beige-900">
            2025
          </h2>
        </div>
        <div>
          <h3 className="mb-4 text-4xl font-bold font-heading text-beige-900">
            Our Story
          </h3>
          <p className="text-lg leading-relaxed text-beige-700">
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
