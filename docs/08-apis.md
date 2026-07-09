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

## WebSocket (tempo real — WebSocket nativo do FastAPI)

Endpoint único: `WS /ws/atendimentos/{atendimento_id}/{papel}` (papel = `medico` ou `paciente`). O FastAPI mantém, em memória, a lista de conexões abertas por `atendimento_id` — isso é a "sala". Cada mensagem trocada é um JSON com um campo `evento` para o cliente saber como tratá-la (o WebSocket nativo não tem roteamento de eventos embutido como o Socket.IO, então esse campo faz esse papel).

### Cliente → servidor: `mensagem_medico`
Enviado pelo monitor do médico ao enviar texto ou voz transcrita.
```json
{ "evento": "mensagem_medico", "tipo": "texto", "conteudoOriginal": "Você está com dor onde?" }
```
Servidor processa (simplificação clínica) e retransmite para todos os conectados na sala:

### Servidor → clientes da sala: `mensagem_para_paciente`
```json
{
  "evento": "mensagem_para_paciente",
  "mensagemId": "uuid",
  "conteudoOriginal": "Você está com dor onde?",
  "conteudoSimplificado": "Onde você sente dor?"
}
```
O frontend do paciente pega `conteudoSimplificado` e passa para o widget VLibras exibir a tradução.

### Cliente → servidor: `mensagem_paciente`
Enviado pelo monitor do paciente ao concluir uma seleção na biblioteca visual.
```json
{ "evento": "mensagem_paciente", "tipo": "simbolo_estruturado", "conteudoOriginal": "Paciente relata muita dor na cabeça." }
```
Servidor retransmite para a sala:

### Servidor → clientes da sala: `mensagem_para_medico`
```json
{ "evento": "mensagem_para_medico", "mensagemId": "uuid", "conteudoOriginal": "Paciente relata muita dor na cabeça.", "criadoEm": "2026-07-07T10:02:00Z" }
```

### Servidor → clientes da sala: `status_atendimento`
Notifica mudança de status (ex.: `em_andamento`, `finalizado`).

Como o WebSocket nativo não reconecta sozinho (diferente do Socket.IO), o frontend implementa uma reconexão simples (tentar de novo após queda de conexão) e, ao reconectar, chama `GET /atendimentos/:id/mensagens` para recompor o histórico que possa ter sido perdido.

## Integrações externas

- **VLibras**: o widget roda direto no navegador do paciente (script público do gov.br), sem chamada de backend — o backend só entrega o texto já simplificado.
- **Web Speech API**: roda no navegador do médico (client-side); o backend só recebe o texto já transcrito via evento `mensagem_medico`.
