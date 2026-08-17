"""Static server for local preview that never lets the browser cache.

python -m http.server sends only Last-Modified, so Chrome applies heuristic
freshness and can serve a stale stylesheet against fresh HTML — which looks
exactly like a layout bug.
"""
import http.server
import functools
import pathlib
import sys

# resolved from this file, so renaming the repo or moving the checkout costs
# nothing
ROOT = str(pathlib.Path(__file__).resolve().parent.parent)
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, *a):
        pass


handler = functools.partial(NoCache, directory=ROOT)
with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
    print(f"serving {ROOT} on http://127.0.0.1:{PORT}")
    httpd.serve_forever()
