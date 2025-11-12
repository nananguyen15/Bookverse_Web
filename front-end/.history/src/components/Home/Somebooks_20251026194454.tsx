export function Somebooks() {
  // Updated card sizes (responsive) and fixed tailwind typos
  const card =
    "w-48 sm:w-56 md:w-64 h-54 sm:h-62 md:h-90 bg-gray-300 rounded-md flex items-center justify-center flex-shrink-0";

  return (
    <div className="grid grid-cols-12 px-16 py-6">
      {/* Title spans full width and has spacing */}
      <h2 className="col-span-12 my-5 text-3xl font-bold font-heading">
        Books
      </h2>

      {/* Cards container:
          - replace invalid "space-between" with "justify-between" (or use gap)
          - allow wrap so cards move to next line on small screens
      */}
      <div className="flex flex-row items-start justify-start col-span-12 gap-5">
        <div className={card}>
          <a</a>Book 1</div>
        <div className={card}>Book 2</div>
        <div className={card}>Book 3</div>
        <div className={card}>Book 4</div>
        <div className={card}>Book 5</div>
        <div className={card}>Book 6</div>
      </div>
    </div>
  );
}
