# Speaker's Corner Consultora

Sitio web institucional de Speaker's Corner Consultora. Single-page estática construida en HTML/CSS/JS vanilla, lista para servir desde GitHub Pages.

**Live:** https://ctiraferri.github.io/speakerscornerwebsite/

## Estructura

```
.
├── index.html            # Página única con todas las secciones
├── css/
│   ├── tokens.css        # Tipografía + tokens de color
│   ├── kit.css           # Componentes base (nav, hero, botones, secciones)
│   └── site.css          # Animaciones, ticker, proceso, FAQ, etc.
├── js/
│   └── app.js            # Reveal, counters, typing, scroll-spy, quote rotator, FAQ
├── assets/               # Imágenes (logo, megáfono, iconos, foto directores)
├── fonts/                # Fuentes Lato (woff2)
└── .nojekyll             # Evita procesamiento Jekyll en GitHub Pages
```

## Desarrollo local

No requiere build step. Abrir `index.html` directamente en el navegador o servir con cualquier server estático:

```bash
# opcional, con Python
python -m http.server 8080
# luego http://localhost:8080
```

## Deploy a GitHub Pages

El repo ya está configurado. Cualquier push a `main` se publica automáticamente. Para activar Pages la primera vez: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)`**.

## Créditos

- Diseño base: bundle exportado desde Claude Design (handoff HTML/CSS/JS).
- Contenido: sitio existente en https://www.speakerscorner.com.ar/.
