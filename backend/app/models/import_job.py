import json
from datetime import UTC, datetime
from enum import StrEnum

from app.extensions import db


class ImportJobStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class ImportJob(db.Model):
    __tablename__ = "import_jobs"

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default=ImportJobStatus.PENDING, nullable=False)
    file_path = db.Column(db.String(512), nullable=False)
    result = db.Column(db.Text)
    error = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))
    completed_at = db.Column(db.DateTime)

    def to_dict(self) -> dict:
        payload = {
            "id": self.id,
            "filename": self.filename,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
        if self.status == ImportJobStatus.COMPLETED and self.result:
            payload["result"] = json.loads(self.result)
        if self.status == ImportJobStatus.FAILED and self.error:
            payload["error"] = self.error
        return payload
