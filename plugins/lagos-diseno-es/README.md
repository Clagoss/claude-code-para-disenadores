# lagos-diseno-es · 3 skills de Claude Code para diseñadores, en español

Tres revisiones para lo que diseñas, antes de publicarlo. Cada una corre un script de Node que
lee tus archivos y te entrega una lista concreta de problemas, con la corrección propuesta.

| Skill | Qué revisa |
|---|---|
| `ux-writing-es` | Los textos de tu interfaz en español neutro con tuteo: voseo, formas de vosotros, inglés que quedó («Submit», «Learn more»), mayúsculas de título, signos ¿¡ que faltan y enlaces «aquí» o «leer más». Después propone botones con verbo, errores útiles y estados vacíos claros. |
| `contraste-colores` | El contraste WCAG entre los colores de tus tokens (hex, rgb, hsl u oklch), separando tema claro y oscuro. Si un par no llega a 4,5:1 en texto o 3:1 en interfaz, sugiere el color más cercano que cumple sin cambiar el tono. |
| `seo-basico` | Tu sitio construido o publicado: title, meta description, un solo h1, lang, canonical, Open Graph, imágenes sin alt, enlaces internos rotos, títulos repetidos, robots.txt y sitemap. |

## Instalar

```text
/plugin marketplace add Clagoss/claude-code-para-disenadores
/plugin install lagos-diseno-es@claude-code-para-disenadores
```

## Tres ejemplos de uso

1. **Revisar el contraste de tu paleta** después de cambiar un color. Claude busca tu archivo de
   tokens, calcula cada par de texto y fondo, y te dice cuál falla y qué valor usar:
   ```text
   /lagos-diseno-es:contraste-colores src/styles/tokens.css
   ```
2. **Revisar los textos de una pantalla** antes de publicarla. Te entrega una tabla «ahora ·
   propuesta · por qué» y aplica los cambios que apruebes:
   ```text
   /lagos-diseno-es:ux-writing-es src/pages/registro.astro
   ```
3. **Revisar el SEO básico** de tu sitio, sobre la carpeta del build o sobre la URL publicada:
   ```text
   /lagos-diseno-es:seo-basico dist
   /lagos-diseno-es:seo-basico https://tusitio.com
   ```

También puedes pedirlos con tus palabras («revisa si mis colores pasan WCAG»): Claude los
reconoce por su descripción.

## Qué lee, qué ejecuta y a dónde se conecta

- **Qué ejecuta:** solo los scripts de Node que vienen en la carpeta `scripts/` de cada skill
  (código legible, sin dependencias). No instala paquetes ni cambia tu configuración.
- **Qué lee:** los archivos de tu proyecto que le indiques (por defecto, `src/` o la carpeta del
  build).
- **Red:** `contraste-colores` y `ux-writing-es` no se conectan a internet. **`seo-basico` solo
  consulta la URL que tú le das**, y solo cuando le das una URL: pide esa página y las páginas
  enlazadas del mismo dominio (40 como máximo, ajustable con `--max`), más su `robots.txt` y su
  sitemap. No envía tus archivos ni ningún dato a otro lugar. Sobre la carpeta del build no usa
  la red.
- **Qué cambia:** solo archivos de tu proyecto, con los permisos que tú le das a Claude Code.
  `contraste-colores` y `ux-writing-es` proponen antes de cambiar y nunca tocan colores de marca,
  tono, nombres de producto ni textos legales sin preguntarte. `seo-basico` corrige lo técnico en
  la fuente (title, description, alt) y el contenido solo lo comenta.

Requisitos: Claude Code y Node 18 o superior.

*English:* three Spanish-language skills for designers. A UX-writing reviewer for Spanish
interfaces, a WCAG contrast checker that reads your design tokens, and a basic SEO audit that
only fetches the URL you give it.

Licencia MIT · Carlos Lagos · No está afiliado a Anthropic ni a Figma.

Estos tres skills son parte del kit «Del Figma a producción con Claude Code»: [carloslagos.cl/guias/kit-del-figma-a-produccion](https://carloslagos.cl/guias/kit-del-figma-a-produccion/?utm_source=plugin&utm_medium=directorio&utm_campaign=lanzamiento-kit)
