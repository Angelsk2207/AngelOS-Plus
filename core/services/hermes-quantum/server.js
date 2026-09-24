const http = require('http');
const crypto = require('crypto');
const port = Number(process.env.PORT || 3000);
const started = new Date().toISOString();
const queue = [];
const json = (res, code, body) => { res.writeHead(code, {'content-type':'application/json'}); res.end(JSON.stringify(body)); };
const authorized = (req) => !process.env.HERMES_API_KEY || req.headers['x-api-key'] === process.env.HERMES_API_KEY;
const body = (req) => new Promise((resolve, reject) => { let raw=''; req.on('data', c => raw += c); req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); } }); });
const server = http.createServer(async (req, res) => {
  if (req.url === '/healthz') return json(res, 200, {status:'ok', service:'hermes-quantum'});
  if (!authorized(req)) return json(res, 401, {error:'unauthorized'});
  if (req.url === '/v1/status' && req.method === 'GET') return json(res, 200, {service:'hermes-quantum', role:'coordination-cabin', mode:'quantum', started, queue_depth:queue.length});
  if (req.url === '/v1/command' && req.method === 'POST') {
    try {
      const input = await body(req);
      if (!input.command) return json(res, 400, {error:'command_required'});
      const job = {id: crypto.randomUUID(), command: String(input.command), payload: input.payload || {}, status:'accepted', created_at:new Date().toISOString()};
      queue.push(job);
      return json(res, 202, job);
    } catch { return json(res, 400, {error:'invalid_json'}); }
  }
  if (req.url === '/v1/queue' && req.method === 'GET') return json(res, 200, {items:queue.slice(-20), count:queue.length});
  if (req.url === '/') return json(res, 200, {service:'hermes-quantum', status:'ready', endpoints:['/healthz','/v1/status','/v1/command','/v1/queue']});
  return json(res, 404, {error:'not_found'});
});
server.listen(port, '0.0.0.0', () => console.log(`Hermes listening on ${port}`));
