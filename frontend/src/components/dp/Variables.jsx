export default function Variables(data) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg h-full">
      <ul className="space-y-2">
        {Object.entries(data).map(([key, value]) => (
          <li key={key} className="flex justify-between font-mono text-lg">
            <span className="text-gray-400">{key}:</span>
            <span className="text-white font-bold">{String(value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}