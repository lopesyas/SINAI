# 4. Roadmap de Desenvolvimento

## Fase 1 — MVP validável (dias 1–30)

**Objetivo:** validar se o fluxo básico de comunicação reduz a barreira entre médico e paciente surdo.

Entregas:
- Chat bilateral em tempo real (médico ↔ paciente).
- Voz → texto (Web Speech API) do lado do médico.
- Texto → Libras via VLibras.
- Biblioteca visual de sintomas para resposta do paciente.
- Histórico de conversa persistido por atendimento.
- Interfaces de paciente e médico (ver [Fluxo de Telas](09-fluxo-telas.md)).

Critério de saída da fase: piloto executado no HC-UFPE (ou simulação com profissionais/pacientes voluntários) com fluxo ponta a ponta funcionando. Ver [Estratégia de Validação](11-estrategia-validacao-hcufpe.md).

## Fase 2 — MVP avançado (dias 31–90)

**Objetivo:** aumentar a autonomia do paciente na resposta, e começar a gerar dados de uso.

Adiciona:
- Reconhecimento de sinais médicos específicos via webcam (conjunto fechado e pré-treinado, não Libras livre).
- Modelo de Machine Learning supervisionado para esse reconhecimento restrito.
- Personalização por hospital (logotipo, fluxos específicos).
- Histórico do paciente entre atendimentos (não só por sessão).
- Métricas de uso (tempo médio de resposta, sinais mais usados, taxa de conclusão do atendimento via SINAI).

## Fase 3 — Produto completo

**Objetivo:** produto multi-hospitalar, com inteligência clínica e integração institucional.

Adiciona:
- Interpretação contínua de Libras (não mais restrita a um conjunto fechado de sinais).
- Integração com prontuário eletrônico.
- Camada de inteligência clínica (ex.: sugestões de perguntas de triagem com base no histórico).
- Suporte a múltiplos hospitais/unidades com administração centralizada.
- Analytics de acessibilidade (relatórios para gestão hospitalar e para pesquisa).

## Por que essa ordem

Cada fase só assume o risco técnico da fase anterior já validado: a Fase 1 evita completamente IA de reconhecimento de sinais (o item de maior risco/custo do projeto) usando biblioteca visual; a Fase 2 introduz esse reconhecimento, mas em domínio restrito e supervisionado, só depois que o fluxo básico já provou valor; a Fase 3 é a única que assume o risco de interpretação livre de Libras, quando já há tração e dados reais para justificar o investimento.
