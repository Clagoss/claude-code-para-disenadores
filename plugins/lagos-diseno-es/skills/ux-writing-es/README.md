# UX writing en español (tuteo neutro) · `ux-writing-es`

Revisa y reescribe textos de interfaz en español neutro con tuteo. Un script detecta lo mecánico (voseo, vosotros, usted suelto, inglés residual, mayúsculas de título, signos de apertura, enlaces «aquí», regionalismos) y el criterio revisa lo que importa: botones con verbo, errores útiles, estados vacíos, confirmaciones, formularios y consistencia de términos.

## Cuándo usarlo
- Antes de publicar textos nuevos.
- Cuando heredas un producto con textos traducidos o mezclados.
- Para unificar la voz de un producto.

## Cómo pedirlo
Con el plugin instalado (`/lagos-diseno-es:ux-writing-es`) o, si copiaste los skills a `.claude/skills/`, `/ux-writing-es`.
También puedes pedirlo con tus palabras (Claude lo reconoce por su descripción).

```text
/lagos-diseno-es:ux-writing-es src
```
```text
Revisa los textos del formulario de contacto y propón cambios
```

## Qué necesita
- Node 18 o superior. Nada más.

## Qué entrega
- Lista de errores y avisos con archivo y línea.
- Tabla de cambios propuestos con su porqué.
- Con tu permiso, los cambios aplicados y el script en 0 errores.

## Qué nunca hace
- Mezclar tú y usted.
- Traducir literal del inglés.
- Cambiar tono de marca, nombres o textos legales sin preguntar.

## Notas
Script: `revisar-texto.mjs <archivos o carpetas> [--json] [--sin-regionalismos]`. Para excluir una línea, agrega el comentario `tuteo-ignorar`. Si tu `CLAUDE.md` define otra voz (usted, un país), manda el `CLAUDE.md`. Guía completa: `guia-de-voz.md`.

---
Parte del plugin gratis `lagos-diseno-es`. No está afiliado a Anthropic ni a Figma.
