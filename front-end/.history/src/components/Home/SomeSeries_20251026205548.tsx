export function Someseries() {
  return (
      <div className="grid grid-cols-4 grid-rows-2 px-16 py-6">
        {/* Title and See All */}
        <div className="flex items-center justify-between col-span-4 my-5">
          <h2 className="text-3xl font-bold font-heading text-beige-900">
            Series
          </h2>
          <a
            href="/series"
            className="text-base font-medium transition-colors text-beige-700 hover:text-beige-900 hover:underline"
          >
            See All →
          </a>
        </div>

        {/* Series Grid */}
        <div className="flex flex-row items-start justify-between col-span-4 gap-8 pb-4 overflow-x-auto">
          <div className="col-span-1 row-span-1">Book1 </div>
          <div className="col-span-1">Book2 </div>
          <div className="col-span-1">Book3 </div>
          <div className="col-span-1">Book4 </div>
        </div>
      </div>
  );
}
