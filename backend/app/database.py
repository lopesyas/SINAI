import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Railway injeta DATABASE_URL automaticamente com PostgreSQL.
# Localmente, cai para SQLite.
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./sinai.db")

# SQLAlchemy 1.4+ exige "postgresql://" mas Railway fornece "postgres://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite precisa de check_same_thread; PostgreSQL não aceita esse argumento
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
