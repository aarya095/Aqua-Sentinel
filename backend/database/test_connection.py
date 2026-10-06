from sqlalchemy import text

from .session import SessionLocal


def test_connection():

    db = SessionLocal()

    try:
        result = db.execute(
            text("""
                SELECT COUNT(*)
                FROM incidents
            """)
        )

        print("Incident count:", result.scalar())

    finally:
        db.close()


if __name__ == "__main__":
    test_connection()w