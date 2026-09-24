# AngelOS Plus — arquitetura-alvo para discussão

## Princípio

**O sistema adapta ao usuário e não ao contrário.** AngelOS Plus reunirá AngelOS, suas versões/protótipos e toda a base Atena em um único ecossistema híbrido.

## Camadas

1. **Experiência — Anjo:** conversa em linguagem natural; entende pedidos, apresenta plano/resultado e coordena capacidades locais e cloud autorizadas.
2. **Permissões e auditoria:** identifica a pessoa, delimita a tarefa, registra o que foi consultado/alterado e aplica a autorização dada pelo usuário. A capacidade de administrador é mediada por controles e escopos; não é acesso invisível e sem limites.
3. **Orquestração — n8n + coordenador:** conecta agentes, eventos, agendas e resultados. Workflows determinísticos lidam com tarefas previsíveis; os agentes escolhem as ferramentas dentro das permissões.
4. **Agentes especializados:** adaptação/perfil, gestão de recursos, OSINT/pesquisa, manutenção de software, cibersegurança defensiva, diagnóstico de hardware, arquivos e criação de entregáveis.
5. **Nós de execução:** containers e serviços leves para isolar funções. No dispositivo, os nós lógicos distribuem CPU/RAM/GPU/armazenamento **do próprio computador**; na nuvem, serviços autorizados dão continuidade às tarefas compatíveis.
6. **Resiliência híbrida:** health checks identificam falhas; o nó afetado pode ser isolado e tarefas recuperáveis encaminhadas a outro recurso. Falha física exige alerta e, quando disponível, leitura de telemetria — software não repara peça queimada.
7. **Chip quântico virtual:** conceito de uma camada compacta de trânsito/armazenamento de funções. A definição técnica, dados guardados, limites, persistência e interface com os nós ainda precisam ser especificados e testados; não se afirma que seja RAM quântica física.

## Adaptação por rotina

Com informação transparente e consentida, AngelOS pode observar padrões por um período curto, gerar um perfil provisório, propor ajustes e mostrar o benefício esperado. Exemplos: priorizar jogo e GPU em perfil gamer; recursos de criação para designer; build/testes para programador. O usuário pode revisar, aceitar, desfazer ou pausar o perfil. Nunca se infere que simplesmente aumentar carga ou encerrar processos seja seguro.

## Autonomia do Anjo

- Pedidos explícitos (“localize esta pasta”, “faça relatório”, “diagnostique lentidão”) autorizam a execução dentro do escopo pedido.
- Operações de leitura/diagnóstico podem ser apresentadas com fontes e limites.
- Alterações de sistema passam por validação, logs, backup/rollback e permissões específicas.
- Exclusão em massa, publicação, comunicação externa, custos, mudança de permissões ou ação irreversível exigem confirmação clara.
- Falha física: detectar quando possível, isolar o nó/serviço e alertar; não alegar reparo físico.

## O que significa “100% por agentes”

A meta é que agentes de IA operem e coordenem as funções do backend. O código continua necessário como estrutura, APIs, adaptadores, limites de acesso, armazenamento de logs e testes. O n8n coordena workflows, mas não transforma por si só módulos não implementados em agentes funcionais.

## Etapas de implementação

1. Inventariar e classificar o que foi copiado: ativo, protótipo, legado ou planejado.
2. Definir contratos entre Anjo, n8n, agentes, nós locais e serviços cloud.
3. Implementar permissões, telemetria, logs, fila de tarefas e health checks.
4. Validar gestão de recursos em uma máquina de teste, com benchmarks antes/depois e limites seguros.
5. Integrar um agente por vez, com testes, revisão de segurança e rollback.
6. Só então publicar uma apresentação comercial que diferencie visão de capacidades já comprovadas.

## Limites conhecidos

- Os protótipos de origem não equivalem a um OS completo nem a uma nuvem AWS real.
- O simulador AWS cria dados locais; o código “VirtualQuantumChip” da versão 2.0 simula estado/chave, não comprova uma RAM compartilhada funcional.
- O código Atena copiado tem diferentes níveis de maturidade; a cópia não valida que cada serviço esteja ativo.
