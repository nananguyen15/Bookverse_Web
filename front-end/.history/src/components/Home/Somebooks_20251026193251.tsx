export function Somebooks() {
  // Updated card sizes (responsive) and fixed tailwind typos
  const card =
    "w-40 sm:w-48 md:w-56 lg:w-64 h-36 sm:h-44 md:h-52 bg-gray-300 rounded-md animate-pulse flex items-center justify-center flex-shrink-0";

  return (
    <div className="grid grid-cols-12 px-16 py-6">
      {/* Title spans full width and has spacing */}
      <h2 className="col-span-12 my-4 text-xl font-bold font-heading">
        Books
      </h2>

      {/* Cards container: fixed typos, allow wrap, align to start */}
      <div className="flex flex-row items-start col-span-12 row-span-2 gap-4">
        <div className={card}>Book 1</div>
        <div className={card}>Book 2</div>
        <div className={card}>Book 3</div>
        <div className={card}>Book 4</div>
        <div className={card}>Book 5</div>
        <div className={card}>Book 6</div>
      </div>
    </div>
  );
}
