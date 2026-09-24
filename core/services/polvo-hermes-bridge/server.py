import json, os, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get('PORT', '3000'))
HERMES = os.environ.get('HERMES_BASE_URL', 'https://atena-hermes-quantum-b81f56b01.onrunxbuild.com').rstrip('/')
KEY = os.environ.get('HERMES_API_KEY', '')

class Handler(BaseHTTPRequestHandler):
    def send_json(self, code, data):
        raw = json.dumps(data).encode()
        self.send_response(code); self.send_header('content-type','application/json'); self.end_headers(); self.wfile.write(raw)
    def do_GET(self):
        if self.path == '/healthz': return self.send_json(200, {'status':'ok','service':'polvo-hermes-bridge'})
        if self.path == '/': return self.send_json(200, {'service':'polvo-hermes-bridge','status':'ready','target':HERMES})
        return self.send_json(404, {'error':'not_found'})
    def do_POST(self):
        if self.path != '/v1/command': return self.send_json(404, {'error':'not_found'})
        if KEY and self.headers.get('x-api-key') != KEY: return self.send_json(401, {'error':'unauthorized'})
        try:
            n=int(self.headers.get('content-length','0')); payload=self.rfile.read(n)
            req=urllib.request.Request(HERMES+'/v1/command',data=payload,method='POST',headers={'content-type':'application/json','x-api-key':KEY})
            with urllib.request.urlopen(req,timeout=20) as r: data=json.load(r); code=r.status
            return self.send_json(code,data)
        except Exception as e: return self.send_json(502, {'error':'hermes_unreachable'})
    def log_message(self, *args): pass

ThreadingHTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
