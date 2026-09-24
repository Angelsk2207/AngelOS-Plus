import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Terminal, 
  Database, 
  Cloud, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  HardDrive,
  Cpu,
  Zap,
  Lock,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { cn } from './lib/utils';

interface Resource {
  id: number;
  service: string;
  name: string;
  status: string;
  created_at: string;
  metadata: string;
}

interface Policy {
  id: number;
  name: string;
  document: string;
  created_at: string;
}

export default function App() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ec2' | 's3' | 'lambda' | 'iam'>('dashboard');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isCreatingPolicy, setIsCreatingPolicy] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [newResource, setNewResource] = useState({ service: 'S3', name: '' });
  const [newPolicy, setNewPolicy] = useState({ name: '', document: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": "*",\n      "Resource": "*"\n    }\n  ]\n}' });
  const [aiDescription, setAiDescription] = useState('');
  const [fetchingAi, setFetchingAi] = useState(false);
  const [attachedPolicies, setAttachedPolicies] = useState<Record<number, Policy[]>>({});

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const fetchAiDescription = async () => {
    setFetchingAi(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a very short, one-sentence description of the AWS service ${newResource.service} for a local documentation console. Be concise.`,
      });
      setAiDescription(response.text || "AWS Service description.");
    } catch (err) {
      setAiDescription("Offline: Could not reach AI engine.");
    } finally {
      setFetchingAi(false);
    }
  };

  useEffect(() => {
    if (isProvisioning) {
      fetchAiDescription();
    } else {
      setAiDescription('');
    }
  }, [newResource.service, isProvisioning]);

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      setResources(data);
      
      // Fetch attachments for IAM resources
      const iamResources = data.filter((r: Resource) => r.service === 'IAM');
      for (const r of iamResources) {
        fetchAttachedPolicies(r.id);
      }
    } catch (err) {
      console.error("Failed to fetch resources", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      const res = await fetch('/api/policies');
      const data = await res.json();
      setPolicies(data);
    } catch (err) {
      console.error("Failed to fetch policies", err);
    }
  };

  const fetchAttachedPolicies = async (resourceId: number) => {
    try {
      const res = await fetch(`/api/resources/${resourceId}/policies`);
      const data = await res.json();
      setAttachedPolicies(prev => ({ ...prev, [resourceId]: data }));
    } catch (err) {
      console.error("Failed to fetch attached policies", err);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchPolicies();
  }, []);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.name) return;
    
    try {
      await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResource),
      });
      setNewResource({ service: 'S3', name: '' });
      setIsProvisioning(false);
      fetchResources();
    } catch (err) {
      console.error("Provisioning failed", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      fetchResources();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy),
      });
      setNewPolicy({ name: '', document: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": "*",\n      "Resource": "*"\n    }\n  ]\n}' });
      setIsCreatingPolicy(false);
      fetchPolicies();
    } catch (err) {
      console.error("Policy creation failed", err);
    }
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;
    try {
      await fetch(`/api/policies/${editingPolicy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: editingPolicy.document }),
      });
      setEditingPolicy(null);
      fetchPolicies();
    } catch (err) {
      console.error("Policy update failed", err);
    }
  };

  const handleDeletePolicy = async (id: number) => {
    try {
      await fetch(`/api/policies/${id}`, { method: 'DELETE' });
      fetchPolicies();
      fetchResources(); // Refresh attachments
    } catch (err) {
      console.error("Delete policy failed", err);
    }
  };

  const handleAttachPolicy = async (resourceId: number, policyId: number) => {
    try {
      await fetch(`/api/resources/${resourceId}/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policy_id: policyId }),
      });
      fetchAttachedPolicies(resourceId);
    } catch (err) {
      console.error("Attach policy failed", err);
    }
  };

  const generateMarkdown = () => {
    let md = `# ☁️ AWS Offline Console Dashboard\n\n`;
    md += `## 🛠️ Main Menu\n`;
    md += `*   [**EC2** (Computação)](#)\n`;
    md += `*   [**S3** (Storage)](#)\n`;
    md += `*   [**Lambda** (Serverless)](#)\n`;
    md += `*   [**IAM** (Segurança)](#)\n\n`;
    
    md += `## 🚀 Active Resources\n\n`;
    if (resources.length === 0) {
      md += `*Não há recursos ativos no momento. Use o botão "Provision" para criar um.*`;
    } else {
      md += `| ID | Service | Name | Status | Link |\n`;
      md += `|----|---------|------|--------|------|\n`;
      resources.forEach(r => {
        md += `| ${r.id} | ${r.service} | ${r.name} | \`${r.status}\` | [Manage](#) |\n`;
      });
    }
    
    md += `\n\n---
*Gerado automaticamente pelo AWS_Mock_Engine motor Python em Z:\\AWS_LOCAL*`;
    return md;
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ec2', label: 'EC2', icon: Cpu },
    { id: 's3', label: 'S3', icon: HardDrive },
    { id: 'lambda', label: 'Lambda', icon: Zap },
    { id: 'iam', label: 'IAM', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-[#d4d4d4] overflow-hidden font-sans">
      {/* Sidebar - Obsidian Style */}
      <aside className="w-64 border-r border-[#333] bg-[#252526] flex flex-col">
        <div className="p-4 flex items-center gap-2 border-b border-[#333]">
          <div className="bg-orange-500 p-1.5 rounded-md">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">AWS OFFLINE CONSOLE</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase font-bold text-[#666] tracking-widest">
            Main Management
          </div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                activeTab === item.id 
                  ? "bg-[#37373d] text-white" 
                  : "text-[#858585] hover:bg-[#2a2d2e] hover:text-[#d4d4d4]"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#333]">
          <button 
            onClick={() => setIsProvisioning(true)}
            className="w-full bg-[#3e3e3e] hover:bg-[#4d4d4d] text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Provision New
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#1e1e1e] overflow-y-auto relative">
        <header className="h-12 border-b border-[#333] flex items-center justify-between px-6 bg-[#1e1e1e] sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-[#858585]">
            <span>AWS_LOCAL</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#d4d4d4] capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchResources} className="p-1 hover:bg-[#333] rounded-md transition-colors">
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeTab}
            className="markdown-body"
          >
            {activeTab === 'dashboard' ? (
              <ReactMarkdown>{generateMarkdown()}</ReactMarkdown>
            ) : (
              <div>
                <div className="flex items-center justify-between border-b border-[#333] pb-2 mb-6">
                  <h1 className="text-2xl font-bold text-[#e0e0e0] flex items-center gap-2 uppercase">
                    {activeTab} Management
                  </h1>
                  {activeTab === 'iam' && (
                    <button 
                      onClick={() => setIsCreatingPolicy(true)}
                      className="text-xs bg-[#2d2d2d] hover:bg-[#333] px-3 py-1.5 rounded border border-[#444] flex items-center gap-2 transition-colors"
                    >
                      <Lock className="w-3 h-3" />
                      Create Policy
                    </button>
                  )}
                </div>
                
                <p className="text-[#858585]">
                  Filtro local para serviços do tipo <strong>{activeTab.toUpperCase()}</strong> em <code>REGION_SA_EAST_1</code>.
                </p>
                
                {activeTab === 'iam' && policies.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-sm font-bold text-[#666] uppercase tracking-widest mb-4">Managed Policies ({policies.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {policies.map(p => (
                        <div key={p.id} className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#569cd6]" />
                              <span className="font-medium text-sm text-[#d4d4d4]">{p.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => setEditingPolicy(p)} className="p-1.5 hover:bg-[#333] rounded text-[#569cd6] hover:text-[#9cdcfe]">
                                <Terminal className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleDeletePolicy(p.id)} className="p-1.5 hover:bg-[#333] rounded text-red-500/50 hover:text-red-500">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <pre className="text-[10px] bg-[#111] p-2 rounded overflow-x-auto text-[#858585] max-h-24">
                            {p.document}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 space-y-4">
                  <h2 className="text-sm font-bold text-[#666] uppercase tracking-widest mb-4">Resources</h2>
                  {resources.filter(r => r.service.toLowerCase() === activeTab).map(r => (
                    <div key={r.id} className="bg-[#252526] border border-[#333] p-4 rounded-lg hover:border-[#444] transition-all group">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#d4d4d4]">{r.name}</span>
                            <span className="text-[10px] bg-[#333] px-1.5 py-0.5 rounded text-[#858585]">ID: {r.id}</span>
                          </div>
                          <div className="text-xs text-[#666] mt-1">{new Date(r.created_at).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-[#333] rounded-md text-[#569cd6]">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="p-2 hover:bg-[#333] rounded-md text-red-500/70 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {activeTab === 'iam' && (
                        <div className="mt-4 pt-4 border-t border-[#333]">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-[#666] uppercase">Attached Policies</span>
                            <div className="relative group/attach">
                              <button className="text-[10px] bg-[#333] px-2 py-1 rounded hover:bg-[#444] text-[#d4d4d4]">Attach Policy</button>
                              <div className="absolute right-0 mt-1 w-48 bg-[#252526] border border-[#444] rounded-md shadow-xl hidden group-hover/attach:block z-20">
                                {policies.length === 0 ? (
                                  <div className="p-2 text-[10px] text-[#666]">No policies found</div>
                                ) : (
                                  policies.map(p => (
                                    <button 
                                      key={p.id}
                                      onClick={() => handleAttachPolicy(r.id, p.id)}
                                      className="w-full text-left px-3 py-2 text-[10px] hover:bg-[#333] text-[#d4d4d4] border-b border-[#333] last:border-0"
                                    >
                                      {p.name}
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(attachedPolicies[r.id] || []).map(p => (
                              <div key={p.id} className="flex items-center gap-1.5 bg-[#111] px-2 py-1 rounded text-[10px] text-[#569cd6] border border-[#569cd6]/20">
                                <ShieldCheck className="w-3 h-3" />
                                {p.name}
                              </div>
                            ))}
                            {(!attachedPolicies[r.id] || attachedPolicies[r.id].length === 0) && (
                              <span className="text-[10px] text-[#666] italic">No policies attached</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {resources.filter(r => r.service.toLowerCase() === activeTab).length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-[#333] rounded-lg text-[#666]">
                      Nenhum recurso {activeTab.toUpperCase()} encontrado nesta região.
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Console Log Area (footer simulator) */}
        <footer className="h-24 border-t border-[#333] bg-[#1e1e1e] p-3 overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-4 h-4 text-green-500" />
            <span className="text-[10px] font-bold text-[#666] uppercase tracking-widest">Mock Engine Output</span>
          </div>
          <div className="font-mono text-xs text-[#858585] space-y-1">
             <div>[SYSTEM] Local AWS Engine running on SQLite backend_cloud.db</div>
             <div>[INFO] Region detected: SA_EAST_1 (Local disk sync enabled)</div>
             <div className="text-gray-500">{resources.length > 0 ? `[DB] ${resources.length} active resources in registry.` : `[DB] No data found in resources table.`}</div>
          </div>
        </footer>
      </main>

      {/* Provisioning Modal */}
      <AnimatePresence>
        {isProvisioning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#252526] border border-[#444] rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Provision Local Resource</h3>
                <form onSubmit={handleProvision} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#666] uppercase mb-1.5">Service Type</label>
                    <select 
                      value={newResource.service}
                      onChange={e => setNewResource({...newResource, service: e.target.value})}
                      className="w-full bg-[#3c3c3c] border border-[#555] rounded-md px-3 py-2 text-sm outline-none focus:border-orange-500"
                    >
                      <option value="EC2">EC2 (Instance)</option>
                      <option value="S3">S3 (Bucket)</option>
                      <option value="LAMBDA">Lambda (Function)</option>
                      <option value="IAM">IAM (Execution Role)</option>
                    </select>
                  </div>
                  
                  <div className="bg-[#1e1e1e] p-3 rounded-md border border-[#333]">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-3 h-3 text-orange-400" />
                      <span className="text-[10px] font-bold text-[#858585] uppercase tracking-wider">AI Insight (Hugging Face / Gemini)</span>
                    </div>
                    <p className={cn("text-xs leading-relaxed transition-opacity", fetchingAi ? "opacity-50" : "opacity-100")}>
                      {fetchingAi ? "Analyzing cloud service architecture..." : aiDescription}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#666] uppercase mb-1.5">Resource Name</label>
                    <input 
                      autoFocus
                      required
                      type="text" 
                      placeholder="my-cool-resource"
                      value={newResource.name}
                      onChange={e => setNewResource({...newResource, name: e.target.value})}
                      className="w-full bg-[#3c3c3c] border border-[#555] rounded-md px-3 py-2 text-sm outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsProvisioning(false)}
                      className="flex-1 px-4 py-2 bg-transparent border border-[#555] hover:bg-[#333] rounded-md text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      Provision
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Policy Creation Modal */}
      <AnimatePresence>
        {isCreatingPolicy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#252526] border border-[#444] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Create IAM Policy (JSON)</h3>
                <form onSubmit={handleCreatePolicy} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#666] uppercase mb-1.5">Policy Name</label>
                    <input 
                      autoFocus
                      required
                      type="text" 
                      placeholder="AdministratorAccess-Local"
                      value={newPolicy.name}
                      onChange={e => setNewPolicy({...newPolicy, name: e.target.value})}
                      className="w-full bg-[#3c3c3c] border border-[#555] rounded-md px-3 py-2 text-sm outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#666] uppercase mb-1.5">Policy Document (JSON)</label>
                    <textarea 
                      required
                      rows={10}
                      value={newPolicy.document}
                      onChange={e => setNewPolicy({...newPolicy, document: e.target.value})}
                      className="w-full bg-[#111] border border-[#555] rounded-md px-3 py-2 text-xs font-mono outline-none focus:border-orange-500 text-[#ce9178]"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsCreatingPolicy(false)}
                      className="flex-1 px-4 py-2 bg-transparent border border-[#555] hover:bg-[#333] rounded-md text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      Create Policy
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Policy Edit Modal */}
      <AnimatePresence>
        {editingPolicy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#252526] border border-[#444] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Edit Policy: {editingPolicy.name}</h3>
                <form onSubmit={handleUpdatePolicy} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#666] uppercase mb-1.5">Policy Document (JSON)</label>
                    <textarea 
                      required
                      rows={12}
                      value={editingPolicy.document}
                      onChange={e => setEditingPolicy({...editingPolicy, document: e.target.value})}
                      className="w-full bg-[#111] border border-[#555] rounded-md px-3 py-2 text-xs font-mono outline-none focus:border-orange-500 text-[#ce9178]"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setEditingPolicy(null)}
                      className="flex-1 px-4 py-2 bg-transparent border border-[#555] hover:bg-[#333] rounded-md text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
