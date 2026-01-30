# 🦕 Aventura Dino: Aventura Preescolar

**Aventura Dino** es una aplicación web educativa diseñada específicamente para niños en etapa preescolar. Combina juegos interactivos, actividades de aprendizaje y herramientas de control parental en una experiencia segura y divertida.

La aplicación está construida como una **Single Page Application (SPA)** contenida principalmente en un único archivo (`index.html`), lo que facilita su distribución y funcionamiento en cualquier dispositivo.

## ✨ Características Principales

### 👶 Zona Niños
Un panel colorido e intuitivo donde los niños pueden elegir entre diversas actividades:

#### 🎲 Juegos de Mesa Clásicos
*   **La Oca Dino**: Versión adaptada con modos 1 Jugador (vs IA), 2 Jugadores y Híbrido (con dado físico).
*   **Parchís**: Simplificado para aprender a contar y turnos.
*   **Ajedrez & Damas**: Introducción a la estrategia.
*   **4 en Raya**: Juego de lógica clásico.

#### 🧠 Actividades Educativas
*   **Secuencias**: Completar patrones de números, figuras y colores.
*   **Robótica**: Introducción a la lógica de programación (comandos secuenciales).
*   **Quiz Educativos**:
    *   *El Cuerpo / Body* (Bilingüe).
    *   *Colores / Colors* (Inglés).
    *   *Las Emociones* (Inteligencia emocional).
    *   *Rutinas Diarias*.
*   **Música**: Piano interactivo para aprender melodías simples.
*   **Arte**: Pizarra digital para dibujar libremente o con plantillas.

#### 🎮 Arcade & Acción
*   **Dino Karts**: Juego de carreras vertical.
*   **Dino Penaltis**: Juego de fútbol.
*   **Dino Surf**: Esquivar obstáculos.
*   **Movimiento**: Arrastrar y soltar elementos (motricidad fina).

### 🔒 Zona Padres
Un área protegida (acceso mediante operación matemática) para gestionar la experiencia:
*   **Progreso**: Visualización de estrellas ganadas y actividades completadas.
*   **Cine Dino**: Configuración de enlaces a videos de YouTube/Drive aprobados.
*   **Seguridad**:
    *   **Palabra Mágica**: Configura una contraseña para restringir el acceso a la zona de niños.
    *   **Bloqueo de Cine**: Restringe el acceso a los videos.
    *   **Reset**: Reinicio del progreso.

## 🛠️ Aspectos Técnicos

*   **Arquitectura**: HTML5 Monolítico (HTML + CSS + JS en un solo archivo principal).
*   **Lenguaje**: Vanilla JavaScript (ES6+). Sin frameworks ni dependencias de construcción.
*   **PWA (Progressive Web App)**: Incluye `manifest.json` para permitir la instalación en dispositivos móviles y funcionamiento a pantalla completa.
*   **Audio Engine**: Sistema de síntesis de voz (TTS) para narrar preguntas y feedback, optimizado para Android/iOS.
*   **Diseño Responsive**: Interfaz adaptable que funciona en móviles (Portrait/Landscape), tablets y escritorio.

## 🚀 Instalación y Uso

1.  **Clonar/Descargar**:
    Obtén los archivos del repositorio (`index.html`, `icon.svg`, `manifest.json`).

2.  **Ejecutar**:
    Simplemente abre el archivo `index.html` en un navegador web moderno (Chrome, Safari, Edge).
    *   *Recomendado*: Servir a través de un servidor local (ej. VS Code Live Server, `python -m http.server`) para evitar restricciones de CORS con módulos de audio/imágenes.

3.  **Instalar (PWA)**:
    *   **Android/Chrome**: Abre el menú y selecciona "Añadir a pantalla de inicio" o "Instalar aplicación".
    *   **iOS/Safari**: Pulsa el botón "Compartir" y selecciona "Añadir a la pantalla de inicio".

## 📁 Estructura del Proyecto

*   `index.html`: El núcleo de la aplicación. Contiene toda la lógica del juego, estilos CSS y estructura DOM.
*   `manifest.json`: Metadatos para la PWA (nombre, iconos, colores).
*   `icon.svg`: Icono vectorial de la aplicación.

---
*Desarrollado para fomentar el aprendizaje y la diversión segura.*
