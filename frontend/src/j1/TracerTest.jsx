import CodeEditor from "./j1";

export default function TracerTest() {
  const handleRun = (code) => {
    console.log("Code submitted:", code);
    // 🔗 Later: send this to backend with Axios
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white flex flex-col items-center justify-center">
      <CodeEditor onRun={handleRun} />
    </div>
  );
}