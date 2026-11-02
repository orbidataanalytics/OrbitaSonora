<p align="center">
  <img src="docs/img/logo-orbidata-analytics.png" width="180" alt="Logo original de ORBIDATA ANALYTICS">
  &nbsp;&nbsp;
  <img src="docs/img/logo-orbita-sonora.png" width="340" alt="Logo original de Órbita Sonora">
  &nbsp;&nbsp;
  <img src="docs/img/logo-semillero-itm.png" width="150" alt="Logo original del Semillero de Astronomía ITM">
</p>

# Órbita Sonora

> Website for image processing in the sound domain

**ORBIDATA ANALYTICS** desarrolla soluciones de análisis de datos, modelado y visualización. **Órbita Sonora** es su producto para explorar las relaciones entre imágenes, señales, firmas espectrales y representaciones sonoras, con un componente científico, educativo y artístico.

El proyecto hace parte del **Semillero de Astronomía, Instrumentación y Ciencias Espaciales del ITM**, también denominado **Semillero de Astronomía ITM**, del Instituto Tecnológico Metropolitano, Medellín, Colombia.

[Abrir la aplicación](https://orbidataanalytics.github.io/OrbitaSonora/) · [Código fuente](https://github.com/orbidataanalytics/OrbitaSonora) · [API en Render](https://orbitasonora.onrender.com/) · [Documentación interactiva de la API](https://orbitasonora.onrender.com/docs) · [Apache License 2.0](LICENSE)

## 1 Qué es Órbita Sonora

Órbita Sonora es una plataforma en desarrollo para relacionar información visual y sonora mediante transformaciones explícitas. Su propósito es que una persona pueda recorrer datos, observar cómo cambian sus valores, escuchar una representación y conservar un registro de las decisiones de análisis.

El demostrador actual trabaja con tres grabaciones musicales. Calcula previamente su energía en tres bandas acústicas, convierte esos valores en imágenes RGB y sincroniza la rocola, el píxel activo, la firma de intensidades y tres partituras espectrales. Este recorrido **audio → imagen → análisis sincronizado** permite estudiar y mostrar la relación entre tiempo, frecuencia, intensidad, color y notación.

La visión del producto incorpora también el recorrido **imagen científica → extracción de firmas → sonificación parametrizada**. Su integración completa requiere lectura de imágenes, metadatos, calibración y un motor de síntesis, además de las herramientas visuales del demostrador.

### 1.1 Del boceto al demostrador

![Boceto conceptual original de la plataforma Órbita Sonora](docs/img/boceto-conceptual.png)

*Boceto conceptual del proyecto. Reúne la rockola central, imágenes o stacks, preparación, recorridos, firmas, partituras, marcadores, ubicación celeste e informe técnico. Representa el diseño del producto y su hoja de ruta; varios controles del dibujo todavía pertenecen a las ampliaciones previstas.*

### 1.2 Alcance de esta versión

| Capacidad | Estado en el paquete modular |
|---|---|
| Rocola con selección, reproducción, pausa, búsqueda y avance automático | Implementada para las tres grabaciones del catálogo |
| Imagen RGB y canales R, G y B alineados | Implementada, 64 × 64 píxeles por imagen |
| Recorridos por filas, serpentina e Hilbert | Implementados |
| Firma dinámica de tres intensidades y marcador de píxel | Implementada |
| Repetición, ocupación, mapa de colores y curvas de grupos frecuentes | Implementados |
| Tres partituras espectrales con cursor común | Implementadas como estimación de una componente dominante por banda |
| Marcadores manuales y selección automática de píxeles importantes | Implementados |
| Informe con imágenes, tablas, histogramas y partituras completas | Implementado, con impresión, guardado como PDF desde el navegador y exportación HTML |
| API modular y datos compartidos entre web y servidor | Implementados |
| Consulta de un enlace de imagen GOES para el fondo | Implementada como contexto visual |
| Entrada general de FITS, TIFF, imágenes multibanda, URL y stacks ZIP | Prevista para integrar el flujo completo de imágenes científicas |
| Calibración de radiancia o reflectancia, WCS y ubicación celeste | Previstas cuando las fuentes aporten los metadatos necesarios |
| Síntesis musical desde imágenes, orquestación y exportación MIDI o MusicXML | Parte de la hoja de ruta |

En esta versión, la reproducción utiliza los MP3 existentes. Los colores de las imágenes analizadas proceden de las bandas de esas grabaciones. La imagen GOES de fondo aporta contexto visual y tiene una procedencia independiente del análisis musical.

## 2 Cómo usar la aplicación

### 2.1 Elegir la canción

1. Abre [Órbita Sonora](https://orbidataanalytics.github.io/OrbitaSonora/).
2. Pulsa el botón azul de la rocola para desplegar la lista.
3. Selecciona una pista. Un clic la carga en pausa; el botón verde o un doble clic inicia la reproducción.
4. El botón rojo pausa y la barra de progreso permite buscar otro instante.

![Catálogo y duraciones de las grabaciones del demostrador](docs/img/01-catalogo.png)

*Datos del catálogo. La figura documenta las tres grabaciones, no reproduce los botones de la interfaz.*

| Pista | Referencia artística | Duración analizada |
|---|---|---:|
| End Of Line | Daft Punk, *TRON: Legacy* | 157.106213 s |
| Derezzed | Daft Punk, *TRON: Legacy* | 105.047075 s |
| The Son Of Flynn | Daft Punk, *TRON: Legacy* | 96.037732 s |

### 2.2 Examinar RGB y cada banda

Observa la imagen compuesta y los tres paneles de canal. El marcador identifica la misma posición e intervalo en los cuatro. Cada canal aislado conserva su componente de color y pone las otras dos a cero.

![Imagen RGB y bandas R G B alineadas](docs/img/02-rgb-y-bandas.png)

La opción de descarga guarda cuatro PNG en un ZIP, usando el recorrido elegido. La resolución de los datos es de 64 × 64 píxeles; el lienzo de pantalla amplía su visualización.

### 2.3 Recorrer píxel a píxel

Elige filas, serpentina o Hilbert. Cambia la colocación espacial de las muestras, mientras el orden temporal de la canción se conserva.

- Haz clic en un píxel para buscar el intervalo que representa.
- Con una imagen enfocada, utiliza las flechas para avanzar o retroceder un índice.
- Inicio y Fin llevan al primer y al último píxel.
- En pausa puedes inspeccionar cada paso sin que avance la música.

![La misma secuencia de valores en tres recorridos](docs/img/03-recorridos.png)

*Los tres cuadrados contienen la misma secuencia RGB. La marca señala el mismo tiempo en diferentes coordenadas.*

### 2.4 Leer la firma dinámica

La curva une las tres intensidades del píxel activo. Su eje horizontal es categórico: bajos, medios y altos. Las líneas que conectan los puntos ayudan a leer el perfil; las frecuencias intermedias entre puntos no se han medido como una curva continua en ese gráfico.

![Firma dinámica de tres bandas en un píxel concreto](docs/img/04-firma-dinamica.png)

La intensidad visual está normalizada con una escala común de 70 dB. La frecuencia de una nota se estima mediante un análisis adicional del espectro; no se deduce únicamente del valor RGB.

### 2.5 Localizar repeticiones

Selecciona 4, 8 o 16 niveles por banda y el ámbito de conteo: canción completa o tramo hasta el cursor.

- **Rojo:** grupos de intensidades con mayor ocupación temporal.
- **Verde:** grupos con menor frecuencia positiva.
- **Amarillo:** valores intermedios.
- **Negro:** intervalos excluidos por silencio.
- **Gris:** tramo todavía no contado cuando se trabaja hasta el cursor.

![Mapa de repetición y ocupación de las firmas más frecuentes](docs/img/05-repeticion-y-ocupacion.png)

La tabla permite destacar los píxeles de un grupo y buscar su primera aparición. El conteo mide intervalos ocupados: un grupo sostenido durante dos segundos y dos episodios de un segundo pueden tener la misma ocupación. Volver a reproducir un tramo no aumenta artificialmente su frecuencia.

### 2.6 Seguir las tres partituras

Los pentagramas R, G y B comparten el instante del reproductor. El cursor avanza con el audio y se detiene con él. Hay ventanas de lectura de 8, 12 y 24 segundos; un clic en el pentagrama busca ese tiempo.

![Captura de las tres partituras espectrales sincronizadas](docs/img/06-partituras.jpg)

La altura de cada evento representa una componente espectral dominante. Las barras muestran su duración en segundos; las cruces indican energía sin una altura suficientemente definida. Se usan 8vb en R y 8va en B para facilitar la lectura. Los nombres de nota y los Hz muestran la altura sonora estimada.

### 2.7 Marcar puntos y preparar el informe

1. Señala un píxel de interés y, si lo deseas, escribe una nota.
2. Pulsa **Marcar píxel actual**. Las marcas se conservan en el almacenamiento local de ese navegador.
3. Al final del panel elige la pista actual o las tres canciones.
4. Activa la inclusión de partituras completas si necesitas el recorrido entero.
5. Pulsa **Preparar informe imprimible**. La rocola se pausa durante la preparación.
6. En la vista del informe elige imprimir, guardar PDF mediante el diálogo del navegador o guardar el HTML autónomo.

![Ejemplo resumido de productos del informe](docs/img/07-productos-del-informe.png)

*Resumen construido con datos de la API del demostrador. La figura ilustra imágenes anotadas, estadísticas y trazabilidad; no es una captura del diálogo de impresión.*

El informe emplea la canción completa y la agrupación y recorrido seleccionados. Incluye las cuatro imágenes, puntos numerados, coordenadas, intervalos, estadísticas, histogramas, ocupación, mapa de repetición y resumen de alturas. También puede incorporar las partituras completas y las notas manuales.

## 3 Fundamento físico

### 3.1 Una imagen como medición

Una imagen digital puede representarse como un conjunto de valores por posición:

$$
\mathbf{v}(x,y)=[v_1(x,y),\ldots,v_B(x,y)].
$$

En RGB hay tres componentes. Una imagen monocromática aporta una, mientras que un stack o cubo puede aportar muchas. Para comparar una misma posición entre capas se necesita una geometría común.

En un sensor, cada banda recoge una respuesta integrada sobre una región del espectro electromagnético. Un modelo simplificado es:

$$
y_b(x,y)=\int R_b(\lambda)L(x,y,\lambda)\,d\lambda+\varepsilon_b,
$$

donde $R_b$ es la respuesta espectral de la banda, $L$ la radiancia y $\varepsilon_b$ el término de error. La conversión del número digital a radiancia o reflectancia depende de la calibración del instrumento y de los metadatos del producto.

Por ello, los valores de una fotografía RGB describen tres canales de esa imagen. La identificación de materiales mediante una firma física necesita unidades, respuesta del sensor y referencias apropiadas, como las bibliotecas espectrales del USGS [1].

### 3.2 Dos significados de espectro

| Dominio | Eje espectral | Magnitudes habituales |
|---|---|---|
| Imagen científica | Longitud de onda o frecuencia electromagnética | Radiancia, reflectancia, flujo o cuentas calibradas |
| Señal acústica | Frecuencia de oscilación en Hz | Amplitud, potencia o densidad espectral de potencia |
| Perfil RGB del demostrador | Tres categorías de banda | Intensidades visuales derivadas de potencia acústica |

La relación $c=\lambda\nu$ describe la radiación electromagnética. La sonificación establece una función de representación que lleva variables de los datos a parámetros audibles. La asignación entre rojo y bajos, verde y medios, azul y altos es una decisión de diseño documentada.

### 3.3 Las bandas acústicas utilizadas

| Canal visual | Banda acústica | Guarda siguiente |
|---|---:|---:|
| R | 20–250 Hz | 250–350 Hz |
| G | 350–500 Hz | 500–600 Hz |
| B | 600–20 000 Hz | — |

![Bandas de audio y guardas utilizadas por el análisis](docs/img/fundamento-bandas.png)

Las guardas tienen 100 Hz cada una. El análisis omite los bins situados fuera de las bandas elegidas. La ventana temporal introduce una resolución finita y fuga espectral, por lo que los límites no se comportan como filtros ideales.

La fuente se decodificó a 44 100 muestras por segundo. Su límite de Nyquist es 22 050 Hz, suficiente para incluir el extremo de 20 000 Hz de la configuración. Otras fuentes requieren revisar su frecuencia de muestreo antes de adoptar los mismos límites.

## 4 Fundamento matemático del demostrador

### 4.1 Transformada de Fourier de tiempo corto

La STFT permite describir cómo varía el contenido frecuencial de una señal no estacionaria [2, 3]:

$$
X_c(m,k)=\sum_{n=0}^{N-1}x_c[n+mH]w[n]e^{-j2\pi kn/N},
\qquad f_k=\frac{k f_s}{N}.
$$

Aquí $c$ identifica el canal de audio, $N$ la longitud de ventana, $H$ el paso y $w[n]$ la ventana Hann. La estimación unilateral de densidad espectral de potencia, promediada entre canales, sigue la forma:

$$
S(m,k)=\frac{1}{C}\sum_{c=1}^{C}
\frac{\kappa_k|X_c(m,k)|^2}{f_s\sum_n w[n]^2},
$$

con $\kappa_k=2$ en las frecuencias interiores positivas y $\kappa_k=1$ para DC y Nyquist.

La potencia integrada de una banda $b$ es:

$$
P_b(m)\approx\sum_{k:\,f_{b,\min}\leq f_k\leq f_{b,\max}}
S(m,k)\Delta f,
\qquad \Delta f=\frac{f_s}{N}.
$$

Se promedian las potencias de los canales estéreo antes de resumirlas por intervalo temporal de píxel. Las bandas tienen anchos diferentes: se compara potencia integrada por banda, no densidad media por Hz.

### 4.2 Potencia y color

Para una canción de duración $T$ y $M$ píxeles, el intervalo del píxel $i$ es:

$$
\mathcal{I}_i=\left[\frac{iT}{M},\frac{(i+1)T}{M}\right),
\qquad i=0,\ldots,M-1.
$$

La potencia media de banda dentro de ese intervalo se transforma a decibelios y luego a una intensidad visual:

$$
L_b(i)=10\log_{10}\left(\max(\overline{P_b}(i),\epsilon)\right),
$$

$$
u_b(i)=\operatorname{clip}\left(
\frac{L_b(i)-(L_{\mathrm{ref}}-70)}{70},0,1\right),
\qquad Q_b(i)=\operatorname{round}(255u_b(i)).
$$

$L_{\mathrm{ref}}$ corresponde al máximo de potencia de banda entre las tres canciones e intervalos del conjunto. Se conserva una referencia común para comparar canales. Los intervalos declarados sin energía se representan en negro.

El píxel compuesto es $[Q_R(i),Q_G(i),Q_B(i)]$. Los aislados son $[Q_R,0,0]$, $[0,Q_G,0]$ y $[0,0,Q_B]$; su suma componente a componente reproduce el RGB.

### 4.3 Posición, recorrido y sincronización

Una función de recorrido $p(i)=(x_i,y_i)$ asigna cada índice temporal a una posición. En filas, para ancho $W$:

$$
x_i=i\bmod W,\qquad y_i=\left\lfloor\frac{i}{W}\right\rfloor.
$$

La serpentina invierte el sentido en filas alternas. Hilbert conserva vecindad entre pasos consecutivos en una grilla de lado potencia de dos. Todos recorren una vez los 4096 píxeles de la grilla actual de 64 × 64.

El índice activo se obtiene del tiempo del reproductor:

$$
i(t)=\min\left(M-1,\left\lfloor\frac{t}{T}M\right\rfloor\right).
$$

`web/js/reloj.js` lee `audio.currentTime` y comparte ese instante e índice con los paneles. La actualización gráfica sigue al audio al pausar, buscar, cambiar de pista o modificar la velocidad. La pantalla puede omitir fotogramas; la posición se calcula de nuevo a partir del tiempo real, sin acumular un cronómetro independiente.

### 4.4 Qué resolución tiene realmente

| Análisis | Ventana | Paso | Resolución frecuencial nominal a 44 100 Hz |
|---|---:|---:|---:|
| Intensidad de bandas | 8192 muestras, unos 186 ms | 512 muestras | 5.38 Hz |
| Componente tonal dominante | 16384 muestras, unos 372 ms | 1024 muestras | 2.69 Hz |

Cada píxel ocupa unos 23–38 ms según la canción. Estos pasos muestrean una estimación suavizada; la duración de ventana limita la independencia temporal de las medidas y la localización de ataques. La interpolación o el aumento del tamaño de pantalla no añaden resolución física.

### 4.5 Repetición y ocupación

Con $K\in\{4,8,16\}$ niveles por banda se construye el grupo:

$$
g_b(i)=\min\left(K-1,\left\lfloor\frac{KQ_b(i)}{256}\right\rfloor\right),
\qquad \mathbf{g}(i)=[g_R(i),g_G(i),g_B(i)].
$$

Para un grupo $g$:

$$
n_g=\#\{i:\mathbf{g}(i)=g,\ i\text{ activo}\},
\qquad O_g=100\frac{n_g}{N_{\mathrm{activos}}},
\qquad D_g=n_g\frac{T}{M}.
$$

$O_g$ es ocupación porcentual y $D_g$ duración acumulada. Los grupos reúnen intensidades parecidas; su igualdad no exige formas de onda ni contenidos musicales idénticos. El gradiente verde–amarillo–rojo representa el conteo relativo entre el mínimo y máximo del ámbito seleccionado.

### 4.6 Estadísticas y puntos importantes

El informe calcula mínimo, máximo, media, mediana, desviación estándar poblacional, percentiles 5 y 95 e histogramas para cada canal. Por ejemplo:

$$
\mu_b=\frac{1}{M}\sum_i Q_b(i),
\qquad \sigma_b=\sqrt{\frac{1}{M}\sum_i(Q_b(i)-\mu_b)^2}.
$$

Los puntos automáticos se eligen por máximos de R/G/B, máximo de la media visual conjunta, mayor cambio entre vectores consecutivos y primera aparición del grupo más frecuente. El cambio se cuantifica mediante:

$$
d_i=\|\mathbf{Q}(i)-\mathbf{Q}(i-1)\|_2.
$$

Los máximos de intensidad visual conjunta resumen valores transformados a color; las potencias físicas se describen con sus propias magnitudes y unidades. Las marcas manuales se añaden como observaciones trazables.

### 4.7 Extracción de las notas

Se identifica un pico dentro de cada banda, se interpola su posición y se evalúan prominencia, concentración de energía y planitud espectral. Después se suaviza la secuencia y se agrupan eventos. Los eventos tonales inferiores a 0.10 s se indican sin altura definida.

La frecuencia dominante se aproxima a una nota de temperamento igual:

$$
m=\operatorname{round}\left(69+12\log_2\frac{f_{\mathrm{pico}}}{440}\right).
$$

En mezclas musicales, ese pico puede corresponder a un armónico o a otro instrumento. La cobertura de altura definida mide cuánto tiempo el criterio asigna una nota; no es un porcentaje de exactitud de transcripción. Las partituras actuales representan una voz dominante por banda, con duraciones proporcionales en segundos y sin compás o tempo inferidos.

## 5 Firmas de imágenes científicas y sonificación

Esta sección describe el modelo científico de ampliación del producto. Su integración debe conservar la procedencia, las unidades y las transformaciones del dato.

### 5.1 Preparar y comparar una firma

Para una imagen multibanda o un stack alineado, el recorrido extrae $\mathbf{v}(p(i))$. Cada valor debe conservar su significado: cuentas, intensidad, radiancia, reflectancia u otra magnitud documentada. Las comparaciones entre imágenes necesitan revisar geometría, calibración y unidades.

Una normalización explícita puede usar límites $a_b$ y $z_b$, definidos por calibración o percentiles:

$$
q_b(i)=\operatorname{clip}\left(\frac{v_b(p(i))-a_b}{z_b-a_b},0,1\right).
$$

Se requiere $z_b>a_b$. Los límites deben registrarse junto a la serie original. Si cada imagen se normaliza con referencias diferentes, cambia la interpretación de la comparación entre ellas.

Como extensión de análisis, dos firmas no nulas y comparables pueden contrastarse por distancia o ángulo:

$$
d(\mathbf{v},\mathbf{w})=\|\mathbf{v}-\mathbf{w}\|_2,
\qquad
\theta=\arccos\frac{\mathbf{v}\cdot\mathbf{w}}{\|\mathbf{v}\|_2\|\mathbf{w}\|_2}.
$$

Estas métricas amplían el marco de comparación. El agrupamiento actual de la aplicación utiliza la cuantización RGB descrita en la sección 4.5.

### 5.2 Convertir valores en parámetros audibles

La sonificación es una representación de datos mediante sonido. El mapeo puede vincular intensidad, posición o variación temporal con frecuencia, amplitud, duración, timbre y posición estéreo [4, 5].

Un ejemplo de mapeo logarítmico de una variable normalizada a frecuencia es:

$$
f_b(i)=f_{b,\min}\left(\frac{f_{b,\max}}{f_{b,\min}}\right)^{q_b(i)}.
$$

Para un intervalo $i$, un modelo elemental de síntesis por voces sería:

$$
s(t)=\sum_b A_b(i)\,h(t-t_i)\,
\sin\left(2\pi f_b(i)(t-t_i)+\phi_b\right),
$$

donde $A_b$ regula amplitud, $h$ define una envolvente y $\phi_b$ la fase. Un motor práctico debe tratar continuidad, transiciones, mezcla y saturación. Esta ecuación ilustra un diseño de sonificación; el reproductor del demostrador actual utiliza las grabaciones MP3 y no ejecuta ese sintetizador desde una imagen cargada.

### 5.3 Decisiones artísticas documentadas

La composición puede organizar una voz por canal o capa, elegir instrumentos, escalas, registros, ritmo, envolventes y panoramización. Una cuantización musical puede adaptar las alturas a una escala elegida y una armonización puede construir relaciones entre voces.

El registro del experimento debe identificar qué valores proceden de la medición y qué transformaciones pertenecen a la creación artística. Así se pueden comparar resultados entre un recorrido más directo de los datos y una interpretación musical con mayor intervención del compositor.

## 6 Qué se obtiene y para qué sirve

| Producto | Uso posible |
|---|---|
| RGB y tres bandas aisladas | Comparar distribución temporal de intensidad y relaciones entre canales |
| Recorrido y cursor sincronizados | Revisar un instante y relacionarlo con sus valores visuales y sonoros |
| Firmas y grupos de repetición | Explorar perfiles frecuentes, cambios y ocupación temporal |
| Mapa de colores | Ubicar espacialmente los grupos definidos por el análisis |
| Partituras espectrales | Inspeccionar componentes dominantes y apoyar actividades didácticas sobre frecuencia y altura |
| Píxeles automáticos y marcas manuales | Documentar observaciones, contrastes y puntos a revisar |
| Informe HTML o impresión PDF | Compartir resultados, método, estadísticas, fuentes y configuraciones |
| Datos JSON y API | Integrar consultas y comprobaciones con otras herramientas |
| Flujo futuro de imágenes y sonificación | Explorar observaciones astronómicas, datos terrestres y composición basada en datos |

Los usos incluyen docencia de física y procesamiento de señales, talleres del Semillero, divulgación científica, experiencias de museos y planetarios, exploración multimodal y creación sonora. El diseño permite investigar apoyos de accesibilidad; su eficacia requiere evaluación con usuarios y tareas concretas.

La forma de la imagen depende del recorrido elegido. Los colores son una representación diseñada y la repetición se refiere a un criterio de agrupamiento declarado. Las conclusiones sobre fenómenos físicos requieren datos adecuados y validación específica.

## 7 Web y servicios de Render

La web se publica en [GitHub Pages](https://orbidataanalytics.github.io/OrbitaSonora/). La API utiliza [FastAPI en Render](https://orbitasonora.onrender.com/). Los archivos `datos/pixeles.json` y `datos/partituras.json` contienen el análisis preparado de las tres fuentes y son compartidos por la web y la API.

La dirección de Render es **`https://orbitasonora.onrender.com`**, sin guion entre las palabras. La comprobación realizada para esta documentación confirmó respuestas HTTP 200 en estado, metadatos, catálogo, GOES y OpenAPI, con la API modular 3.0.0. Esta comprobación describe el momento de revisión y no constituye una garantía continua de disponibilidad.

| Recurso | Función |
|---|---|
| [Estado](https://orbitasonora.onrender.com/) | Indicar que el servidor responde |
| [Metadatos](https://orbitasonora.onrender.com/api/datos) | Proyecto, organización y referencias del catálogo |
| [Catálogo](https://orbitasonora.onrender.com/api/canciones) | Duraciones, bandas, resolución y huellas de fuente |
| [Análisis de una pista](https://orbitasonora.onrender.com/api/analisis/end-of-line) | Intensidades y actividad por píxel, con metadatos |
| [Estado en un instante](https://orbitasonora.onrender.com/api/estado/end-of-line?tiempo=30&recorrido=filas) | Píxel, coordenadas, RGB y eventos de partitura |
| [Ocupación](https://orbitasonora.onrender.com/api/ocupacion/end-of-line) | Conteo de firmas agrupadas |
| [Imagen RGB](https://orbitasonora.onrender.com/api/imagenes/end-of-line/RGB.png?recorrido=filas) | PNG calculado por el servicio |
| [Partituras](https://orbitasonora.onrender.com/api/partituras/end-of-line) | Eventos y método de extracción |
| [Datos del informe](https://orbitasonora.onrender.com/api/informe/end-of-line?recorrido=filas) | Estadísticas y puntos importantes |
| [Consulta GOES](https://orbitasonora.onrender.com/api/goes) | Enlace de imagen y metadatos declarados para el fondo |
| [Swagger UI](https://orbitasonora.onrender.com/docs) | Explorar y probar las rutas |
| [OpenAPI](https://orbitasonora.onrender.com/openapi.json) | Contrato de la API |

Los ejemplos utilizan los ocho niveles predeterminados del servicio. Las observaciones de validación de parámetros y despliegue están en [la comprobación de API](docs/ESTADO_API.md).

Los identificadores de canción son `end-of-line`, `derezzed` y `the-son-of-flynn`. Las coordenadas e índices de API comienzan en cero; la interfaz y el informe muestran números de píxel, columnas y filas desde uno.

```bash
curl "https://orbitasonora.onrender.com/api/estado/end-of-line?tiempo=30&recorrido=filas"
curl "https://orbitasonora.onrender.com/api/informe/end-of-line?recorrido=hilbert&marcados=0,101"
```

El estado remoto acepta un tiempo para consultar el análisis; el reloj de reproducción pertenece al navegador. Las marcas y sus notas se incorporan localmente al informe web.

### 7.1 Contexto de las imágenes GOES

El endpoint conserva la etiqueta y el enlace GOES-16 de la configuración inicial. NOAA documenta que GOES-19 sustituyó a GOES-16 como GOES-East en abril de 2025 [6]. Para describir una imagen como actual se debe comprobar su fecha, fuente y plataforma efectiva. El JSON de estado de la aplicación, por sí solo, no verifica la actualidad de una captura satelital.

## 8 Organización modular e instalación

| Carpeta o archivo | Responsabilidad |
|---|---|
| `main.py` | Punto de entrada de la API |
| `api/rutas/` | Rutas de sistema, canciones, partituras e informes |
| `api/servicios/` | Análisis, eventos de partitura y estadísticas |
| `web/js/reproductor.js` | Rocola, audio y controles |
| `web/js/reloj.js` | Reloj compartido de reproducción |
| `web/js/imagenes.js` | Imágenes, firmas y ocupación |
| `web/js/partituras.js` y `notacion.js` | Notación y actualización de pentagramas |
| `web/js/informes.js` y `estadisticas.js` | Marcas, cálculos, informe e impresión |
| `web/css/` | Estilos separados por responsabilidad |
| `datos/` | Análisis preparado y eventos de partitura |
| `imagenes_pixel/` | Exportaciones de RGB y bandas |
| `audio/` | Grabaciones utilizadas por el demostrador |

Consulta [la arquitectura](ARQUITECTURA.md) y [las instrucciones de instalación](LEER_PRIMERO.md). Para utilizar la versión modular se necesita la estructura completa del proyecto.

### 8.1 Ejecutar FastAPI

```bash
python -m venv .venv
# Linux o macOS
source .venv/bin/activate
# En Windows PowerShell, utiliza .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

La API responde en `http://localhost:8000/`. Si los archivos web y los MP3 están junto al proyecto, la página se puede abrir en `http://localhost:8000/rocola`.

En Render:

```text
Build Command  pip install -r requirements.txt
Start Command  uvicorn main:app --host 0.0.0.0 --port $PORT
```

El paquete de ejecución utiliza FastAPI y Uvicorn. Los JSON ya contienen el análisis preparado; regenerar datos para nuevas grabaciones requiere el procesamiento del audio correspondiente.

### 8.2 Verificar la instalación

```bash
pip install -r requirements-dev.txt
python pruebas/verificar.py
```

Las comprobaciones revisan rutas, parámetros, recorridos, imágenes, correspondencia entre tiempos y eventos, informes y acceso por rangos al audio.

## 9 Desarrollo y participación

El siguiente crecimiento del producto incluye la entrada y calibración de imágenes científicas, stacks alineados, metadatos astronómicos, sonificación multivoz y formatos de intercambio musical. Cada ampliación debe registrar origen, unidades, parámetros y límites de interpretación.

Para contribuir, describe la función o problema, adjunta un caso reproducible y señala qué módulo afecta. Las modificaciones de mapeo, normalización o agrupamiento deben explicar cómo cambian los valores o su interpretación.

La perspectiva del proyecto integra análisis de datos, desarrollo web, instrumentación, astronomía, composición y diseño de experiencias. Su contexto académico es el Semillero de Astronomía ITM y su identidad empresarial es ORBIDATA ANALYTICS.

## 10 Licencia y créditos

El código del proyecto se publica bajo **Apache License, Version 2.0**, identificador SPDX **`Apache-2.0`**. Consulta el texto completo en [LICENSE](LICENSE) y las atribuciones de [NOTICE](NOTICE).

La licencia permite usar, modificar y distribuir el software, incluyendo usos comerciales, respetando sus condiciones de licencia, avisos y atribución de cambios [7]. Las licencias de grabaciones, datasets, imágenes o marcas de terceros conservan sus propias condiciones.

- **Empresa y producto:** ORBIDATA ANALYTICS · Órbita Sonora.
- **Comunidad académica:** Semillero de Astronomía, Instrumentación y Ciencias Espaciales del ITM, Semillero de Astronomía ITM.
- **Identidad visual:** logos originales del equipo, conservados sin modificaciones en esta documentación.
- **Demostración musical:** pistas de Daft Punk de *TRON: Legacy*, utilizadas como fuentes del análisis entregado.
- **Fuentes y referencias externas:** documentación de NOAA, USGS, Chandra, SciPy, GitHub y Apache Software Foundation.

## 11 Referencias

1. Kokaly, R. F., Clark, R. N., Swayze, G. A., Livo, K. E., Hoefen, T. M., Pearson, N. C., Wise, R. A., Benzel, W. M., Lowers, H. A., Driscoll, R. L., & Klein, A. J. (2017). *USGS spectral library version 7* (Data Series 1035). U.S. Geological Survey. https://doi.org/10.3133/ds1035
2. Smith, S. W. (1997). *The scientist and engineer's guide to digital signal processing*. California Technical Publishing. ISBN 978-0-9660176-3-2. https://www.dspguide.com/
3. SciPy Developers. (s. f.). *Short-Time Fourier Transform*. Documentación de SciPy. https://docs.scipy.org/doc/scipy/tutorial/signal.html#short-time-fourier-transform
4. Hermann, T., Hunt, A., & Neuhoff, J. G. (Eds.). (2011). *The sonification handbook*. Logos Verlag Berlin. ISBN 978-3-8325-2819-5. https://sonification.de/handbook/
5. Chandra X-ray Center. (s. f.). *A universe of sound*. Smithsonian Astrophysical Observatory. https://chandra.harvard.edu/sound/listen.html
6. National Environmental Satellite, Data, and Information Service. (2025, 7 de abril). *NOAA’s GOES-19 now operational as GOES East, providing critical new data to forecasters*. NOAA. https://www.nesdis.noaa.gov/news/noaas-goes-19-now-operational-goes-east-providing-critical-new-data-forecasters
7. Apache Software Foundation. (2004). *Apache License, Version 2.0*. https://www.apache.org/licenses/LICENSE-2.0

*Documentación preparada para la versión modular del demostrador. Los bocetos se identifican como conceptuales; las figuras de análisis emplean datos de las grabaciones del catálogo y la captura de partituras corresponde a la interfaz del proyecto.*
