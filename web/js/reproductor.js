import {emitir} from './eventos.js';
import {API_BASE} from './conexion.js';

        // Metadatos y fuentes locales precargadas en la carpeta /audio/
export const playlist = [
            {
                url: "./audio/End Of Line - Daft Punk - TRON Legacy.mp3", //[cite: 2]
                id: "end-of-line",
                titulo: "End Of Line",
                album: "TRON: Legacy OST",
                autores: "Daft Punk",
                genero: "Electronic / Cyberpunk"
            },
            {
                url: "./audio/Derezzed - Daft Punk - TRON Legacy.mp3", //[cite: 1]
                id: "derezzed",
                titulo: "Derezzed",
                album: "TRON: Legacy OST",
                autores: "Daft Punk",
                genero: "Electro House / Synthwave"
            },
            {
                url: "./audio/The Son Of Flynn - Daft Punk - TRON Legacy.mp3", //[cite: 3]
                id: "the-son-of-flynn",
                titulo: "The Son Of Flynn",
                album: "TRON: Legacy OST",
                autores: "Daft Punk",
                genero: "Ambient Synth / Electronic"
            }
        ];

export let pistaSeleccionada = 0;
export let pistaCargadaIndex = -1;
        const preloadedAudios = [];

export const audio = document.getElementById('audio-player');
        const vinyl = document.getElementById('vinyl');
        const seekBar = document.getElementById('seek-bar');
        const timeDisplay = document.getElementById('time-display');

        // Precarga de buffer en memoria para reproducción instantánea sin latencia
export function precargarRecursos() {
            playlist.forEach((track, index) => {
                const a = new Audio();
                a.src = track.url;
                a.preload = "auto";
                preloadedAudios[index] = a;
            });
        }

export function formatearTiempo(segundos) {
            if (isNaN(segundos) || segundos < 0) return "00:00";
            const min = Math.floor(segundos / 60);
            const seg = Math.floor(segundos % 60);
            return `${min < 10 ? '0' : ''}${min}:${seg < 10 ? '0' : ''}${seg}`;
        }

        // Eventos del reproductor nativo HTML5
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const porcentaje = (audio.currentTime / audio.duration) * 100;
                seekBar.value = porcentaje;
                timeDisplay.innerText = `${formatearTiempo(audio.currentTime)} / ${formatearTiempo(audio.duration)}`;
            }
        });

        audio.addEventListener('play', () => {
            vinyl.classList.add('playing');
        });

        audio.addEventListener('pause', () => {
            vinyl.classList.remove('playing');
        });

        audio.addEventListener('ended', () => {
            let siguiente = (pistaCargadaIndex + 1) % playlist.length;
            reproducirPistaDirecta(siguiente);
        });

export function cambiarTiempo(valorPorcentaje) {
            if (audio.duration) {
                audio.currentTime = (valorPorcentaje / 100) * audio.duration;
            }
        }

export function actualizarPantalla() {
            const track = playlist[pistaSeleccionada];
            document.getElementById('track-title').innerText = `🎵 Pista: ${track.titulo}`;
            document.getElementById('track-genre').innerText = `🎷 Género: ${track.genero}`;
            document.getElementById('track-author').innerText = `👤 Autores: ${track.autores}`;

            const items = document.querySelectorAll('.playlist-item');
            items.forEach((item, index) => {
                if (index === pistaSeleccionada) item.classList.add('selected');
                else item.classList.remove('selected');
            });
        }

        // 🔵 BOTÓN AZUL: Desplegar / Ocultar Lista
export function togglePlaylist() {
            const panel = document.getElementById('playlist-panel');
            panel.classList.toggle('active');
        }

        // Un Clic: Selecciona el ítem de la lista
export function seleccionarItem(index) {
            if (!playlist[index]) return;
            audio.pause();
            const cambio = pistaCargadaIndex !== index;
            pistaSeleccionada = index;
            if (cambio) {
                pistaCargadaIndex = index;
                audio.src = playlist[index].url;
                audio.load();
                seekBar.value = 0;
                timeDisplay.innerText = '00:00 / 00:00';
            }
            actualizarPantalla();
            emitir('orbita:pista', {id: playlist[index].id});
        }

        // Doble Clic o Botón Verde: Reproduce inmediatamente el archivo local
export function reproducirPistaDirecta(index) {
            if (!playlist[index]) return;
            audio.pause();
            pistaSeleccionada = index;
            pistaCargadaIndex = index;
            actualizarPantalla();
            audio.src = playlist[index].url;
            audio.load();
            emitir('orbita:pista', {id: playlist[index].id});
            audio.play().catch(e => {
                console.log("Interacción requerida:", e);
                emitir('orbita:error', {mensaje: 'Pulsa Play para iniciar la pista.'});
            });
        }

        // 🟢 BOTÓN VERDE: Reproducir Pista Seleccionada
export function reproducirAudio() {
            if (pistaCargadaIndex !== pistaSeleccionada) {
                reproducirPistaDirecta(pistaSeleccionada);
            } else {
                audio.play().catch(e => console.log("Error al reproducir:", e));
            }
        }

        // 🔴 BOTÓN ROJO: Pausar Reproducción
export function pausarAudio() {
            audio.pause();
        }

        // Precarga fluida en memoria de la toma satelital del GOES-16 (NOAA)
export async function actualizarFondoGOES() {
            let urlImagen = `https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/1808x1808.jpg?t=${Date.now()}`;

            try {
                const res = await fetch(`${API_BASE}/api/goes`);
                if (res.ok) {
                    const data = await res.json();
                    urlImagen = data.image_url;
                }
            } catch (e) {}

            const imgEnMemoria = new Image();
            imgEnMemoria.src = urlImagen;

            imgEnMemoria.onload = () => {
                document.body.style.backgroundImage = `radial-gradient(circle at center, rgba(10, 15, 30, 0.25) 0%, rgba(3, 5, 10, 0.88) 100%), url('${urlImagen}')`;
                const horaActual = new Date().toLocaleTimeString();
                document.getElementById('goes-timer').innerText = `🛰️ GOES-16 Suramérica (${horaActual})`;
            };
        }


export function iniciarReproductor() {
    Object.assign(window,{cambiarTiempo,seleccionarItem,reproducirPistaDirecta,reproducirAudio,pausarAudio,togglePlaylist});
    precargarRecursos();actualizarFondoGOES();setInterval(actualizarFondoGOES,600000);actualizarPantalla();
}
