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

## Más del mismo autor

Estos tres skills salieron de escribir [«Del Figma a producción con Claude Code»](https://carloslagos.cl/guias/kit-del-figma-a-produccion/),
un kit de pago más completo sobre el mismo flujo. También hay guías gratis sobre el tema en
[carloslagos.cl/guias](https://carloslagos.cl/guias/).

## Licencia

MIT. Úsalos, cámbialos y compártelos.

---
Hecho por [Carlos Lagos](https://carloslagos.cl), Senior Product Designer. No está afiliado a
Anthropic ni a Figma.
