#!/usr/bin/env python3
"""
Bundles the Middle Ear 3D Room Diorama into a single self-contained HTML file:
  dist/Middle-Ear-3D-Standalone.html

The output file has ZERO external dependencies (inlines styles.css, Three.js, and all
ES modules under src/) so you can:
  - Double-click it offline on any Mac/Windows/Linux computer (works directly over file://)
  - Send it to friends over AirDrop, iMessage, Discord, Slack, or Email
  - Drag-and-drop the dist/ folder onto https://app.netlify.com/drop or Cloudflare Pages for an instant URL
"""
import json
import os
import posixpath
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DIST_DIR = ROOT / "dist"
OUT_HTML = DIST_DIR / "Middle-Ear-3D-Standalone.html"

IMPORT_RE = re.compile(
    r"""(\b(?:import|export)\s+(?:[^'"]*?\s+from\s+)?)(['"])(\.[^'"]+)\2"""
)


def rewrite_relative_imports(code: str, rel_posix_dir: str) -> str:
    def _repl(match: re.Match) -> str:
        prefix, quote, target = match.group(1), match.group(2), match.group(3)
        resolved = posixpath.normpath(posixpath.join(rel_posix_dir, target))
        return f"{prefix}{quote}@app/{resolved}{quote}"

    return IMPORT_RE.sub(_repl, code)


def build_bundle() -> Path:
    index_html = (ROOT / "index.html").read_text(encoding="utf-8")
    styles_css = (ROOT / "styles.css").read_text(encoding="utf-8")
    three_js = (ROOT / "vendor" / "three.module.min.js").read_text(encoding="utf-8")

    modules = {"three": three_js}
    for js_path in sorted((ROOT / "src").rglob("*.js")):
        rel_posix = js_path.relative_to(ROOT).as_posix()
        rel_dir = posixpath.dirname(rel_posix)
        raw_code = js_path.read_text(encoding="utf-8")
        modules[f"@app/{rel_posix}"] = rewrite_relative_imports(raw_code, rel_dir)

    # Escape closing script tags safely inside JSON payload
    payload_json = json.dumps(modules, separators=(",", ":")).replace("</", "<\\/")

    # Replace external stylesheet + importmap + module entry with self-contained inline bundle
    html = index_html.replace(
        '<link rel="stylesheet" href="./styles.css" />',
        f"<style>\n{styles_css}\n</style>",
    )
    html = re.sub(
        r"<script type=\"importmap\">.*?</script>",
        "",
        html,
        flags=re.DOTALL,
    )

    loader_script = f"""<script>
(function () {{
  const rawModules = {payload_json};
  const imports = {{}};
  for (const [spec, source] of Object.entries(rawModules)) {{
    const blob = new Blob([source], {{ type: 'text/javascript' }});
    imports[spec] = URL.createObjectURL(blob);
  }}
  const mapEl = document.createElement('script');
  mapEl.type = 'importmap';
  mapEl.textContent = JSON.stringify({{ imports }});
  document.currentScript.after(mapEl);

  const entryEl = document.createElement('script');
  entryEl.type = 'module';
  entryEl.textContent = "import '@app/src/main.js';";
  mapEl.after(entryEl);
}})();
</script>"""

    html = html.replace(
        '<script type="module" src="./src/main.js"></script>',
        loader_script,
    )

    DIST_DIR.mkdir(parents=True, exist_ok=True)
    OUT_HTML.write_text(html, encoding="utf-8")
    # Also write dist/index.html copy so dragging the `dist` folder onto Netlify Drop works out-of-the-box!
    (DIST_DIR / "index.html").write_text(html, encoding="utf-8")
    size_kb = os.path.getsize(OUT_HTML) / 1024.0
    print(f"Built standalone bundle: {OUT_HTML} ({size_kb:.1f} KB, {len(modules)} modules inlined)")
    return OUT_HTML


if __name__ == "__main__":
    build_bundle()
