# Pruebas y capturas

- `engine.test.cjs`: 49 comprobaciones rápidas del motor. Ejecutar con `node tests/engine.test.cjs`.
- `browser-smoke.cjs`: prueba breve en Edge usando Playwright. Ejecutar con `node tests/browser-smoke.cjs` cuando Playwright esté disponible.

Las capturas se regeneran con la prueba de navegador:

| Archivo | Contenido |
|---|---|
| `preview-desktop.png` | Nueva introducción y título en computador |
| `preview-mobile.png` | Nueva introducción y título en móvil |
| `gameplay-desktop.png` / `gameplay-mobile.png` | Escenario jugable y controles |
| `reflection-desktop.png` | Reflexión con imagen del Word en computador |
| `reflection-1-mobile.png` a `reflection-5-mobile.png` | Las cinco reflexiones en móvil |
| `victory-desktop.png` / `victory-mobile.png` | Pantalla de victoria |

Las capturas de móvil muestran la página completa; pueden ser más altas que la pantalla porque la página permite desplazarse. Las imágenes de las reflexiones se muestran completas, con `object-fit: contain`.

- `signs-desktop.png` / `signs-mobile.png`: cartel fijo y legible junto al pozo.
- `after-pit-desktop.png` / `after-pit-mobile.png`: vista después de pasar el cartel.

Las comprobaciones incluyen la duración de la protección de pies, la ausencia de puentes, el salto completo sobre los tres pozos, la separación de objetivos entre grises y principales, los nombres por categoría y los mensajes de derrota.

- `colors-desktop.png` / `colors-mobile.png`: comparación del principal verde saturado y los enemigos grises en el escenario.
