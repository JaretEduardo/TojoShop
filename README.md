# TojoShop
# 🛒 Sistema de Ventas con Sensores IoT – Angular + Laravel + Arduino

Este repositorio contiene el código completo de un sistema de ventas inteligente que combina tecnologías web modernas con hardware IoT. El sistema permite monitorear eventos físicos en tiempo real mediante sensores, integrando todo en una sola solución web y embebida.

## 📁 Estructura del Repositorio

/frontend → Aplicación web en Angular 17 (SPA)
/backend → API REST en Laravel 10 con base de datos MySQL
/arduino → Código para Arduino (ESP32/UNO) con 6 sensores IoT

## ⚙️ Tecnologías Utilizadas

- **Angular 17** – Interfaz de usuario moderna y responsive.
- **Laravel 10** – Backend robusto, seguro y escalable.
- **MySQL** – Base de datos relacional para ventas, productos y sensores.
- **Arduino (C++)** – Lectura y control de sensores físicos.
- **ESP32 / Arduino UNO** – Microcontroladores utilizados para la comunicación con los sensores.
- **MQTT / WebSockets (opcional)** – Comunicación en tiempo real.

## 🧠 Funcionalidades Principales

- Registro y gestión de ventas.
- Visualización del estado de sensores en tiempo real.
- Notificaciones o alertas según condiciones físicas (ej. movimiento, temperatura alta).
- Control de dispositivos conectados.
- Dashboard con métricas de ventas e IoT.

## 🧪 Sensores Utilizados

Este proyecto emplea 6 sensores físicos que pueden incluir, según configuración:

- Sensor de temperatura y humedad (DHT11/DHT22)
- Sensor de movimiento (PIR)
- Sensor de luz (LDR)
- Sensor ultrasónico (HC-SR04)
- Sensor de gas (MQ-2)
- Sensor magnético de puertas

## 🚀 Objetivo del Proyecto

Demostrar cómo una solución de software puede integrarse eficientemente con hardware IoT para mejorar el proceso de ventas, seguridad, monitoreo de ambiente o presencia de personas, haciendo más inteligente y automatizado el entorno.

## 🛠️ Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

### 2. Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configura tu base de datos en .env
php artisan migrate
php artisan serve
```

### 3. Frontend (Angular)
```bash
cd ../frontend
npm install
ng serve
```

### 4. Arduino

- Abre el código en Arduino IDE.
- Conecta los sensores al ESP32/UNO según el esquema de pines.
- Carga el código al microcontrolador.
- Configura la red Wi-Fi y las IPs si aplica.
