# SINAI — Sistema Inteligente de Navegação e Atendimento Inclusivo

Camada digital de acessibilidade para consultas médicas com pacientes surdos, reduzindo barreiras de comunicação quando não há intérprete de Libras disponível.

Contexto inicial de validação: hospital universitário (referência HC-UFPE).

## Documentação

| # | Documento | Conteúdo |
|---|-----------|----------|
| 1 | [Visão do Produto](docs/01-visao-produto.md) | Problema, público, proposta de valor, escopo |
| 2 | [Arquitetura Técnica](docs/02-arquitetura-tecnica.md) | Componentes, diagrama, fluxo de dados |
| 3 | [Stack de Tecnologias](docs/03-stack-tecnologias.md) | Escolhas e justificativas |
| 4 | [Roadmap](docs/04-roadmap.md) | Fases 1, 2 e 3 |
| 5 | [Backlog Priorizado](docs/05-backlog-priorizado.md) | Épicos e itens do MVP |
| 6 | [User Stories](docs/06-user-stories.md) | Histórias médico/paciente + critérios de aceite |
| 7 | [Banco de Dados](docs/07-banco-de-dados.md) | Modelo ER e tabelas |
| 8 | [APIs](docs/08-apis.md) | REST + eventos WebSocket |
| 9 | [Fluxo de Telas](docs/09-fluxo-telas.md) | Telas paciente/médico |
| 10 | [Plano de Implementação](docs/10-plano-implementacao.md) | Equipe pequena, sprints de 30 dias |
| 11 | [Estratégia de Validação HC-UFPE](docs/11-estrategia-validacao-hcufpe.md) | Piloto, métricas, ética/LGPD |
| 12 | [Riscos e Mitigação](docs/12-riscos-mitigacao.md) | Riscos técnicos e de produto |

## Escopo do MVP (30 dias)

Chat bilateral médico↔paciente com tradução assistida português→Libras (avatar/vídeo via solução existente), biblioteca visual de sintomas para resposta do paciente, e histórico de conversa. **Não** inclui reconhecimento livre de Libras, modelo próprio de visão computacional ou integração com prontuário eletrônico — isso fica para as fases 2 e 3.
