# 🍦 HeladoExpress - Sistema Automatizado de Ordenamiento

[![NestJS](https://img.shields.io/badge/NestJS-10.0.0-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Arduino](https://img.shields.io/badge/Arduino-1.8.19-blue.svg)](https://www.arduino.cc/)

> **Proyecto desarrollado para el curso de Aseguramiento de la Calidad de Software** 🎯

> **📋 Rama Principal (main) - Versión estable del proyecto** 🚀

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

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Hardware      │
│   (Web App)     │◄──►│   (NestJS)      │◄──►│   (Arduino)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Tecnologías Utilizadas

### Backend
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

## 🔧 Configuración del Proyecto

### Base de Datos
- **MySQL 8.0**: Configuración optimizada para desarrollo
- **TypeORM**: Migraciones automáticas y sincronización

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- MySQL 8.0+
- Git

### Backend
```bash
cd backend
npm install
npm run build
npm run start:dev
```

<div align="center">
  <p>🍦 <strong>HeladoExpress</strong> - Donde la tecnología se encuentra con la dulzura 🍦</p>
  <p><em>Desarrollado con ❤️ para el curso de Aseguramiento de la Calidad de Software</em></p>
</div>
