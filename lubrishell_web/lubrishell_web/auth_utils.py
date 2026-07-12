# lubrishell_web/auth_utils.py
import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings

ALGORITMO = 'HS256'
DURACION_TOKEN = timedelta(hours=24)


def generar_token(rut, rol):
    payload = {
        'rut': rut,
        'rol': rol,
        'exp': datetime.now(timezone.utc) + DURACION_TOKEN,
        'iat': datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITMO)


def decodificar_token(token):
    """Devuelve el payload si es válido, o lanza jwt.PyJWTError si no lo es."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITMO])