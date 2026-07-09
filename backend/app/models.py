import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def now_utc():
    return datetime.now(timezone.utc)


def new_uuid():
    return str(uuid.uuid4())


class Hospital(Base):
    __tablename__ = "hospitais"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    profissionais: Mapped[List["Profissional"]] = relationship(back_populates="hospital")


class Profissional(Base):
    __tablename__ = "profissionais"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    hospital_id: Mapped[str] = mapped_column(String, ForeignKey("hospitais.id"), nullable=False)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    cargo: Mapped[str] = mapped_column(String, nullable=False, default="Médico")
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    hospital: Mapped["Hospital"] = relationship(back_populates="profissionais")
    atendimentos: Mapped[List["Atendimento"]] = relationship(back_populates="profissional")


class Atendimento(Base):
    __tablename__ = "atendimentos"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    profissional_id: Mapped[str] = mapped_column(String, ForeignKey("profissionais.id"), nullable=False)
    paciente_ref: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(
        SAEnum("aguardando", "em_andamento", "finalizado", name="status_atendimento"),
        default="aguardando",
    )
    iniciado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)
    finalizado_em: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    profissional: Mapped["Profissional"] = relationship(back_populates="atendimentos")
    mensagens: Mapped[List["Mensagem"]] = relationship(
        back_populates="atendimento", order_by="Mensagem.criado_em"
    )
    feedbacks: Mapped[List["FeedbackPiloto"]] = relationship(back_populates="atendimento")


class Mensagem(Base):
    __tablename__ = "mensagens"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    atendimento_id: Mapped[str] = mapped_column(String, ForeignKey("atendimentos.id"), nullable=False)
    remetente: Mapped[str] = mapped_column(
        SAEnum("medico", "paciente", name="remetente_msg"), nullable=False
    )
    tipo: Mapped[str] = mapped_column(
        SAEnum("texto", "voz_transcrita", "simbolo_estruturado", name="tipo_msg"),
        nullable=False,
        default="texto",
    )
    conteudo_original: Mapped[str] = mapped_column(Text, nullable=False)
    conteudo_simplificado: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    atendimento: Mapped["Atendimento"] = relationship(back_populates="mensagens")


class ItemBibliotecaVisual(Base):
    __tablename__ = "itens_biblioteca_visual"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    categoria: Mapped[str] = mapped_column(String, nullable=False)
    local: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    intensidade: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    texto_gerado: Mapped[str] = mapped_column(Text, nullable=False)
    emoji: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ordem: Mapped[int] = mapped_column(Integer, default=0)


class FeedbackPiloto(Base):
    __tablename__ = "feedback_piloto"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=new_uuid)
    atendimento_id: Mapped[str] = mapped_column(String, ForeignKey("atendimentos.id"), nullable=False)
    papel: Mapped[str] = mapped_column(SAEnum("medico", "paciente", name="papel_feedback"), nullable=False)
    nota: Mapped[int] = mapped_column(Integer, nullable=False)
    comentario: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    atendimento: Mapped["Atendimento"] = relationship(back_populates="feedbacks")
