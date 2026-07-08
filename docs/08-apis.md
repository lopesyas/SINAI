# 8. APIs

## REST (criação/consulta — não tempo real)

### `POST /atendimentos`
Cria um novo atendimento (início da consulta).
```json
// Request
{ "profissionalId": "uuid", "pacienteRef": "string" }

// Response 201
{ "id": "uuid", "status": "aguardando", "iniciadoEm": "2026-07-07T10:00:00Z" }
```

### `GET /atendimentos/:id`
Retorna os dados do atendimento e seu status atual.

### `GET /atendimentos/:id/mensagens`
Retorna o histórico de mensagens do atendimento, ordenado por `criado_em`. Usado ao carregar/recarregar qualquer um dos dois monitores.

### `PATCH /atendimentos/:id/finalizar`
Marca o atendimento como `finalizado`.

### `GET /biblioteca-visual`
Retorna a árvore categoria → local → intensidade → texto_gerado, usada para montar a interface de resposta do paciente.

### `POST /atendimentos/:id/feedback`
Registra feedback pós-atendimento (piloto).
```json
{ "papel": "medico", "nota": 5, "comentario": "opcional" }
```

## WebSocket (tempo real — Socket.IO)

Cada atendimento é uma **sala** (`room = atendimento_id`). Paciente e médico entram na mesma sala ao abrir suas respectivas telas.

### Evento: `join_atendimento`
Emitido pelo cliente ao conectar.
```json
{ "atendimentoId": "uuid", "papel": "medico" }
```

### Evento: `mensagem_medico`
Emitido pelo monitor do médico ao enviar texto ou voz transcrita.
```json
{ "atendimentoId": "uuid", "tipo": "texto", "conteudoOriginal": "Você está com dor onde?" }
```
Servidor processa (simplificação → VLibras) e retransmite para a sala:

### Evento: `mensagem_para_paciente` (servidor → clientes da sala)
```json
{
  "mensagemId": "uuid",
  "conteudoOriginal": "Você está com dor onde?",
  "conteudoSimplificado": "Onde você sente dor?",
  "libras": { "provider": "vlibras", "texto": "Onde você sente dor?" }
}
```

### Evento: `mensagem_paciente`
Emitido pelo monitor do paciente ao concluir uma seleção na biblioteca visual.
```json
{ "atendimentoId": "uuid", "tipo": "simbolo_estruturado", "conteudoOriginal": "Paciente relata muita dor na cabeça." }
```
Servidor retransmite para a sala:

### Evento: `mensagem_para_medico` (servidor → clientes da sala)
```json
{ "mensagemId": "uuid", "conteudoOriginal": "Paciente relata muita dor na cabeça.", "criadoEm": "2026-07-07T10:02:00Z" }
```

### Evento: `status_atendimento` (servidor → clientes da sala)
Notifica mudança de status (ex.: `em_andamento`, `finalizado`).

## Integrações externas

- **VLibras**: chamada feita pelo backend (não pelo frontend), para manter a chave/uso centralizado e permitir troca futura de provedor sem alterar o cliente.
- **Web Speech API**: roda no navegador do médico (client-side); o backend só recebe o texto já transcrito via evento `mensagem_medico`.
