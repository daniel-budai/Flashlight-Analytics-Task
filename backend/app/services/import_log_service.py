from app.models import ImportLog


def list_import_logs(limit: int = 20) -> list[dict]:
    logs = (
        ImportLog.query.order_by(ImportLog.created_at.desc()).limit(limit).all()
    )
    return [log.to_dict() for log in logs]
