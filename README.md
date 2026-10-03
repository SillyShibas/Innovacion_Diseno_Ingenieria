# Escuchar para iterar

Juego de plataformas en HTML, CSS y JavaScript sobre el diseño en ingeniería. Ayuda a CaseroBot a perseverar, superar a cinco enemigos y descubrir las reflexiones del portafolio. Conserva el paisaje de colinas y la interfaz cartoon.

## Probarlo

1. Abre `index.html` con doble clic en Chrome, Edge o Firefox.
2. Pulsa **¡Vamos a crear!**.
3. Muévete con **← / →** o **A / D**; salta con **Espacio**, **W** o **↑**. Pulsa **Escape** para pausar. En móvil usa los botones inferiores.
4. Pisa los enemigos desde arriba. Recoge sus estrellas para leer las reflexiones con las fotografías e imágenes originales del Word.

Los enemigos persiguen, saltan a las plataformas, preparan un dash con ojos rojos y dejan una estela roja. El dash puede repetirse una vez cada seis segundos por enemigo; también tienen un barrido de corto alcance. El nivel mide 6.400 píxeles y tiene dieciséis plataformas, grupos de dos a cuatro pinchos por plataforma, sin pinchos en el suelo, y tres pozos señalizados: culturales, emocionales y perceptuales. Los pozos no tienen puentes: se cruzan saltando desde el suelo. Los carteles tienen posiciones fijas, independientes de los enemigos.

Los principales reciben nombres aleatorios de su categoría al comenzar; solo se revelan si te eliminan: **“Has sido victima de un bloqueo creativo <categoría> por <causa>”**. El contacto con un enemigo gris o con pinchos muestra **“Has sido victima de las malas decisiones de diseño”**. Caer en un pozo muestra **“Has sido victima de un bloqueo cultural/emocional/perceptual.”**, según el pozo. El botón vuelve al inicio y reinicia la partida. Hay entre tres y cuatro enemigos grises en el suelo por tramo (uno o dos menos que antes) (cantidad aleatoria): solo patrullan, pueden saltar a las plataformas bajas, no atacan y se eliminan pisándolos. No dan reflexiones ni cuentan para la victoria. Los cinco principales se acercan por los costados para atacar y evitan pinchos. Después de caer sobre una plataforma, la zona de ataque de los pies permanece activa durante 0,5 segundos; no protege el torso ni los laterales. Al vencer a los cinco enemigos ya ganaste: recoge las estrellas pendientes o pulsa **Ⅱ** para abrir la celebración. Cerrar la última reflexión recogida abre la celebración automáticamente. La galería final permite revisar las cinco reflexiones, incluso si dejaste alguna estrella pendiente. Recargar empieza desde cero.

## Publicar en GitHub Pages

Sube estos archivos y carpetas juntos, respetando sus nombres:

- `index.html`
- `styles.css`
- `reflections.js`
- `engine.js`
- `game.js`
- `assets/reflections/` con sus cinco imágenes
- `.nojekyll`

Después, en **Settings → Pages → Build and deployment**, elige **Deploy from a branch**, la rama que contiene los archivos y **/(root)**; pulsa **Save**. Abre el enlace que indique Pages cuando termine la publicación. Si están en una subcarpeta de otro sitio, abre el `index.html` de esa carpeta.

No requiere npm, compilación ni servidor de aplicación. Todas las rutas son relativas y no hay imágenes ni fuentes descargadas desde servicios externos.

Referencia: [configuración de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Comprobaciones breves

Con Node.js:

```sh
node tests/engine.test.cjs
```

Son 45 comprobaciones de física, colisiones, dash, recarga, alcance de ataque, navegación, hazards, powerups, pausa, victoria y reinicio.

La comprobación opcional de navegador usa Playwright y Microsoft Edge:

```sh
node tests/browser-smoke.cjs
```

Revisa los flujos principales y el diseño a 1280, 390 y 320 píxeles. Regenera las capturas de `tests/`. Playwright debe estar disponible para Node; el juego no depende de él.

## Contenido

`reflections.js` contiene los títulos y los textos completos importados del Word actualizado, junto con las rutas de sus imágenes. La imagen aparece debajo del texto, completa y conservando sus proporciones. En pantallas pequeñas las ventanas permiten desplazarse para acceder a todo el contenido. Las reflexiones y los menús detienen la simulación, incluidos los tiempos de los ataques.

Las plataformas bajas están elevadas 25 píxeles. La protección de 0,5 segundos ocupa una franja estrecha en los pies: no alcanza a los grises que pasan por debajo. Los cinco principales usan colores saturados propios, independientes de las imágenes de las reflexiones.

Los principales detectan al jugador a 1.200 píxeles (antes 600). Usan un salto bajo de aproximadamente 108 píxeles y otro alto de aproximadamente 189 píxeles: eligen según la superficie objetivo y pueden alcanzar directamente las plataformas altas desde el suelo. Los grises usan el salto bajo para subir plataformas cercanas durante su patrulla, sin perseguir ni atacar.

Cada plataforma tiene un 60 % de probabilidad de empezar con un gris, con un máximo de uno por plataforma. Los pinchos forman un grupo contiguo de 2 a 4 en una posición aleatoria dentro de cada plataforma, dejando espacio seguro. Los enemigos saltan los grupos que están en su camino y solo saltan si existe un aterrizaje seguro. El dash tiene prioridad cuando el especial está apoyado, dentro del rango y con su recarga disponible; se detiene antes de los bordes, pozos o pinchos y nunca se inicia en el aire. El encabezado muestra «Taller En Énfasis 1».

Los grises tienen una recarga de salto de 1,5 segundos, también al esquivar pinchos. Las plataformas son 30 píxeles más anchas. Ambos tipos de enemigo pueden trasladarse entre plataformas y bajar a una superficie segura. Las plataformas reservan como máximo un gris; si dos coinciden, el sobrante busca bajar inmediatamente. El contacto de una cabeza contra los pies en el aire se detecta mediante su movimiento relativo, incluso durante el ascenso del jugador, conservando la zona estrecha y los 0,5 segundos al aterrizar.

La espada de los principales solo hace daño 0,15 segundos después de dibujarse por primera vez en pantalla. La animación se mantiene visible durante la ventana de daño.

Al saltar por debajo de un grupo de pinchos, el tablero de la plataforma detiene la cabeza tanto del jugador como de los enemigos. Los tramos libres siguen permitiendo subir a través de la plataforma; los pinchos mantienen el daño al tocarlos desde arriba.

El dash se inicia a una distancia de 180 a 320 píxeles, dejando 20 píxeles de margen respecto a sus 340 píxeles de desplazamiento máximo. Si el jugador está más lejos, el especial se acerca antes de prepararlo.
