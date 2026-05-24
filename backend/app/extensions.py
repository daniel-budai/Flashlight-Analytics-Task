from flask_caching import Cache
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
cache = Cache()

try:
    from flask_migrate import Migrate

    migrate = Migrate()
except ImportError:
    migrate = None
