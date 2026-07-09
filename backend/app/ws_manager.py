"""
Gerenciador de conexões WebSocket.
Cada atendimento é uma "sala" identificada pelo atendimento_id.
Mensagens recebidas de um papel são retransmitidas a todos da mesma sala.
"""

from fastapi import WebSocket
from typing import DefaultDict, Optional
from collections import defaultdict
import json


class ConnectionManager:
    def __init__(self):
        # { atendimento_id: [WebSocket, ...] }
        self._rooms: DefaultDict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, atendimento_id: str, ws: WebSocket):
        await ws.accept()
        self._rooms[atendimento_id].append(ws)

    def disconnect(self, atendimento_id: str, ws: WebSocket):
        room = self._rooms.get(atendimento_id, [])
        if ws in room:
            room.remove(ws)
        if not room:
            self._rooms.pop(atendimento_id, None)

    async def broadcast(self, atendimento_id: str, payload: dict, exclude: Optional[WebSocket] = None):
        """Envia payload JSON para todos os conectados na sala, exceto o remetente opcional."""
        message = json.dumps(payload, ensure_ascii=False, default=str)
        dead: list[WebSocket] = []

        for ws in list(self._rooms.get(atendimento_id, [])):
            if ws is exclude:
                continue
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)

        for ws in dead:
            self.disconnect(atendimento_id, ws)

    async def send_to(self, ws: WebSocket, payload: dict):
        """Envia payload JSON para uma conexão específica."""
        try:
            await ws.send_text(json.dumps(payload, ensure_ascii=False, default=str))
        except Exception:
            pass

    def room_size(self, atendimento_id: str) -> int:
        return len(self._rooms.get(atendimento_id, []))


manager = ConnectionManager()
