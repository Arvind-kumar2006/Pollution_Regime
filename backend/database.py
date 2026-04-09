from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ----------------------------
# DATABASE URL (Docker PostgreSQL)
# ----------------------------
DATABASE_URL = "postgresql://postgres:1234@localhost:5432/pollution_db"

# ----------------------------
# ENGINE (connection to DB)
# ----------------------------
engine = create_engine(
    DATABASE_URL,
    echo=True  # optional: shows SQL logs (good for debugging)
)

# ----------------------------
# SESSION (used to interact with DB)
# ----------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ----------------------------
# BASE CLASS (for models)
# ----------------------------
Base = declarative_base()


# ----------------------------
# DEPENDENCY (optional, for FastAPI)
# ----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()