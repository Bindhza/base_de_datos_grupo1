import json
from django.db import connection,transaction, IntegrityError
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from django.views.decorators.csrf import csrf_exempt
from .utils import dictfetchall
from .auth_utils import generar_token
from .decorators import login_requerido, rol_requerido
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    rut = request.POST.get('rut')
    password = request.POST.get('contrasena')

    with connection.cursor() as cursor:
        cursor.execute(
            'SELECT u.contrasena FROM lubrishell.Usuario u WHERE RUT = %s',
            [rut]
        )
        fila = cursor.fetchone()

    if fila is None or not check_password(password, fila[0]):
        return JsonResponse({'error': 'RUT o contraseña incorrectos'}, status=401)

    # Determinar el rol: primero busca en Personal, si no está, es Cliente
    with connection.cursor() as cursor:
        cursor.execute('SELECT rol FROM lubrishell.Personal WHERE RUT = %s', [rut])
        fila_personal = cursor.fetchone()

    rol = fila_personal[0] if fila_personal else 'cliente'

    token = generar_token(rut, rol)
    return JsonResponse({'token': token, 'rol': rol})

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

@csrf_exempt
def registrar_cliente(request):
     rut = request.POST.get('rut')
     numero_telefonico = request.POST.get('numero_telefonico')
     correo_electronico = request.POST.get('correo_electronico')
     fecha_nacimiento = request.POST.get('fecha_nacimiento')
     contrasena = make_password(request.POST.get('contrasena')) #la hasheamos
    #validamos el correo
     try:
        validate_email(correo_electronico)
     except ValidationError:
        return JsonResponse({'error': 'Correo electrónico inválido'}, status=400)

     try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    'INSERT INTO lubrishell.Usuario '
                    '(rut, numero_telefonico, correo_electronico, fecha_registro, contrasena, fecha_nacimiento) '
                    'VALUES (%s, %s, %s, NOW(), %s, %s)',
                    [rut, numero_telefonico, correo_electronico, contrasena, fecha_nacimiento]
                )
                cursor.execute(
                    'INSERT INTO lubrishell.Cliente (rut) VALUES (%s)',
                    [rut]
                )

        return JsonResponse({'mensaje': 'Cliente creado correctamente'}, status=201)

     except IntegrityError:
        return JsonResponse({'error': 'El RUT o correo ya están registrados'}, status=409)
     
@csrf_exempt    
@login_requerido
@rol_requerido('administrador')     
def registrar_personal(request):
    rut = request.POST.get('rut')
    telefono = request.POST.get('numero_telefonico')
    correo = request.POST.get('correo_electronico')
    password = request.POST.get('contrasena')
    fecha_nacimiento = request.POST.get('fecha_nacimiento')
    rol = request.POST.get('rol')

    if rol not in ('vendedor', 'jefe_bodega', 'administrador'):
        return JsonResponse({'error': 'Rol inválido'}, status=400)

    contrasena_hasheada = make_password(password)

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    'INSERT INTO lubrishell.Usuario '
                    '(rut, numero_telefonico, correo_electronico, fecha_registro, contrasena, fecha_nacimiento) '
                    'VALUES (%s, %s, %s, NOW(), %s, %s)',
                    [rut, telefono, correo, contrasena_hasheada, fecha_nacimiento]
                )
                cursor.execute(
                    'INSERT INTO lubrishell.Personal (rut, rol) VALUES (%s, %s)',
                    [rut, rol]
                )

        return JsonResponse({'mensaje': 'Personal creado correctamente'}, status=201)

    except IntegrityError:
        return JsonResponse({'error': 'El RUT o correo ya están registrados'}, status=409)     

@csrf_exempt
@login_requerido
@rol_requerido('jefe_bodega')
def actualizar_precio(request, sku):
    if request.method not in ('POST', 'PUT'):
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    # Intentar obtener el precio de form-data o JSON body
    nuevo_precio = request.POST.get('precio_venta')
    if nuevo_precio is None:
        try:
            body = json.loads(request.body)
            nuevo_precio = body.get('precio_venta')
        except json.JSONDecodeError:
            pass

    if nuevo_precio is None:
        return JsonResponse({'error': 'El campo precio_venta es requerido'}, status=400)

    try:
        nuevo_precio = int(nuevo_precio)
        if nuevo_precio <= 0:
            return JsonResponse({'error': 'El precio debe ser un número positivo mayor a 0'}, status=400)
    except ValueError:
        return JsonResponse({'error': 'El precio debe ser un número válido'}, status=400)

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # Validar existencia del producto
                cursor.execute('SELECT 1 FROM lubrishell.Producto WHERE SKU = %s', [sku])
                if not cursor.fetchone():
                    return JsonResponse({'error': 'Producto no encontrado'}, status=404)

                # Realizar actualización
                cursor.execute(
                    'UPDATE lubrishell.PrecioVenta '
                    'SET precio_venta = %s, fecha_vigencia = NOW(), RUT_creador = %s '
                    'WHERE SKU_producto = %s',
                    [nuevo_precio, request.rut, sku]
                )
                
                if cursor.rowcount == 0:
                    return JsonResponse({'error': 'No existe un registro de precio base previo para actualizar'}, status=404)

        return JsonResponse({'mensaje': 'Precio actualizado exitosamente'}, status=200)

    except IntegrityError as e:
        return JsonResponse({'error': 'Error de integridad en la base de datos'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error en el servidor: {str(e)}'}, status=500)

@csrf_exempt    
@login_requerido
@rol_requerido('jefe_bodega')  
def registrar_producto(request):
    sku = request.POST.get('sku')
    nombre = request.POST.get('nombre')
    descripcion = request.POST.get('descripcion')
    url_imagen = request.POST.get('url_imagen')
    marca = request.POST.get('marca')
    stock = request.POST.get('sku')
    id_categoria = request.POST.get('id_categoria')
