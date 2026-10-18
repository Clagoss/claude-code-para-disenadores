# Guía de voz: español neutro con tuteo

Referencia del skill `ux-writing-es`. Pensada para productos digitales que hablan a toda
Latinoamérica. Si tu proyecto es para un solo país, ajusta el glosario en tu `CLAUDE.md`.

## 1. Tratamiento
| Usa | Evita | Por qué |
|---|---|---|
| **tú**: puedes, tienes, quieres, ingresa, revisa | **vos**: podés, tenés, querés, ingresá, revisá | El voseo es correcto en Argentina, Uruguay y parte de Centroamérica, pero en un texto neutro suena local. | <!-- tuteo-ignorar -->
| **ustedes**: pueden, tienen | **vosotros**: podéis, tenéis | En Latinoamérica el plural de tú es ustedes. | <!-- tuteo-ignorar -->
| tú en todo el producto | mezclar tú y usted | La mezcla se nota y resta confianza. |

Imperativos de tú que más se equivocan: ingresa (no ingresá), regístrate (no registrate), <!-- tuteo-ignorar -->
escríbenos (no escribinos), fíjate (no fijate), haz (no hacé), pon (no poné), sal (no salí), <!-- tuteo-ignorar -->
ven (no vení), di (no decí), suscríbete (no suscribite), únete (no unite), súmate (no sumate). <!-- tuteo-ignorar -->

## 2. Botones y enlaces
- **Verbo en infinitivo o imperativo, y siempre el mismo estilo en todo el producto.** El
  infinitivo es lo más común en interfaces en español: «Guardar», «Enviar solicitud», «Crear
  cuenta». El imperativo de tú funciona en llamados de marketing: «Empieza gratis».
- Especifica el objeto si hay ambigüedad: «Descargar factura», no «Descargar».
- Evita: «Aceptar» para una acción que no es aceptar, «Click aquí», «Submit», «Más».
- El enlace dice a dónde lleva: «Lee la guía de instalación», no «Haz clic aquí».

| Ahora | Mejor |
|---|---|
| Submit | Enviar |
| Click aquí para más info | Ver precios y planes |
| OK | Entendido / Guardar cambios (según la acción) |
| Sign up | Crear cuenta |
| Log in | Iniciar sesión |

## 3. Mensajes de error
Estructura: **qué pasó** + **cómo seguir**. Sin culpar, sin códigos, sin mayúsculas gritonas.

| Ahora | Mejor |
|---|---|
| Error: campo inválido | Escribe un correo con el formato nombre@dominio.com |
| ¡Contraseña incorrecta! | Esa contraseña no coincide. Vuelve a intentarlo o recupérala. |
| Error 500 | No pudimos guardar tus cambios. Intenta de nuevo en unos minutos. |
| Debe completar este campo | Escribe tu nombre |

## 4. Estados vacíos
Qué es + por qué está vacío + qué hacer ahora.
> **Todavía no tienes proyectos.** Cuando crees uno, aparecerá aquí.
> [Crear proyecto]

## 5. Confirmaciones y acciones destructivas
- Título con la acción y el objeto: «¿Eliminar el proyecto “Rediseño”?».
- Consecuencia clara: «Se borrarán sus 12 pantallas. No se puede deshacer.».
- Botón con el mismo verbo: «Eliminar proyecto» (no «Sí»). El otro: «Cancelar».
- Éxito breve y concreto: «Guardamos tus cambios.».

## 6. Formularios
- Label visible arriba del campo, corto: «Correo», «Nombre completo».
- Ayuda debajo cuando evita un error: «Te enviaremos el comprobante aquí».
- El placeholder no reemplaza al label (desaparece al escribir).
- Marca «(opcional)» en lo opcional cuando la mayoría es obligatorio.
- `autocomplete` en nombre, correo, teléfono y dirección.

## 7. Mayúsculas, signos y formato
- **Mayúscula solo al inicio** y en nombres propios: «Crea tu cuenta gratis», no «Crea Tu Cuenta
  Gratis». Las tildes se escriben también en mayúsculas.
- Signos de apertura siempre: «¿Olvidaste tu contraseña?», «¡Listo!».
- Comillas latinas o inglesas, pero las mismas en todo el producto.
- Fechas sin ambigüedad: «3 de marzo de 2026» o «3 mar 2026».
- Moneda con su código cuando el público es de varios países: «US$ 29», «$ 15.000 CLP».
- Números: el separador de miles cambia por país (1.000 en Chile y Argentina; 1,000 en México).
  Si el público es de varios países, evita cifras ambiguas o define una convención.

## 8. Lenguaje inclusivo y claro
- Reformula para no marcar género cuando se pueda: «Te damos la bienvenida», «Quienes se
  inscriban recibirán…».
- Evita la arroba, la x y la e si tu público no las usa; la reformulación es más clara.
- Frases cortas (menos de 20 palabras en interfaz), voz activa, palabras comunes.

## 9. Palabras que delatan una traducción o un texto local
| Evita | Usa |
|---|---|
| loguearte, logueate | iniciar sesión | <!-- tuteo-ignorar -->
| clickear, cliquear | hacer clic, seleccionar |
| setear | configurar |
| aplicar (a un trabajo) | postular |
| ordenador (España) | computadora |
| coger (sensible en varios países) | tomar, agarrar |
| ahorita (México) | ahora, en un momento |
| bacán, al tiro (Chile) | genial, enseguida |
| che, laburo (Río de la Plata) | oye, trabajo |

## 10. Antes de publicar, pregúntate
1. ¿Una persona que no conoce el producto entiende qué hacer?
2. ¿Cada botón dice qué pasa al tocarlo?
3. ¿Cada error dice cómo seguir?
4. ¿Hay una sola voz (tú) y un solo término por concepto?
5. ¿El script `revisar-texto.mjs` da 0 errores?
