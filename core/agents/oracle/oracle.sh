#!/bin/bash
# 👁️ ORACLE - Supervisor da Atena OS
# Revisa relatórios dos outros agentes e gera resumo geral

REPORT_DIR="agents/oracle/reports"
mkdir -p "$REPORT_DIR"

echo "👁️ ORACLE - Iniciando supervisão dos agentes..."

# ✅ SUB-AGENTE 1: Revisor
echo "  ✅ [Revisor] Coletando relatórios dos agentes..."
CYBER_REPORT="agents/cyberguard/reports/relatorio.md"
HUNTER_REPORT="agents/hunter/reports/relatorio.md"

CYBER_STATUS="🔴 Não executado"
HUNTER_STATUS="🔴 Não executado"

if [ -f "$CYBER_REPORT" ]; then
    CYBER_LINES=$(wc -l < "$CYBER_REPORT")
    CYBER_STATUS="🟢 Executado ($CYBER_LINES linhas)"
fi

if [ -f "$HUNTER_REPORT" ]; then
    HUNTER_LINES=$(wc -l < "$HUNTER_REPORT")
    HUNTER_STATUS="🟢 Executado ($HUNTER_LINES linhas)"
fi

# 🚨 SUB-AGENTE 2: Alertas
echo "  🚨 [Alertas] Verificando anomalias..."
ALERTAS=""
if [ -f "$CYBER_REPORT" ] && grep -qi "🔴\|suspeito\|erro" "$CYBER_REPORT" 2>/dev/null; then
    ALERTAS="$ALERTAS\n⚠️ CYBERGUARD detectou algo suspeito!"
fi

# 📊 SUB-AGENTE 3: Resumo Geral
echo "  📊 [Resumo] Consolidando informações..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

cat > "$REPORT_DIR/supervisao.md" << EOF
# 👁️ Relatório ORACLE - Supervisão Geral
**Data:** $TIMESTAMP

## 📋 Status dos Agentes

| Agente | Status | Última Execução |
|--------|--------|-----------------|
| 🛡️ CYBERGUARD | $CYBER_STATUS | $TIMESTAMP |
| 👻 SYSTEM HUNTER | $HUNTER_STATUS | $TIMESTAMP |
| 👁️ ORACLE | 🟢 Rodando | $TIMESTAMP |

## 🚨 Alertas
${ALERTAS:-Nenhum alerta detectado. Sistema estável.}

## 🎯 Recomendações
- Verificar se todos os agentes rodaram hoje
- Revisar relatórios individuais para detalhes
- Manter Termux ativo (não fechar o app)

## 🌌 Status Geral: 🟢 OPERACIONAL
EOF

echo "✅ ORACLE finalizado. Supervisão em $REPORT_DIR/supervisao.md"