export function Somebooks() {
  return (
    <div className="grid grid-cols-12 grid-rows-3 px-16 py-3">
      <h2 className="row-span-1 text-xl font-bold font-heading">Books</h2>
      <div className="flex col-span-12 row-span-2 gap-2 flex-direction-row">
        <div className="col-span-2 row-span-1 bg-gray-200">Book 1</div>
        <div className="col-span-2 row-span-1 bg-gray-200">Book 2</div>
        <div className="col-span-2 row-span-1 bg-gray-200">Book 3</div>
      </div>
      
    </div>
  );
}
