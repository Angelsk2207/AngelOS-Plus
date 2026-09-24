# Hermes Quantum

Minimal coordination cabin for Atena Swarm. No models, workers, databases, or heavy workloads inside the core.

Endpoints: `/healthz`, `/v1/status`.

## Operação multiagente

O backend é composto por agentes especializados coordenados por um agente central. Há agentes dedicados à coordenação, manutenção, segurança defensiva, monitoramento/radar e diagnóstico. O usuário continua no controle: mudanças sensíveis pedem autorização; após aprovação, o agente executa, valida e registra o resultado. A arquitetura atende computadores e celulares, mantendo o núcleo mínimo e os workloads pesados na nuvem.

