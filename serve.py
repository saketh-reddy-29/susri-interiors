import http.server
import socketserver
import os
import urllib.parse
import mimetypes
import sys

PORT = 3000
DIRECTORY = os.path.abspath(os.path.dirname(__file__))

mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("font/woff", ".woff")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")

class SusriHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Handle Next.js image proxy /_next/image?url=...
        if path.startswith("/_next/image"):
            qs = urllib.parse.parse_qs(parsed.query)
            if "url" in qs and qs["url"]:
                img_rel = urllib.parse.unquote(qs["url"][0]).lstrip("/")
                img_path = os.path.join(DIRECTORY, img_rel)
                if os.path.isfile(img_path):
                    self.send_response(200)
                    ctype, _ = mimetypes.guess_type(img_path)
                    self.send_header("Content-Type", ctype or "application/octet-stream")
                    self.send_header("Content-Length", str(os.path.getsize(img_path)))
                    self.send_header("Cache-Control", "public, max-age=31536000, immutable")
                    self.end_headers()
                    with open(img_path, "rb") as f:
                        self.wfile.write(f.read())
                    return

        # Handle clean URLs (e.g. /about, /archive, /archive/camber)
        local_path = os.path.normpath(os.path.join(DIRECTORY, path.lstrip("/")))

        # If it's a directory and has index.html
        if os.path.isdir(local_path):
            idx = os.path.join(local_path, "index.html")
            if os.path.isfile(idx):
                self.serve_file(idx, "text/html; charset=utf-8")
                return

        # If file does not exist, check if appending .html matches
        if not os.path.exists(local_path):
            html_candidate = local_path + ".html"
            if os.path.isfile(html_candidate):
                self.serve_file(html_candidate, "text/html; charset=utf-8")
                return
            idx_candidate = os.path.join(local_path, "index.html")
            if os.path.isfile(idx_candidate):
                self.serve_file(idx_candidate, "text/html; charset=utf-8")
                return

        # If it's a missing _next chunk or manifest, return empty JS so browser doesn't throw 404
        if path.startswith("/_next/") and not os.path.exists(local_path):
            if path.endswith(".js"):
                self.send_response(200)
                self.send_header("Content-Type", "application/javascript")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
            elif path.endswith(".css"):
                self.send_response(200)
                self.send_header("Content-Type", "text/css")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return

        # Fallback to standard handler
        return super().do_GET()

    def serve_file(self, filepath, content_type):
        try:
            with open(filepath, "rb") as f:
                data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:
            self.send_error(500, f"Error reading file: {e}")

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

def run_server():
    port = PORT
    for attempt in range(10):
        try:
            handler = SusriHTTPHandler
            with socketserver.TCPServer(("", port), handler) as httpd:
                print("=" * 60)
                print(f"  SUSRI INTERIORS - Local Server Running")
                print(f"  URL: http://localhost:{port}")
                print(f"  Serving directory: {DIRECTORY}")
                print(f"  Press Ctrl+C to stop.")
                print("=" * 60)
                sys.stdout.flush()
                httpd.serve_forever()
        except OSError as e:
            if e.errno == 10048 or "address already in use" in str(e).lower():
                port += 1
            else:
                raise

if __name__ == "__main__":
    run_server()

