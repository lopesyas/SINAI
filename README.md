# SINAI — Sistema Inteligente de Navegação e Atendimento Inclusivo

Plataforma de comunicação acessível entre profissionais de saúde e pacientes surdos para atendimentos sem intérprete de Libras presente.

## Como rodar (desenvolvimento local)

### Backend (FastAPI + SQLite)

```bash
cd backend
./start.sh
# ou: venv/bin/uvicorn app.main:app --reload --port 8000
```

API disponível em: http://localhost:8000  
Docs automáticos: http://localhost:8000/docs

### Frontend (React + Vite)

```bash
cd frontend
npm run dev
```

App disponível em: http://localhost:5173

### Fluxo de uso

1. Abrir http://localhost:5173 no monitor do **médico**
2. Criar atendimento → será gerado o ID e o link do monitor do paciente
3. Copiar o link e abrir no monitor/tablet do **paciente**
4. Comunicação em tempo real via WebSocket:
   - Médico digita ou usa voz → texto chega em Libras para o paciente (via VLibras)
   - Paciente responde via biblioteca visual → frase estruturada chega para o médico

## Estrutura

```
SINAI/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, lifespan
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── database.py      # SQLite engine + session
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── simplificador.py # Dicionário clínico de simplificação
│   │   ├── ws_manager.py    # Gerenciador de salas WebSocket
│   │   ├── seed.py          # Dados iniciais (hospital, biblioteca visual)
│   │   └── routers/
│   │       ├── atendimentos.py  # REST endpoints
│   │       ├── biblioteca.py    # GET /biblioteca-visual
│   │       └── websocket.py     # WS /ws/atendimentos/{id}/{papel}
│   └── venv/
└── frontend/
    └── src/
        ├── App.jsx
        ├── pages/
        │   ├── NovoAtendimento.jsx  # Criação de sessão
        │   ├── MonitorMedico.jsx    # Chat + voz + histórico
        │   └── MonitorPaciente.jsx  # Libras + biblioteca visual
        ├── context/
        │   └── AtendimentoContext.jsx  # WebSocket + estado compartilhado
        ├── components/
        │   ├── Logo.jsx
        │   ├── Button.jsx
        │   ├── Card.jsx
        │   ├── StatusBadge.jsx
        │   └── GeometricBackground.jsx
        └── services/
            └── api.js
```
