# Función auxiliar para no repetir código
def dictfetchall(cursor):
    """Retorna todas las filas de un cursor como una lista de diccionarios."""
    columnas = [col[0] for col in cursor.description]
    return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]