# Mapa de consolidação das fontes

Este repositório centraliza uma base de trabalho. Os repositórios Atena de origem **não foram alterados nem removidos**. Só os três repositórios AngelOS antigos serão removidos depois da verificação desta consolidação, conforme solicitado.

| Origem | Destino no AngelOS Plus | Natureza / ressalva |
|---|---|---|
| `AngelOS` | `legacy/angelos-original/README.md` | Documento de visão; não continha implementação. |
| `AngelOS-2.0` | `prototypes/angelos-2.0/` | Protótipo de painel; engine virtual e integrações são simulações. |
| `AngelOS-Aws-local` | `prototypes/aws-local-simulator/` | Simulador local com Express/SQLite; não provisiona AWS real. |
| `atena-os` | `core/agents/` | Scripts-base CyberGuard, Hunter e Oracle, mais mapas de n8n/Obsidian; revisar antes de executar. |
| `atena-n8n` | `core/n8n/` | Dockerfile e manifesto de deploy; Dockerfile foi sanitizado para não carregar segredo no código. |
| `atena-hermes-quantum` | `core/services/hermes-quantum/` | Núcleo mínimo de coordenação copiado para revisão. |
| `atena-polvo-hermes-bridge` | `core/services/polvo-hermes-bridge/` | Ponte copiada para revisão. |
| `atena-sentinel` | `core/services/sentinel/` | Verificador defensivo copiado para revisão. |
| `atena-poco-agent-quantum` | `core/services/device-relay/` | Agente leve de diagnóstico; o instalador automático não é executado nesta consolidação. |

## Preservação

- Repositórios `atena-*` originais ficam intactos.
- O antigo conteúdo AngelOS foi preservado em seus diretórios de protótipo/histórico antes de remover os três repositórios antigos.
- Este commit não publica credenciais, bancos locais nem arquivos `.env`.
- Nenhum serviço cloud existente foi reconfigurado ou reiniciado.

## Próximo ciclo

Revisar conflitos entre os protótipos, escolher uma interface principal e integrar funções gradualmente. O status “copiado” não significa “integrado”, “deployado” ou “testado em produção”.
