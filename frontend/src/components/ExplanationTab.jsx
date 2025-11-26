import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Explanation({ fullExplanation }) {
  return (
    <div
      className="
        prose prose-invert 
        max-w-none
        bg-slate-800 
        p-6 
        rounded-xl 
        shadow-xl 
        overflow-y-auto 
        max-h-[75vh]
        border border-slate-700
      "
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {fullExplanation || "Select this tab to generate an AI explanation of your code."}
      </ReactMarkdown>
    </div>
  );
}
