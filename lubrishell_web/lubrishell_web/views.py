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
from datetime import datetime, date

@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    rut = request.POST.get('rut')
    password = request.POST.get('contrasena')

    with connection.cursor() as cursor:
        cursor.execute(
            'SELECT u.contrasena, u.nombre, u.apellido FROM lubrishell.Usuario u WHERE RUT = %s',
            [rut]
        )
        fila = cursor.fetchone()

    if fila is None or not check_password(password, fila[0]):
        return JsonResponse({'error': 'RUT o contraseña incorrectos'}, status=401)

    nombre = fila[1]
    apellido = fila[2]
    with connection.cursor() as cursor:
        cursor.execute('SELECT rol FROM lubrishell.Personal WHERE RUT = %s', [rut])
        fila_personal = cursor.fetchone()

    rol = fila_personal[0] if fila_personal else 'cliente'

    token = generar_token(rut, rol)
    return JsonResponse({'token': token, 'rol': rol, 'nombre': nombre, 'apellido':apellido})

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
     """ Solo administrador o jefe bodega puede registrar una marca nueva insertandolo a la tabla.
     Nivel de aislacion de la transacción: RC"""
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
    """Pedimos todos los productos, para obtener la marca y la categoria hacemos join con las tablas respectivas"""
    with connection.cursor() as cursor:
        cursor.execute(
          'SELECT p.sku, p.nombre, p.url_imagen, m.nombre_marca AS marca, p.stock '
            'FROM lubrishell.Producto p '
            'JOIN lubrishell.Marca m ON p.id_marca = m.id_marca;'
        )
        datos = dictfetchall(cursor)
    return JsonResponse(datos, safe=False)

def ver_detalle_producto(request, sku):
    """Solicitamos toda la informacion de un producto haciendo los joins con marca, categoria y precioventa, donde en 
    esta ultima pedimos el ultimo precio de venta registrado."""
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
     """En primer lugar validamos el correo electronico,
     luego hacemos dos operaciones en la misma transacción:
     Insertamos en la tabla usuario y luego en la de cliente"""
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
    """Solo un administrador puede registrar personal.
    Validamos el correo electronico y el rol.
    En la misma transacción se registra en la tabla usuario y luego en la de personal"""
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
    try:
        validate_email(correo)
    except ValidationError:
        return JsonResponse({'error': 'Correo electrónico inválido'}, status=400)
    
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
@rol_requerido('jefe_bodega', 'administrador')
def lanzar_oferta(request):
    if request.method not in ('POST', 'PUT'):
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    sku = request.POST.get('sku')
    descuento = request.POST.get('descuento')

    fecha_inicio = request.POST.get('fecha_inicio')
    fecha_fin = request.POST.get('fecha_fin')

    if not sku:
        return JsonResponse({'error': 'El SKU del producto es requerido'}, status=400)
    if not descuento:
        return JsonResponse({'error': 'El porcentaje de descuento es requerido'}, status=400)

    try:
        descuento = int(descuento)
        if descuento <= 0 or descuento > 100:
            return JsonResponse({'error': 'El descuento debe ser un porcentaje entre 1 y 100'}, status=400)
    except ValueError:
        return JsonResponse({'error': 'El descuento debe ser un número entero válido'}, status=400)

    if not fecha_inicio:
        fecha_inicio = None  
    if not fecha_fin:
        fecha_fin = None

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1 FROM lubrishell.Producto WHERE SKU = %s', [sku])
                if not cursor.fetchone():
                    return JsonResponse({'error': f'El producto con SKU {sku} no existe'}, status=404)

                cursor.execute(
                    'INSERT INTO lubrishell.Oferta ' 
                    '(fecha_creacion, fecha_inicio, descuento, fecha_fin, sku_producto, rut_creador) '
                    'VALUES (LEAST(NOW(), COALESCE(%s, NOW())), COALESCE(%s, NOW()), %s, %s, %s, %s)',
                    [fecha_inicio, fecha_inicio, descuento, fecha_fin, sku, request.rut]
                )

        return JsonResponse({'mensaje': 'Oferta agregada exitosamente'}, status=201)

    except IntegrityError as e:
        return JsonResponse({'error': f'Error de integridad en la base de datos: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error interno del servidor: {str(e)}'}, status=500)

@csrf_exempt
@login_requerido
def obtener_producto(request, sku):
    if request.method not in ('GET',):
        return JsonResponse({'error': 'Método no permitido'}, status=405)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                '''
                SELECT p.nombre, p.descripcion, pv.precio_venta 
                FROM lubrishell.Producto p 
                LEFT JOIN lubrishell.PrecioVenta pv ON p.sku = pv.sku_producto 
                WHERE p.sku = %s 
                ORDER BY pv.fecha_vigencia DESC 
                LIMIT 1
                ''',
                [sku]
            )

            datos = dictfetchall(cursor)

            if not datos:
                return JsonResponse({'error': 'Producto no encontrado'}, status=404)

            return JsonResponse(datos[0], status=200)

    except Exception as e:
        return JsonResponse({'error': f'Error interno del servidor: {str(e)}'}, status=500)



@csrf_exempt    
@login_requerido
@rol_requerido('jefe_bodega','administrador')  
def registrar_producto(request):
    """Solo un administrador o jefe de bodega puede ingresar un nuevo producto.
    Debe indicar los datos del producto, la compra y la venta de este.
    En la misma transaccion:
    - Se inserta en la tabla de producto el producto nuevo 
    - Se registra la primera compra del producto en compra
    - Se registra un precio vigente en precio venta"""
    sku = request.POST.get('sku')
    nombre = request.POST.get('nombre')
    descripcion = request.POST.get('descripcion')
    url_imagen = request.POST.get('url_imagen')
    id_marca = request.POST.get('id_marca')
    cantidad_compra = request.POST.get('cantidad_compra')  
    stock = cantidad_compra
    id_categoria = request.POST.get('id_categoria')
    fecha_compra = request.POST.get('fecha_compra')
    precio_compra = request.POST.get('precio_compra')
    precio_venta = request.POST.get('precio_venta')
    rut_creador= request.rut

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    'INSERT INTO lubrishell.producto'
                    '(sku, nombre, descripcion, url_imagen, id_marca, stock, id_categoria) '
                    'VALUES (%s, %s, %s, %s, %s, %s, %s)',
                    [sku, nombre, descripcion, url_imagen, id_marca, stock, id_categoria]
                )
                cursor.execute(
                    'INSERT INTO lubrishell.compra'
                    '(fecha_compra, precio_compra, cantidad_compra, rut_creador_compra, sku_producto_comprado) '
                    'VALUES ( %s, %s, %s, %s, %s)',
                    [fecha_compra, precio_compra, cantidad_compra, rut_creador, sku]
                )
                cursor.execute(
                    'INSERT INTO lubrishell.precioventa'
                    '(fecha_vigencia, precio_venta, rut_creador, sku_producto) '
                    'VALUES ( NOW() , %s, %s, %s)',
                    [precio_venta, rut_creador, sku]
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

@csrf_exempt
@login_requerido
@rol_requerido('jefe_bodega','administrador')
def registrar_compra(request, sku):
    if request.method not in ('POST', 'PUT'):
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Cuerpo de petición inválido'}, status=400)

    precio_compra = body.get('precio_compra')
    cantidad = body.get('cantidad')
    fecha_compra_str = body.get('fecha_compra')

    if precio_compra is None or cantidad is None or not fecha_compra_str:
        return JsonResponse({'error': 'Faltan datos requeridos'}, status=400)

    try:
        precio_compra = int(precio_compra)
        cantidad = int(cantidad)
        if precio_compra <= 0 or cantidad <= 0:
            return JsonResponse({'error': 'Precio y cantidad deben ser mayores a 0'}, status=400)
    except ValueError:
        return JsonResponse({'error': 'Precio y cantidad deben ser números válidos'}, status=400)

    try:
        # Validar fecha_compra <= hoy
        fecha_compra = datetime.strptime(fecha_compra_str, '%Y-%m-%d').date()
        if fecha_compra > date.today():
            return JsonResponse({'error': 'La fecha de compra no puede ser en el futuro'}, status=400)
    except ValueError:
        return JsonResponse({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=400)

    try:
        with transaction.atomic():
            with connection.cursor() as cursor:
                # Validar existencia del producto
                cursor.execute('SELECT 1 FROM lubrishell.Producto WHERE SKU = %s', [sku])
                if not cursor.fetchone():
                    return JsonResponse({'error': 'Producto no encontrado'}, status=404)

                # Insertar en Compra (id_compra is GENERATED ALWAYS)
                cursor.execute(
                    '''
                    INSERT INTO lubrishell.Compra (fecha_compra, precio_compra, cantidad_compra, RUT_creador_compra, SKU_producto_comprado)
                    VALUES (
                        %s, %s, %s, %s, %s
                    )
                    ''',
                    [fecha_compra_str, precio_compra, cantidad, request.rut, sku]
                )

                # Actualizar stock
                cursor.execute(
                    '''
                    UPDATE lubrishell.Producto 
                    SET stock = stock + %s 
                    WHERE SKU = %s
                    ''',
                    [cantidad, sku]
                )

        return JsonResponse({'mensaje': 'Compra registrada y stock actualizado exitosamente'}, status=200)

    except IntegrityError as e:
        return JsonResponse({'error': f'Error de integridad en la base de datos: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error en el servidor: {str(e)}'}, status=500)
