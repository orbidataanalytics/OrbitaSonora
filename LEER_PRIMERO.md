# Órbita Sonora modular con partituras e informes

Versión 3.0. Se conserva la rocola y el análisis RGB aprobado. La API y la web ahora se organizan en módulos. Se añaden tres partituras espectrales sincronizadas y un informe imprimible con imágenes, píxeles importantes y estadísticas.

## Instalar esta versión

Esta entrega necesita la estructura completa del ZIP. Ya no basta con copiar únicamente `index.html` y `main.py`.

1. Extrae la carpeta `OrbitaSonora` del ZIP y copia su contenido en la raíz de tu repositorio.
2. Conserva la carpeta `audio` que ya tienes. El paquete no incluye MP3 ni vídeos y mantiene estos nombres:
   - `End Of Line - Daft Punk - TRON Legacy.mp3`
   - `Derezzed - Daft Punk - TRON Legacy.mp3`
   - `The Son Of Flynn - Daft Punk - TRON Legacy.mp3`
3. Sube también las carpetas `api`, `web`, `datos` e `imagenes_pixel` y los archivos de esta entrega.
4. Si GitHub Pages y Render usan el mismo repositorio, publica esa estructura completa en el repositorio actual.
5. Si los repositorios son distintos, GitHub Pages necesita `index.html`, `web`, `datos` y tu carpeta `audio`. Render necesita `main.py`, `api`, `datos` y `requirements.txt`; añade también `index.html`, `web` y `audio` si quieres abrir la rocola desde Render.
6. En Render conserva Build Command `pip install -r requirements.txt` y Start Command `uvicorn main:app --host 0.0.0.0 --port $PORT`.
7. Después de actualizar la web, recarga con Ctrl+Shift+R para cargar los módulos nuevos.

El paquete funciona sin proceso de compilación web ni instalación de paquetes npm. `package.json` declara los módulos JavaScript. En producción Python sigue necesitando solo `fastapi` y `uvicorn`.

La dirección de API sigue siendo `https://orbita-sonora.onrender.com`, configurada en la etiqueta `meta` llamada `orbita-api-base` del HTML. La API también puede servir la página en `/rocola`; `/` conserva el JSON original.

## Funciones conservadas

Se mantienen los botones de reproducir, pausar y lista, el vinilo animado, los metadatos, la barra de búsqueda, la precarga, el avance a la siguiente pista, las marcas gráficas originales y la actualización GOES cada diez minutos. Las rutas `/`, `/api/datos` y `/api/goes` conservan sus campos originales.

Un clic en una pista la carga en pausa; doble clic o Play inicia la reproducción. Las cuatro imágenes conservan los mismos píxeles y el mismo recorrido en RGB, R, G y B. Continúan los recorridos por filas, serpentina e Hilbert, la búsqueda por clic y teclado, la firma dinámica, el mapa de repetición y la descarga de cuatro PNG en ZIP.

## Partituras al unísono

Los tres pentagramas se mueven juntos con `audio.currentTime`, el mismo reloj de los píxeles. Las ventanas de lectura son de 8, 12 o 24 segundos. Puedes pulsar un pentagrama para buscar ese instante.

- R representa 20–250 Hz y se escribe en clave de Fa con 8vb.
- G representa 350–500 Hz y se escribe en clave de Sol.
- B representa 600–20 000 Hz y se escribe en clave de Sol con 8va.
- Los nombres y las frecuencias visibles corresponden a la altura sonora real, antes del desplazamiento de octava de lectura.
- Cada nota ocupa un intervalo temporal proporcional en segundos. Las barras muestran duración. No se atribuye un compás ni un tempo musical a la grabación.
- Una cruz identifica energía sin altura definida; la marca de silencio identifica la ausencia de energía suficiente en esa banda.

Estas son partituras espectrales automáticas de una componente dominante por banda. La componente puede ser un armónico o pertenecer a otro instrumento de la mezcla. No equivalen a una transcripción completa de todos los instrumentos o acordes ni a las partituras originales del compositor.

## Marcas e informe

Puedes marcar el píxel actual y añadir una nota. Las marcas se conservan en el almacenamiento local de ese navegador. Pulsar una marca de la lista la elimina.

Al final del panel, elige la pista actual o las tres canciones, decide si incluyes las partituras completas y pulsa Preparar informe imprimible. La reproducción se pausa para preparar el documento.

El informe contiene:

- Las cuatro imágenes con puntos numerados y coordenadas en una tabla.
- Máximos de cada canal, mayor intensidad visual conjunta, mayor cambio RGB entre píxeles, primera aparición de la firma más frecuente y marcas manuales.
- Mínimo, máximo, media, mediana, desviación estándar poblacional, percentiles 5 y 95 e histogramas por banda.
- Intervalos con energía, silencio, grupos de firmas, ocupación y duración acumulada.
- Mapa de repetición y curvas representativas de los grupos más frecuentes.
- Resumen de alturas detectadas y, opcionalmente, las partituras de la canción entera.
- Fuente de audio, huella SHA-256 y método empleado.

En la vista del informe puedes imprimir, guardar PDF mediante el diálogo de impresión o descargar un HTML autónomo con las figuras incluidas. El informe siempre cuenta la canción completa, con la agrupación y el recorrido seleccionados. Así su estadística no depende de cuántas veces has vuelto a pasar por un tramo.

## Qué significan las cifras

Las estadísticas R/G/B son intensidades visuales de 0 a 255. Se usa la misma escala de 70 dB para todas las bandas y canciones, referida al máximo de potencia de banda del conjunto de las tres pistas. La estadística de intensidad incluye todos los píxeles; la ocupación de firmas excluye los intervalos sin energía.

Las firmas se agrupan en 4, 8 o 16 niveles por banda. Una repetición es un intervalo que cae en el mismo grupo de tres intensidades. Rojo representa los grupos más repetidos y verde los menos frecuentes. El negro representa silencio; en el ámbito hasta el cursor, el gris corresponde al tramo no contado. Un porcentaje de ocupación se calcula sobre el total de intervalos activos.

La cantidad de notas con altura definida mide cobertura del análisis, no exactitud de transcripción musical. Los píxeles importantes se eligen mediante criterios indicados en el informe; su importancia es analítica, no una valoración estética de la música.

## Resolución y fuentes

Se mantienen 64 × 64 píxeles por canción y las guardas de 250–350 y 500–600 Hz. Las duraciones analizadas son 157.106213 s para End Of Line, 105.047075 s para Derezzed y 96.037732 s para The Son Of Flynn. Cada píxel representa respectivamente unos 38.356, 25.646 y 23.447 ms.

El cursor es `min(4095, floor(t/T*4096))`. El reloj visual no acumula un cronómetro propio. Si la pantalla omite un fotograma, los paneles vuelven al índice correspondiente al tiempo real del audio.

Intensidades: STFT Hann de 8192 muestras, paso 512, potencia promediada de los dos canales de audio a 44 100 Hz e integración temporal por intervalo de píxel. La ventana abarca aproximadamente 186 ms; los píxeles temporales más pequeños no son estimaciones físicamente independientes.

Alturas: ventana Hann de 16384 muestras y paso 1024, máximo espectral dentro de cada banda, ajuste parabólico del logaritmo de potencia y suavizado de cinco pasos. Se aplica un criterio de prominencia, concentración de energía y planitud antes de asignar una nota. Los eventos tonales inferiores a 0.10 s se indican sin altura definida. La ventana abarca unos 372 ms y limita la localización de ataques. Las guardas no eliminan toda fuga espectral.

La altura de una banda se considera en silencio si su potencia queda más de 60 dB por debajo del máximo conjunto de esa pista. El silencio de las imágenes usa el criterio global del análisis RGB anterior; por esa razón la cobertura de silencio de una banda puede diferir del silencio conjunto de la imagen.

Los datos corresponden exactamente a los MP3 recibidos. Cambiar de versión, corte o grabación requiere regenerar el análisis y las partituras. Los PNG resumen potencia espectral y no conservan la fase necesaria para recuperar el audio sin pérdida.

## Módulos y API

Consulta `ARQUITECTURA.md` para localizar cada responsabilidad. `main.py` solo expone la aplicación y `index.html` contiene la estructura. La API usa rutas separadas de los servicios; la web separa reproducción, reloj, imágenes, notación, estadísticas e informes.

Rutas nuevas:

- `/api/partituras/{id}` devuelve los eventos por banda y el método.
- `/api/informe/{id}?recorrido=filas&niveles=8` devuelve estadísticas y píxeles importantes.
- `/api/informe/{id}?marcados=0,101` añade índices manuales en base cero al informe de datos.
- `/api/estado/{id}?tiempo=10` conserva la respuesta previa y añade la nota activa de cada banda.

Identificadores: `end-of-line`, `derezzed` y `the-son-of-flynn`. Las coordenadas de la API son base cero; la interfaz y el informe muestran columnas, filas y números de píxel en base uno.

## Referencias de implementación

- FastAPI modular https://fastapi.tiangolo.com/tutorial/bigger-applications/
- Reloj de audio https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime
- Archivos estáticos https://fastapi.tiangolo.com/tutorial/static-files/
- Configuración Render https://render.com/docs/deploy-fastapi
