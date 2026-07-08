# 2. Arquitetura Técnica

## Visão geral

O SINAI é uma aplicação web com dois "papéis" de tela — **Monitor do Paciente** e **Monitor do Profissional** — conectados em tempo real à mesma sessão de atendimento. Não são apps separados: é a mesma aplicação, renderizando uma interface diferente por papel/rota, sincronizada por WebSocket.

```
┌─────────────────────┐        ┌─────────────────────┐
│  Monitor Paciente    │        │  Monitor Profissional │
│  (browser, tablet)   │        │  (browser, notebook)  │
└──────────┬───────────┘        └──────────┬───────────┘
           │  WebSocket (sala = atendimento_id)          │
           └───────────────┬──────────────────────────────┘
                            ▼
                 ┌─────────────────────┐
                 │   Backend (API +    │
                 │   Gateway WS)       │
                 └──────────┬──────────┘
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  PostgreSQL    │  │  Serviço STT      │  │  Serviço Libras   │
│  (atendimentos,│  │  (Web Speech API  │  │  (VLibras widget/ │
│  mensagens)    │  │  no MVP)          │  │  API)             │
└───────────────┘  └──────────────────┘  └──────────────────┘
```

## Componentes

### Frontend (uma aplicação, dois papéis)
- SPA que resolve `/atendimento/:id/paciente` e `/atendimento/:id/medico`.
- Conecta ao WebSocket na sala `atendimento_id` assim que carrega.
- **Papel paciente**: renderiza a mensagem do médico (avatar/vídeo em Libras) e a biblioteca visual de sintomas para resposta.
- **Papel médico**: renderiza chat com histórico, campo de texto e botão de voz.

### Backend
- API REST para criar/consultar atendimentos e histórico.
- Gateway WebSocket: cada atendimento é uma "sala"; mensagens de um papel são retransmitidas ao outro em tempo real.
- Orquestra as chamadas aos serviços externos (STT, simplificador, tradução Libras) antes de emitir a mensagem final para o paciente.

### Serviços de suporte (MVP usa soluções existentes, não modelos próprios)
- **Speech-to-Text**: Web Speech API do navegador (gratuita, sem infraestrutura própria) na fase 1; troca futura por Whisper API se a precisão for insuficiente.
- **Simplificação clínica de texto**: camada de regras + dicionário de expressões clínicas comuns (ex.: "desconforto abdominal" → "dor na barriga"). Deliberadamente **não** usa um LLM generativo aberto no MVP, para não arriscar alucinação em conteúdo clínico — só substituições controladas e revisadas.
- **Texto → Libras**: widget/API do **VLibras** (governo federal, gratuito, mantido). O backend envia o texto simplificado e recebe/exibe a tradução (avatar do próprio VLibras).
- **Resposta do paciente**: não depende de nenhum serviço de IA no MVP — é seleção estruturada na biblioteca visual (ver [Fluxo de Telas](09-fluxo-telas.md)).

## Fluxo de dados — Cenário 1 (médico → paciente)

```
Médico fala/digita
   │
   ▼ (se voz) Web Speech API → texto
   │
   ▼
Backend: simplificador de texto clínico
   │
   ▼
Backend: envia texto simplificado ao VLibras
   │
   ▼
Backend emite via WebSocket para a sala do atendimento
   │
   ▼
Monitor do Paciente exibe avatar/vídeo em Libras
   │
   ▼
Mensagem (original + simplificada) é persistida no Postgres
```

## Fluxo de dados — Cenário 2 (paciente → médico)

```
Paciente navega: Categoria → Local → Intensidade (biblioteca visual)
   │
   ▼
Frontend monta frase estruturada: "Paciente relata muita dor na cabeça."
   │
   ▼
Emite via WebSocket para a sala do atendimento
   │
   ▼
Monitor do Médico recebe e exibe no histórico do chat
   │
   ▼
Mensagem é persistida no Postgres
```

## Por que essa arquitetura para um MVP de 30 dias

- **Sem modelo de IA próprio**: todo o "Libras" e "voz" do MVP vem de serviços já existentes (VLibras, Web Speech API). Isso é o que torna 30 dias viável.
- **Um único código-base para os dois papéis**: menos superfície de manutenção para equipe pequena.
- **WebSocket simples (sala = atendimento)**: não precisa de infraestrutura de mensageria; um único servidor Node resolve o volume esperado do piloto.
- **Persistência mínima**: só o necessário para histórico e auditoria da conversa (ver [Banco de Dados](07-banco-de-dados.md)).

## Deploy sugerido (baixo custo, piloto)

- Frontend: Vercel (deploy automático, gratuito nesse volume).
- Backend + WebSocket: Render ou Railway (plano pequeno, suporta processo long-lived para WebSocket).
- Banco: Postgres gerenciado do próprio Render/Railway ou Supabase (tier gratuito/baixo custo).

Essa combinação evita provisionar servidor próprio no hospital na fase de piloto — o hospital só precisa dos dois dispositivos (tablets/monitores) com navegador e internet.
