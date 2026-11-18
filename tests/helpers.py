"""
Helper utilities and mock environments for E2E testing of the
Cô Duyên Anh Memorial Web application.
"""

import os
import re
import json
from html.parser import HTMLParser
from pathlib import Path
from PIL import Image

# Canonical project paths
WORKSPACE_DIR = Path(__file__).resolve().parent.parent
INDEX_HTML = WORKSPACE_DIR / "index.html"
DONGGOP_HTML = WORKSPACE_DIR / "donggop.html"
ALBUM_HTML = WORKSPACE_DIR / "album.html"
STYLES_CSS = WORKSPACE_DIR / "styles.css"
SCRIPT_JS = WORKSPACE_DIR / "script.js"
IMAGES_DIR = WORKSPACE_DIR / "images"
WISHES_JSON = WORKSPACE_DIR / "wishes.json"
CODE_GS = WORKSPACE_DIR / "Code.gs"
WEB_DIR = WORKSPACE_DIR.parent / "Web"


def read_workspace_file(path: Path) -> str:
    """Reads a file from the workspace with utf-8 encoding."""
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()


class SimpleDOMParser(HTMLParser):
    """A lightweight HTML Parser to extract elements, IDs, classes, and attributes."""

    def __init__(self):
        super().__init__()
        self.elements = []
        self.elements_by_id = {}
        self.elements_by_tag = {}
        self.element_stack = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        node = {
            "tag": tag,
            "attrs": attr_dict,
            "id": attr_dict.get("id"),
            "class": attr_dict.get("class", "").split(),
            "children": [],
            "parent": self.element_stack[-1] if self.element_stack else None,
            "order": len(self.elements),
        }
        self.elements.append(node)
        if node["id"]:
            self.elements_by_id[node["id"]] = node

        if tag not in self.elements_by_tag:
            self.elements_by_tag[tag] = []
        self.elements_by_tag[tag].append(node)

        if self.element_stack:
            self.element_stack[-1]["children"].append(node)

        # Void elements do not go onto the stack
        if tag not in ("img", "input", "br", "hr", "meta", "link", "source", "area"):
            self.element_stack.append(node)

    def handle_endtag(self, tag):
        if self.element_stack and self.element_stack[-1]["tag"] == tag:
            self.element_stack.pop()

    def get_element_by_id(self, elem_id):
        return self.elements_by_id.get(elem_id)

    def get_elements_by_tag(self, tag):
        return self.elements_by_tag.get(tag, [])

    def get_elements_by_class(self, class_name):
        return [el for el in self.elements if class_name in el.get("class", [])]


def parse_html(content: str) -> SimpleDOMParser:
    """Parses HTML content and returns a SimpleDOMParser instance."""
    parser = SimpleDOMParser()
    parser.feed(content)
    return parser


def parse_css_rules(css_text: str):
    """
    Parses a CSS string into selector -> properties dictionary mapping.
    Handles nested media queries cleanly.
    """
    clean_css = re.sub(r'/\*.*?\*/', '', css_text, flags=re.DOTALL)
    rules = []
    
    # Simple regex block parser for selector { declarations }
    pattern = re.compile(r'([^{]+)\{([^}]+)\}')
    for match in pattern.finditer(clean_css):
        selector = match.group(1).strip()
        body = match.group(2).strip()
        
        # Parse property declarations
        props = {}
        for decl in body.split(';'):
            decl = decl.strip()
            if not decl or ':' not in decl:
                continue
            prop, val = decl.split(':', 1)
            props[prop.strip().lower()] = val.strip()
            
        rules.append({
            "selector": selector,
            "properties": props
        })
    return rules


class MockLocalStorage:
    """Simulates the browser LocalStorage API for data persistence testing."""

    def __init__(self, initial_data=None):
        self._store = {}
        if initial_data:
            for k, v in initial_data.items():
                self.setItem(k, v)

    def getItem(self, key: str):
        return self._store.get(key, None)

    def setItem(self, key: str, value: str):
        self._store[key] = str(value)

    def removeItem(self, key: str):
        if key in self._store:
            del self._store[key]

    def clear(self):
        self._store.clear()

    def key(self, index: int):
        keys = list(self._store.keys())
        return keys[index] if index < len(keys) else None

    @property
    def length(self):
        return len(self._store)


class MockBroadcastChannel:
    """Simulates the HTML5 BroadcastChannel API for multi-tab synchronization testing."""
    _channels = {}

    def __init__(self, name: str):
        self.name = name
        self.listeners = []
        if name not in MockBroadcastChannel._channels:
            MockBroadcastChannel._channels[name] = []
        MockBroadcastChannel._channels[name].append(self)

    def postMessage(self, message):
        peers = [ch for ch in MockBroadcastChannel._channels.get(self.name, []) if ch is not self]
        for peer in peers:
            for listener in peer.listeners:
                listener({"data": message})

    def addEventListener(self, event_type, callback):
        if event_type == "message":
            self.listeners.append(callback)

    def close(self):
        if self.name in MockBroadcastChannel._channels:
            if self in MockBroadcastChannel._channels[self.name]:
                MockBroadcastChannel._channels[self.name].remove(self)

    @classmethod
    def reset_all(cls):
        cls._channels.clear()


def verify_image_is_valid_webp(image_path: Path) -> bool:
    """Verifies that an image file exists, is non-empty, and is valid WebP."""
    if not image_path.exists() or image_path.stat().st_size == 0:
        return False
    try:
        with Image.open(image_path) as img:
            return img.format == "WEBP"
    except Exception:
        return False
