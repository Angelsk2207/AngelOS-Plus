# AngelOS Plus

> **O sistema adapta ao usuário e não ao contrário.**

AngelOS Plus é o projeto unificado que reunirá os projetos AngelOS anteriores e a base da Atena em um ecossistema híbrido, adaptativo e orientado por agentes. Esta primeira consolidação organiza código e documentação de origem; **não significa que todos os módulos estejam integrados ou prontos para produção**.

## Visão-alvo

- **Híbrido:** computador local e serviços em nuvem cooperam; falhas são detectadas, isoladas e comunicadas.
- **Adaptativo:** AngelOS gerencia os recursos do próprio computador conforme o perfil e a tarefa; não agrega RAM de máquinas diferentes.
- **Anjo:** assistente conversacional que coordena tarefas locais e cloud autorizadas — diagnóstico, otimização, arquivos, pesquisa e entregáveis.
- **Agentes:** funções especializadas em containers e módulos pequenos, sob coordenação central.
- **n8n:** conexão de workflows, agendas e eventos; não substitui o raciocínio dos agentes.
- **Chip quântico virtual:** nome do conceito de camada ultracompacta de trânsito/armazenamento de funções; não representa hardware quântico nem RAM física central.

## Estrutura deste repositório

- `docs/architecture/` — arquitetura-alvo e responsabilidades.
- `docs/migration/` — mapa das fontes consolidadas e estado conhecido.
- `core/agents/` — agentes e documentos-base da Atena.
- `core/services/` — runtimes e pontes já existentes, copiados para revisão.
- `core/n8n/` — desenho do fluxo n8n e definição de container sanitizada.
- `prototypes/` — AngelOS 2.0 e simulador AWS local preservados como protótipos.

## Estado desta consolidação

Os arquivos foram reunidos e organizados em um repositório. Os protótipos e serviços copiados precisam de revisão, testes, hardening e integração antes de serem considerados funcionais como um único produto. Consulte [o mapa de migração](docs/migration/source-map.md) e [a arquitetura-alvo](docs/architecture/target-design.md).

## Segurança

Segredos devem ficar em variáveis de ambiente/secret stores, nunca no GitHub. Ações com impacto precisam de escopo, autorização adequada, registro, backup e possibilidade de reversão. Agentes de diagnóstico não devem ser tratados como garantia de segurança absoluta.
