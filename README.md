# Cartón & Ideas

Juego de plataformas sencillo en HTML, CSS y JavaScript. Rollo es un robot de tubos de papel higiénico, botones y palitos de manualidades. Recorre colinas cartoon inspiradas en el fondo de Windows XP. Todos los gráficos son dibujos originales generados con Canvas y SVG; no necesita imágenes externas, librerías ni instalación.

## Probarlo en tu computador

1. Abre `index.html` con doble clic en Chrome, Edge o Firefox.
2. Pulsa **¡Vamos a crear!**.
3. Muévete con **← / →** o **A / D**. Salta con **espacio**, **W** o **↑**. Pausa con **Escape**.
4. Pisa los enemigos desde arriba. Recoge la estrella que dejan para abrir una reflexión con imagen.
5. Cierra la reflexión con **Continuar** o **Escape**. Puedes consultar las recogidas con **Mis reflexiones**.

En dispositivos táctiles usa los botones inferiores. Tocar a un enemigo de lado provoca derrota inmediata. La pantalla muestra **“Fuiste victima del bloqueo creativo”** y su botón vuelve al inicio, donde comienza una partida nueva.

Al vencer al quinto enemigo ya ganaste: puedes recoger las estrellas pendientes o pulsar **Ⅱ** para abrir la celebración. Al cerrar la última reflexión recogida se abre automáticamente la pantalla de victoria. Desde allí las cinco reflexiones quedan disponibles, incluso si no recogiste alguna estrella. **Jugar de nuevo** borra el progreso de la partida anterior.

## Subirlo a GitHub Pages

1. Crea un repositorio en GitHub y sube `index.html`, `styles.css`, `engine.js` y `game.js` a la raíz. También puedes subir el README y los tests.
2. En el repositorio abre **Settings → Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Elige la rama donde subiste los archivos (normalmente `main`) y la carpeta **/(root)**; pulsa **Save**.
5. Cuando termine la publicación, abre el enlace indicado en Pages, normalmente `https://TU-USUARIO.github.io/TU-REPOSITORIO/`.

No requiere build, npm, servidor de aplicación ni claves. Las rutas son relativas para funcionar en un subdirectorio de GitHub Pages. Si lo agregas dentro de otro sitio, conserva los cuatro archivos juntos y visita el `index.html` de esa carpeta.

Referencia: [configurar la publicación en GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Comprobación breve

Con Node.js instalado ejecuta:

```sh
node tests/engine.test.cjs
```

Comprueba movimiento, salto, aterrizaje en plataformas, pisotón, golpe lateral, powerups, pausa, cinco enemigos y reinicio. Para una comprobación manual rápida: pierde tocando un enemigo, vuelve a empezar y salta sobre el primero; abre su reflexión y comprueba que el juego se detiene mientras lees.

## Personalizar

- Cambia los textos y colores en `reflections`, al principio de `engine.js`.
- Ajusta los gráficos en `game.js` y el estilo de la página en `styles.css`.
- No hay guardado permanente: recargar la página empieza de cero.
