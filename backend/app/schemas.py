from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ---- Atendimento ----

class AtendimentoCreate(BaseModel):
    profissional_id: str
    paciente_ref: str


class AtendimentoOut(BaseModel):
    id: str
    profissional_id: str
    paciente_ref: str
    status: str
    iniciado_em: datetime
    finalizado_em: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ---- Mensagem ----

class MensagemOut(BaseModel):
    id: str
    atendimento_id: str
    remetente: str
    tipo: str
    conteudo_original: str
    conteudo_simplificado: Optional[str] = None
    criado_em: datetime

    model_config = {"from_attributes": True}


# ---- Biblioteca Visual ----

class ItemBibliotecaOut(BaseModel):
    id: str
    categoria: str
    local: Optional[str] = None
    intensidade: Optional[str] = None
    texto_gerado: str
    emoji: Optional[str] = None
    ordem: int

    model_config = {"from_attributes": True}


class BibliotecaVisualOut(BaseModel):
    categorias: list[str]
    itens: list[ItemBibliotecaOut]


# ---- Feedback ----

class FeedbackCreate(BaseModel):
    papel: str
    nota: int
    comentario: Optional[str] = None


class FeedbackOut(BaseModel):
    id: str
    atendimento_id: str
    papel: str
    nota: int
    comentario: Optional[str] = None
    criado_em: datetime

    model_config = {"from_attributes": True}


# ---- Profissional (simplificado para MVP) ----

class ProfissionalCreate(BaseModel):
    nome: str
    cargo: str = "Médico"
    hospital_nome: str = "HC-UFPE"


class ProfissionalOut(BaseModel):
    id: str
    nome: str
    cargo: str
    hospital_id: str

    model_config = {"from_attributes": True}
