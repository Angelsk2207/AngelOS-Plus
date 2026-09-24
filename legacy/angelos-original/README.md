#AngelOS 2.0 - Sistema Hibrido

## Arquitetura de agentes autogerenciada

Este projeto integra um ecossistema modular cujo backend é gerenciado por uma equipe de agentes de IA especializados, executados em serviços separados e coordenados por um agente central. Cada agente possui responsabilidade delimitada: coordenação e comandos, segurança defensiva, monitoramento/radar da internet, manutenção, diagnóstico e atualização.

O sistema trabalha em computadores e celulares, priorizando execução cloud e agentes locais leves. Alterações automáticas que possam mudar comportamento, dados, permissões, custos ou exposição pública exigem autorização do usuário; após aprovação, o agente responsável executa, valida e registra a mudança. Problemas devem ser detectados, isolados, corrigidos e verificados sem interromper o usuário sempre que possível.

Fluxo: usuário → agente central → agente especializado → validação de segurança → execução autorizada → relatório.

