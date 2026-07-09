"""
Seed: popula banco com dados iniciais para o MVP.
- Hospital HC-UFPE
- Um profissional demo
- Biblioteca visual completa (categoria → local → intensidade)
- Atendimento DEMO com ID fixo (para QR code do pitch)

ID do atendimento demo: "sinai-demo-pitch-2025"
URLs do pitch:
  Médico:   https://<seu-dominio>/atendimento/sinai-demo-pitch-2025/medico
  Paciente: https://<seu-dominio>/atendimento/sinai-demo-pitch-2025/paciente
"""

from app.database import SessionLocal
from app.models import Hospital, Profissional, ItemBibliotecaVisual, Atendimento
import uuid


# ID fixo e legível — vai direto na URL do QR code
DEMO_ATENDIMENTO_ID = "sinai-demo-pitch-2025"


BIBLIOTECA_VISUAL = [
    # ── DOR ──────────────────────────────────────────────────────────────
    {"categoria": "dor", "local": None, "intensidade": None,
     "texto_gerado": "Paciente relata dor.", "emoji": "😣", "ordem": 1},
    {"categoria": "dor", "local": "cabeça", "intensidade": None,
     "texto_gerado": "Paciente relata dor na cabeça.", "emoji": "🤕", "ordem": 2},
    {"categoria": "dor", "local": "peito", "intensidade": None,
     "texto_gerado": "Paciente relata dor no peito.", "emoji": "💔", "ordem": 3},
    {"categoria": "dor", "local": "barriga", "intensidade": None,
     "texto_gerado": "Paciente relata dor na barriga.", "emoji": "🤢", "ordem": 4},
    {"categoria": "dor", "local": "costas", "intensidade": None,
     "texto_gerado": "Paciente relata dor nas costas.", "emoji": "🔙", "ordem": 5},
    {"categoria": "dor", "local": "pernas", "intensidade": None,
     "texto_gerado": "Paciente relata dor nas pernas.", "emoji": "🦵", "ordem": 6},
    {"categoria": "dor", "local": "braços", "intensidade": None,
     "texto_gerado": "Paciente relata dor nos braços.", "emoji": "💪", "ordem": 7},
    {"categoria": "dor", "local": "pescoço", "intensidade": None,
     "texto_gerado": "Paciente relata dor no pescoço.", "emoji": "🦒", "ordem": 8},
    {"categoria": "dor", "local": "cabeça", "intensidade": "pouca",
     "texto_gerado": "Paciente relata pouca dor na cabeça.", "emoji": "😕", "ordem": 10},
    {"categoria": "dor", "local": "cabeça", "intensidade": "média",
     "texto_gerado": "Paciente relata dor moderada na cabeça.", "emoji": "😣", "ordem": 11},
    {"categoria": "dor", "local": "cabeça", "intensidade": "muita",
     "texto_gerado": "Paciente relata muita dor na cabeça.", "emoji": "😫", "ordem": 12},
    {"categoria": "dor", "local": "barriga", "intensidade": "pouca",
     "texto_gerado": "Paciente relata pouca dor na barriga.", "emoji": "😕", "ordem": 13},
    {"categoria": "dor", "local": "barriga", "intensidade": "média",
     "texto_gerado": "Paciente relata dor moderada na barriga.", "emoji": "😣", "ordem": 14},
    {"categoria": "dor", "local": "barriga", "intensidade": "muita",
     "texto_gerado": "Paciente relata muita dor na barriga.", "emoji": "😫", "ordem": 15},
    {"categoria": "dor", "local": "peito", "intensidade": "pouca",
     "texto_gerado": "Paciente relata pouca dor no peito.", "emoji": "😕", "ordem": 16},
    {"categoria": "dor", "local": "peito", "intensidade": "média",
     "texto_gerado": "Paciente relata dor moderada no peito.", "emoji": "😣", "ordem": 17},
    {"categoria": "dor", "local": "peito", "intensidade": "muita",
     "texto_gerado": "Paciente relata muita dor no peito.", "emoji": "😫", "ordem": 18},
    {"categoria": "dor", "local": "costas", "intensidade": "pouca",
     "texto_gerado": "Paciente relata pouca dor nas costas.", "emoji": "😕", "ordem": 19},
    {"categoria": "dor", "local": "costas", "intensidade": "média",
     "texto_gerado": "Paciente relata dor moderada nas costas.", "emoji": "😣", "ordem": 20},
    {"categoria": "dor", "local": "costas", "intensidade": "muita",
     "texto_gerado": "Paciente relata muita dor nas costas.", "emoji": "😫", "ordem": 21},

    # ── MAL-ESTAR ─────────────────────────────────────────────────────────
    {"categoria": "mal-estar", "local": None, "intensidade": None,
     "texto_gerado": "Paciente relata mal-estar.", "emoji": "🤒", "ordem": 30},
    {"categoria": "mal-estar", "local": None, "intensidade": "pouco",
     "texto_gerado": "Paciente relata pouco mal-estar.", "emoji": "😟", "ordem": 31},
    {"categoria": "mal-estar", "local": None, "intensidade": "moderado",
     "texto_gerado": "Paciente relata mal-estar moderado.", "emoji": "🤒", "ordem": 32},
    {"categoria": "mal-estar", "local": None, "intensidade": "intenso",
     "texto_gerado": "Paciente relata mal-estar intenso.", "emoji": "🤢", "ordem": 33},

    # ── ENJOO ─────────────────────────────────────────────────────────────
    {"categoria": "enjoo", "local": None, "intensidade": None,
     "texto_gerado": "Paciente relata enjoo.", "emoji": "🤢", "ordem": 40},
    {"categoria": "enjoo", "local": None, "intensidade": "pouco",
     "texto_gerado": "Paciente relata pouco enjoo.", "emoji": "😟", "ordem": 41},
    {"categoria": "enjoo", "local": None, "intensidade": "muito",
     "texto_gerado": "Paciente relata muito enjoo.", "emoji": "🤢", "ordem": 42},
    {"categoria": "enjoo", "local": None, "intensidade": "vômito",
     "texto_gerado": "Paciente relata enjoo com vômito.", "emoji": "🤮", "ordem": 43},

    # ── TONTURA ───────────────────────────────────────────────────────────
    {"categoria": "tontura", "local": None, "intensidade": None,
     "texto_gerado": "Paciente relata tontura.", "emoji": "😵", "ordem": 50},
    {"categoria": "tontura", "local": None, "intensidade": "leve",
     "texto_gerado": "Paciente relata tontura leve.", "emoji": "😵‍💫", "ordem": 51},
    {"categoria": "tontura", "local": None, "intensidade": "forte",
     "texto_gerado": "Paciente relata tontura forte.", "emoji": "😵", "ordem": 52},

    # ── FALTA DE AR ───────────────────────────────────────────────────────
    {"categoria": "falta de ar", "local": None, "intensidade": None,
     "texto_gerado": "Paciente relata falta de ar.", "emoji": "😮‍💨", "ordem": 60},
    {"categoria": "falta de ar", "local": None, "intensidade": "pouca",
     "texto_gerado": "Paciente relata pouca falta de ar.", "emoji": "😮‍💨", "ordem": 61},
    {"categoria": "falta de ar", "local": None, "intensidade": "muita",
     "texto_gerado": "Paciente relata muita falta de ar.", "emoji": "🫁", "ordem": 62},

    # ── FEBRE ─────────────────────────────────────────────────────────────
    {"categoria": "febre", "local": None, "intensidade": None,
     "texto_gerado": "Paciente relata febre.", "emoji": "🌡️", "ordem": 70},
    {"categoria": "febre", "local": None, "intensidade": "baixa",
     "texto_gerado": "Paciente relata febre baixa.", "emoji": "🌡️", "ordem": 71},
    {"categoria": "febre", "local": None, "intensidade": "alta",
     "texto_gerado": "Paciente relata febre alta.", "emoji": "🔥", "ordem": 72},

    # ── OUTRO ─────────────────────────────────────────────────────────────
    {"categoria": "outro", "local": None, "intensidade": None,
     "texto_gerado": "Paciente relata outro problema não listado.", "emoji": "❓", "ordem": 90},
]


def run_seed(db):
    # ── Hospital e profissional ───────────────────────────────────────────
    existing = db.query(Hospital).filter_by(nome="HC-UFPE").first()
    if existing:
        profissional = existing.profissionais[0] if existing.profissionais else None
    else:
        hospital = Hospital(id=str(uuid.uuid4()), nome="HC-UFPE")
        db.add(hospital)
        db.flush()

        profissional = Profissional(
            id=str(uuid.uuid4()),
            hospital_id=hospital.id,
            nome="Dr. Demo",
            cargo="Médico",
        )
        db.add(profissional)
        db.flush()

        # Biblioteca visual (só cria junto com o hospital)
        for item_data in BIBLIOTECA_VISUAL:
            db.add(ItemBibliotecaVisual(id=str(uuid.uuid4()), **item_data))

        db.commit()

    # ── Atendimento DEMO com ID fixo para o pitch ─────────────────────────
    # Recria se estiver finalizado (para o pitch sempre começar fresco)
    demo = db.get(Atendimento, DEMO_ATENDIMENTO_ID)
    if demo and demo.status == "finalizado":
        # Reseta para aguardando — jurados podem testar várias vezes
        demo.status = "aguardando"
        demo.finalizado_em = None
        db.commit()
    elif demo is None and profissional:
        demo = Atendimento(
            id=DEMO_ATENDIMENTO_ID,
            profissional_id=profissional.id,
            paciente_ref="Paciente Demo — Pitch SINAI",
            status="aguardando",
        )
        db.add(demo)
        db.commit()

    return profissional
