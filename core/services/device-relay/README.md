# Agente do Poco C85

Agente externo e leve para o relay do Poco. Ele não usa IA local, não apaga arquivos e não altera aplicativos. Coleta somente bateria e presença das pastas Download/Movies e envia heartbeat autenticado ao Hermes.

Instalação: executar `install-termux.sh` no Termux depois que o relay SSH estiver acessível.

## Operação multiagente

O backend é composto por agentes especializados coordenados por um agente central. Há agentes dedicados à coordenação, manutenção, segurança defensiva, monitoramento/radar e diagnóstico. O usuário continua no controle: mudanças sensíveis pedem autorização; após aprovação, o agente executa, valida e registra o resultado. A arquitetura atende computadores e celulares, mantendo o núcleo mínimo e os workloads pesados na nuvem.

