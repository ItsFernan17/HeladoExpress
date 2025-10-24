# 🍦 HeladoExpress - Sistema Automatizado de Ordenamiento

[![NestJS](https://img.shields.io/badge/NestJS-10.0.0-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)


> **Proyecto desarrollado para el curso de Aseguramiento de la Calidad de Software** 🎯

> **📋 Rama de Funcionalidades (Feature) - Funcionalidad: Pruebas Unitarias e Integración Backend** 🧪✅

## 📋 Descripción del Proyecto

**HeladoExpress** es un sistema automatizado diseñado específicamente para la **Heladería Sarita Franquicia Chuscaj**, con el objetivo de optimizar el proceso de toma de pedidos y mejorar la experiencia del cliente. 

A través de una interfaz visual intuitiva, el sistema permite a los usuarios seleccionar paso a paso el tipo de helado, sabor y complementos disponibles, sin requerir asistencia verbal o interacción con el personal.

La solución incluye una pantalla principal con imágenes representativas de cada opción y una pantalla secundaria que proporciona instrucciones y confirmaciones escritas para guiar al cliente durante el proceso. Una vez finalizado el pedido, la información se envía automáticamente a una estación de trabajo, donde los empleados pueden visualizarlo en tiempo real para su preparación inmediata.

Este sistema busca agilizar el servicio, reducir errores en la comunicación y ofrecer una experiencia moderna y eficiente al cliente.

### 🎯 Objetivos del Proyecto

#### Objetivo General
Diseñar un sistema automatizado de toma de pedidos para la **Heladería Sarita Franquicia Chuscaj** que permita a los clientes realizar sus pedidos de forma autónoma, optimizando el tiempo de atención y reduciendo la necesidad de interacción verbal con el personal.

#### Objetivos Específicos
- **Interfaz Visual Intuitiva**: Implementar una interfaz que permita al cliente seleccionar el tipo de helado, sabor y complementos de forma secuencial
- **Envío Automático**: Desarrollar un mecanismo de envío automático de pedidos hacia una estación de trabajo en tiempo real para facilitar la preparación inmediata
- **Optimización de Servicio**: Optimizar los tiempos de atención al cliente y reducir los errores de comunicación en el proceso de toma de pedidos
- **Gestión de Personal**: Asignar funciones específicas al personal involucrado (técnico, despachador, administrador), asegurando el correcto funcionamiento, supervisión y mantenimiento del sistema



## 🚀 Tecnologías Utilizadas

- **NestJS 10** - Framework de Node.js para aplicaciones escalables
- **TypeScript 5** - Lenguaje de programación tipado
- **TypeORM** - ORM para gestión de base de datos
- **MySQL 8** - Base de datos relacional
- **Class Validator** - Validación de DTOs
- **Class Transformer** - Transformación de datos
- **Jest** - Framework de testing unitario e integración
- **Supertest** - Testing de APIs HTTP
- 
## 🏗️ Arquitectura del Backend

### Patrones de Diseño
- **Módulos**: Organización por funcionalidad
- **Controladores**: Manejo de requests HTTP
- **Servicios**: Lógica de negocio
- **Entidades**: Modelos de base de datos con TypeORM
- **DTOs**: Validación y transformación de datos
- **Interfaces**: Contratos TypeScript
- **Decoradores**: Metadatos y validación

### Estructura del Backend
```
backend/
├── src/                                    # Código fuente principal
│   ├── main.ts                            # Punto de entrada de la aplicación
│   ├── app.module.ts                      # Módulo principal de la aplicación
│   ├── categoria/                         # Categorías de productos
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
```

### Módulos del Sistema
1. **Categoria**: Categorías de productos y helados
2. **Estado**: Estados de pedidos (Pendiente, En Proceso, Completado, etc.)
3. **Producto**: Productos de helados disponibles con precios
4. **Sabor**: Sabores disponibles (vainilla, chocolate, fresa, etc.)
5. **Pedido**: Órdenes completas de clientes con estado
6. **Detalle Pedido**: Items individuales de cada pedido
7. **Pedido Detalle Sabor**: Sabores específicos en cada detalle
8. **Image**: Gestión de imágenes de productos
9. **Upload**: Configuración y validación de archivos

## 🔧 Estado de Implementación

- **Entidades**: ✅ Completadas para todos los módulos
- **DTOs**: ✅ Implementados con validaciones
- **Controllers**: ✅ Desarrollados con endpoints REST  
- **Services**: ✅ Lógica de negocio implementada
- **APIs**: ✅ Endpoints funcionales
- **Pruebas Unitarias**: ✅ 44 tests implementados (5 suites)
- **Pruebas de Integración**: ✅ 43 tests implementados (5 suites)

## 🧪 Testing y Calidad de Software

### Pruebas Unitarias (44 tests)
- **ProductoService**: 7 tests de lógica de negocio
- **PedidoService**: 7 tests de gestión de pedidos  
- **EstadoService**: 6 tests de estados de pedidos
- **CategoriaService**: 11 tests de gestión de categorías
- **SaborService**: 11 tests de gestión de sabores

### Pruebas de Integración (43 tests)
- **ProductoController**: 9 tests de endpoints HTTP
- **PedidoController**: 8 tests de gestión de pedidos completos
- **EstadoController**: 8 tests de endpoints de estados
- **CategoriaController**: 8 tests de endpoints HTTP
- **SaborController**: 10 tests de endpoints HTTP

### Resultados del Testing
- **Total Test Suites**: 10 (5 unitarias + 5 integración)
- **Total Tests**: 87 (44 unitarias + 43 integración)
- **Cobertura**: 100% de pasos exitosos
- **Framework**: Jest v30.0.0 con Supertest para testing HTTP

### Pruebas de Integración (23 tests)
- **ProductoController**: 6 tests de endpoints HTTP
- **PedidoController**: 8 tests de API REST
- **EstadoController**: 9 tests de gestión de estados

### Cobertura de Testing
- **Tasa de Éxito**: 100% (43/43 tests)
- **Servicios Vitales**: Completamente probados
- **Endpoints Principales**: Validados con HTTP testing
- **Validación de DTOs**: Verificada en integración
- **Manejo de Errores**: Probado en todos los escenarios

## 🚀 Instalación

```bash
cd backend
npm install
npm run start:dev
```

## 🧪 Ejecución de Pruebas

```bash
# Ejecutar todas las pruebas
npm run test:all

# Ejecutar solo pruebas unitarias
npm run test:unit

# Ejecutar solo pruebas de integración
npm run test:integration

# Ejecutar pruebas en modo watch
npm run test:watch
```

## 🎯 Próximos Pasos

1. **Expandir Cobertura de Testing** a módulos adicionales
2. **Implementar E2E Testing** para flujos completos
3. **Configurar CI/CD Pipeline** con testing automático
4. **Documentar APIs** con Swagger/OpenAPI
5. **Implementar autenticación** y autorización
6. **Optimizar Performance** basado en métricas de testing
7. **Crear Mocks avanzados** para testing de servicios externos

---

<div align="center">
  <p>🧪 <strong>Rama de Funcionalidades</strong> - Testing y Calidad de Software 🧪</p>
  <p><em>Implementación de pruebas unitarias e integración para el backend de HeladoExpress</em></p>
</div>
