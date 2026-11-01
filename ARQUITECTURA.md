# Arquitectura modular de Órbita Sonora

La aplicación conserva un solo reproductor. El módulo `reloj.js` lee `audio.currentTime` y emite el instante y el índice de píxel; imágenes y partituras consumen ese mismo evento. Los informes toman una instantánea del análisis y calculan sus estadísticas sin alterar el audio ni los datos fuente.

## Puntos de entrada

| Archivo | Responsabilidad |
| --- | --- |
| `main.py` | Exponer `app` para Uvicorn y Render |
| `api/aplicacion.py` | Configurar FastAPI, CORS, compresión, rutas y archivos estáticos |
| `index.html` | Estructura visual y controles |
| `web/js/app.js` | Cargar los datos y conectar los módulos web |

## API

| Módulo | Responsabilidad |
| --- | --- |
| `api/datos.py` | Leer y validar el análisis y las partituras de las mismas fuentes de audio |
| `api/rutas/sistema.py` | Estado original, metadatos y GOES |
| `api/rutas/canciones.py` | Catálogo, estado sincronizado, ocupación e imágenes |
| `api/rutas/partituras.py` | Partituras por canción |
| `api/rutas/informes.py` | Estadísticas y puntos importantes para informes |
| `api/servicios/analisis.py` | Recorridos, intensidades, agrupaciones y PNG |
| `api/servicios/partituras.py` | Consultar eventos y la nota activa de cada banda |
| `api/servicios/informes.py` | Calcular estadísticas y seleccionar píxeles importantes |

Las rutas traducen solicitudes HTTP; los servicios contienen los cálculos. `api/aplicacion.py` conecta ambas capas. Las rutas públicas anteriores se mantienen, incluido el JSON de `/`.

## Web

| Módulo | Responsabilidad |
| --- | --- |
| `web/js/reproductor.js` | Lista, audio, botones, progreso, vinilo y fondo GOES |
| `web/js/reloj.js` | Único ciclo de actualización de la posición temporal |
| `web/js/eventos.js` | Comunicación entre módulos |
| `web/js/conexion.js` | Dirección de API y carga de los datos locales |
| `web/js/imagenes.js` | RGB, bandas, píxel activo, firma y mapa de repetición |
| `web/js/recorridos.js` | Coordenadas de filas, serpentina e Hilbert |
| `web/js/partituras.js` | Tres pentagramas dinámicos y notas activas |
| `web/js/notacion.js` | Dibujar la notación espectral, compartida con los informes |
| `web/js/estadisticas.js` | Estadísticas, grupos de firmas y píxeles importantes |
| `web/js/informes.js` | Marcas, informe, impresión y descarga HTML |

Los estilos se separan en `web/css/rocola.css`, `analisis.css`, `partituras.css` e `informes.css`.

## Datos y sincronización

`datos/pixeles.json` contiene el análisis RGB aprobado. `datos/partituras.json` añade los eventos de altura por banda. Tanto la API como la web leen esos archivos, sin incrustar copias diferentes en `main.py` e `index.html`.

Cada canción tiene un identificador, duración, SHA-256 del MP3 y 4096 intervalos. Un evento de partitura se representa con cinco valores:

`[inicio_pixel, fin_pixel_exclusivo, nota_midi_o_estado, frecuencia_mediana_hz, confianza_espectral]`

Los estados −2 y −1 corresponden a silencio y energía sin altura definida. El código de nota puede superar el límite MIDI de reproducción convencional porque representa frecuencia; no se utiliza para reproducir una pista MIDI adicional.

El evento `orbita:reloj` incluye `id`, `tiempo`, `indice`, `duracion`, `pausado`, `buscando` y `esperando`. Los módulos visuales no crean relojes independientes. `orbita:pixel` comunica un cambio de píxel y `orbita:pista` identifica la carga de una canción.

## Cambios habituales

| Cambio | Archivos principales |
| --- | --- |
| Colores o tamaños de la rocola | `web/css/rocola.css` |
| Notación y presentación de las notas | `web/js/notacion.js`, `web/css/partituras.css` |
| Contenido del informe | `web/js/informes.js`, `web/css/informes.css` |
| Estadísticas | `web/js/estadisticas.js`, `api/servicios/informes.py` |
| Reglas de repetición | `web/js/imagenes.js`, `web/js/estadisticas.js`, `api/servicios/analisis.py` |
| Endpoint nuevo | Añadirlo a su módulo en `api/rutas` y registrarlo en `api/aplicacion.py` |
| Sustituir una grabación | Regenerar sus datos RGB y sus eventos espectrales, conservando una huella de fuente coincidente |

Esta versión incluye análisis preparado para las tres grabaciones entregadas. Añadir una pista al catálogo por sí solo no extrae sus notas ni genera su análisis. Las intensidades no permiten deducir la frecuencia de una nota: para nuevas partituras se necesita analizar de nuevo el audio.

## Verificación

Las comprobaciones comparan el análisis anterior con el modular, revisan que cada recorrido visite los 4096 píxeles una vez, verifican que los eventos cubran la canción sin huecos y confirman que API, reloj, imágenes y partituras usen el mismo índice. Las estadísticas de la API y la web se contrastan entre sí.
