import { useState, useEffect } from 'react';
import { CategoriaModel } from '../models'; // Importamos tu modelo

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/productos/categorias')
      .then(res => res.json())
      .then(data => {
        // Pasamos cada objeto crudo del JSON por nuestro "molde"
        const datosSeguros = data.map(item => new CategoriaModel(item));
        setCategorias(datosSeguros);
      });
  }, []);

  return (
    <ul>
      {categorias.map(c => (
        // Ahora usamos las propiedades limpias de nuestro modelo
        <li key={c.id}>{c.nombre}</li>
      ))}
    </ul>
  );
}