---
name: contraste-colores
description: Calcula el contraste WCAG entre los colores de los tokens del proyecto (hex, rgb, hsl u oklch) y, cuando un par no llega a 4,5 a 1 en texto o 3 a 1 en interfaz, sugiere el ajuste mínimo de luminosidad que mantiene el tono. Úsalo cuando la persona cambie la paleta, agregue un color, pregunte si un texto se lee bien o antes de aprobar un tema claro u oscuro.
argument-hint: "[ruta al archivo de tokens]"
---

# Contraste de colores

Mides los **tokens**, no pantallas: así un problema se arregla una vez y se arregla en todo el
sitio. Mínimos de WCAG 2.2 AA:
- Texto normal: **4,5:1** (1.4.3).
- Texto grande (24 px, o 18,66 px en negrita): **3:1**.
- Componentes de interfaz y gráficos (bordes de campos, íconos, indicador de foco): **3:1**
  (1.4.11).

## 1. Corre el cálculo
```bash
node ${CLAUDE_SKILL_DIR}/scripts/contraste.mjs --tokens <archivo>
```
Si no das archivo, busca `src/styles/tokens.css` y otros lugares comunes. El script:
- Lee las variables `--color-*` (hex, `rgb()`, `hsl()`, `oklch()`), resuelve `var(--otro)` y
  separa tema claro y modo oscuro (`prefers-color-scheme: dark`, `.dark` o `[data-theme=dark]`).
- Arma los pares por nombre: tokens de texto (`texto`, `text`, `foreground`, `contraste`, `foco`,
  `enlace`…) sobre tokens de fondo (`fondo`, `background`, `superficie`, `tarjeta`…), y
  `--color-X-contraste` sobre `--color-X`.
- Para cada par que falla, sugiere un color con la **misma tonalidad** y la luminosidad más
  cercana que cumple (en `oklch()` y hex), y además **un solo valor por token** que pasa contra
  todos los fondos con que se mide (ese es el que conviene proponer: un token, un cambio).

Si los nombres no siguen ese patrón, crea `.kit/contraste.json` con los pares reales:
```json
[{"texto": "--color-gris-500", "fondo": "--color-blanco", "tipo": "texto"},
 {"texto": "--color-borde-campo", "fondo": "--color-blanco", "tipo": "ui"}]
```
y corre con `--pares .kit/contraste.json`. Para explorar una paleta nueva: `--todos`.

## 2. Revisa lo que el script no ve
- Texto sobre **imágenes o degradados**: captura la sección y mira el peor punto.
- Texto con **opacidad** o colores puestos a mano fuera de los tokens (búscalos con Grep:
  `#[0-9a-fA-F]{3,8}`, `rgb(`, `text-[#`).
- Estados: `hover`, `disabled` (los deshabilitados están exentos, pero deben distinguirse),
  placeholder (sí debe cumplir si da información).

## 3. Informe y propuesta
| Par | Ahora | Mínimo | Sugerencia | Dónde se usa |
|---|---|---|---|---|

- Para «dónde se usa», busca con Grep las clases (`text-texto-suave`) y `var(--color-...)`.
- **No cambies colores de marca sin preguntar.** Ofrece opciones: oscurecer el token, usar el
  color solo para texto grande, o crear un token nuevo (`--color-acento-texto`) para texto
  pequeño y dejar el original para fondos y bordes.
- Si la persona aprueba, cambia el token (un solo lugar), corre de nuevo el script y muestra que
  pasa.
