import { DaysWeekGame } from '../games/DaysWeekGame.js';
import { QuizGame } from '../games/QuizGame.js';
import { MovementGame } from '../games/MovementGame.js';
import { SurfGame } from '../games/SurfGame.js';
import { SoccerGame } from '../games/SoccerGame.js';
import { KartGame } from '../games/KartGame.js';
import { FighterGame } from '../games/FighterGame.js';
import { MusicGame } from '../games/MusicGame.js';
import { PainterGame } from '../games/PainterGame.js';
import { MazeGame } from '../games/MazeGame.js';
import { ConnectDotsGame } from '../games/ConnectDotsGame.js';
import { ClockGame } from '../games/ClockGame.js';
import { ConnectFourGame } from '../games/ConnectFourGame.js';
import { CheckersGame } from '../games/CheckersGame.js';
import { ParchisGame } from '../games/ParchisGame.js';
import { GooseGame } from '../games/GooseGame.js';
import { ChessGame } from '../games/ChessGame.js';
import { SequenceGame } from '../games/SequenceGame.js';
import { MemoryGame } from '../games/MemoryGame.js';
import { SimonGame } from '../games/SimonGame.js';
import { WhackGame } from '../games/WhackGame.js';
import { ArkanoidGame } from '../games/ArkanoidGame.js';
import { RecycleGame } from '../games/RecycleGame.js';
import { SnakeGame } from '../games/SnakeGame.js';
import { RoboticsGame } from '../games/RoboticsGame.js';
import { EnglishMoodJumpGame } from '../games/EnglishMoodJumpGame.js';
import { EnglishPathGame } from '../games/EnglishPathGame.js';
import { EnglishWeatherGame } from '../games/EnglishWeatherGame.js';
import { EnglishFoodGame } from '../games/EnglishFoodGame.js';
import { EnglishSimonGame } from '../games/EnglishSimonGame.js';
import { CommRhymesGame } from '../games/CommRhymesGame.js';
import { CommPhonemesGame } from '../games/CommPhonemesGame.js';
import { CommArtGame } from '../games/CommArtGame.js';
import { CommInstrumentsGame } from '../games/CommInstrumentsGame.js';
import { CommStoryGame } from '../games/CommStoryGame.js';
import { CommNumbersGame } from '../games/CommNumbersGame.js';

export const ACTIVITIES_DATA = {
            aventura: {
                title: '🎮 ¡Aventura de Dino!',
                description: 'Mueve a Dino por toda la pantalla',
                type: 'movement',
                class: MovementGame,
                icon: '🎮', // Added for v9 UI
                theme: 'var(--theme-aventura)', // Added for v9 UI
                cost: 25 // STAR COST
            },
            surf: {
                title: '🏄‍♂️ Dino Surfer',
                description: '¡Consigue 10 estrellas para ganar!',
                type: 'surf',
                class: SurfGame,
                icon: '🌊',
                theme: 'linear-gradient(180deg, #4facfe 0%, #00f2fe 100%)',
                cost: 25
            },
            soccer: {
                title: '⚽ Dino Penaltis',
                description: '¡Marca 3 goles para ganar!',
                type: 'soccer',
                class: SoccerGame,
                icon: '🥅',
                theme: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                cost: 25
            },
            kart: {
                title: '🏎️ Dino Karts',
                description: '¡Sobrevive 2 minutos!',
                type: 'kart',
                class: KartGame,
                icon: '⏱️',
                theme: 'linear-gradient(180deg, #dd3e54 0%, #6be585 100%)',
                cost: 25
            },
            fighter: {
                title: '🥋 Dino Fighter',
                description: '¡Vence al T-Rex en combate!',
                type: 'fighter',
                class: FighterGame,
                icon: '🥊',
                theme: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                cost: 25
            },
            musica: {
                title: '🎹 Piano Mágico',
                description: '¡Toca Estrellita y gana 100⭐!',
                type: 'music',
                class: MusicGame,
                icon: '🎹',
                theme: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
            },
            pintar: {
                title: '🎨 Dino Pintor',
                description: '¡Dibuja y colorea con Dino!',
                type: 'painter',
                class: PainterGame,
                icon: '🎨',
                theme: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)'
            },
            laberinto: {
                title: '🧩 Dino Laberinto',
                description: '¡Encuentra el camino al Huevo!',
                type: 'maze',
                class: MazeGame,
                icon: '🧩',
                theme: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
            },
            unir_puntos: {
                title: '✏️ Unir Puntos',
                description: '¡Conecta del 1 al 10!',
                type: 'connect_dots',
                class: ConnectDotsGame,
                icon: '✏️',
                theme: 'linear-gradient(135deg, #3498db 0%, #8e44ad 100%)'
            },
            dias_semana: {
                title: '📅 Días de la Semana',
                description: '¡Aprende el orden en ES/EN!',
                type: 'days_week',
                class: DaysWeekGame,
                icon: '📅',
                theme: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
            },
            armonia: {
                title: '🌟 Desafío de Dino',
                description: '¡Ayuda a Dino con sus rutinas diarias!',
                type: 'quiz',
                class: QuizGame,
                icon: '🌟',
                theme: 'var(--theme-quiz)',
                games: [
                    { question: '¿Qué hace Dino antes de comer?', options: ['🧼 Lavarse las manos', '📺 Ver TV', '🏃 Correr', '😴 Dormir'], correct: 0 },
                    { question: '¿Qué parte del cuerpo usa Dino para caminar?', options: ['👂 Orejas', '👃 Nariz', '🦵 Piernas', '👀 Ojos'], correct: 2 },
                    { question: '¿Cuándo nos cepillamos los dientes?', options: ['🥐 Mientras comemos', '🦷 Después de comer', '🚫 Nunca', '👟 Con zapatos'], correct: 1 },
                    { question: '¿Qué decimos al pedir algo?', options: ['😡 ¡Dámelo!', '🙏 Por favor', '😤 No quiero', '👋 Adiós'], correct: 1 },
                    { question: '¿Dónde guardamos los juguetes?', options: ['🗑️ En la basura', '🏠 En el techo', '📦 En la caja', '🛏️ En la cama'], correct: 2 },
                    { question: '¿Qué hacemos si un amigo está triste?', options: ['😂 Reírnos', '😠 Empujarle', '🤗 Darle un abrazo', '🏃 Irnos'], correct: 2 },
                    { question: '¿Qué hacemos por la noche?', options: ['🏫 Ir al colegio', '⚽ Jugar al fútbol', '😴 Dormir y descansar', '🍦 Comer helado'], correct: 2 }
                ]
            },
            exploracion: {
                title: '🌳 Jardín Secreto',
                description: '¡Explora el jardín con Dino!',
                type: 'quiz',
                class: QuizGame,
                icon: '🌳',
                theme: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                games: [
                    { question: '¿Qué es más GRANDE?', options: ['🐘 Elefante', '🐜 Hormiga', '🐱 Gato', '🐭 Ratón'], correct: 0 },
                    { question: '¿Cuántas manzanas hay? 🍎', options: ['0️⃣', '1️⃣', '2️⃣', '3️⃣'], correct: 1 }
                ]
            },
            comunicacion: {
                title: '📚 Biblioteca Mágica',
                description: '¡Lee y aprende con Dino!',
                type: 'quiz',
                class: QuizGame,
                icon: '📚',
                theme: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                games: [
                    { question: '¿Qué número es este? 1️⃣', options: ['Cero', 'Uno', 'Dos', 'Tres'], correct: 1 },
                    { question: 'En inglés, ¿cómo se dice "Rojo"?', options: ['Blue', 'Red', 'Green', 'Yellow'], correct: 1 }
                ]
            },
            religion: {
                title: '⭐ Historias Especiales',
                description: '¡Aprende historias maravillosas!',
                type: 'quiz',
                class: QuizGame,
                icon: '⭐',
                theme: 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)',
                games: [
                    { question: '¿Quién nació en Navidad?', options: ['🎅 Santa Claus', '👼 Jesús', '⛄ Muñeco de nieve', '🦌 Rodolfo'], correct: 1 },
                    { question: '¿Dónde nació Jesús?', options: ['🏰 Castillo', '🏠 Casa', '⭐ Belén', '🏫 Escuela'], correct: 2 }
                ]
            },
            emociones: {
                title: '😊 Las Emociones',
                description: '¡Identifica cómo se sienten!',
                type: 'quiz',
                class: QuizGame,
                icon: '🎭',
                theme: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                games: [
                    { question: '¿Quién está FELIZ? 😄', options: ['😠', '😢', '😄', '😴'], correct: 2 },
                    { question: '¿Quién está TRISTE? 😢', options: ['😄', '😢', '😲', '😡'], correct: 1 },
                    { question: '¿Quién tiene MIEDO? 😨', options: ['😨', '😎', '😆', '😐'], correct: 0 },
                    { question: '¿Quién está ENFADADO? 😠', options: ['😴', '😠', '😄', '😢'], correct: 1 },
                    { question: '¿Quién está SORPRENDIDO? 😲', options: ['😐', '😲', '😴', '😆'], correct: 1 },
                    { question: '¿Quién tiene SUEÑO? 😴', options: ['😄', '😴', '😠', '😨'], correct: 1 },
                    { question: '¿Quién siente AMOR? 😍', options: ['😍', '😢', '😠', '😐'], correct: 0 }
                ]
            },
            cuerpo: {
                title: '🦵 El Cuerpo / Body',
                description: 'Español e Inglés 🇪🇸🇬🇧',
                type: 'quiz',
                class: QuizGame,
                icon: '🦵',
                theme: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                games: [
                    { question: '¿Dónde está la NARIZ? (Nose)', options: ['👁️ Ojo', '👃 Nariz', '👂 Oreja', '👄 Boca'], correct: 1 },
                    { question: 'Where are the EYES? (Ojos)', options: ['👃 Nose', '🦵 Leg', '👁️ Eyes', '✋ Hand'], correct: 2 },
                    { question: '¿Cuál es la BOCA? (Mouth)', options: ['👄 Boca', '👁️ Ojo', '👂 Oreja', '🦶 Pie'], correct: 0 },
                    { question: 'Where is the HAND? (Mano)', options: ['🦶 Foot', '✋ Hand', '👃 Nose', '🦵 Leg'], correct: 1 },
                    { question: '¿Dónde está la OREJA? (Ear)', options: ['👂 Oreja', '👄 Boca', '👁️ Ojo', '✋ Mano'], correct: 0 },
                    { question: 'Where is the FOOT? (Pie)', options: ['✋ Hand', '👃 Nose', '🦶 Foot', '👁️ Eye'], correct: 2 },
                    { question: '¿Dónde está la PIERNA? (Leg)', options: ['💪 Brazo', '🦵 Pierna', '🦶 Pie', '👃 Nariz'], correct: 1 }
                ]
            },
            colores: {
                title: '🎨 Colors / Colores',
                description: '¡Aprende los colores en Inglés!',
                type: 'quiz',
                class: QuizGame,
                icon: '🎨',
                theme: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
                games: [
                    { question: 'Which one is RED? 🔴 (Rojo)', options: ['🟦', '🟥', '🟩', '🟨'], correct: 1 },
                    { question: 'Which one is BLUE? 🔵 (Azul)', options: ['🟥', '🟨', '🟦', '🟧'], correct: 2 },
                    { question: 'Which one is GREEN? 🟢 (Verde)', options: ['🟩', '🟪', '🟦', '🟫'], correct: 0 },
                    { question: 'Which one is YELLOW? 🟡 (Amarillo)', options: ['🟧', '🟨', '⬛', '🟥'], correct: 1 },
                    { question: 'Which one is ORANGE? 🟠 (Naranja)', options: ['🟧', '🟥', '🟪', '🟦'], correct: 0 },
                    { question: 'Which one is PURPLE? 🟣 (Morado)', options: ['🟦', '🟩', '🟪', '⬛'], correct: 2 },
                    { question: 'Which one is BLACK? ⚫ (Negro)', options: ['⬜', '⬛', '🟫', '🟥'], correct: 1 },
                    { question: 'Which one is WHITE? ⚪ (Blanco)', options: ['⬛', '⬜', '🟨', '🟦'], correct: 1 }
                ]
            },
            reloj: {
                title: '⏰ Dino Reloj',
                description: '¡Aprende la hora con Dino!',
                type: 'clock',
                class: ClockGame,
                icon: '⏰',
                theme: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
            },
            connect_four: {
                title: '🔴 4 en Raya',
                description: '¡Gana a Dino!',
                type: 'connect_four',
                class: ConnectFourGame,
                icon: '🔴',
                theme: 'linear-gradient(135deg, #2980b9 0%, #6dd5fa 100%)',
                cost: 10
            },
            checkers: {
                title: '🏁 Damas',
                description: '¡Salta y gana!',
                type: 'checkers',
                class: CheckersGame,
                icon: '🏁',
                theme: 'linear-gradient(135deg, #8e44ad 0%, #c0392b 100%)',
                cost: 10
            },
            parchis: {
                title: '🎲 Parchís',
                description: '¡Corre a casa!',
                type: 'parchis',
                class: ParchisGame,
                icon: '🎲',
                theme: 'linear-gradient(135deg, #f1c40f 0%, #e67e22 100%)',
                cost: 10
            },
            oca: {
                title: '🦆 Oca',
                description: '¡Llega al 63!',
                type: 'goose',
                class: GooseGame,
                icon: '🦆',
                theme: 'linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%)',
                cost: 10
            },
            chess: {
                title: '♟️ Ajedrez',
                description: 'Jaque Mate 🦖',
                type: 'chess',
                class: ChessGame,
                icon: '♟️',
                theme: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
                cost: 10
            },
            robotica: {
                title: '🤖 Robótica / Coding',
                description: '¡Programa al Robot!',
                type: 'robotics',
                class: RoboticsGame,
                icon: '🤖',
                theme: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
            },
            secuencias: {
                title: '🔢 Secuencias',
                description: '¡Completa la serie!',
                type: 'sequence',
                class: SequenceGame,
                icon: '🔢',
                theme: 'linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)'
            },
            memory: {
                title: '🧠 Memorama Dino',
                description: '¡Encuentra las parejas!',
                type: 'memory',
                class: MemoryGame,
                icon: '🧠',
                theme: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                cost: 10
            },
            simon: {
                title: '🔊 Simón Dice',
                description: '¡Repite la secuencia!',
                type: 'simon',
                class: SimonGame,
                icon: '🔊',
                theme: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                cost: 10
            },
            whack: {
                title: '🔨 Topo Dino',
                description: '¡Atrapa a los Dinos!',
                type: 'whack',
                class: WhackGame,
                icon: '🔨',
                theme: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                cost: 10
            },
            arkanoid: {
                title: '🧱 Arkanoid Dino',
                description: '¡Rompe los bloques!',
                type: 'arkanoid',
                class: ArkanoidGame,
                icon: '🧱',
                theme: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                cost: 10
            },
            recycling: {
                title: '♻️ Reciclaje',
                description: '¡Cuida el planeta!',
                type: 'recycling',
                class: RecycleGame,
                icon: '♻️',
                theme: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                cost: 10
            },
            snake: {
                title: '🐍 Serpiente',
                description: '¡Come y crece!',
                type: 'snake',
                class: SnakeGame,
                icon: '🐍',
                theme: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                cost: 10
            },
            en_mood: {
                title: '☁️ Mood Jump',
                description: 'Jump over sad/angry!',
                type: 'en_mood',
                class: EnglishMoodJumpGame,
                icon: '☁️',
                theme: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                cost: 0
            },
            en_path: {
                title: '🥚 Months & Numbers',
                description: 'Collect in order!',
                type: 'en_path',
                class: EnglishPathGame,
                icon: '🥚',
                theme: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                cost: 0
            },
            en_weather: {
                title: '☀️ What\'s the weather?',
                description: 'Interactive weather!',
                type: 'en_weather',
                class: EnglishWeatherGame,
                icon: '☀️',
                theme: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                cost: 0
            },
            en_food: {
                title: '🍕 Dino Snack',
                description: 'I like playing...',
                type: 'en_food',
                class: EnglishFoodGame,
                icon: '🍕',
                theme: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                cost: 0
            },
            en_simon: {
                title: '🗣️ Simon Says',
                description: 'Listen and act!',
                type: 'en_simon',
                class: EnglishSimonGame,
                icon: '🗣️',
                theme: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                cost: 0
            },
            com_rhymes: {
                title: '🎵 Poesías y Rimas',
                description: '¡Completa la rima!',
                type: 'com_rhymes',
                class: CommRhymesGame,
                icon: '🎵',
                theme: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                cost: 0
            },
            com_phonemes: {
                title: '🅰️ Fonemas Mágicos',
                description: 'Traza y explota',
                type: 'com_phonemes',
                class: CommPhonemesGame,
                icon: '🅰️',
                theme: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                cost: 0
            },
            com_art: {
                title: '🎨 Plástica y Creatividad',
                description: '¡Dibuja y crea!',
                type: 'com_art',
                class: CommArtGame,
                icon: '🎨',
                theme: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                cost: 0
            },
            com_instruments: {
                title: '🎺 Instrumentos',
                description: 'Viento, cuerda o percusión',
                type: 'com_instruments',
                class: CommInstrumentsGame,
                icon: '🎺',
                theme: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                cost: 0
            },
            com_story: {
                title: '📖 Cuentos de Dino',
                description: 'Escucha y comprende',
                type: 'com_story',
                class: CommStoryGame,
                icon: '📖',
                theme: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                cost: 0
            },
            com_numbers: {
                title: '🔢 Números 0-8',
                description: 'Traza y cuenta',
                type: 'com_numbers',
                class: CommNumbersGame,
                icon: '🔢',
                theme: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                cost: 0
            }
        };

export const ARCADE_KEYS = ['aventura', 'surf', 'soccer', 'kart', 'fighter', 'laberinto', 'unir_puntos', 'connect_four', 'checkers', 'parchis', 'oca', 'chess', 'robotica', 'memory', 'simon', 'whack', 'arkanoid', 'recycling', 'snake'];
export const ENGLISH_KEYS = ['en_mood', 'en_path', 'en_weather', 'en_food', 'en_simon'];
export const COMUNICACION_KEYS = ['com_rhymes', 'com_phonemes', 'com_art', 'com_instruments', 'com_story', 'com_numbers'];
