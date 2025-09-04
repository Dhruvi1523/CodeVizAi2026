export default function MemoTable({ memo }) {
  if (!memo || Object.keys(memo).length === 0) {
    return <p className="text-gray-400">No memoization data yet.</p>;
  }

  return (
    <div className="overflow-auto max-h-[500px] border border-gray-700 rounded-lg">
      <table className="border-collapse text-sm w-full">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-2 py-1 border border-gray-700">Key</th>
            <th className="px-2 py-1 border border-gray-700">Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(memo).map(([key, val]) => (
            <tr key={key} className="text-white bg-gray-900">
              <td className="border border-gray-700 px-2 font-mono">{key}</td>
              <td className="border border-gray-700 px-2 font-mono">{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}