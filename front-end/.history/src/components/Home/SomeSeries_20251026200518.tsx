export function Someseries() {
  return (
    <div className="px-16 py-6 bg-beige-50">
      <h2 className="text-3xl font-bold font-heading text-beige-900 mb-6">
        Popular Series
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder content */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Series 1</h3>
          <p className="text-beige-600">Coming soon...</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Series 2</h3>
          <p className="text-beige-600">Coming soon...</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Series 3</h3>
          <p className="text-beige-600">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}