from django.db import connection
from django.http import JsonResponse

def test_categoria(request):
    with connection.cursor() as cursor:
        # 1. Hacemos la consulta SQL apuntando a tu esquema y tabla
        cursor.execute('SELECT * FROM lubrishell.Categoria;')
        
        # 2. Obtenemos todos los registros (filas)
        filas = cursor.fetchall()
        
        # 3. TRUCO PRO: Obtenemos los nombres de las columnas automáticamente
        columnas = [col[0] for col in cursor.description]
        
        # 4. Juntamos las columnas con los valores para armar diccionarios
        datos = []
        for fila in filas:
            datos.append(dict(zip(columnas, fila)))
            
    # 5. Devolvemos la respuesta en formato JSON
    return JsonResponse(datos, safe=False)