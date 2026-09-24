#!/bin/bash
# 🛡️ CYBERGUARD - Agente de Segurança da Atena OS
# Executa varreduras de segurança no sistema e rede

REPORT_DIR="agents/cyberguard/reports"
mkdir -p "$REPORT_DIR"

echo "🛡️ CYBERGUARD - Iniciando varredura de segurança..."

# 📡 SUB-AGENTE 1: Port Scanner
echo "  📡 [Port Scanner] Verificando portas abertas..."
netstat -tlnp 2>/dev/null > "$REPORT_DIR/portas_abertas.txt" || ss -tlnp >> "$REPORT_DIR/portas_abertas.txt" 2>/dev/null
PORTS_OPEN=$(wc -l < "$REPORT_DIR/portas_abertas.txt")
echo "    -> $PORTS_OPEN portas encontradas"

# 🕵️ SUB-AGENTE 2: Threat Monitor
echo "  🕵️ [Threat Monitor] Verificando processos suspeitos..."
ps aux --sort=-%mem 2>/dev/null | head -20 > "$REPORT_DIR/processos_pesados.txt"
SUSPECT=$(grep -ci "tor\|thor\|malware\|suspect" "$REPORT_DIR/processos_pesados.txt" 2>/dev/null)
echo "    -> $SUSPECT processos suspeitos"

# 🔐 SUB-AGENTE 3: Firewall Check
echo "  🔐 [Firewall Check] Verificando configurações de rede..."
ip addr show 2>/dev/null > "$REPORT_DIR/rede_config.txt"
echo "    -> Configuração de rede salva"

# 🧪 SUB-AGENTE 4: Conexões Ativas
echo "  🔌 [Conexões] Verificando conexões ativas..."
ss -tun 2>/dev/null | tail -n +2 > "$REPORT_DIR/conexoes_ativas.txt"
echo "    -> Conexões ativas registradas"

# 📊 Relatório Consolidado
cat > "$REPORT_DIR/relatorio.md" << EOF
# 🛡️ Relatório CYBERGUARD
**Data:** $(date '+%Y-%m-%d %H:%M')

## 📡 Portas Abertas
$(cat "$REPORT_DIR/portas_abertas.txt")

## 🕵️ Processos Pesados
$(cat "$REPORT_DIR/processos_pesados.txt")

## 🔐 Rede
$(cat "$REPORT_DIR/rede_config.txt")

## Status: 🟢 $( ([ "$SUSPECT" -gt 0 ] && echo "🔴") || echo "🟢" )
EOF

echo "✅ CYBERGUARD finalizado. Relatório em $REPORT_DIR/relatorio.md"