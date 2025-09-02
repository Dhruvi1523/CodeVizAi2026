import React, { useRef, useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import Editor from "@monaco-editor/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CodePage = () => {
    const editorRef = useRef(null);
    const [code, setCode] = useState("");


    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    // highlight active line





    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-[#0d1117] text-gray-200 font-sans">
                {/* Header */}
                <header className="flex justify-between items-center bg-[#161b22] px-6 py-4 shadow-lg border-b border-gray-800">
                    <h1 className="text-xl font-bold text-blue-400">CodeVizAI</h1>
                    <div className="flex gap-3 items-center">
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">
                            Run Code
                        </button>
                        <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow">
                            Complexity Analyzer
                        </button>
                        <button
                            onClick={() => document.getElementById("fileInput").click()}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow"
                        >
                            Upload Code File
                        </button>
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            ref={useRef()}
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const text = await file.text();
                                    setCode(text);
                                }
                            }}
                        />
                        <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow">
                            Flowchart Generation
                        </button>
                        <UserButton />
                    </div>
                </header>

                {/* Main Layout */}
                <div className="grid grid-cols-2 gap-6 p-6">
                    {/* Code Editor */}
                    <div className="flex flex-col gap-3">
                        <Editor
                            height="65vh"
                            theme="vs-dark"
                            defaultLanguage="javascript"
                            value={code}
                            onChange={(v) => setCode(v)}
                            onMount={handleEditorDidMount}
                        />
                        <button
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow disabled:opacity-50"
                        >
                            ▶ Play Animation
                        </button>
                    </div>


                </div>

                {/* Highlight CSS */}

            </div>
            <Footer />
        </div>
    );
};

export default CodePage;