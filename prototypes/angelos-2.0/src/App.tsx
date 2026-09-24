/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Cloud, 
  Server, 
  Database, 
  Network, 
  Code, 
  Plus, 
  Trash2,
  Settings2,
  Terminal,
  Activity,
  Cpu,
  Sparkles,
  ChevronRight,
  Info,
  Maximize2,
  Download,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { CloudArchitecture, CloudResource, ResourceType } from './types';
import { generatePythonIaC } from './services/iacService';
import { GoogleGenAI } from "@google/genai";

const INITIAL_ARCH: CloudArchitecture = {
  name: "Infraestrutura Crítica",
  provider: 'aws',
  resources: [
    { id: '1', name: 'vpc-master', type: 'vpc', config: { cidr: '10.0.0.0/16' } },
    { id: '2', name: 'subnet-public-a', type: 'subnet', config: { cidr: '10.0.1.0/24', az: 'us-east-1a' }, parentId: '1' },
    { id: '3', name: 'app-server-01', type: 'instance', config: { size: 't3.medium' }, parentId: '2' },
    { id: '4', name: 'infra-db', type: 'database', config: { engine: 'postgres' } },
  ]
};

export default function App() {
  const [arch, setArch] = useState<CloudArchitecture>(INITIAL_ARCH);
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  const pythonCode = useMemo(() => generatePythonIaC(arch), [arch]);

  const addResource = (type: ResourceType) => {
    const defaultParent = type === 'subnet' 
      ? arch.resources.find(r => r.type === 'vpc')?.id 
      : (type === 'instance' ? arch.resources.find(r => r.type === 'subnet')?.id : undefined);

    const newResource: CloudResource = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${type}-${arch.resources.length + 1}`,
      type,
      config: {},
      parentId: defaultParent
    };
    setArch(prev => ({ ...prev, resources: [...prev.resources, newResource] }));
    setSelectedResourceId(newResource.id);
  };

  const removeResource = (id: string) => {
    setArch(prev => ({ ...prev, resources: prev.resources.filter(r => r.id !== id) }));
    if (selectedResourceId === id) setSelectedResourceId(null);
  };

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analise esta arquitetura de nuvem (JSON): ${JSON.stringify(arch)}. 
        Forneça 3 dicas rápidas de segurança ou otimização de custos em Português. 
        Seja técnico e direto.`
      });
      setAiAnalysis(response.text || "Não foi possível gerar a análise.");
    } catch (err) {
      console.error(err);
      setAiAnalysis("Erro na conexão com IA. Verifique as configurações.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedResource = useMemo(() => 
    arch.resources.find(r => r.id === selectedResourceId), 
    [arch.resources, selectedResourceId]
  );

  return (
    <div className="flex h-screen bg-bg text-text-primary flex-col md:flex-row font-sans overflow-hidden relative">
      {/* Immersive Glows */}
      <div className="glow-bg top-[-100px] left-[-100px] w-[400px] h-[400px]" />
      <div className="glow-bg bottom-[-200px] right-[-100px] w-[600px] h-[600px] opacity-20" />

      {/* Navigation Rail / Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-[#080a14] flex flex-col z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-dark rounded-lg flex items-center justify-center font-bold shadow-lg shadow-accent/20">
            P
          </div>
          <span className="font-semibold tracking-wider text-sm">PyCloud Engine</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity, active: true },
            { id: 'clusters', label: 'Clusters', icon: Cloud },
            { id: 'functions', label: 'Functions', icon: Code },
            { id: 'database', label: 'Database', icon: Database },
            { id: 'networking', label: 'Networking', icon: Network }
          ].map((item) => (
            <button
              key={item.id}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all",
                item.active ? "bg-accent/10 text-accent" : "text-text-primary/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
           <div className="p-4 glass bg-accent/5 border-accent/20">
              <h4 className="text-[10px] font-mono uppercase text-accent tracking-widest mb-2 flex items-center gap-2">
                <Sparkles size={12} /> AI Architect
              </h4>
              <button 
                onClick={analyzeWithAI}
                disabled={isAnalyzing}
                className="w-full py-2 bg-accent text-white text-[10px] font-bold uppercase rounded-md shadow-lg shadow-accent/20 hover:brightness-110 disabled:opacity-50 transition-all font-mono"
              >
                {isAnalyzing ? "..." : "Analyze Stack"}
              </button>
           </div>
        </div>

        <div className="p-6 text-[10px] opacity-30 font-mono tracking-tighter uppercase whitespace-nowrap">
          v2.4.1-stable // kernel_orion
        </div>
      </aside>


      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 z-10">
        <header className="h-20 px-8 flex items-end justify-between pb-4">
           <div>
             <h1 className="text-3xl font-light tracking-tight">Cluster <span className="font-bold text-accent">Ω-ORION</span></h1>
             <p className="text-xs text-text-secondary mt-1 flex items-center gap-2">
               <span className="w-1.5 h-1.5 node-active" /> Python 3.11 Distroless / Region: US-EAST-1
             </p>
           </div>
           
           <div className="flex gap-8 items-center mb-1">
             <div className="text-right">
                <div className="text-[10px] uppercase text-text-secondary/50 tracking-widest">Uptime</div>
                <div className="text-lg font-medium">99.98%</div>
             </div>
             <div className="h-8 w-px bg-border mx-2" />
             <div className="flex bg-black/40 p-1 rounded-lg border border-border">
               {['visual', 'code'].map((tab) => (
                 <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-mono uppercase rounded transition-all",
                    activeTab === tab ? "bg-accent text-white" : "text-text-secondary hover:text-white"
                  )}
                 >
                   {tab === 'visual' ? 'Architecture' : 'Source'}
                 </button>
               ))}
             </div>
           </div>
        </header>

        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 overflow-hidden">
          <div className="flex flex-col gap-6 overflow-hidden">
            {activeTab === 'visual' ? (
              <div className="flex-1 glass p-10 relative overflow-hidden flex flex-col">
                <div className="absolute top-6 left-6 text-[10px] font-bold text-text-secondary/40 tracking-widest uppercase italic">
                  Topology Stream
                </div>
                
                <div className="flex-1 flex items-center justify-around relative">
                   <div className="absolute inset-x-20 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent top-1/2 -translate-y-1/2 pointer-events-none" />
                   
                   <AnimatePresence>
                     <motion.div 
                        key="gateway-node"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 flex flex-col items-center gap-3"
                      >
                        <div className="w-16 h-16 rounded-full border-2 border-accent flex items-center justify-center bg-accent/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                          <Network className="text-accent" size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Gateway</span>
                      </motion.div>

                      <div key="main-cluster-node" className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-24 h-24 glass bg-accent/20 border-accent/40 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                           <Server className="text-white" size={40} />
                        </div>
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Main Cluster</span>
                      </div>

                      <div key="storage-node" className="relative z-10 flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center bg-white/5">
                           <Database className="text-text-secondary" size={24} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Storage</span>
                      </div>
                   </AnimatePresence>
                </div>

                <div className="mt-auto flex gap-4 pt-8">
                   <button onClick={() => addResource('instance')} className="px-6 py-3 glass border-white/5 hover:border-accent transition-all text-[10px] font-mono uppercase tracking-widest text-text-secondary hover:text-white">
                     + Node
                   </button>
                   <button onClick={() => addResource('vpc')} className="px-6 py-3 glass border-white/5 hover:border-accent transition-all text-[10px] font-mono uppercase tracking-widest text-text-secondary hover:text-white">
                     + Virtual Net
                   </button>
                   <div className="flex-1" />
                   <div className="flex items-center gap-4 text-[10px] font-mono text-white/20">
                      SYNC_STATUS: <span className="text-success">OK</span>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 glass bg-black/40 border-white/5 p-8 overflow-auto terminal-font text-accent/80">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                   <Code size={16} className="text-text-secondary" />
                   <span className="text-text-secondary/40">infrastructure_as_code.py</span>
                </div>
                <pre className="text-sm">
                  {pythonCode.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-6 group">
                      <span className="w-4 text-white/5 text-right select-none group-hover:text-white/20">{i + 1}</span>
                      <span className={cn(
                        line.trim().startsWith('#') ? "text-text-secondary/30 italic" : "text-accent/90"
                      )}>{line}</span>
                    </div>
                  ))}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 h-24">
              {[
                { label: 'CPU USAGE', value: '24.2%' },
                { label: 'MEMORY', value: '1.4 GB' },
                { label: 'LATENCY', value: '12ms' }
              ].map(stat => (
                <div key={stat.label} className="glass border-white/5 p-5 flex flex-col justify-center">
                  <div className="text-[9px] uppercase text-text-secondary/40 tracking-widest mb-1 font-bold italic">{stat.label}</div>
                  <div className="text-2xl font-bold text-accent">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 overflow-hidden">
             {/* Terminal Interface */}
             <div className="flex-1 glass bg-black/80 p-6 flex flex-col overflow-hidden border-white/5">
                <div className="flex gap-1.5 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  <span className="ml-3 text-[10px] text-text-secondary/30 tracking-widest font-mono uppercase italic">Kernel Output</span>
                </div>
                
                <div className="terminal-font flex-1 overflow-auto pr-2">
                   <div className="text-success mb-2"># PyCloud kernel 6.x active</div>
                   <div className="text-text-secondary/70">{">>>"} import cloud_utils</div>
                   <div className="text-text-secondary/70">{">>>"} engine = cloud_utils.Service('orion')</div>
                   <div className="text-text-secondary/70">{">>>"} engine.link_db(env='prod')</div>
                   <div className="text-success underline decoration-success/20 underline-offset-4">[SUCCESS] Database linked safely.</div>
                   <div className="text-text-secondary/70">{">>>"} engine.auto_scale(max=20)</div>
                   <div className="text-warning font-bold">[PENDING] Propagating replicas...</div>
                   
                   <AnimatePresence>
                    {aiAnalysis && (
                      <motion.div 
                        key="ai-strategy-report"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 pt-6 border-t border-white/5"
                      >
                         <div className="text-[10px] text-accent font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Sparkles size={12} /> AI Strategy Report
                         </div>
                         <div className="text-[12px] text-text-secondary leading-relaxed bg-white/[0.02] p-4 rounded-lg border border-white/5">
                            {aiAnalysis}
                         </div>
                      </motion.div>
                    )}
                   </AnimatePresence>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                   <div className="text-[9px] text-text-secondary/30 uppercase font-bold tracking-widest mb-3">Live Service Events</div>
                   <div className="terminal-font text-[11px] text-text-secondary/50 space-y-1.5">
                      <div key="log-1" className="flex gap-4"><span>14:02:11</span> <span className="text-success italic">GET /health</span> <span className="ml-auto">200 OK</span></div>
                      <div key="log-2" className="flex gap-4"><span>14:02:15</span> <span className="text-accent underline decoration-accent/20">REPLICA_UP node_092</span></div>
                      <div key="log-3" className="flex gap-4 opacity-40 italic"><span>14:02:18</span> POST /api/deploy</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>


        {/* Floating Tooltips or Inspect Panel (Condition) */}
        {selectedResource && (
          <aside className="w-72 border-l border-[#2A2C32] bg-[#151619] p-6 slide-in-right hidden lg:block">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-mono uppercase text-white/40 tracking-widest">Inspector</h3>
                <button onClick={() => setSelectedResourceId(null)} className="text-white/20 hover:text-white"><Plus size={14} className="rotate-45" /></button>
             </div>
             
             <div className="space-y-6">
                <div>
                  <label className="block text-[9px] uppercase font-mono text-white/30 mb-2">Resource Name</label>
                  <input 
                    type="text" 
                    value={selectedResource.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setArch(prev => ({
                        ...prev,
                        resources: prev.resources.map(r => r.id === selectedResource.id ? { ...r, name: newName } : r)
                      }));
                    }}
                    className="w-full bg-black/40 border border-[#2A2C32] p-2 rounded text-xs font-mono focus:border-accent outline-none"
                  />
                </div>

                <div>
                   <label className="block text-[9px] uppercase font-mono text-white/30 mb-2">Specifications</label>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/40">Resource Type</span>
                        <span className="font-mono text-accent uppercase">{selectedResource.type}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/40">IOPS Priority</span>
                        <span className="font-mono">High Cluster</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-white/40">Status</span>
                        <span className="text-green-400 font-mono animate-pulse">Online</span>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-[#2A2C32]">
                   <button className="w-full py-2 border border-red-500/20 text-red-500/60 hover:bg-red-500/10 hover:text-red-400 transition-all text-[10px] font-mono uppercase rounded" onClick={() => removeResource(selectedResource.id)}>
                      Terminar Instância
                   </button>
                </div>
             </div>
          </aside>
        )}
    </div>
  );
}
