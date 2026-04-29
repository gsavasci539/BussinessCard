from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from urllib.parse import quote_plus

# Default to the provided SQL Server ODBC connection. Can be overridden by DATABASE_URL.
ODBC_CONN = os.getenv(
    "ODBC_CONN",
    "DRIVER={ODBC Driver 17 for SQL Server};SERVER=104.247.167.130,57673;DATABASE=yazil112_meeting;UID=yazil112_test2;PWD=GURkan5391;charset=UTF-8",
)

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    # Build SQLAlchemy URL using pyodbc and the ODBC connection string
    DB_URL = f"mssql+pyodbc:///?odbc_connect={quote_plus(ODBC_CONN)}"

# Configure engine with UTF-8 support for Turkish characters
connect_args = {
    'charset': 'utf8',
    'autocommit': True
}
engine = create_engine(DB_URL, echo=False, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
