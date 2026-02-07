# Glosario Técnico y Funcional

Este documento resume las correcciones, mejoras y conceptos técnicos implementados durante la sesión de trabajo.

## 🐛 Corrección de Bugs (Bug Fixes)

### 1. Arkanoid (Bucle Infinito/Crash)
*   **Problema:** El juego se bloqueaba o entraba en bucle al completar el Nivel 5.
*   **Solución:** Se implementó una lógica de `startLevel` separada de `startGame` para gestionar la progresión de niveles (1 al 5) y se añadió una pantalla de `finalVictory` al terminar el juego correctamente.

### 2. Memory Game (Race Condition/Layout)
*   **Problema (Lógica):** Si se hacía clic muy rápido en una tercera carta mientras dos ya estaban volteadas, el juego perdía el estado (cartas "fantasmas").
*   **Solución:** Se añadió un bloqueo estricto (`this.flipped.length >= 2`) y un manejo robusto de `timeouts` (`clearTimeouts`) para limpiar eventos pendientes al reiniciar o salir.
*   **Problema (Visual):** En modo horizontal (landscape), el tablero se desbordaba y requería scroll.
*   **Solución:** Se usó CSS Grid con `aspect-ratio: 1/1` y `max-height: 100%` para asegurar que el tablero siempre quepa en la pantalla sin scroll.

### 3. Footer Gigante (Regresión UI)
*   **Problema:** Aparecía un espacio blanco enorme debajo del juego.
*   **Solución:** Se ajustó el contenedor `#view-game` con `height: 90vh` y `overflow: hidden` para contener el canvas y evitar desbordamientos del layout.

## 🎨 Mejoras de Interfaz (UI Improvements)

### 4. Botones Flotantes (Floating UI)
*   **Concepto:** Maximizar el área de juego eliminando barras superiores estáticas.
*   **Implementación:** Se movieron los botones "Atrás" (izquierda) y "Puntuación/Wallet" (derecha) a posiciones absolutas (`position: absolute`) sobre el canvas del juego. El título del juego se ocultó (`display: none`) pero se mantuvo en el DOM para la lógica interna.

### 5. Diseño Responsive
*   **Concepto:** Adaptar el juego a cualquier tamaño de pantalla.
*   **Implementación:** Uso de unidades relativas (`vh`, `vmin`, `%`) y `flexbox`/`grid` para centrar elementos dinámicamente.

## 🌐 Funcionalidad Offline

### 6. Service Worker (`sw.js`)
*   **Concepto:** Un script que corre en segundo plano para permitir que la web funcione sin internet.
*   **Implementación:** Se creó un archivo `sw.js` que cachea (guarda en memoria) archivos esenciales como `index.html`, `manifest.json`, e `icon.svg` para cargas offline rápidas.

## 🛠️ Herramientas y Verificación

### 7. Playwright Scripts (`verify_*.py`)
*   **Concepto:** Automatización de pruebas de navegador.
*   **Uso:** Creamos scripts en Python para simular interacciones de usuario (jugar niveles, verificar elementos visuales) y confirmar que los arreglos funcionaban (ej. `verify_arkanoid.py` para pasar los 5 niveles automáticamente).

### 8. Git Merge Diff
*   **Concepto:** Formato utilizado para aplicar parches de código de manera quirúrgica, buscando un bloque de texto original y reemplazándolo por uno nuevo.

## 📚 Conceptos Generales
*   **Race Condition:** Error de software que ocurre cuando el resultado de un proceso depende de la secuencia o el tiempo de otros eventos incontrolables (ej. clics rápidos en Memory).
*   **Game Loop:** El ciclo infinito que actualiza la lógica del juego y redibuja la pantalla (usado en Arkanoid, Snake, etc.).
*   **Canvas API:** Tecnología de HTML5 usada para dibujar gráficos 2D dinámicos (usado en Arkanoid para la pelota, paleta y ladrillos).
