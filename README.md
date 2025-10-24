# 🍦 HeladoExpress - Sistema Automatizado de Ordenamiento

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)


> **Proyecto desarrollado para el curso de Aseguramiento de la Calidad de Software** 🎯

> **📋 Rama de Funcionalidades (Feature) - Funcionalidad: Pruebas Unitarias e Integración Frontend** 🧪✅

## 📋 Descripción del Proyecto

*HeladoExpress* es un sistema automatizado diseñado específicamente para la *Heladería Sarita Franquicia Chuscaj*, con el objetivo de optimizar el proceso de toma de pedidos y mejorar la experiencia del cliente. 

A través de una interfaz visual intuitiva, el sistema permite a los usuarios seleccionar paso a paso el tipo de helado, sabor y complementos disponibles, sin requerir asistencia verbal o interacción con el personal.

La solución incluye una pantalla principal con imágenes representativas de cada opción y una pantalla secundaria que proporciona instrucciones y confirmaciones escritas para guiar al cliente durante el proceso. Una vez finalizado el pedido, la información se envía automáticamente a una estación de trabajo, donde los empleados pueden visualizarlo en tiempo real para su preparación inmediata.

Este sistema busca agilizar el servicio, reducir errores en la comunicación y ofrecer una experiencia moderna y eficiente al cliente.

### 🎯 Objetivos del Proyecto

#### Objetivo General
Diseñar un sistema automatizado de toma de pedidos para la *Heladería Sarita Franquicia Chuscaj* que permita a los clientes realizar sus pedidos de forma autónoma, optimizando el tiempo de atención y reduciendo la necesidad de interacción verbal con el personal.

#### Objetivos Específicos
- *Interfaz Visual Intuitiva*: Implementar una interfaz que permita al cliente seleccionar el tipo de helado, sabor y complementos de forma secuencial
- *Envío Automático*: Desarrollar un mecanismo de envío automático de pedidos hacia una estación de trabajo en tiempo real para facilitar la preparación inmediata
- *Optimización de Servicio*: Optimizar los tiempos de atención al cliente y reducir los errores de comunicación en el proceso de toma de pedidos
- *Gestión de Personal*: Asignar funciones específicas al personal involucrado (técnico, despachador, administrador), asegurando el correcto funcionamiento, supervisión y mantenimiento del sistema



## 🚀 Tecnologías Utilizadas

- **Next.js 15** - Framework React para producción
- **React 19** - Biblioteca UI con Server Components
- **TypeScript 5** - Lenguaje de programación tipado
- **TailwindCSS 3.4** - Framework CSS utility-first
- **React Hot Toast** - Notificaciones elegantes
- **Jest 29** - Framework de testing unitario e integración
- **React Testing Library** - Testing de componentes React
- **JSDOM** - Environment de pruebas DOM
- 
## 🏗️ Arquitectura del Frontend

### Patrones de Diseño
- **App Router**: Enrutamiento basado en carpetas con Server Components
- **Componentes**: Componentes reutilizables de React
- **Custom Hooks**: Lógica reutilizable con estado
- **Services**: Capa de abstracción para APIs
- **Types**: Interfaces TypeScript para type safety
- **Utilities**: Funciones auxiliares y configuración

### Estructura del Frontend

```
frontened/
├── app/                                    # App Router de Next.js
│   ├── layout.tsx                         # Layout principal de la aplicación
│   ├── globals.css                        # Estilos globales con Tailwind
│   ├── (public)/                          # Rutas públicas
│   ├── estado/                            # Estados de pedidos
│   ├── producto/                          # Productos de helados disponibles
│   ├── sabor/                             # Sabores de helado
│   ├── pedido/                            # Gestión de pedidos completos
│   ├── detalle-pedido/                    # Detalles de pedidos
│   ├── pedido-detalle-sabor/              # Sabores en detalles de pedidos
│   ├── image/                             # Gestión de imágenes
│   ├── upload/                            # Configuración de subida de archivos
│   └── utils/                             # Utilidades y validaciones
├── tests/                                  # 🧪 Suite de pruebas
│   ├── unit/                              # Pruebas unitarias
│   │   ├── producto.service.spec.ts       # Tests del servicio de productos
│   │   ├── pedido.service.spec.ts         # Tests del servicio de pedidos
│   │   └── estado.service.spec.ts         # Tests del servicio de estados
│   ├── integration/                       # Pruebas de integración
│   │   ├── producto.controller.integration.spec.ts  # Tests HTTP de productos
│   │   ├── pedido.controller.integration.spec.ts    # Tests HTTP de pedidos
│   │   └── estado.controller.integration.spec.ts    # Tests HTTP de estados
│   └── fixtures/                          # Datos de prueba y utilidades
│       └── test-helpers.ts                # Mocks y helpers para testing
├── dist/                                   # Código compilado (generado)
├── node_modules/                           # Dependencias de npm
├── .vscode/                                # Configuración de VS Code
├── package.json                            # Dependencias y scripts del proyecto
├── nest-cli.json                           # Configuración de NestJS CLI
├── tsconfig.json                           # Configuración de TypeScript
├── eslint.config.mjs                       # Configuración de ESLint
└── .prettierrc                             # Configuración de Prettier


### Módulos del Sistema
1. *Categoria*: Categorías de productos y helados
2. *Estado*: Estados de pedidos (Pendiente, En Proceso, Completado, etc.)
3. *Producto*: Productos de helados disponibles con precios
4. *Sabor*: Sabores disponibles (vainilla, chocolate, fresa, etc.)
5. *Pedido*: Órdenes completas de clientes con estado
6. *Detalle Pedido*: Items individuales de cada pedido
7. *Pedido Detalle Sabor*: Sabores específicos en cada detalle
8. *Image*: Gestión de imágenes de productos
9. *Upload*: Configuración y validación de archivos

## 🔧 Estado de Implementación

- **Componentes**: ✅ Completados para todos los módulos
- **Custom Hooks**: ✅ Implementados con gestión de estado
- **Services**: ✅ Capa de API funcional  
- **Types**: ✅ Interfaces TypeScript definidas
- **Rutas**: ✅ App Router configurado
- **Pruebas Unitarias**: ✅ 31 tests implementados (6 suites)
- **Pruebas de Integración**: ✅ 25 tests implementados (5 suites)

## 🧪 Testing y Calidad de Software

### Pruebas Unitarias (31 tests)
- **Navbar**: 5 tests de renderizado y funcionalidad
- **PedidoCard**: 7 tests de visualización de pedidos  
- **useToast**: 4 tests de notificaciones
- **useConfirm**: 3 tests de diálogos de confirmación
- **usePedido**: 6 tests de gestión de pedidos
- **useEstado**: 6 tests de gestión de estados

###Pruebas de Integración (25 tests)
- **http-client**: 3 tests de cliente HTTP
- **error-handling**: 8 tests de manejo de errores
- **user-interaction**: 5 tests de interacción de usuario
- **pedido-management**: 5 tests de gestión de pedidos
- **form-submission**: 4 tests de envío de formularios

### Resultados del Testing
- **Total Test Suites**: 11 (6 unitarias + 5 integración)
- **Total Tests**: 56 (31 unitarias + 25 integración)
- **Cobertura**: 100% de pasos exitosos
- **Framework**: Jest v29 con React Testing Library

### Cobertura de Testing
- **Tasa de Éxito**: 100% (56/56 tests)
- **Componentes Principales**: Completamente probados
- **Custom Hooks**: Validados con renderHook
- **Servicios de API**: Verificados con mocks
- **Manejo de Errores**: Probado en todos los escenarios

## 🚀 Instalación

```bash
cd frontened
npm install
npm run dev
```

## 🧪 Ejecución de Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar solo pruebas unitarias
npm test -- test/unit

# Ejecutar solo pruebas de integración
npm test -- test/integration

# Ejecutar pruebas en modo watch
npm test -- --watch
```

## 🎯 Próximos Pasos

1. *Expandir Cobertura de Testing* a módulos adicionales
2. *Implementar E2E Testing* para flujos completos
3. *Configurar CI/CD Pipeline* con testing automático
4. *Documentar APIs* con Swagger/OpenAPI
5. *Implementar autenticación* y autorización
6. *Optimizar Performance* basado en métricas de testing
7. *Crear Mocks avanzados* para testing de servicios externos

---

<div align="center">
  <p>🧪 <strong>Rama de Funcionalidades</strong> - Testing y Calidad de Software 🧪</p>
  <p><em>Implementación de pruebas unitarias e integración para el backend de HeladoExpress</em></p>
</div>