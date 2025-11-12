export function Somebooks() {
  const card="width-"
  return (
    <div className="grid grid-cols-12 grid-rows-3 px-16 py-3">
      <h2 className="row-span-1 text-xl font-bold font-heading">Books</h2>
      <div className="flex col-span-12 row-span-2 gap-4 my-2 flex-direction-row">
        <div className="col-span-2 bg-gray-200">Book 1</div>
        <div className="col-span-2 bg-gray-200">Book 2</div>
        <div className="col-span-2 bg-gray-200">Book 3</div>
        <div className="col-span-2 bg-gray-200">Book 4</div>
        <div className="col-span-2 bg-gray-200">Book 5</div>
        <div className="col-span-2 bg-gray-200">Book 6</div>
      </div>
      
    </div>
  );
}
