from datetime import UTC, datetime

from app.extensions import db


class ImportLog(db.Model):
    __tablename__ = "import_logs"

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255))
    rows_ok = db.Column(db.Integer, default=0)
    rows_error = db.Column(db.Integer, default=0)
    errors = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "rows_ok": self.rows_ok,
            "rows_error": self.rows_error,
            "created_at": self.created_at.isoformat(),
        }
