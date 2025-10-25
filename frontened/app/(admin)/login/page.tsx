'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLogin from '@/components/AdminLogin';

export default function AdminLoginPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si ya está autenticado
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (isLoggedIn === 'true') {
      router.replace('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Login exitoso, guardando en sessionStorage y redirigiendo...');
      sessionStorage.setItem('admin_logged_in', 'true');
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return <AdminLogin onLogin={() => {
    console.log('Login exitoso, estableciendo isAuthenticated a true');
    setIsAuthenticated(true);
  }} />;
}