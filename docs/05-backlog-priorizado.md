# 5. Backlog Priorizado (MVP — 30 dias)

Priorização por método MoSCoW (Must / Should / Could / Won't nesta fase).

## Épico A — Infraestrutura base
| Item | Prioridade |
|------|-----------|
| Setup do projeto (React + FastAPI + SQLite) | Must |
| Modelo de dados de atendimento/mensagem | Must |
| Conexão WebSocket por sala de atendimento | Must |
| Deploy contínuo (Vercel + Render/Railway) | Must |

## Épico B — Comunicação médico → paciente
| Item | Prioridade |
|------|-----------|
| Campo de texto para o médico digitar mensagem | Must |
| Captura de voz (Web Speech API) e conversão em texto | Must |
| Simplificador de texto clínico (regras + dicionário) | Must |
| Integração com VLibras para exibir tradução | Must |
| Indicador de "mensagem enviada / traduzida / recebida" | Should |

## Épico C — Comunicação paciente → médico
| Item | Prioridade |
|------|-----------|
| Biblioteca visual: categoria de sintoma (dor, mal-estar, outro) | Must |
| Biblioteca visual: local do sintoma | Must |
| Biblioteca visual: intensidade | Must |
| Composição automática da frase estruturada | Must |
| Respostas rápidas sim/não | Should |
| Campo livre opcional com teclado (para paciente alfabetizado que prefira digitar) | Could |

## Épico D — Interfaces
| Item | Prioridade |
|------|-----------|
| Tela do paciente (alto contraste, avatar central, botões grandes) | Must |
| Tela do médico (histórico + campo de envio + botão de voz) | Must |
| Aplicação da paleta e identidade visual do SINAI | Must |
| Estado de espera / "aguardando profissional" | Should |

## Épico E — Registro e histórico
| Item | Prioridade |
|------|-----------|
| Persistência de todas as mensagens do atendimento | Must |
| Tela/consulta simples de histórico por atendimento | Should |
| Exportação do histórico (texto simples) | Could |

## Épico F — Validação
| Item | Prioridade |
|------|-----------|
| Roteiro de teste com profissionais e pacientes voluntários | Must |
| Formulário de feedback pós-atendimento | Should |
| Ajustes de usabilidade a partir do feedback do piloto | Should |

## Fora do backlog do MVP (Won't nesta fase)
- Reconhecimento de sinais via webcam.
- Integração com prontuário eletrônico.
- Personalização multi-hospitalar.
- Qualquer modelo de IA generativa aberta para geração de texto clínico.

## Sugestão de distribuição em sprints (4 sprints de ~1 semana)
1. **Sprint 1**: Épico A completo + início do Épico D (telas estáticas).
2. **Sprint 2**: Épico B completo.
3. **Sprint 3**: Épico C completo + Épico E.
4. **Sprint 4**: Épico D refinado (visual final) + Épico F (piloto e ajustes).
