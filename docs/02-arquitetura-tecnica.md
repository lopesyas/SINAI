# 2. Arquitetura Técnica

## Visão geral

O SINAI é uma aplicação web com dois "papéis" de tela — **Monitor do Paciente** e **Monitor do Profissional** — conectados em tempo real à mesma sessão de atendimento. Não são apps separados: é o mesmo frontend React, renderizando uma interface diferente por papel/rota, sincronizada por WebSocket.

```
┌─────────────────────┐        ┌─────────────────────┐
│  Monitor Paciente    │        │  Monitor Profissional │
│  (browser, tablet)   │        │  (browser, notebook)  │
└──────────┬───────────┘        └──────────┬───────────┘
           │  WebSocket (sala = atendimento_id)          │
           └───────────────┬──────────────────────────────┘
                            ▼
                 ┌─────────────────────┐
                 │   Backend FastAPI    │
                 │   (API REST + WS)    │
                 └──────────┬──────────┘
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  SQLite         │  │  Serviço STT      │  │  Serviço Libras   │
│  (atendimentos,│  │  (Web Speech API  │  │  (VLibras widget/ │
│  mensagens)    │  │  no MVP)          │  │  API)             │
└───────────────┘  └──────────────────┘  └──────────────────┘
```

## Componentes

### Frontend (React, uma aplicação, dois papéis)
- SPA que resolve `/atendimento/:id/paciente` e `/atendimento/:id/medico`.
- Conecta ao WebSocket na sala `atendimento_id` assim que carrega.
- **Papel paciente**: renderiza a mensagem do médico (avatar/vídeo em Libras) e a biblioteca visual de sintomas para resposta.
- **Papel médico**: renderiza chat com histórico, campo de texto e botão de voz.

### Backend (Python + FastAPI)
- API REST para criar/consultar atendimentos e histórico.
- Endpoint WebSocket nativo do FastAPI: cada atendimento é uma "sala" (gerenciada em memória pelo próprio processo); mensagens de um papel são retransmitidas ao outro em tempo real.
- Orquestra as chamadas aos serviços externos (STT, simplificador, tradução Libras) antes de emitir a mensagem final para o paciente.

### Serviços de suporte (MVP usa soluções existentes, não modelos próprios)
- **Speech-to-Text**: Web Speech API do navegador (gratuita, sem infraestrutura própria) na fase 1; troca futura por outro serviço se a precisão for insuficiente.
- **Simplificação clínica de texto**: função Python de regras + dicionário de expressões clínicas comuns (ex.: "desconforto abdominal" → "dor na barriga"). Deliberadamente **não** usa um LLM generativo aberto no MVP, para não arriscar alucinação em conteúdo clínico — só substituições controladas e revisadas.
- **Texto → Libras**: widget do **VLibras** (governo federal, gratuito, mantido), embutido na tela do paciente. O frontend passa o texto simplificado para o widget exibir a tradução (avatar do próprio VLibras).
- **Resposta do paciente**: não depende de nenhum serviço de IA no MVP — é seleção estruturada na biblioteca visual (ver [Fluxo de Telas](09-fluxo-telas.md)).

## Fluxo de dados — Cenário 1 (médico → paciente)

```
Médico fala/digita
   │
   ▼ (se voz) Web Speech API no navegador → texto
   │
   ▼
Backend: simplificador de texto clínico (regras em Python)
   │
   ▼
Backend emite via WebSocket para a sala do atendimento
   │
   ▼
Monitor do Paciente recebe o texto simplificado e aciona o widget VLibras
   │
   ▼
Mensagem (original + simplificada) é persistida no SQLite
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
Mensagem é persistida no SQLite
```

## Por que essa arquitetura para um MVP de 30 dias

- **Sem modelo de IA próprio**: todo o "Libras" e "voz" do MVP vem de serviços já existentes (VLibras, Web Speech API). Isso é o que torna 30 dias viável.
- **Um único código-base para os dois papéis**: menos superfície de manutenção para equipe pequena.
- **WebSocket nativo (sala = atendimento)**: não precisa de bibliotecas nem infraestrutura de mensageria extra; um único processo FastAPI resolve o volume esperado do piloto.
- **SQLite**: banco em arquivo único, sem servidor separado para instalar, configurar ou manter durante o MVP.

## Deploy sugerido (baixo custo, piloto)

- Frontend: Vercel ou Netlify (build estático do React, deploy automático, gratuito nesse volume).
- Backend: Render ou Railway (plano pequeno, suporta processo Python persistente para manter WebSocket aberto).
- Banco: o próprio arquivo SQLite, dentro do serviço do backend (com backup periódico simples). Se o volume crescer além do piloto, migrar para um Postgres gerenciado é uma troca de configuração no SQLAlchemy, não uma reescrita da aplicação.

Essa combinação evita provisionar servidor próprio no hospital na fase de piloto — o hospital só precisa dos dois dispositivos (tablets/monitores) com navegador e internet.
