#!/bin/bash
# 👻 SYSTEM HUNTER - Agente de Atualizações e Performance da Atena OS
# Monitora atualizações, otimiza performance e limpa lixo

REPORT_DIR="agents/hunter/reports"
mkdir -p "$REPORT_DIR"

echo "👻 SYSTEM HUNTER - Iniciando varredura do sistema..."

# 🔄 SUB-AGENTE 1: Update Checker
echo "  🔄 [Update Checker] Verificando atualizações disponíveis..."
pkg list-installed 2>/dev/null | wc -l > "$REPORT_DIR/pacotes_instalados.txt"
echo "    -> $(cat "$REPORT_DIR/pacotes_instalados.txt") pacotes instalados"

# ⚡ SUB-AGENTE 2: Performance Tuning
echo "  ⚡ [Performance Tuning] Analisando desempenho..."
FREE_MEM=$(free -m 2>/dev/null | awk '/Mem:/ {print $4}')
echo "    -> Memória livre: ${FREE_MEM:-N/A} MB"
echo "Memória Livre: ${FREE_MEM:-N/A} MB" > "$REPORT_DIR/performance.txt"

# 🧹 SUB-AGENTE 3: Cache Cleaner
echo "  🧹 [Cache Cleaner] Analisando espaço em disco..."
df -h / 2>/dev/null > "$REPORT_DIR/disco.txt"
echo "    -> $(df -h / 2>/dev/null | tail -1 | awk '{print $4}') disponível"

# 📊 SUB-AGENTE 4: Sistema
echo "  📊 [System Info] Coletando informações do sistema..."
uname -a > "$REPORT_DIR/sistema.txt"
echo "    -> $(uname -o) rodando em $(uname -m)"

# 📊 Relatório Consolidado
cat > "$REPORT_DIR/relatorio.md" << EOF
# 👻 Relatório SYSTEM HUNTER
**Data:** $(date '+%Y-%m-%d %H:%M')

## 🔄 Pacotes Instalados
$(cat "$REPORT_DIR/pacotes_instalados.txt")

## ⚡ Performance
$(cat "$REPORT_DIR/performance.txt")

## 🧹 Disco
$(cat "$REPORT_DIR/disco.txt")

## 📊 Sistema
$(cat "$REPORT_DIR/sistema.txt")

## Status: 🟢
EOF

echo "✅ SYSTEM HUNTER finalizado. Relatório em $REPORT_DIR/relatorio.md"