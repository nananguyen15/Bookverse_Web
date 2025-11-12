export function Somebooks() {
  const card=" width-full h-4 bg-gray-300 rounded-md animate-pulse ";
  return (
    <div className="grid grid-cols-12 grid-rows-3 px-16 py-3">
      <h2 className="row-span-1 text-2xl font-bold font-heading">Books</h2>
      <div className="flex col-span-12 row-span-2 gap-4 flex-direction-row">
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
