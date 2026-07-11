from django.db import connection
from django.http import JsonResponse

from .utils import dictfetchall

def test_categoria(request):
    with connection.cursor() as cursor:
        # Hacemos la consulta
        cursor.execute('SELECT * FROM lubrishell.Categoria;')
        datos = dictfetchall(cursor)
            
    return JsonResponse(datos, safe=False)

def ver_productos(request):
    with connection.cursor() as cursor:
        cursor.execute(
            'SELECT p.nombre, p.url_imagen, p.SKU, p.marca, p.stock FROM lubrishell.Producto p;'
        )
        datos = dictfetchall(cursor)
    return JsonResponse(datos, safe=False)

def ver_detalle_producto(request, sku):
    with connection.cursor() as cursor:
        cursor.execute(
            'SELECT * '
            'FROM lubrishell.Producto p '
            'WHERE p.sku = %s',
            [sku]
        )
        datos = dictfetchall(cursor)
    
    if not datos:
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)
    
    return JsonResponse(datos[0], safe=False)  