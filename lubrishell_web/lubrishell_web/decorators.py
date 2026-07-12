# lubrishell_web/decorators.py
import jwt
from functools import wraps
from django.http import JsonResponse
from .auth_utils import decodificar_token


def login_requerido(vista):
    @wraps(vista)
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Token no proporcionado'}, status=401)

        token = auth_header.split(' ', 1)[1]

        try:
            payload = decodificar_token(token)
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expirado'}, status=401)
        except jwt.PyJWTError:
            return JsonResponse({'error': 'Token inválido'}, status=401)

        # Adjuntamos los datos del usuario al request para que la vista los use
        request.rut = payload['rut']
        request.rol = payload['rol']

        return vista(request, *args, **kwargs)
    return wrapper


def rol_requerido(*roles_permitidos):
    """Uso: @rol_requerido('administrador', 'jefe_bodega')"""
    def decorador(vista):
        @wraps(vista)
        def wrapper(request, *args, **kwargs):
            if request.rol not in roles_permitidos:
                return JsonResponse({'error': 'No tenés permisos para esta acción'}, status=403)
            return vista(request, *args, **kwargs)
        return wrapper
    return decorador