# 3. Stack de Tecnologias

Critério de escolha: equipe pequena, prazo de 30 dias para o MVP, baixo custo, tecnologias simples e amplamente documentadas — sem servidor de banco separado para rodar, sem infraestrutura extra para configurar.

| Camada | Escolha | Por quê |
|--------|---------|---------|
| Frontend | **React (Vite) + JavaScript + Tailwind CSS** | React é o mais documentado/ensinado do mercado, o que ajuda quem está aprendendo; Vite dá um setup rápido e simples, sem a complexidade de um framework full-stack; Tailwind acelera a implementação da paleta e do alto contraste exigidos pela acessibilidade. |
| Backend | **Python + FastAPI** | Python é uma linguagem simples de ler/escrever; FastAPI é leve, tem documentação automática (Swagger) só de escrever o código, e suporta WebSocket nativamente — sem precisar de bibliotecas extras. |
| Tempo real | **WebSocket nativo** (`WebSocket` do navegador + suporte nativo do FastAPI) | Não precisa de nenhuma biblioteca adicional (nada de Socket.IO); tanto o navegador quanto o FastAPI já falam WebSocket "puro" de fábrica. |
| Banco de dados | **SQLite + SQLAlchemy (ORM)** | Banco em um único arquivo, sem instalar nem rodar um servidor de banco separado — ideal para o MVP e para desenvolvimento local simples; SQLAlchemy organiza as tabelas em código Python. Se um dia o volume de uso exigir, dá para migrar para Postgres sem reescrever a lógica da aplicação. |
| Voz → texto | **Web Speech API** (nativa do navegador) | Gratuita, zero infraestrutura, já embutida no Chrome/Edge — suficiente para validar o fluxo no piloto. |
| Texto → Libras | **VLibras** (widget público, gov.br) | Solução madura e gratuita, evita construir avatar 3D próprio (explicitamente fora do escopo do MVP). |
| Simplificação clínica | Camada de regras + dicionário próprio em Python (sem LLM generativo aberto no MVP) | Reduz risco de alucinação em conteúdo clínico; controlado e auditável desde o início. |
| Hospedagem frontend | **Vercel ou Netlify** | Deploy contínuo de um build estático do React, gratuito no volume do piloto. |
| Hospedagem backend | **Render ou Railway** | Suporta um processo Python persistente (necessário para manter as conexões WebSocket abertas), plano gratuito/baixo custo cobre o piloto. |

## O que deliberadamente NÃO entra no MVP

- Modelo próprio de reconhecimento de sinais (visão computacional) — fica para a Fase 2, quando webcam + ML supervisionado forem introduzidos.
- LLM generativo aberto para geração de texto clínico — risco de alucinação incompatível com contexto clínico no MVP.
- Servidor de banco de dados separado (Postgres, MySQL etc.) — o SQLite resolve o MVP sem essa complexidade operacional.
- Infraestrutura própria (servidores no hospital) — o piloto roda em nuvem, o hospital só precisa de dispositivos com navegador.
