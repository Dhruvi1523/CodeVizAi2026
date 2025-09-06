// This function defines your custom theme for the Monaco Editor.
export function defineCodVizTheme(monaco) {
   monaco.editor.defineTheme("CodVizDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "8b5cf6" },
        { token: "number", foreground: "f59e0b" },
        { token: "string", foreground: "14b8a6" },
        { token: "comment", foreground: "94a3b8", fontStyle: "italic" },
        { token: "identifier", foreground: "f1f5f9" },
        { token: "operator", foreground: "f59e0b" },
      ],
      colors: {
        "editor.background": "#1e293b",
        "editor.foreground": "#f1f5f9",
        "editorCursor.foreground": "#6366f1",
        "editorLineNumber.foreground": "#475569",
        "editor.selectionBackground": "#33415599",
        "editorGutter.background": "#1e293b",
      },
    });
}