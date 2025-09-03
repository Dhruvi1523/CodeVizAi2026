from tree_sitter import Parser , Language
import tree_sitter_python
import tree_sitter_javascript
import tree_sitter_cpp
import tree_sitter_java

# Map language names to grammars
LANGUAGES = {
    "python": tree_sitter_python.language(),
    "javascript": tree_sitter_javascript.language(),
    "cpp": tree_sitter_cpp.language(),
    "java": tree_sitter_java.language()
}

def get_parser(lang: str):
    if lang not in LANGUAGES:
        raise ValueError(f"Unsupported language: {lang}")
    parser = Parser(Language(LANGUAGES[lang]))
    return parser