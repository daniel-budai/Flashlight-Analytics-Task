import json
import os
from datetime import UTC, datetime
from uuid import uuid4

from flask import current_app
from werkzeug.datastructures import FileStorage

from app.extensions import db
from app.models import ImportJob, ImportJobStatus
from app.services.cache_utils import invalidate_stats_cache
from app.services.imports.service import import_csv_from_path
from app.services.import_jobs.worker import run_in_background


def create_import_job(file: FileStorage) -> ImportJob:
    filename = file.filename or "unknown.csv"
    safe_name = f"{uuid4().hex}_{filename}"
    path = os.path.join(current_app.config["UPLOAD_FOLDER"], safe_name)
    file.save(path)

    job = ImportJob(filename=filename, file_path=path, status=ImportJobStatus.PENDING)
    db.session.add(job)
    db.session.commit()
    return job


def enqueue_import_job(job_id: int, app) -> None:
    run_in_background(_process_job, job_id, app)


def get_import_job(job_id: int) -> ImportJob | None:
    return db.session.get(ImportJob, job_id)


def _process_job(job_id: int, app) -> None:
    with app.app_context():
        job = db.session.get(ImportJob, job_id)
        if not job:
            return

        file_path = job.file_path
        job.status = ImportJobStatus.PROCESSING
        db.session.commit()

        try:
            result = import_csv_from_path(file_path, filename=job.filename)
            if "error" in result:
                job.status = ImportJobStatus.FAILED
                job.error = result["error"]
            else:
                job.status = ImportJobStatus.COMPLETED
                job.result = json.dumps(result)
                invalidate_stats_cache()
            job.completed_at = datetime.now(UTC)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            job = db.session.get(ImportJob, job_id)
            if job:
                job.status = ImportJobStatus.FAILED
                job.error = str(e)
                job.completed_at = datetime.now(UTC)
                db.session.commit()
        finally:
            _cleanup_file(file_path)


def _cleanup_file(path: str) -> None:
    try:
        os.remove(path)
    except OSError:
        pass
