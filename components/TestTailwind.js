export default function TestTailwind() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-indigo-600 mb-4">Tailwind CSS Test</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-500 p-4 text-white rounded-lg">Red Box</div>
        <div className="bg-blue-500 p-4 text-white rounded-lg">Blue Box</div>
        <div className="bg-green-500 p-4 text-white rounded-lg">Green Box</div>
      </div>
      <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
        Test Button
      </button>
    </div>
  )
}
