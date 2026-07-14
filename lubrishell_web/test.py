import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lubrishell_web.settings')
django.setup()
from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute("ALTER TABLE lubrishell.Documento_Tributario DROP CONSTRAINT documento_tributario_id_orden_compra_fkey;")
        cursor.execute("ALTER TABLE lubrishell.Documento_Tributario ADD CONSTRAINT documento_tributario_id_orden_compra_fkey FOREIGN KEY (id_orden_compra) REFERENCES lubrishell.Orden_Compra(id_orden_compra) DEFERRABLE INITIALLY DEFERRED;")
        
        cursor.execute("ALTER TABLE lubrishell.Orden_Compra DROP CONSTRAINT orden_compra_folio_doc_trib_fkey;")
        cursor.execute("ALTER TABLE lubrishell.Orden_Compra ADD CONSTRAINT orden_compra_folio_doc_trib_fkey FOREIGN KEY (folio_doc_trib) REFERENCES lubrishell.Documento_Tributario(folio) DEFERRABLE INITIALLY DEFERRED;")
    print("Constraints updated successfully.")
except Exception as e:
    print("Exception:", e)
