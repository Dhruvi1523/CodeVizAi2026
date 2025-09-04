export default function DPArray({ steps, highlightedIndex }) {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {steps.map((value, index) => {
        const isHighlighted = index === highlightedIndex;
        return (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-14 h-14 border border-gray-700 flex items-center justify-center rounded font-semibold transition-colors duration-300 ${isHighlighted ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-white'}`}>
              {value === Infinity ? '∞' : value}
            </div>
            <div className="text-xs text-gray-400 mt-1">{index}</div>
          </div>
        );
      })}
    </div>
  );
}