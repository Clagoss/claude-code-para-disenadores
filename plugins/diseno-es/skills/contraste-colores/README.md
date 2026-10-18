# Contraste de colores · `contraste-colores`

Calcula el contraste WCAG entre los colores de tus tokens (hex, rgb, hsl u oklch, con alias `var()`), separa tema claro y modo oscuro, y para cada par que no llega al mínimo sugiere el color más cercano que cumple manteniendo el tono.

## Cuándo usarlo
- Cambiaste la paleta o agregaste un color.
- Dudas si un texto secundario se lee bien.
- Antes de aprobar un modo oscuro.

## Cómo pedirlo
Con el plugin instalado (`/kit-diseno:contraste-colores`) o, si copiaste los skills a `.claude/skills/`, `/contraste-colores`.
También puedes pedirlo con tus palabras (Claude lo reconoce por su descripción).

```text
/kit-diseno:contraste-colores
```
```text
Revisa el contraste de src/styles/tokens.css, también el modo oscuro
```

## Qué necesita
- Node 18 o superior. Nada más.

## Qué entrega
- Lista de pares con su contraste y si pasa (4,5:1 texto, 3:1 texto grande y UI).
- Sugerencias en oklch y hex para los que fallan.
- Dónde se usa cada token problemático.

## Qué nunca hace
- Cambiar colores de marca sin preguntar.

## Notas
Script: `contraste.mjs [--tokens archivo.css] [--pares pares.json] [--todos] [--json]`. Arma los pares por nombre (texto/foreground/contraste/foco sobre fondo/superficie/tarjeta). Si tus nombres son otros, usa `--pares`. Texto sobre imágenes o degradados: se revisa en pantalla.

---
Parte del kit «Del Figma a producción con Claude Code». No está afiliado a Anthropic ni a Figma.
