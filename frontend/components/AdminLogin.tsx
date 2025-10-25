'use client';

import { useState } from 'react';
import { GiIceCreamCone } from 'react-icons/gi';
import { FiLock } from 'react-icons/fi';
import Image from 'next/image';
import { Paytone_One } from "next/font/google";

const paytone = Paytone_One({ subsets: ["latin"], weight: "400" });

interface LoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular un pequeño delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === '3110') {
      console.log('Contraseña correcta, ejecutando onLogin callback');
      onLogin();
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 flex min-h-screen">
      
      {/* Panel izquierdo - Fondo rojo Sarita */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#E61429] to-red-600 items-center justify-center p-12 relative overflow-hidden">
        
        {/* Elementos decorativos de fondo con SVGs */}
        <div className="absolute inset-0">
          <Image
            src="/images/decorative-circle-large.svg"
            alt=""
            width={120}
            height={120}
            className="absolute top-10 left-10"
          />
          <Image
            src="/images/decorative-circle-medium.svg"
            alt=""
            width={80}
            height={80}
            className="absolute bottom-20 right-20"
          />
          <Image
            src="/images/decorative-circle-small.svg"
            alt=""
            width={50}
            height={50}
            className="absolute top-1/2 left-1/4"
          />
          <Image
            src="/images/decorative-square-large.svg"
            alt=""
            width={60}
            height={60}
            className="absolute top-1/3 right-10"
          />
          <Image
            src="/images/decorative-square-medium.svg"
            alt=""
            width={40}
            height={40}
            className="absolute bottom-1/3 left-20"
          />
          <Image
            src="/images/decorative-square-small.svg"
            alt=""
            width={30}
            height={30}
            className="absolute bottom-1/4 right-1/3"
          />
          <Image
            src="/images/decorative-diamond.svg"
            alt=""
            width={70}
            height={70}
            className="absolute top-1/4 left-1/2"
          />
        </div>
        
        {/* Contenido principal del panel izquierdo */}
        <div className="relative z-10 text-center text-white">
          <div className="mb-8">
            <Image
              src="/images/logo_sarita.webp"
              alt="Sarita"
              width={200}
              height={80}
              className="mx-auto mb-6 drop-shadow-lg"
              priority
            />
          </div>
          
          <div className={`space-y-4 ${paytone.className}`}>
            <h1 className="text-4xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-xl text-red-100 mb-6">Franquicia Chuscaj</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-8 border border-white/20">
            <div className="flex items-center justify-center mb-4">
              <GiIceCreamCone size={32} className="text-white mr-3" />
              <span className="text-lg font-semibold">Sistema de Gestión</span>
            </div>
            <p className="text-red-100 text-sm leading-relaxed">
              Accede al panel de control para gestionar pedidos, productos, categorías y sabores de la franquicia.
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario de login idéntico al original */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-12 bg-white relative overflow-hidden">
        {/* Elementos decorativos del panel derecho */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/decorative-red-circle-large.svg"
            alt=""
            width={120}
            height={120}
            className="absolute top-10 right-10"
          />
          <Image
            src="/images/decorative-red-circle-medium.svg"
            alt=""
            width={80}
            height={80}
            className="absolute bottom-20 left-20"
          />
          <Image
            src="/images/decorative-red-square-large.svg"
            alt=""
            width={60}
            height={60}
            className="absolute top-1/3 left-10"
          />
          <Image
            src="/images/decorative-red-square-medium.svg"
            alt=""
            width={40}
            height={40}
            className="absolute bottom-1/3 right-20"
          />
        </div>
        
        <div className="w-full max-w-md relative z-10">
          
          {/* Header del formulario - Móvil */}
          <div className="lg:hidden text-center mb-8">
            <Image
              src="/images/logo_sarita.webp"
              alt="Sarita"
              width={150}
              height={60}
              className="mx-auto mb-4"
              priority
            />
            <h1 className={`text-2xl font-bold text-gray-900 ${paytone.className}`}>
              Franquicia Chuscaj
            </h1>
          </div>
          
          <div className="space-y-8">
            
            <div className="text-left">
              <h2 className="text-4xl font-bold text-[#E61429] mb-2">
                Iniciar Sesión
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value="alconerick0@gmail.com"
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200 text-base bg-gray-100 text-gray-500"
                    placeholder="alconerick0@gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E61429] focus:border-[#E61429] transition-all duration-200 text-base bg-gray-50"
                      placeholder="••••••••"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg animate-shake">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="h-4 w-4 text-[#E61429] border-gray-300 rounded focus:ring-[#E61429]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Recordarme
                </label>
              </div>

              <button
                type="submit"
                disabled={!password || isLoading}
                className="w-full bg-[#E61429] hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* CSS para animación shake */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}