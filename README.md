# Claude Code para diseñadores · 3 skills gratis en español

Tres skills de [Claude Code](https://code.claude.com/docs) para quien diseña y quiere publicar lo
que diseña con calidad de producción. En español neutro, con tuteo, probados uno por uno.

| Skill | Qué hace |
|---|---|
| `ux-writing-es` | Revisa los textos de tu interfaz: voseo, formas de vosotros, inglés residual («Submit», «Learn more»), mayúsculas de título, signos ¿¡ faltantes, enlaces «aquí» y regionalismos. Después propone botones con verbo, errores útiles y estados vacíos claros. |
| `contraste-colores` | Calcula el contraste WCAG entre los colores de tus tokens (hex, rgb, hsl u oklch), separa tema claro y oscuro y, cuando un par falla, sugiere el color más cercano que cumple **sin cambiar el tono**. |
| `seo-basico` | Revisa tu sitio construido o publicado: title, description, un h1, lang, canonical, Open Graph, imágenes sin alt, enlaces internos rotos, robots.txt y sitemap. Y explica cómo avisarle a Google y a Bing. |

Los tres funcionan solo con Node 18 o superior: no instalan nada en tu proyecto.

## Instalar

Dentro de Claude Code:

```text
/plugin marketplace add Clagoss/claude-code-para-disenadores
/plugin install lagos-diseno-es@claude-code-para-disenadores
```

Y luego, por ejemplo:

```text
/lagos-diseno-es:contraste-colores
/lagos-diseno-es:ux-writing-es src
/lagos-diseno-es:seo-basico
```

¿Usas otro agente además de Claude Code (Cursor, Codex, Gemini CLI, Copilot)? Con el instalador
abierto de [skills.sh](https://skills.sh):

```bash
npx skills add Clagoss/claude-code-para-disenadores
```

¿Ya usas el marketplace de [Build with Claude](https://buildwithclaude.com/plugin/lagos-diseno-es)?
El plugin también está ahí:

```text
/plugin marketplace add davepoon/buildwithclaude
/plugin install lagos-diseno-es@buildwithclaude
```

¿Prefieres tenerlos por proyecto? Copia la carpeta `plugins/lagos-diseno-es/skills/` a `.claude/skills/`
de tu proyecto y llámalos como `/contraste-colores`, `/ux-writing-es` y `/seo-basico`.

Los scripts también se pueden correr solos, sin Claude:

```bash
node plugins/lagos-diseno-es/skills/contraste-colores/scripts/contraste.mjs --tokens src/styles/tokens.css
node plugins/lagos-diseno-es/skills/ux-writing-es/scripts/revisar-texto.mjs src
node plugins/lagos-diseno-es/skills/seo-basico/scripts/seo.mjs --dist dist
```

## Dónde más aparece

- [Build with Claude](https://buildwithclaude.com/plugin/lagos-diseno-es): el plugin completo, en su
  marketplace de Claude Code.
- [Agentic Awesome Skills](https://github.com/sickn33/agentic-awesome-skills/tree/main/skills/design-token-contrast):
  la revisión de contraste de tokens, como skill `design-token-contrast`.

## ¿Quieres el flujo completo, de Figma a producción?

Estos tres skills son parte del kit **«Del Figma a producción con Claude Code»**: una guía de diez
capítulos en español y un pack de 14 skills y 6 subagentes probados para pasar un frame de Figma
a código con el MCP oficial de Figma, sincronizar tokens con Tailwind v4, hacer QA visual,
auditar accesibilidad WCAG 2.2, revisar responsive y rendimiento, publicar gratis en Cloudflare y
revisar tu sitio cada semana. Incluye 5 plantillas de `CLAUDE.md` y 2 proyectos de partida en
Astro.

**[Conoce el kit →](https://carloslagos.gumroad.com/l/del-figma-a-produccion?utm_source=github&utm_medium=repo&utm_campaign=lanzamiento-kit)**

Y si prefieres leer antes, hay guías gratis en español sobre el mismo flujo en
[carloslagos.cl/guias](https://carloslagos.cl/guias/).

## Licencia

MIT. Úsalos, cámbialos y compártelos.

---
Hecho por [Carlos Lagos](https://carloslagos.cl), Senior Product Designer. No está afiliado a
Anthropic ni a Figma.
