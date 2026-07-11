
export class CategoriaModel {
  constructor(data) {
    // Si la API no envía el dato, asignamos un valor por defecto seguro
    this.id = data.id_categoria || 0; 
    this.nombre = data.nombre || 'Sin nombre';
  }
}