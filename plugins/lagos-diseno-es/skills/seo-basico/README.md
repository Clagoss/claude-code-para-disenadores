# SEO básico · `seo-basico`

Revisa el sitio construido (`dist/`) o publicado: title, meta description, un h1, lang, canonical, Open Graph, imágenes sin alt, enlaces sin texto, enlaces internos rotos, noindex donde no corresponde, títulos repetidos, robots.txt y sitemap. Corrige en la fuente y explica cómo avisar a Google y Bing.

## Cuándo usarlo
- Antes de publicar.
- Cuando un link compartido se ve sin imagen o con un título raro.
- Cuando el sitio no aparece en buscadores.

## Cómo pedirlo
Con el plugin instalado (`/lagos-diseno-es:seo-basico`) o, si copiaste los skills a `.claude/skills/`, `/seo-basico`.
También puedes pedirlo con tus palabras (Claude lo reconoce por su descripción).

```text
/lagos-diseno-es:seo-basico
```
```text
Revisa el SEO de https://tusitio.com
```

## Qué necesita
- Node 18 o superior. Nada más.

## Qué entrega
- Lista de errores y avisos por página.
- Correcciones en el componente que arma el `<head>`.
- Pasos para Search Console e IndexNow (solo si los pides).

## Qué nunca hace
- Prometer posiciones.
- Enviar URLs a buscadores sin tu confirmación.

## Notas
Script: `seo.mjs [--dist dist] [--url https://sitio --max 40] [--json]`. Considera normal el noindex en `/404` y `/componentes`.

---
Parte del kit «Del Figma a producción con Claude Code». No está afiliado a Anthropic ni a Figma.
