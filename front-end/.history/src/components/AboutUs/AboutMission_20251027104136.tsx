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
        <h2 className="mb-4 text-6xl font-bold font-heading text-beige-100">Our Mission</h2>

        <blockquote className="relative py-4 pl-10 my-10 border-beige-100 order-beige-50 mb-18">
          <p className="font-serif text-xl italic md:text-2xl text-beige-50">
            “A reader lives a thousand lives before he dies . . . The man who
            never reads lives only one.”
          </p>
          <cite className="block mt-4 not-italic text-right text-beige-300/70"></cite>
        </blockquote>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {missions.map((mission) => (
            <div key={mission.title} className="flex flex-col items-center p-6 rounded-lg border- border-beige-200">
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
