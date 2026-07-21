import http.server
import socketserver
import json
import os
import urllib.parse
from datetime import datetime

PORT = 8000
DB_FILE = 'quotes.json'

# Ensure DB exists
if not os.path.exists(DB_FILE):
    with open(DB_FILE, 'w') as f:
        json.dump([], f)

class QuoteHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        if self.path == '/api/quotes':
            with open(DB_FILE, 'r') as f:
                data = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(data.encode('utf-8'))
        elif self.path.startswith('/api/next-qtn'):
            # Parse query params
            parsed_path = urllib.parse.urlparse(self.path)
            query_params = urllib.parse.parse_qs(parsed_path.query)
            date_str = query_params.get('date', [None])[0]
            
            # Generate next QTN
            with open(DB_FILE, 'r') as f:
                quotes = json.load(f)
            
            if date_str:
                # Expecting YYYY-MM-DD, convert to YYYY-MMDD
                try:
                    dt = datetime.strptime(date_str, "%Y-%m-%d")
                    today = dt.strftime("%Y-%m%d")
                except ValueError:
                    today = datetime.now().strftime("%Y-%m%d")
            else:
                today = datetime.now().strftime("%Y-%m%d")

            count = 1
            for q in quotes:
                if q.get('qtn', '').startswith(f"GNX-QTN-{today}"):
                    count += 1
            
            next_qtn = f"GNX-QTN-{today}-{count:02d}"
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"qtn": next_qtn}).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/quotes':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            new_quote = json.loads(post_data.decode('utf-8'))
            
            with open(DB_FILE, 'r') as f:
                quotes = json.load(f)
            
            # Check if quote with this QTN already exists (update it)
            updated = False
            for i, q in enumerate(quotes):
                if q.get('qtn') == new_quote.get('qtn'):
                    quotes[i] = new_quote
                    updated = True
                    break
            
            if not updated:
                quotes.append(new_quote)

            with open(DB_FILE, 'w') as f:
                json.dump(quotes, f, indent=2)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success"}).encode('utf-8'))

with socketserver.TCPServer(("", PORT), QuoteHandler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
