import React from 'react';
import Editor from '@monaco-editor/react';
import { Play, ChevronDown } from 'lucide-react';
import { defineCodVizTheme } from "../utils/monacoTheme";


export default function EditorPanel({ code, setCode, onRun, onFlowchart, isLoading, handleEditorBeforeMount, editorRef, monacoRef }) {
    return (
        <div className="h-full w-full flex flex-col gap-2 bg-[#0f172a] border border-[#334155] ">
            {/* --- Integrated Header --- */}
            <div className="flex-shrink-0 flex items-center justify-between p-2 border-b border-[#334155] bg-[#1e293b]">
                {/* Left Side: Language Selector */}
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-[#334155] hover:bg-opacity-80 text-[#f1f5f9] rounded-md font-semibold text-sm">
                        <span>Python</span>
                        <ChevronDown size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                   
                    <button
                        onClick={onRun}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] hover:opacity-90 text-[#f1f5f9] rounded-lg font-semibold disabled:opacity-50"
                    >
                        <Play size={16} className="fill-current" />
                        {isLoading ? 'Running...' : 'Run'}
                    </button>
                </div>
            </div>

            {/* --- Editor Area --- */}
            <div className="flex-grow min-h-0  m-4 rounded-lg overflow-hidden">
                <Editor
                    height="100%"
                    theme="CodVizDark" // Your custom theme
                    defaultLanguage="python"
                    value={code}
                    beforeMount={defineCodVizTheme}
                    onMount={(editor, monaco) => {
                        editorRef.current = editor;
                        monacoRef.current = monaco;
                    }}
                    onChange={(val) => setCode(val || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                    }}
                />
            </div>
        </div>
    );
}