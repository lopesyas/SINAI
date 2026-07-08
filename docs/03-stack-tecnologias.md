# 3. Stack de Tecnologias

Critério de escolha: equipe pequena, prazo de 30 dias para o MVP, baixo custo, e o menor número possível de tecnologias diferentes para manter e depurar.

| Camada | Escolha | Por quê |
|--------|---------|---------|
| Frontend | **Next.js + TypeScript + Tailwind CSS** | Uma única linguagem (TS) do frontend ao backend; Tailwind acelera a implementação da paleta e do alto contraste exigidos pela acessibilidade; Next.js dá roteamento e deploy simples (Vercel). |
| Backend | **Node.js + NestJS + TypeScript** | Mesma linguagem do frontend (menos context-switch para equipe pequena); NestJS organiza o código em módulos desde o início (evita virar "spaghetti" sob prazo curto); tem suporte nativo a WebSocket Gateway. |
| Tempo real | **Socket.IO** | Mais simples de operar que WebSocket puro (reconexão automática, fallback), maduro, bem documentado, integra direto com NestJS. |
| Banco de dados | **PostgreSQL + Prisma (ORM)** | Modelo relacional simples (atendimentos, mensagens, usuários) não precisa de NoSQL; Prisma dá migrations e type-safety com TS, reduzindo erro humano sob prazo curto. |
| Voz → texto | **Web Speech API** (nativa do navegador) | Gratuita, zero infraestrutura, já embutida no Chrome/Edge — suficiente para validar o fluxo no piloto. Evoluir para Whisper API só se a precisão em ambiente hospitalar (ruído, sotaques) se mostrar insuficiente. |
| Texto → Libras | **VLibras** (widget/API pública, gov.br) | Solução madura e gratuita, evita construir avatar 3D próprio (explicitamente fora do escopo do MVP). |
| Simplificação clínica | Camada de regras + dicionário próprio (sem LLM generativo aberto no MVP) | Reduz risco de alucinação em conteúdo clínico; controlado e auditável desde o início. |
| Hospedagem frontend | **Vercel** | Deploy contínuo, gratuito no volume do piloto. |
| Hospedagem backend/DB | **Render ou Railway** | Suporta processo persistente para WebSocket + Postgres gerenciado, baixo custo. |

## O que deliberadamente NÃO entra no MVP

- Modelo próprio de reconhecimento de sinais (visão computacional) — fica para a Fase 2, quando webcam + ML supervisionado forem introduzidos.
- LLM generativo aberto para geração de texto clínico — risco de alucinação incompatível com contexto clínico no MVP.
- Infraestrutura própria (servidores no hospital) — o piloto roda em nuvem, o hospital só precisa de dispositivos com navegador.
