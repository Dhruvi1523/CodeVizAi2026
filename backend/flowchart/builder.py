from .handlers import Handlers
from .parser_loader import get_parser
from .utils import new_id

class FlowchartBuilder:
    def __init__(self, code: str, lang: str = "python"):
        self.code = code
        self.parser = get_parser(lang)
        self.ast_root = self.parser.parse(bytes(code, "utf8")).root_node
        self.handlers = Handlers(self)

        self.nodes, self.edges = [], []
        self.start_node = self.add_node("Start", "start", "#22c55e")
        self.end_node = self.add_node("End", "end", "#ef4444")

    def add_node(self, label, type="process", color="#6366f1"):
        node_id = new_id()
        # Position is initially set to 0; the frontend will calculate the layout.
        self.nodes.append({
            "id": node_id, "data": {"label": label}, "type": type,
            "style": {"background": color, "color": "white"},
            "position": {"x": 0, "y": 0}
        })
        return node_id

    def add_edge(self, src, tgt, label=None):
        if not src or not tgt or src == tgt: return
        edge_id = f"e{src}-{tgt}-{label or ''}-{new_id()}"
        edge = {"id": edge_id, "source": src, "target": tgt}
        if label:
            edge["label"] = str(label)
        if not any(e['source'] == src and e['target'] == tgt and e.get('label') == label for e in self.edges):
            self.edges.append(edge)
    
    def build(self):
        """Builds the flowchart and returns the final elements."""
        last_node_id = self.handlers.handle_block(self.ast_root, self.start_node)
        self.add_edge(last_node_id, self.end_node)
        
        # The frontend is responsible for layout, so we just return the nodes and edges.
        return {"nodes": self.nodes, "edges": self.edges}