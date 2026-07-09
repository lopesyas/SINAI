from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ItemBibliotecaVisual
from app.schemas import BibliotecaVisualOut, ItemBibliotecaOut

router = APIRouter(prefix="/biblioteca-visual", tags=["biblioteca"])


@router.get("", response_model=BibliotecaVisualOut)
def get_biblioteca(db: Session = Depends(get_db)):
    itens = (
        db.query(ItemBibliotecaVisual)
        .order_by(ItemBibliotecaVisual.ordem)
        .all()
    )

    # Extrai categorias únicas mantendo a ordem
    seen: set[str] = set()
    categorias: list[str] = []
    for item in itens:
        if item.categoria not in seen:
            seen.add(item.categoria)
            categorias.append(item.categoria)

    return BibliotecaVisualOut(
        categorias=categorias,
        itens=[ItemBibliotecaOut.model_validate(i) for i in itens],
    )
