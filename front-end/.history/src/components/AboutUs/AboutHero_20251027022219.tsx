export function AboutHero() {
  return (
    <section className="flex items-center justify-center min-h-[60vh] px-16 py-20 text-center bg-linear-to-br from-beige-50 to-beige-100">
      <div className="max-w-4xl">
        <h1 className="text-6xl font-bold md:text-8xl font-heading text-[var(--color-darkest)]">
          About Us
        </h1>
        <p className="mt-6 text-lg md:text-xl leading-relaxed text-[var(--color-mid-dark)]">
          We are a passionate team dedicated to bringing the world of knowledge and imagination to your doorstep through carefully curated books.
        </p>
      </div>
    </section>
  );
}
