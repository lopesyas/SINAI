import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine
from app.models import Base
from app.routers import atendimentos, biblioteca, websocket
from app.seed import run_seed
from app.database import SessionLocal

# Origens permitidas: sempre localhost + qualquer URL configurada via env
# FRONTEND_URL deve ser setada no Railway com a URL da Vercel, ex:
#   https://sinai.vercel.app
_extra_origins = os.environ.get("FRONTEND_URL", "")
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:4173",
]
if _extra_origins:
    for origin in _extra_origins.split(","):
        origin = origin.strip().rstrip("/")
        if origin:
            ALLOWED_ORIGINS.append(origin)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cria tabelas e roda seed na inicialização
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        run_seed(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="SINAI API",
    description="Sistema Inteligente de Navegação e Atendimento Inclusivo",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(atendimentos.router)
app.include_router(biblioteca.router)
app.include_router(websocket.router)


@app.get("/health")
def health():
    return {"status": "ok", "sistema": "SINAI"}
