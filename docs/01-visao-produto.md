# 1. Visão do Produto

## O que é o SINAI

SINAI (Sistema Inteligente de Navegação e Atendimento Inclusivo) é uma camada digital de acessibilidade dentro da consulta médica, criada para reduzir a barreira de comunicação entre profissionais de saúde e pacientes surdos quando não há intérprete de Libras disponível no atendimento.

O SINAI **não substitui** um intérprete humano. Ele existe para os momentos — a maioria dos atendimentos em um hospital público de alta complexidade — em que esse intérprete simplesmente não está presente.

## O problema

Em hospitais universitários de atendimento público, como o HC-UFPE, a disponibilidade de intérpretes de Libras é limitada frente ao volume e à diversidade de atendimentos. Isso gera, para o paciente surdo:

- dificuldade para explicar sintomas com precisão;
- dificuldade para compreender diagnóstico e orientações;
- menor autonomia durante a consulta;
- risco de falha de comunicação clínica (o mais grave: um sintoma mal entendido);
- dependência de acompanhantes ou terceiros para interpretar, o que reduz a privacidade e a autonomia do paciente.

## Público

- **Paciente surdo**, usuário de Libras, em atendimento ambulatorial ou de urgência.
- **Profissional de saúde** (médico, enfermeiro) sem fluência em Libras, atendendo esse paciente.

## Proposta de valor

Uma estação de atendimento com dois monitores — um voltado ao paciente, outro ao profissional — executando uma aplicação web sincronizada em tempo real, que:

- traduz o que o médico diz/escreve para uma representação visual em Libras;
- oferece ao paciente uma forma estruturada e rápida de responder, sem depender de reconhecimento livre de Libras;
- registra toda a conversa, para segurança clínica e continuidade do atendimento.

## Contexto de validação

O ambiente de referência para a primeira validação é um **hospital universitário de atendimento público e alta complexidade** (HC-UFPE como referência), caracterizado por grande diversidade de pacientes e pressão de tempo no atendimento — por isso o MVP prioriza simplicidade de uso acima de qualquer sofisticação técnica.

## Princípios de design

- **Dignidade antes de tudo**: interface acolhedora, nunca infantilizada.
- **Alto contraste e linguagem simples**: acessibilidade visual real, não decorativa.
- **Reduzir fricção, não eliminar o intérprete**: o SINAI é um complemento para os momentos sem intérprete disponível, não uma substituição da política de garantir intérpretes.
- **Confiabilidade clínica**: nunca inventar/alucinar conteúdo médico — toda simplificação de texto deve preservar o sentido clínico original.

## Escopo do MVP (fase 1, ~30 dias)

**Dentro do escopo:**
- Chat bilateral entre monitor do médico e monitor do paciente.
- Voz → texto (fala do médico).
- Texto → Libras usando uma solução de tradução já existente (ex.: VLibras), não um modelo próprio.
- Biblioteca visual de sintomas para resposta estruturada do paciente.
- Histórico da conversa, associado ao atendimento.

**Fora do escopo (fases futuras — ver [Roadmap](04-roadmap.md)):**
- Tradução completa e livre de Libras em tempo real.
- Modelo próprio de visão computacional / reconhecimento livre de sinais.
- Avatar 3D proprietário.
- Integração profunda com prontuário eletrônico.

## Critério de sucesso do MVP

O MVP é considerado validado se, em uso real ou simulado no HC-UFPE, o fluxo de comunicação básica (pergunta do médico → tradução em Libras → resposta estruturada do paciente → texto para o médico) reduzir de forma perceptível o tempo e o esforço de comunicação em relação ao cenário sem SINAI e sem intérprete. Detalhes em [Estratégia de Validação](11-estrategia-validacao-hcufpe.md).
