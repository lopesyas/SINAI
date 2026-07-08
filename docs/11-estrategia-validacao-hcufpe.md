# 11. Estratégia de Validação no HC-UFPE

## Objetivo do piloto

Verificar, em condições reais (ou o mais próximo possível delas), se o SINAI reduz o tempo e o esforço de comunicação entre profissional de saúde e paciente surdo, nos atendimentos em que não há intérprete de Libras disponível.

## Passos para viabilizar o piloto

1. **Aproximação institucional**: contato formal com a direção/núcleo de acessibilidade ou ensino do HC-UFPE, apresentando a visão do produto e o escopo do MVP.
2. **Comitê de ética**: atendimento em hospital universitário com pacientes reais provavelmente exige submissão ao **CEP (Comitê de Ética em Pesquisa)** antes de qualquer coleta de dados com pacientes reais — isso deve ser tratado como pré-requisito, não como etapa opcional.
3. **Termo de consentimento**: consentimento livre e esclarecido do paciente para participar do piloto e ter sua interação registrada (mesmo que pseudonimizada).
4. **Parceria com comunidade surda local**: validar a biblioteca visual e a qualidade da tradução VLibras com pessoas surdas e, se possível, com intérpretes de Libras da instituição, antes de qualquer uso com pacientes reais.

## Formato do piloto (fase 1)

Duas etapas, em ordem de risco crescente:

### Etapa A — Simulação controlada (antes de qualquer paciente real)
- Profissionais de saúde voluntários + pessoas surdas voluntárias (podem ser da comunidade acadêmica, não necessariamente pacientes) simulando consultas com roteiros pré-definidos (queixas comuns de pronto-atendimento).
- Objetivo: validar usabilidade, tempo de resposta, qualidade da tradução, antes de qualquer exposição de paciente real.

### Etapa B — Piloto assistido com pacientes reais (só após aprovação ética)
- Um número pequeno de atendimentos reais, com a equipe do SINAI presente para suporte técnico e coleta de feedback.
- Sempre com opção de fallback para intérprete humano ou acompanhante, nunca como única via de comunicação nessa fase inicial.

## Métricas de sucesso

| Métrica | Como medir |
|---------|-----------|
| Tempo médio de comunicação de uma queixa completa | Cronometragem via timestamps das mensagens (`criado_em`) |
| Taxa de conclusão do atendimento via SINAI (sem precisar de acompanhante/terceiro) | % de atendimentos do piloto concluídos só com SINAI |
| Satisfação do paciente | Nota 1–5 + comentário (`feedback_piloto`) |
| Satisfação do profissional | Nota 1–5 + comentário (`feedback_piloto`) |
| Erros de comunicação percebidos | Relato qualitativo do profissional (pergunta aberta no formulário) |

## Riscos éticos específicos do piloto

- **Consentimento genuíno**: garantir que o paciente entenda, em Libras, o que está sendo pedido antes de aceitar participar (o próprio termo de consentimento deve ser acessível).
- **Não atrasar o cuidado**: o piloto não deve, em nenhuma hipótese, adicionar risco ou demora a um atendimento que precise de intérprete humano ou atendimento imediato — SINAI é um complemento, nunca um bloqueio.
- **Dados sensíveis**: seguir a minimização de dados descrita em [Banco de Dados](07-banco-de-dados.md) durante todo o piloto.
