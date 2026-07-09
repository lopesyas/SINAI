# 7. Estrutura do Banco de Dados

SQLite, acessado via SQLAlchemy (Python) — um único arquivo de banco, sem servidor separado para instalar ou manter no MVP. Modelo pensado para o mínimo necessário — nada de dados sensíveis do paciente além do estritamente necessário para o atendimento (ver nota de LGPD ao final).

Os tipos de coluna abaixo (`uuid`, `timestamptz`, `enum`) são a intenção do modelo; em SQLite/SQLAlchemy isso se traduz, na prática, para `String` (para uuid, gerado em Python), `DateTime` e `String` com valores restritos por `Enum` do Python (SQLite não tem tipo `enum` nativo).

## Modelo ER (texto)

```
hospitais 1───* profissionais
profissionais 1───* atendimentos
atendimentos 1───* mensagens
atendimentos 1───* feedback_piloto
```

## Tabelas

### `hospitais`
| Coluna | Tipo | Observação |
|--------|------|-----------|
| id | uuid, PK | |
| nome | text | ex.: "HC-UFPE" |
| criado_em | timestamptz | default now() |

### `profissionais`
| Coluna | Tipo | Observação |
|--------|------|-----------|
| id | uuid, PK | |
| hospital_id | uuid, FK → hospitais.id | |
| nome | text | |
| cargo | text | ex.: "Médico", "Enfermeiro" |
| criado_em | timestamptz | default now() |

### `atendimentos`
| Coluna | Tipo | Observação |
|--------|------|-----------|
| id | uuid, PK | usado como "sala" do WebSocket |
| profissional_id | uuid, FK → profissionais.id | |
| paciente_ref | text | identificador **anonimizado/pseudonimizado** vindo do hospital (ex.: hash do número de atendimento), nunca nome/CPF |
| status | enum(`aguardando`, `em_andamento`, `finalizado`) | |
| iniciado_em | timestamptz | default now() |
| finalizado_em | timestamptz, nullable | |

### `mensagens`
| Coluna | Tipo | Observação |
|--------|------|-----------|
| id | uuid, PK | |
| atendimento_id | uuid, FK → atendimentos.id | |
| remetente | enum(`medico`, `paciente`) | |
| tipo | enum(`texto`, `voz_transcrita`, `simbolo_estruturado`) | |
| conteudo_original | text | o que foi digitado/falado/selecionado |
| conteudo_simplificado | text, nullable | resultado do simplificador clínico (só para mensagens do médico) |
| criado_em | timestamptz | default now() |

### `itens_biblioteca_visual` (dados de referência, seed estático no MVP)
| Coluna | Tipo | Observação |
|--------|------|-----------|
| id | uuid, PK | |
| categoria | text | ex.: "dor" |
| local | text | ex.: "cabeça" |
| intensidade | text | ex.: "muita" |
| texto_gerado | text | ex.: "Paciente relata muita dor na cabeça." |

### `feedback_piloto`
| Coluna | Tipo | Observação |
|--------|------|-----------|
| id | uuid, PK | |
| atendimento_id | uuid, FK → atendimentos.id | |
| papel | enum(`medico`, `paciente`) | |
| nota | int | escala 1–5 |
| comentario | text, nullable | |
| criado_em | timestamptz | default now() |

## Nota sobre LGPD e dados de saúde

Dados de saúde são categoria sensível pela LGPD. Decisões de modelagem para minimizar risco desde o MVP:
- Não armazenar nome, CPF ou qualquer identificador direto do paciente — apenas `paciente_ref` pseudonimizado, fornecido pelo hospital.
- Conteúdo clínico (`mensagens`) fica associado só ao `atendimento_id`, nunca a um cadastro de paciente persistente no MVP (isso só entra na Fase 2, com consentimento explícito e formalizado — ver [Estratégia de Validação](11-estrategia-validacao-hcufpe.md)).
- Retenção e acesso a esses dados devem seguir o termo de cooperação/consentimento assinado com o hospital antes do piloto.
