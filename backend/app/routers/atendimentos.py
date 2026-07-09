from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models import Atendimento, Mensagem, FeedbackPiloto, Profissional, Hospital
from app.schemas import (
    AtendimentoCreate, AtendimentoOut, MensagemOut,
    FeedbackCreate, FeedbackOut,
    ProfissionalCreate, ProfissionalOut,
)
import uuid

router = APIRouter(prefix="/atendimentos", tags=["atendimentos"])


# ── Profissional (helper para MVP — cria se não existir) ──────────────────

@router.post("/profissionais", response_model=ProfissionalOut, status_code=201)
def criar_profissional(payload: ProfissionalCreate, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter_by(nome=payload.hospital_nome).first()
    if not hospital:
        hospital = Hospital(id=str(uuid.uuid4()), nome=payload.hospital_nome)
        db.add(hospital)
        db.flush()

    prof = Profissional(
        id=str(uuid.uuid4()),
        hospital_id=hospital.id,
        nome=payload.nome,
        cargo=payload.cargo,
    )
    db.add(prof)
    db.commit()
    db.refresh(prof)
    return prof


@router.get("/profissionais", response_model=list[ProfissionalOut])
def listar_profissionais(db: Session = Depends(get_db)):
    return db.query(Profissional).all()


# ── Atendimentos ──────────────────────────────────────────────────────────

@router.post("", response_model=AtendimentoOut, status_code=201)
def criar_atendimento(payload: AtendimentoCreate, db: Session = Depends(get_db)):
    prof = db.get(Profissional, payload.profissional_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")

    atend = Atendimento(
        id=str(uuid.uuid4()),
        profissional_id=payload.profissional_id,
        paciente_ref=payload.paciente_ref,
        status="aguardando",
    )
    db.add(atend)
    db.commit()
    db.refresh(atend)
    return atend


@router.get("/{atendimento_id}", response_model=AtendimentoOut)
def get_atendimento(atendimento_id: str, db: Session = Depends(get_db)):
    atend = db.get(Atendimento, atendimento_id)
    if not atend:
        raise HTTPException(status_code=404, detail="Atendimento não encontrado")
    return atend


@router.get("/{atendimento_id}/mensagens", response_model=list[MensagemOut])
def listar_mensagens(atendimento_id: str, db: Session = Depends(get_db)):
    atend = db.get(Atendimento, atendimento_id)
    if not atend:
        raise HTTPException(status_code=404, detail="Atendimento não encontrado")
    return atend.mensagens


@router.patch("/{atendimento_id}/finalizar", response_model=AtendimentoOut)
def finalizar_atendimento(atendimento_id: str, db: Session = Depends(get_db)):
    atend = db.get(Atendimento, atendimento_id)
    if not atend:
        raise HTTPException(status_code=404, detail="Atendimento não encontrado")
    atend.status = "finalizado"
    atend.finalizado_em = datetime.now(timezone.utc)
    db.commit()
    db.refresh(atend)
    return atend


@router.post("/{atendimento_id}/feedback", response_model=FeedbackOut, status_code=201)
def registrar_feedback(
    atendimento_id: str,
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
):
    atend = db.get(Atendimento, atendimento_id)
    if not atend:
        raise HTTPException(status_code=404, detail="Atendimento não encontrado")
    if payload.nota < 1 or payload.nota > 5:
        raise HTTPException(status_code=422, detail="Nota deve ser entre 1 e 5")

    fb = FeedbackPiloto(
        id=str(uuid.uuid4()),
        atendimento_id=atendimento_id,
        papel=payload.papel,
        nota=payload.nota,
        comentario=payload.comentario,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb
