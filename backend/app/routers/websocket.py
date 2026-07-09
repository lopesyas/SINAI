"""
Endpoint WebSocket: WS /ws/atendimentos/{atendimento_id}/{papel}

Eventos cliente → servidor:
  mensagem_medico       — médico envia texto ou voz transcrita
  mensagem_paciente     — paciente envia seleção da biblioteca visual ou sim/não

Eventos servidor → clientes da sala:
  mensagem_para_paciente — resultado simplificado (médico → paciente)
  mensagem_para_medico   — frase estruturada (paciente → médico)
  status_atendimento     — mudança de status da sessão
  erro                   — algo deu errado
"""

import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Atendimento, Mensagem
from app.simplificador import simplificar
from app.ws_manager import manager

router = APIRouter(tags=["websocket"])


def _get_db() -> Session:
    return SessionLocal()


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.websocket("/ws/atendimentos/{atendimento_id}/{papel}")
async def websocket_atendimento(
    websocket: WebSocket,
    atendimento_id: str,
    papel: str,
):
    if papel not in ("medico", "paciente"):
        await websocket.close(code=4000)
        return

    db = _get_db()

    # Verifica se o atendimento existe
    atend = db.get(Atendimento, atendimento_id)
    if not atend:
        await websocket.close(code=4004)
        db.close()
        return

    await manager.connect(atendimento_id, websocket)

    # Atualiza status para em_andamento na primeira conexão
    if atend.status == "aguardando":
        atend.status = "em_andamento"
        db.commit()

    # Notifica todos na sala sobre o novo participante
    await manager.broadcast(
        atendimento_id,
        {
            "evento": "status_atendimento",
            "status": atend.status,
            "papel_conectado": papel,
            "participantes": manager.room_size(atendimento_id),
            "timestamp": _now_iso(),
        },
    )

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                await manager.send_to(websocket, {"evento": "erro", "detalhe": "JSON inválido"})
                continue

            evento = data.get("evento")

            # ── MÉDICO → PACIENTE ────────────────────────────────────────
            if evento == "mensagem_medico":
                tipo = data.get("tipo", "texto")
                conteudo_original = data.get("conteudoOriginal", "").strip()

                if not conteudo_original:
                    await manager.send_to(websocket, {"evento": "erro", "detalhe": "Mensagem vazia"})
                    continue

                conteudo_simplificado = simplificar(conteudo_original)

                # Persiste
                msg_id = str(uuid.uuid4())
                msg = Mensagem(
                    id=msg_id,
                    atendimento_id=atendimento_id,
                    remetente="medico",
                    tipo=tipo,
                    conteudo_original=conteudo_original,
                    conteudo_simplificado=conteudo_simplificado,
                )
                db.add(msg)
                db.commit()

                # Retransmite para todos da sala (incluindo médico — para confirmar)
                await manager.broadcast(
                    atendimento_id,
                    {
                        "evento": "mensagem_para_paciente",
                        "mensagemId": msg_id,
                        "remetente": "medico",
                        "conteudoOriginal": conteudo_original,
                        "conteudoSimplificado": conteudo_simplificado,
                        "tipo": tipo,
                        "criadoEm": _now_iso(),
                    },
                )

            # ── PACIENTE → MÉDICO ────────────────────────────────────────
            elif evento == "mensagem_paciente":
                tipo = data.get("tipo", "simbolo_estruturado")
                conteudo_original = data.get("conteudoOriginal", "").strip()

                if not conteudo_original:
                    await manager.send_to(websocket, {"evento": "erro", "detalhe": "Mensagem vazia"})
                    continue

                # Persiste
                msg_id = str(uuid.uuid4())
                msg = Mensagem(
                    id=msg_id,
                    atendimento_id=atendimento_id,
                    remetente="paciente",
                    tipo=tipo,
                    conteudo_original=conteudo_original,
                    conteudo_simplificado=None,
                )
                db.add(msg)
                db.commit()

                await manager.broadcast(
                    atendimento_id,
                    {
                        "evento": "mensagem_para_medico",
                        "mensagemId": msg_id,
                        "remetente": "paciente",
                        "conteudoOriginal": conteudo_original,
                        "tipo": tipo,
                        "criadoEm": _now_iso(),
                    },
                )

            else:
                await manager.send_to(
                    websocket, {"evento": "erro", "detalhe": f"Evento desconhecido: {evento}"}
                )

    except WebSocketDisconnect:
        manager.disconnect(atendimento_id, websocket)
        db.close()

        # Notifica os demais
        await manager.broadcast(
            atendimento_id,
            {
                "evento": "status_atendimento",
                "status": "papel_desconectado",
                "papel_desconectado": papel,
                "participantes": manager.room_size(atendimento_id),
                "timestamp": _now_iso(),
            },
        )
    except Exception as e:
        manager.disconnect(atendimento_id, websocket)
        db.close()
