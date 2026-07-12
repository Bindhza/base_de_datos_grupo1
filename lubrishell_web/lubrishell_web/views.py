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

def obtener_categorias(request):
    with connection.cursor() as cursor:
        # Hacemos la consulta
        cursor.execute('SELECT * FROM lubrishell.Categoria;')
        datos = dictfetchall(cursor)
            
    return JsonResponse(datos, safe=False)

def obtener_marcas(request):
    with connection.cursor() as cursor:
        # Hacemos la consulta
        cursor.execute('SELECT * FROM lubrishell.marca;')
        datos = dictfetchall(cursor)
            
    return JsonResponse(datos, safe=False)

@csrf_exempt    
@login_requerido
@rol_requerido('administrador','jefe_bodega')   
def registrar_marca(request):
     nombre_marca = request.POST.get('nombre_marca').lower()

     try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    'INSERT INTO lubrishell.marca '
                    '(nombre_marca)'
                    'VALUES (%s)',
                    [nombre_marca]
                )

        return JsonResponse({'mensaje': 'Marca registrada correctamente'}, status=201)

     except IntegrityError:
        return JsonResponse({'error': 'La marca ya existía'}, status=409)
         
def ver_productos(request):
    with connection.cursor() as cursor:
        cursor.execute(
          'SELECT p.sku, p.nombre, p.url_imagen, m.nombre_marca AS marca, p.stock '
            'FROM lubrishell.Producto p '
            'JOIN lubrishell.Marca m ON p.id_marca = m.id_marca;'
        )
        datos = dictfetchall(cursor)
    return JsonResponse(datos, safe=False)

def ver_detalle_producto(request, sku):
    with connection.cursor() as cursor:
        cursor.execute(
            """
        SELECT 
        p.sku, 
        p.nombre,
        p.descripcion, 
        p.url_imagen, 
        m.nombre_marca AS marca, 
        c.nombre AS categoria, 
        p.stock,
        pv.precio_venta AS precio
        FROM lubrishell.Producto p
        LEFT JOIN lubrishell.Marca m 
            ON p.id_marca = m.id_marca
        LEFT JOIN lubrishell.Categoria c 
            ON p.id_categoria = c.id_categoria
        LEFT JOIN lubrishell.PrecioVenta pv
            ON p.sku = pv.SKU_producto
        WHERE p.sku = %s
        ORDER BY pv.fecha_vigencia DESC NULLS LAST
        LIMIT 1;
            """,
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
     nombre = request.POST.get('nombre')
     apellido = request.POST.get('apellido')
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
                    '(rut, numero_telefonico, correo_electronico, fecha_registro, contrasena, fecha_nacimiento, nombre, apellido) '
                    'VALUES (%s, %s, %s, NOW(), %s, %s, %s , %s)',
                    [rut, numero_telefonico, correo_electronico, contrasena, fecha_nacimiento, nombre, apellido]
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
    nombre = request.POST.get('nombre')
    apellido = request.POST.get('apellido')
    if rol not in ('vendedor', 'jefe_bodega', 'administrador'):
        return JsonResponse({'error': 'Rol inválido'}, status=400)

    contrasena_hasheada = make_password(password)

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    'INSERT INTO lubrishell.Usuario '
                    '(rut, numero_telefonico, correo_electronico, fecha_registro, contrasena, fecha_nacimiento, nombre, apellido) '
                    'VALUES (%s, %s, %s, NOW(), %s, %s, %s ,%s)',
                    [rut, telefono, correo, contrasena_hasheada, fecha_nacimiento, nombre, apellido]
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
@rol_requerido('jefe_bodega','administrador')
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

                # Insertar un nuevo registro histórico de precio
                cursor.execute(
                    '''
                    INSERT INTO lubrishell.PrecioVenta (fecha_vigencia, precio_venta, RUT_creador, SKU_producto)
                    VALUES (
                        NOW(),
                        %s,
                        %s,
                        %s
                    )
                    ''',
                    [nuevo_precio, request.rut, sku]
                )

        return JsonResponse({'mensaje': 'Precio actualizado exitosamente'}, status=200)

    except IntegrityError as e:
        return JsonResponse({'error': f'Error de integridad en la base de datos: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error en el servidor: {str(e)}'}, status=500)

@csrf_exempt    
@login_requerido
@rol_requerido('jefe_bodega','administrador')  
def registrar_producto(request):
    sku = request.POST.get('sku')
    nombre = request.POST.get('nombre')
    descripcion = request.POST.get('descripcion')
    url_imagen = request.POST.get('url_imagen')
    marca = request.POST.get('marca')
    stock = request.POST.get('stock')  
    id_categoria = request.POST.get('id_categoria')

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    'INSERT INTO lubrishell.producto'
                    '(sku, nombre, descripcion, url_imagen, marca, stock, id_categoria) '
                    'VALUES (%s, %s, %s, %s, %s, %s, %s)',
                    [sku, nombre, descripcion, url_imagen, marca, stock, id_categoria]
                )

        return JsonResponse({'mensaje': 'Producto creado correctamente'}, status=201)

    except IntegrityError as e:
        cause = e.__cause__  # objeto psycopg2.errors.UniqueViolation

        # pgcode 23505 = unique_violation (aplica tanto a PK como a UNIQUE)
        constraint = getattr(getattr(cause, 'diag', None), 'constraint_name', '') or ''

        if 'sku' in constraint.lower() or constraint.lower() in ('producto_pkey',):
            return JsonResponse({'error': 'Ya existe un producto con ese SKU'}, status=409)
        elif 'nombre' in constraint.lower():
            return JsonResponse({'error': 'Ya existe un producto con ese nombre'}, status=409)
        else:
            return JsonResponse({'error': 'Producto ya registrado'}, status=409) 
