# 🔗 N8N - Arquitetura de Nós da Atena OS

## 📋 Visão Geral
Cada agente é um **nó independente** no N8N. Se um cair, os outros continuam.

## 🧩 Fluxo de Nós

### Nó 1: 🛡️ CYBERGUARD
```
[CRON: 6h/12h/18h] → [Sub-Agente Port Scanner] → [Filtro: portas suspeitas?]
                      → [Sub-Agente Threat Monitor] → [Filtro: ameaças?]
                      → [Sub-Agente Firewall Check] → [Salva relatório]
                      → [Notifica ORACLE] → [Fim]
```

### Nó 2: 👻 SYSTEM HUNTER  
```
[CRON: 8h/14h/20h] → [Sub-Agente Update Checker] → [Atualizações? SIM → Aplica]
                      → [Sub-Agente Performance Tuning] → [Otimiza]
                      → [Sub-Agente Cache Cleaner] → [Limpa]
                      → [Salva relatório] → [Notifica ORACLE] → [Fim]
```

### Nó 3: 👁️ ORACLE (Supervisor)
```
[Webhook: recebe dos outros nós] → [Coleta relatórios]
                                    → [Revisa erros/alertas]
                                    → [Gera resumo geral]
                                    → [Salva no Obsidian]
                                    → [Notifica se urgente via WhatsApp]
                                    → [Fim]
```

## 🔄 Conexão entre Nós

```
        ┌──────────────┐
        │  🛡️ CYBERGUARD │
        └──────┬───────┘
               │ relatório
               ▼
        ┌──────────────┐
        │  👁️ ORACLE    │ ←── relatório ──┐
        └──────┬───────┘                  │
               │ resumo                   │
               ▼                          ▼
        ┌──────────────┐        ┌──────────────┐
        │ 📊 OBSIDIAN   │        │ 👻 HUNTER    │
        └──────────────┘        └──────────────┘
```

## ⚙️ Configuração no N8N

### Webhook CYBERGUARD → ORACLE:
- URL: `http://localhost:5678/webhook/cyberguard-report`
- Método: POST
- Body: relatório.md

### Webhook HUNTER → ORACLE:
- URL: `http://localhost:5678/webhook/hunter-report`
- Método: POST
- Body: relatório.md

### Trigger ORACLE:
- Schedule: a cada relatório recebido
- Ação: gerar supervisão.md e salvar no Obsidian

## 🛡️ Isolamento (Fault Tolerance)
- Cada nó roda em container separado no N8N
- Se CYBERGUARD falhar → HUNTER continua, ORACLE avisa
- Se HUNTER falhar → CYBERGUARD continua, ORACLE avisa
- Se ORACLE falhar → agentes continuam rodando, mas sem supervisão
- Logs de erro salvos em `agents/n8n/error_logs/`