'use client';

import { useState, useEffect } from 'react';
import { http } from '@/lib/http';
import { config } from '@/utils/config';
import { GiIceCreamCone } from 'react-icons/gi';
import { FiAlertTriangle, FiImage } from 'react-icons/fi';
import { FaStore } from 'react-icons/fa';

interface ImageInfo {
  id: number;
  uuid: string;
  filename: string;
  url: string;
  size: number;
  esta_activo: boolean;
  created_at: string;
}

interface Categoria {
  id: number;
  nombre: string;
  esta_activo: boolean;
  image?: ImageInfo;
}

interface CategoriaCardProps {
  categoria: Categoria;
  onSelect: (categoria: Categoria) => void;
  isSelected: boolean;
}

function CategoriaCard({ categoria, onSelect, isSelected }: CategoriaCardProps) {
  return (
    <div 
      className={`relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        isSelected ? 'ring-4 ring-purple-500 scale-105' : ''
      }`}
      onClick={() => onSelect(categoria)}
    >
      {/* Imagen */}
      <div className="aspect-[3/2] bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
        {categoria.image ? (
          <img 
            src={`${config.apiUrl}${categoria.image.url}`} 
            alt={categoria.nombre}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <GiIceCreamCone size={48} className="mx-auto mb-2" />
              <p className="text-sm">Sin imagen</p>
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {categoria.nombre}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            ID: {categoria.id}
          </span>
          
          {isSelected && (
            <div className="bg-purple-500 text-white text-sm px-3 py-1 rounded-full">
              Seleccionado
            </div>
          )}
        </div>
      </div>

      {/* Overlay de selección */}
      {isSelected && (
        <div className="absolute inset-0 bg-purple-500 bg-opacity-20 flex items-center justify-center">
          <div className="bg-white rounded-full p-3 shadow-lg">
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HeladosPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await http<Categoria[]>('/categoria');
        setCategorias(data.filter((cat: Categoria) => cat.esta_activo));
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleCategoriaSelect = (categoria: Categoria) => {
    setSelectedCategoria(selectedCategoria?.id === categoria.id ? null : categoria);
  };

  const handleContinuar = () => {
    if (selectedCategoria) {
      // Aquí implementarías la navegación al siguiente paso
      alert(`Categoría seleccionada: ${selectedCategoria.nombre}\n\nAquí continuarías con la selección de sabores y productos.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Cargando categorías de helados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">
            <FiAlertTriangle size={60} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      
      {/* Header */}
      <div className="pt-20 pb-8"> {/* pt-20 para el navbar fijo */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
              <GiIceCreamCone size={40} className="text-pink-500" />
              Selecciona tu Categoría de Helado
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Elige entre nuestras deliciosas opciones
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Categorías */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {categorias.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              <FaStore size={60} className="mx-auto text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No hay categorías disponibles
            </h3>
            <p className="text-gray-500">
              Contacta al administrador para agregar categorías de helados.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {categorias.map(categoria => (
              <CategoriaCard
                key={categoria.id}
                categoria={categoria}
                onSelect={handleCategoriaSelect}
                isSelected={selectedCategoria?.id === categoria.id}
              />
            ))}
          </div>
        )}

        {/* Botón Continuar */}
        {selectedCategoria && (
          <div className="flex justify-center">
            <button
              onClick={handleContinuar}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Continuar con {selectedCategoria.nombre} →
            </button>
          </div>
        )}

        {/* Vista Previa de Imagen */}
        {selectedCategoria && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiImage size={20} />
              Vista Previa de Imagen
            </h3>
            <div className="text-center">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden max-w-sm mx-auto">
                {selectedCategoria.image ? (
                  <img
                    src={`${config.apiUrl}${selectedCategoria.image.url}`}
                    alt={selectedCategoria.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <GiIceCreamCone size={48} className="mx-auto mb-2" />
                      <p className="text-sm">Sin imagen disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}