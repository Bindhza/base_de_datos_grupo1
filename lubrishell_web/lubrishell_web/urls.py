"""
URL configuration for lubrishell_web project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from lubrishell_web import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', views.login, name='login'),
    path('api/productos/categorias', views.obtener_categorias, name='categorias'),
    path('api/productos/marcas', views.obtener_marcas, name='marcas'),
    path('api/productos/marcas/registrar', views.registrar_marca, name='marcas'),
    path('api/productos/inmovilizado/', views.obtener_productos_inmovilizados, name='productos_inmovilizados'),
    path('api/productos/mas-comprados/', views.productos_mas_comprados, name='mas_comprados'),
    path('api/productos/', views.ver_productos, name = 'productos'),
    path('api/productos/registrar', views.registrar_producto, name = 'registrar_productos'),
    path('api/productos/<int:sku>/', views.ver_detalle_producto, name='ver_detalle_producto'),
    path('api/productos/<int:sku>/actualizar_precio/', views.actualizar_precio, name='actualizar_precio'),
    path('api/productos/<int:sku>/compra/', views.registrar_compra, name='registrar_compra'),
    path('api/clientes/registrar', views.registrar_cliente, name = 'registrar_cliente'),
    path('api/personal/registrar', views.registrar_personal, name = 'registrar_personal'),
    path('api/entregas/preparacion/', views.entregas_en_preparacion, name='entregas_en_preparacion'),
    path('api/entregas/retiro/', views.entregas_disponibles_retiro, name='entregas_disponibles_retiro'),
    path('api/entregas/resumen/', views.resumen_entregas, name='resumen_entregas'),
    path('api/entregas/desempeno/', views.desempeno_vendedores, name='desempeno_vendedores'),
    path('api/entregas/<int:id_entrega>/preparar/', views.preparar_entrega, name='preparar_entrega'),
    path('api/entregas/<int:id_entrega>/entregar/', views.entregar_en_sucursal, name='entregar_en_sucursal'),
    path('api/entregas/<int:id_entrega>/despachar/', views.despachar, name='despachar'),
    path('api/productos/lanzar_descuento/', views.lanzar_oferta, name='lanzar_oferta'),
    path('api/productos/obtener_producto/<int:sku>/', views.obtener_producto, name='obtener_producto'),
]
