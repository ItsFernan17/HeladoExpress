'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLogOut } from 'react-icons/fi';
import { MdAdminPanelSettings } from 'react-icons/md';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticación al cargar la página
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isLoggedIn === 'true') {
      setIsAuthenticated(true);
    } else {
      router.replace('/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (ya se redirigió)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Espaciador para no tapar por el navbar fijo */}
        <div className="h-28" />
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <MdAdminPanelSettings size={28} className="text-red-600" />
                Panel de Administración
              </h1>
              <p className="text-gray-600 text-sm">Helado Express - Sistema de Gestión Integral</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sessionStorage.removeItem('admin_logged_in');
                  router.replace('/login');
                }}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <FiLogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <MdAdminPanelSettings size={48} className="text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Bienvenido al Dashboard!</h2>
            <p className="text-gray-600 text-lg mb-8">
              Sistema de administración funcionando correctamente.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Especialidades</h3>
                <p className="text-blue-600">Gestionar categorías de helados</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <h3 className="text-xl font-semibold text-green-800 mb-2">Tipos de Helado</h3>
                <p className="text-green-600">Administrar productos</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <h3 className="text-xl font-semibold text-purple-800 mb-2">Sabores</h3>
                <p className="text-purple-600">Gestionar sabores disponibles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}