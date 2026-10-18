#!/usr/bin/env node
// Revisa textos de interfaz en español: voseo, formas de vosotros, mayúsculas de título,
// signos de apertura, inglés residual, enlaces no descriptivos y regionalismos marcados.
// No necesita dependencias.
//
// Uso:
//   node revisar-texto.mjs src                 # revisa una carpeta
//   node revisar-texto.mjs src/pages/index.astro README.md
//   node revisar-texto.mjs src --json informe.json
//   node revisar-texto.mjs src --sin-regionalismos
//
// Para que una línea no se revise, agrega el comentario «tuteo-ignorar» en esa línea.
// Sale con código 1 si hay errores (voseo o vosotros) y 0 si solo hay avisos.

import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opciones = { json: null, regionalismos: true };
const entradas = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--json') opciones.json = argv[++i];
  else if (a === '--sin-regionalismos') opciones.regionalismos = false;
  else if (a === '--ayuda' || a === '-h') {
    console.log('Uso: node revisar-texto.mjs <archivos o carpetas> [--json salida.json] [--sin-regionalismos]');
    process.exit(0);
  } else entradas.push(a);
}
if (entradas.length === 0) entradas.push('src');

const EXTENSIONES = new Set(['.astro', '.html', '.md', '.mdx', '.tsx', '.jsx', '.ts', '.js', '.vue', '.svelte', '.json', '.txt', '.yml', '.yaml']);
const IGNORAR_DIRS = new Set(['node_modules', 'dist', '.astro', '.git', '.next', 'build', 'coverage', 'test-results', 'playwright-report', '.wrangler', '.claude', '.kit']);

// ---------- Diccionarios ----------

// Verbos frecuentes en interfaces. Con ellos se generan las formas de voseo.
const VERBOS_AR = ['ingresar', 'completar', 'revisar', 'confirmar', 'seleccionar', 'descargar', 'registrar', 'iniciar',
  'buscar', 'encontrar', 'agregar', 'guardar', 'cambiar', 'usar', 'empezar', 'comenzar', 'crear', 'editar', 'eliminar',
  'borrar', 'cerrar', 'esperar', 'probar', 'mirar', 'llamar', 'mandar', 'enviar', 'contactar', 'contar', 'avisar',
  'publicar', 'pagar', 'comprar', 'explorar', 'conectar', 'actualizar', 'intentar', 'olvidar', 'recordar', 'activar',
  'desactivar', 'cancelar', 'aceptar', 'continuar', 'tocar', 'presionar', 'cargar', 'sumar', 'anotar', 'quedar',
  'animar', 'acordar', 'tomar', 'escuchar', 'trabajar', 'diseñar', 'necesitar', 'organizar', 'planificar', 'reservar',
  'agendar', 'solicitar', 'ayudar', 'dejar', 'llevar', 'pasar', 'mostrar', 'hablar', 'preguntar', 'consultar',
  'verificar', 'validar', 'arrastrar', 'soltar', 'copiar', 'pegar', 'compartir_no'];
const VERBOS_ER = ['poner', 'tener', 'hacer', 'querer', 'poder', 'saber', 'leer', 'volver', 'mover', 'correr', 'aprender',
  'responder', 'conocer', 'comer', 'beber', 'devolver', 'resolver', 'proteger', 'escoger', 'recoger', 'entender'];
const VERBOS_IR = ['decir', 'venir', 'salir', 'escribir', 'elegir', 'compartir', 'subir', 'abrir', 'recibir', 'preferir',
  'sentir', 'seguir', 'pedir', 'suscribir', 'descubrir', 'añadir', 'permitir', 'imprimir', 'decidir', 'vivir', 'unir',
  'definir', 'construir', 'incluir', 'invertir', 'conseguir', 'repetir', 'medir'];

// Imperativos de -er/-ir que también son pretérito en primera persona («yo escribí»): se marcan para revisar.
const AMBIGUOS = new Set();

const conTilde = { a: 'á', e: 'é', i: 'í' };

const VOSEO = new Map(); // forma -> { sugerencia, ambiguo }
function agregar(forma, sugerencia, ambiguo = false) {
  if (!VOSEO.has(forma)) VOSEO.set(forma, { sugerencia, ambiguo });
}

// Raíz de tú cuando el verbo cambia la vocal (probar → pruebas, empezar → empiezas, pedir → pides).
const RAIZ_TU = {
  probar: 'prueb', contar: 'cuent', recordar: 'recuerd', encontrar: 'encuentr', mostrar: 'muestr', soltar: 'suelt',
  empezar: 'empiez', comenzar: 'comienz', cerrar: 'cierr', acordar: 'acuerd', poder: 'pued', querer: 'quier',
  volver: 'vuelv', mover: 'muev', entender: 'entiend', devolver: 'devuelv', resolver: 'resuelv', tener: 'tien',
  elegir: 'elig', preferir: 'prefier', sentir: 'sient', seguir: 'sig', pedir: 'pid', repetir: 'repit', medir: 'mid',
  conseguir: 'consig', invertir: 'inviert', construir: 'construy', incluir: 'incluy', decir: 'dic', venir: 'vien',
};
// Imperativos de tú irregulares.
const IMPERATIVO_TU = { tener: 'ten', poner: 'pon', hacer: 'haz', decir: 'di', venir: 'ven', salir: 'sal' };
const CLITICOS = ['te', 'me', 'lo', 'la', 'los', 'las', 'nos', 'le', 'les'];

function formasTu(v) {
  const tipo = v.slice(-2);
  const raiz = v.slice(0, -2);
  const r = RAIZ_TU[v] || raiz;
  const presente = r + (tipo === 'ar' ? 'as' : 'es');
  const imperativo = IMPERATIVO_TU[v] || r + (tipo === 'ar' ? 'a' : 'e');
  return { raiz, presente, imperativo };
}

for (const v of VERBOS_AR.filter((x) => !x.endsWith('_no'))) {
  const { raiz, presente, imperativo } = formasTu(v);
  agregar(raiz + 'ás', `${presente} (tú)`);
  agregar(raiz + 'á', `${imperativo} (tú)`);
  for (const cl of CLITICOS) agregar(raiz + 'a' + cl, `«${tildarEsdrujula(imperativo + cl)}» (tú, con tilde)`);
}
for (const v of VERBOS_ER) {
  const { raiz, presente, imperativo } = formasTu(v);
  agregar(raiz + 'és', `${presente} (tú)`);
  agregar(raiz + 'é', `${imperativo} (tú)`);
  for (const cl of CLITICOS) agregar(raiz + 'e' + cl, `«${tildarEsdrujula(imperativo + cl)}» (tú)`);
}
for (const v of VERBOS_IR) {
  const { raiz, presente, imperativo } = formasTu(v);
  agregar(raiz + 'ís', `${presente} (tú)`);
  agregar(raiz + 'í', `${imperativo} (tú)`, true);
  AMBIGUOS.add(raiz + 'í');
  for (const cl of CLITICOS) agregar(raiz + 'i' + cl, `«${tildarEsdrujula(imperativo + cl)}» (tú)`);
}
// Irregulares y formas sueltas.
const IRREGULARES = {
  sos: 'eres', vos: 'tú', andá: 've', vení: 'ven', decí: 'di', hacé: 'haz', poné: 'pon', salí: 'sal', tené: 'ten',
  decime: 'dime', contame: 'cuéntame', fijate: 'fíjate', hacelo: 'hazlo', ponelo: 'ponlo', decilo: 'dilo',
  andate: 'vete', venite: 'vente', unite: 'únete', sumate: 'súmate', escribinos: 'escríbenos', seguinos: 'síguenos',
  contactanos: 'contáctanos', llamanos: 'llámanos', registrate: 'regístrate', suscribite: 'suscríbete',
  logueate: 'inicia sesión', avisame: 'avísame', escribime: 'escríbeme', mirá: 'mira', podés: 'puedes',
  tenés: 'tienes', querés: 'quieres', sabés: 'sabes', hacés: 'haces', decís: 'dices', venís: 'vienes',
  volvés: 'vuelves', preferís: 'prefieres', sentís: 'sientes', seguís: 'sigues', pedís: 'pides', elegís: 'eliges',
};
for (const [f, s] of Object.entries(IRREGULARES)) VOSEO.set(f, { sugerencia: s, ambiguo: false });
// Palabras que coinciden con un patrón pero no son voseo.
const NO_VOSEO = new Set(['está', 'será', 'estará', 'podrá', 'tendrá', 'hará', 'dirá', 'sabrá', 'querrá', 'vendrá',
  'saldrá', 'pondrá', 'habrá', 'irá', 'dará', 'verá', 'mamá', 'papá', 'sofá', 'allá', 'acá', 'ahí', 'aquí', 'allí',
  'así', 'sí', 'mí', 'tí', 'más', 'además', 'jamás', 'atrás', 'detrás', 'demás', 'quizás', 'país', 'maíz', 'raíz',
  'anís', 'café', 'bebé', 'también', 'después', 'través', 'interés', 'inglés', 'francés', 'cortés', 'revés',
  'estrés', 'sé', 'dé', 'té', 'fe', 'pie', 'usted', 'paso', 'caso', 'cosa', 'mira', 'compra', 'usa', 'toma',
  'lea', 'pase', 'deja', 'iniciales', 'tomate', 'tomates', 'tomás', 'comete', 'medite', 'regalo',
  // Palabras en inglés que coinciden con un patrón de voseo (create = crea + te).
  'create', 'mandate', 'probate', 'validate', 'activate', 'animate', 'update']);

function tildarEsdrujula(palabra) {
  // Pone la tilde en la vocal de la sílaba que corresponde al imperativo de tú con un pronombre (aproximado).
  const vocales = [];
  for (let i = 0; i < palabra.length; i++) if ('aeiou'.includes(palabra[i])) vocales.push(i);
  if (vocales.length < 3) return palabra;
  const idx = vocales[vocales.length - 3];
  return palabra.slice(0, idx) + conTilde[palabra[idx]] + palabra.slice(idx + 1);
}

// Formas de vosotros (España): no van en un español neutro para Latinoamérica.
const RE_VOSOTROS = /\b([a-záéíóúñ]{2,}(?:áis|éis))\b/gi;
const NO_VOSOTROS = new Set(['jerséis']);

const INGLES = [
  [/\bsubmit\b/i, 'Enviar'], [/\bclick here\b/i, 'texto de enlace que diga a dónde lleva'], [/\blearn more\b/i, 'Conocer más / Ver cómo funciona'],
  [/\bsign up\b/i, 'Crear cuenta'], [/\bsign in\b/i, 'Iniciar sesión'], [/\blog ?in\b/i, 'Iniciar sesión'],
  [/\blog ?out\b/i, 'Cerrar sesión'], [/\bloading\.{0,3}/i, 'Cargando…'], [/\bread more\b/i, 'Leer el artículo'],
  [/\bget started\b/i, 'Empezar'], [/\bcancel\b/i, 'Cancelar'], [/\bpassword\b/i, 'contraseña'],
  [/\b(clickea|cliquea|clickear|cliquear)\b/i, 'haz clic / seleccionar'], [/\bhaz click\b/i, 'haz clic'],
  [/\b(loguearte|loguearse|loguea|logueate|deslogueate)\b/i, 'iniciar o cerrar sesión'],
  [/\bsetear\b/i, 'configurar'], [/\bdeployar\b/i, 'publicar'],
];
const ENLACE_VAGO = /<a\b[^>]*>\s*(aquí|aqui|acá|haz clic aquí|click aquí|clic aquí|ver más|leer más|más información|link)\s*<\/a>/gi;

const REGIONALISMOS = [
  [/\b(cachai|cachái|bacán|fome|al tiro|altiro|pololo|polola|pucha)\b/i, 'Chile'],
  [/\b(ahorita|chido|chida|güey|wey|neta)\b/i, 'México'],
  [/\b(che|laburo|laburar|boludo|copado|re bueno)\b/i, 'Argentina/Uruguay'],
  [/\b(ordenador|guay|mola|vosotros|vosotras|coger)\b/i, 'España (o término sensible en Latinoamérica)'],
];

// ---------- Extracción del texto que una persona lee ----------
// Para cada línea devuelve { linea, crudo, texto, fragmentos }:
//   texto      → solo lo que se ve en pantalla (sin código, etiquetas ni clases)
//   fragmentos → trozos de texto humano por separado (para signos y mayúsculas)
const MARKUP = new Set(['.astro', '.html', '.vue', '.svelte']);
const CODIGO = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.yml', '.yaml']);
const ATRIBUTOS_HUMANOS = /\b(alt|title|aria-label|aria-description|placeholder|content|label|value)\s*=\s*(["'])([^"']*)\2/gi;
const textoDeStrings = (linea) => {
  const out = [];
  for (const m of linea.matchAll(/(["'`])((?:(?!\1).)+?)\1/g)) {
    const t = m[2];
    if (/\s/.test(t) && /[a-záéíóúñ]{2,}/i.test(t) && !/^[\w./:@#-]+$/.test(t) && !/https?:|\$\{|[{};=<>]|^[\w-]+(\s[\w-:[\]#/.]+)*$/.test(t)) out.push(t);
  }
  return out;
};

function extraerTexto(contenido, ext) {
  const lineas = contenido.split('\n');
  const res = [];
  let enBloque = false;      // ``` en Markdown
  let enFrontmatter = false; // --- en Astro / Markdown
  let enScriptOEstilo = false;
  let dentroDeEtiqueta = false; // atributos de una etiqueta que ocupa varias líneas
  lineas.forEach((crudo, i) => {
    const n = i + 1;
    let fragmentos = [];
    if (crudo.includes('tuteo-ignorar')) { res.push({ linea: n, crudo, texto: '', fragmentos }); return; }
    if (ext === '.md' || ext === '.mdx' || ext === '.txt') {
      if (/^\s*(```|~~~)/.test(crudo)) { enBloque = !enBloque; res.push({ linea: n, crudo, texto: '', fragmentos }); return; }
      if (enBloque) { res.push({ linea: n, crudo, texto: '', fragmentos }); return; }
      if (n === 1 && crudo.trim() === '---') { enFrontmatter = true; res.push({ linea: n, crudo, texto: '', fragmentos }); return; }
      if (enFrontmatter) { if (crudo.trim() === '---') enFrontmatter = false; fragmentos = textoDeStrings(crudo); res.push({ linea: n, crudo, texto: fragmentos.join(' '), fragmentos }); return; }
      const limpio = crudo.replace(/`[^`]*`/g, ' ').replace(/<!--.*?-->/g, ' ').replace(/\]\([^)]*\)/g, ']').replace(/https?:\/\/\S+/g, ' ');
      fragmentos = [limpio.replace(/<[^>]+>/g, ' ')];
      res.push({ linea: n, crudo, texto: fragmentos[0], fragmentos });
      return;
    }
    if (MARKUP.has(ext)) {
      if (n === 1 && crudo.trim() === '---') { enFrontmatter = true; res.push({ linea: n, crudo, texto: '', fragmentos }); return; }
      if (enFrontmatter) {
        if (crudo.trim() === '---') enFrontmatter = false;
        else if (!/^\s*(import|export)\b/.test(crudo)) fragmentos = textoDeStrings(crudo);
        res.push({ linea: n, crudo, texto: fragmentos.join(' '), fragmentos }); return;
      }
      if (/<(script|style)\b/i.test(crudo) && !/<\/(script|style)>/i.test(crudo)) { enScriptOEstilo = true; res.push({ linea: n, crudo, texto: '', fragmentos }); return; }
      if (enScriptOEstilo) { if (/<\/(script|style)>/i.test(crudo)) enScriptOEstilo = false; res.push({ linea: n, crudo, texto: '', fragmentos }); return; }
      let linea = crudo.replace(/<!--.*?-->/g, ' ');
      for (const m of linea.matchAll(ATRIBUTOS_HUMANOS)) if (m[3].trim()) fragmentos.push(m[3]);
      // Línea que continúa una etiqueta abierta (atributos en varias líneas).
      if (dentroDeEtiqueta) {
        const cierre = linea.indexOf('>');
        if (cierre === -1) { res.push({ linea: n, crudo, texto: fragmentos.join(' '), fragmentos }); return; }
        linea = linea.slice(cierre + 1);
        dentroDeEtiqueta = false;
      }
      const ultimaApertura = linea.lastIndexOf('<');
      if (ultimaApertura !== -1 && linea.indexOf('>', ultimaApertura) === -1) { dentroDeEtiqueta = true; linea = linea.slice(0, ultimaApertura); }
      const visible = linea.replace(/<[^>]*>/g, '\n').replace(/\{[^{}]*\}/g, ' ').split('\n').map((t) => t.trim()).filter((t) => t && /[a-záéíóúñ]/i.test(t));
      fragmentos.push(...visible);
      res.push({ linea: n, crudo, texto: fragmentos.join(' · '), fragmentos });
      return;
    }
    // Código: solo strings y texto JSX entre etiquetas.
    if (/^\s*(import|export \* from|\/\/|\*|\/\*)/.test(crudo)) { res.push({ linea: n, crudo, texto: '', fragmentos }); return; }
    fragmentos = textoDeStrings(crudo);
    for (const m of crudo.matchAll(/>([^<>{}]+)</g)) if (/[a-záéíóúñ]{2,}/i.test(m[1])) fragmentos.push(m[1].trim());
    res.push({ linea: n, crudo, texto: fragmentos.join(' · '), fragmentos });
  });
  return res;
}

// ---------- Reglas ----------

const hallazgos = [];
function reportar(archivo, linea, nivel, regla, fragmento, sugerencia) {
  hallazgos.push({ archivo, linea, nivel, regla, fragmento: fragmento.trim().slice(0, 90), sugerencia });
}

function revisarArchivo(archivo) {
  const ext = path.extname(archivo).toLowerCase();
  let contenido;
  try { contenido = fs.readFileSync(archivo, 'utf8'); } catch { return; }
  const lineas = extraerTexto(contenido, ext);
  for (const { linea, crudo, texto, fragmentos } of lineas) {
    if (crudo.includes('tuteo-ignorar')) continue;
    // Enlaces no descriptivos: se miran en el marcado crudo.
    for (const m of crudo.matchAll(ENLACE_VAGO)) reportar(archivo, linea, 'aviso', 'enlace no descriptivo', m[0], 'el texto del enlace debe decir a dónde lleva (WCAG 2.4.4)');
    if (!texto.trim()) continue;
    const enMinusculas = texto.toLowerCase();

    // Voseo (por palabra).
    for (const m of enMinusculas.matchAll(/[a-záéíóúüñ]+/g)) {
      const w = m[0];
      if (NO_VOSEO.has(w)) continue;
      const v = VOSEO.get(w);
      if (!v) continue;
      // Formas con pronombre sin tilde pueden ser tuteo mal tildado; igual se corrigen.
      const ambiguo = v.ambiguo || AMBIGUOS.has(w);
      reportar(archivo, linea, ambiguo ? 'aviso' : 'error', ambiguo ? 'posible voseo' : 'voseo', w,
        ambiguo ? `si es imperativo, usa tú: ${v.sugerencia}; si es pasado («yo ${w}»), ignóralo` : `usa tú: ${v.sugerencia}`);
    }

    // Vosotros.
    for (const m of texto.matchAll(RE_VOSOTROS)) {
      const w = m[1].toLowerCase();
      if (NO_VOSOTROS.has(w)) continue;
      reportar(archivo, linea, 'error', 'vosotros', m[1], 'en Latinoamérica: ustedes (p. ej. «pueden», «tienen»)');
    }

    // Usted (aviso: el kit usa tú por defecto).
    if (/\busted\b/i.test(texto)) reportar(archivo, linea, 'aviso', 'usted', 'usted', 'la voz del proyecto es tú; usa «tú» salvo que el CLAUDE.md diga otra cosa');

    // Inglés residual.
    for (const [re, sug] of INGLES) {
      const m = texto.match(new RegExp(re.source, 'i'));
      if (m) reportar(archivo, linea, 'aviso', 'inglés en la interfaz', m[0], sug);
    }

    // Regionalismos.
    if (opciones.regionalismos) {
      for (const [re, region] of REGIONALISMOS) {
        for (const frag of fragmentos) {
          const m = frag.match(re);
          if (m) { reportar(archivo, linea, 'info', 'regionalismo', m[0], `marcado como ${region}; en un texto neutro busca otra palabra`); break; }
        }
      }
    }

    // Signos de apertura y mayúsculas de título, solo en texto humano.
    for (const frag of fragmentos) {
      const limpio = frag.replace(/&\w+;/g, ' ').trim();
      if (!limpio) continue;
      if (/\?/.test(limpio) && !/¿/.test(limpio) && /[a-záéíóúñ]{3,}\s+[a-záéíóúñ]{2,}.*\?/i.test(limpio) && !/https?:|\?\w+=/.test(limpio)) {
        reportar(archivo, linea, 'aviso', 'falta «¿»', limpio, 'en español la pregunta abre con «¿»');
      }
      if (/[a-záéíóúñ]\s*!(\s|$)/i.test(limpio) && !/¡/.test(limpio)) {
        reportar(archivo, linea, 'aviso', 'falta «¡»', limpio, 'en español la exclamación abre con «¡»');
      }
      const palabras = limpio.split(/\s+/).filter((p) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,}$/.test(p));
      const cortas = new Set(['de', 'del', 'la', 'el', 'y', 'en', 'a', 'con', 'para', 'por', 'los', 'las', 'tu', 'un', 'una', 'o']);
      const relevantes = palabras.filter((p) => !cortas.has(p.toLowerCase()));
      if (relevantes.length >= 3 && relevantes.every((p) => /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(p)) && palabras.length === limpio.split(/\s+/).length) {
        reportar(archivo, linea, 'aviso', 'mayúsculas de título', limpio, 'en español solo va mayúscula al inicio y en nombres propios');
      }
    }
  }
}

function recorrer(entrada) {
  let stat;
  try { stat = fs.statSync(entrada); } catch { console.error(`No existe: ${entrada}`); return; }
  if (stat.isDirectory()) {
    for (const nombre of fs.readdirSync(entrada)) {
      if (IGNORAR_DIRS.has(nombre) || nombre.startsWith('.')) continue;
      recorrer(path.join(entrada, nombre));
    }
  } else if (EXTENSIONES.has(path.extname(entrada).toLowerCase()) && !/package(-lock)?\.json$|tsconfig\.json$/.test(entrada)) {
    revisarArchivo(entrada);
  }
}

for (const e of entradas) recorrer(e);

// ---------- Salida ----------
const orden = { error: 0, aviso: 1, info: 2 };
hallazgos.sort((a, b) => orden[a.nivel] - orden[b.nivel] || a.archivo.localeCompare(b.archivo) || a.linea - b.linea);
const errores = hallazgos.filter((h) => h.nivel === 'error').length;
const avisos = hallazgos.filter((h) => h.nivel === 'aviso').length;
const infos = hallazgos.filter((h) => h.nivel === 'info').length;

if (hallazgos.length === 0) {
  console.log('Sin hallazgos: no encontré voseo, vosotros, inglés residual ni problemas de signos o mayúsculas.');
} else {
  for (const h of hallazgos) {
    console.log(`${h.archivo}:${h.linea}  [${h.nivel}] ${h.regla}: «${h.fragmento}» → ${h.sugerencia}`);
  }
  console.log(`\nResumen: ${errores} errores, ${avisos} avisos, ${infos} notas.`);
  console.log('Los avisos son hipótesis: revisa cada uno antes de cambiar el texto.');
}
if (opciones.json) fs.writeFileSync(opciones.json, JSON.stringify({ errores, avisos, infos, hallazgos }, null, 2));
process.exit(errores > 0 ? 1 : 0);
