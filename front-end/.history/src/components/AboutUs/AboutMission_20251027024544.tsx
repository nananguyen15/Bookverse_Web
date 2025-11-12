import { FaBookOpen, FaTags, FaStar } from "react-icons/fa";

export function AboutMission() {
  const missions = [
    {
      icon: <FaBookOpen className="w-10 h-10" />,
      title: "Curated Knowledge",
      description:
        "We handpick every book, ensuring a collection that inspires, educates, and entertains.",
    },
    {
      icon: <FaTags className="w-10 h-10" />,
      title: "Fair Prices",
      description:
        "Access to knowledge should be affordable. We strive to offer the best prices for our readers.",
    },
    {
      icon: <FaStar className="w-10 h-10" />,
      title: "Trending & Beautiful",
      description:
        "We celebrate book design, offering trending and beautifully crafted editions for your shelf.",
    },
  ];

  return (
    <section className="px-16 py-24 bg-linear-to-t from-beige-500 to-beige-200 text-beige-100">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="mb-4 text-4xl font-bold font-heading">Our Mission</h2>

        <blockquote className="relative pl-10 border-l-4 border-[var(--book-tan)] my-12 py-4">
          <p className="text-xl md:text-2xl font-serif italic text-[var(--book-cream)]">
            “A reader lives a thousand lives before he dies . . . The man who
            never reads lives only one.”
          </p>
          <cite className="block text-right not-italic text-[var(--book-gray-light)]/70 mt-4"></cite>
        </blockquote>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {missions.map((mission) => (
            <div key={mission.title} className="flex flex-col items-center">
              <div className="p-4 mb-4 rounded-full bg-beige-500 text-beige-100">
                {mission.icon}
              </div>
              <h3 className="mb-2 text-2xl font-semibold">{mission.title}</h3>
              <p className="leading-relaxed opacity-80">
                {mission.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
