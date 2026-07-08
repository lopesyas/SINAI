# 10. Plano de Implementação (equipe pequena, 30 dias)

## Composição de equipe mínima viável

| Papel | Dedicação | Responsabilidade |
|-------|-----------|-------------------|
| 1 dev full-stack (líder técnico) | Full-time | Backend (NestJS, WebSocket, integrações VLibras), modelo de dados |
| 1 dev frontend | Full-time | Next.js, telas paciente/médico, identidade visual |
| 1 designer (part-time, pode ser a mesma pessoa validando a paleta já definida) | ~20% do tempo | Cards, ilustrações, refinamento de acessibilidade visual |
| 1 responsável por validação clínica/produto | ~20% do tempo | Ponte com o hospital, roteiro de piloto, revisão da simplificação de texto clínico |

Com 2 devs full-time é possível cobrir todo o backlog Must do MVP em 4 sprints de 1 semana.

## Cronograma por sprint

### Sprint 1 (dias 1–7) — Fundação
- Setup dos repositórios e ambientes (Vercel, Render/Railway, Postgres).
- Modelo de dados (Prisma) e migrations iniciais.
- Gateway WebSocket básico (join de sala, eco de mensagem).
- Telas estáticas (sem lógica) aplicando a paleta e o componente Card.

### Sprint 2 (dias 8–14) — Comunicação médico → paciente
- Campo de texto e botão de voz (Web Speech API) no monitor do médico.
- Simplificador de texto clínico (regras + dicionário inicial, revisado pelo responsável clínico).
- Integração com VLibras e exibição no monitor do paciente.
- Persistência das mensagens.

### Sprint 3 (dias 15–21) — Comunicação paciente → médico
- Biblioteca visual (categoria → local → intensidade) com dados seed.
- Composição da frase estruturada e envio ao médico.
- Botões sim/não.
- Histórico visível nos dois monitores, com reload seguro (`GET /atendimentos/:id/mensagens`).

### Sprint 4 (dias 22–30) — Piloto e ajustes
- Refinamento visual final (ilustrações dos Cards, estados normal/selecionado).
- Roteiro de piloto com profissionais e pacientes voluntários (ver [Estratégia de Validação](11-estrategia-validacao-hcufpe.md)).
- Coleta de feedback (`POST /atendimentos/:id/feedback`).
- Ajustes de usabilidade encontrados no piloto.

## Definição de "pronto" (Definition of Done) do MVP

- Fluxo ponta a ponta funciona: médico envia pergunta (texto ou voz) → paciente vê em Libras → paciente responde pela biblioteca visual → médico recebe a resposta em texto.
- Histórico persiste e sobrevive a reload de página.
- Interfaces seguem a paleta e os princípios de acessibilidade definidos.
- Testado com ao menos uma sessão real (ou simulada) com profissional e pessoa surda voluntária.
