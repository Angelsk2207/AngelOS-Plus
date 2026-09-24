import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const AWS_ROOT = path.join(process.cwd(), 'AWS_LOCAL_ROOT');
const DB_PATH = path.join(AWS_ROOT, 'backend_cloud.db');

// Ensure base structure
if (!fs.existsSync(AWS_ROOT)) {
  fs.mkdirSync(AWS_ROOT, { recursive: true });
}

const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    metadata TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    document TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS resource_policies (
    resource_id INTEGER,
    policy_id INTEGER,
    FOREIGN KEY(resource_id) REFERENCES resources(id),
    FOREIGN KEY(policy_id) REFERENCES policies(id),
    PRIMARY KEY(resource_id, policy_id)
  )
`);

app.use(cors());
app.use(bodyParser.json());

// API Routes
app.get('/api/resources', (req, res) => {
  const resources = db.prepare('SELECT * FROM resources ORDER BY id DESC').all();
  res.json(resources);
});

// Policies API
app.get('/api/policies', (req, res) => {
  const policies = db.prepare('SELECT * FROM policies ORDER BY id DESC').all();
  res.json(policies);
});

app.post('/api/policies', (req, res) => {
  const { name, document } = req.body;
  const created_at = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO policies (name, document, created_at) VALUES (?, ?, ?)');
  const info = stmt.run(name, document, created_at);
  res.json({ id: info.lastInsertRowid, status: 'ok' });
});

app.put('/api/policies/:id', (req, res) => {
  const { document } = req.body;
  const stmt = db.prepare('UPDATE policies SET document = ? WHERE id = ?');
  stmt.run(document, req.params.id);
  res.json({ status: 'updated' });
});

app.delete('/api/policies/:id', (req, res) => {
  db.prepare('DELETE FROM policies WHERE id = ?').run(req.params.id);
  db.prepare('DELETE FROM resource_policies WHERE policy_id = ?').run(req.params.id);
  res.json({ status: 'deleted' });
});

app.post('/api/resources/:id/policies', (req, res) => {
  const { policy_id } = req.body;
  const stmt = db.prepare('INSERT OR IGNORE INTO resource_policies (resource_id, policy_id) VALUES (?, ?)');
  stmt.run(req.params.id, policy_id);
  res.json({ status: 'attached' });
});

app.get('/api/resources/:id/policies', (req, res) => {
  const policies = db.prepare(`
    SELECT p.* FROM policies p 
    JOIN resource_policies rp ON p.id = rp.policy_id 
    WHERE rp.resource_id = ?
  `).all(req.params.id);
  res.json(policies);
});

app.post('/api/resources', (req, res) => {
  const { service, name, metadata } = req.body;
  const created_at = new Date().toISOString();
  const status = 'RUNNING';
  
  const stmt = db.prepare('INSERT INTO resources (service, name, status, created_at, metadata) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(service.toUpperCase(), name, status, created_at, JSON.stringify(metadata || {}));
  
  const servicePath = path.join(AWS_ROOT, 'REGION_SA_EAST_1', 'SERVICES', service.toUpperCase(), name);
  fs.mkdirSync(servicePath, { recursive: true });
  
  const consoleMd = `# ${service.toUpperCase()} Console: ${name}
  
**Status:** ${status}
**Created At:** ${created_at}

## Resource Details
- Service Type: ${service.toUpperCase()}
- Resource Name: ${name}
- ID: ${info.lastInsertRowid}
`;
  fs.writeFileSync(path.join(servicePath, 'console.md'), consoleMd);
  
  updateDashboard();
  res.json({ id: info.lastInsertRowid, status: 'ok' });
});

app.delete('/api/resources/:id', (req, res) => {
  db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id);
  updateDashboard();
  res.json({ status: 'deleted' });
});

function updateDashboard() {
  const resources = db.prepare('SELECT * FROM resources').all() as any[];
  const policies = db.prepare('SELECT * FROM policies').all() as any[];
  
  let md = `# ☁️ AWS Offline Console Dashboard\n\n`;
  md += `## 🛠️ Main Menu\n- [EC2 (Computação)](#)\n- [S3 (Storage)](#)\n- [Lambda (Serverless)](#)\n- [IAM (Segurança)](#)\n\n`;
  
  md += `## 📜 IAM Managed Policies (${policies.length})\n`;
  if (policies.length > 0) {
    md += `| Name | Created At |\n`;
    md += `|------|------------|\n`;
    policies.forEach(p => {
      md += `| ${p.name} | ${p.created_at} |\n`;
    });
    md += `\n`;
  } else {
    md += `*Nenhuma policy gerenciada encontrada.*\n\n`;
  }
  
  md += `## 🚀 Active Resources (${resources.length})\n`;
  md += `| ID | Service | Name | Status | Link |\n`;
  md += `|----|---------|------|--------|------|\n`;
  
  resources.forEach(r => {
    const link = `./REGION_SA_EAST_1/SERVICES/${r.service}/${r.name}/console.md`;
    md += `| ${r.id} | ${r.service} | ${r.name} | ${r.status} | [Manage](${link}) |\n`;
  });
  
  fs.writeFileSync(path.join(AWS_ROOT, 'DASHBOARD_AWS.md'), md);
}

// Initial dashboard creation
updateDashboard();

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
