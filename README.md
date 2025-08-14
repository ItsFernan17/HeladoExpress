# 🍦 HeladoExpress - Sistema Automatizado de Ordenamiento

[![NestJS](https://img.shields.io/badge/NestJS-10.0.0-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)


> **Proyecto desarrollado para el curso de Aseguramiento de la Calidad de Software** 🎯

> **📋 Rama de Desarrollo (Dev) - Backend en construcción** 🔧

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
│   ├── usuario/                            # Gestión de usuarios y autenticación
│   ├── tipo-helado/                       # Tipos de helado disponibles
│   ├── sabor/                             # Sabores de helado
│   ├── complemento/                       # Toppings y aderezos
│   ├── pedido/                            # Gestión de pedidos
│   ├── pedido-item/                       # Items individuales de pedidos
│   ├── pedido-item-bola/                  # Bolas específicas de helado
│   └── pedido-item-complemento/           # Complementos en pedidos
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
1. **Usuario**: Gestión de perfiles y autenticación
2. **Tipo Helado**: Categorías de helados (cono, vaso, etc.)
3. **Sabor**: Sabores disponibles (vainilla, chocolate, etc.)
4. **Complemento**: Toppings y aderezos
5. **Pedido**: Órdenes completas de clientes
6. **Pedido Item**: Items individuales de cada pedido
7. **Pedido Item Bola**: Bolas específicas de helado
8. **Pedido Item Complemento**: Complementos específicos

## 🔧 Estado de Implementación

- **Entidades**: ✅ Completadas para todos los módulos
- **DTOs**: 🔄 En desarrollo
- **Controllers**: 🔄 En desarrollo  
- **Services**: 🔄 En desarrollo
- **APIs**: 🔄 Endpoints en construcción

## 🚀 Instalación

```bash
cd backend
npm install
npm run start:dev
```

## 🎯 Próximos Pasos

1. **Completar DTOs** para todas las entidades
2. **Implementar Controllers** con endpoints REST
3. **Desarrollar Services** con lógica de negocio
4. **Configurar validaciones** con Class Validator
5. **Implementar autenticación** y autorización
6. **Crear tests unitarios** para cada módulo
7. **Documentar APIs** con Swagger

---

<div align="center">
  <p>🚀 <strong>Rama Dev</strong> - Donde se construye el futuro de HeladoExpress 🚀</p>
  <p><em>Desarrollo activo del backend para el curso de Aseguramiento de la Calidad de Software</em></p>
</div>
