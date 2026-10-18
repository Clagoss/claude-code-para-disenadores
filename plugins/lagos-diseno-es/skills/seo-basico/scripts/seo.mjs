#!/usr/bin/env node
// Revisa el SEO básico de un sitio ya construido (la carpeta de salida del build, p. ej. dist/)
// o de un sitio en línea. No necesita dependencias (usa fetch de Node 18+).
//
// Uso:
//   node seo.mjs                          # revisa ./dist
//   node seo.mjs --dist build
//   node seo.mjs --url https://tusitio.com [--max 30]   # rastrea el sitio en línea (mismo dominio)
//   node seo.mjs --json informe.json
//
// Revisa por página: title, meta description, un solo h1, lang, canonical, Open Graph,
// imágenes sin alt, noindex, enlaces internos rotos y títulos/descripciones repetidos.
// Revisa en el sitio: robots.txt, sitemap y que el robots apunte al sitemap.
// Sale con código 1 si hay errores.

import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const op = { dist: 'dist', url: null, max: 40, json: null };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--dist') op.dist = argv[++i];
  else if (a === '--url') op.url = argv[++i];
  else if (a === '--max') op.max = parseInt(argv[++i], 10);
  else if (a === '--json') op.json = argv[++i];
  else if (a === '--ayuda' || a === '-h') { console.log('Uso: node seo.mjs [--dist carpeta] [--url https://sitio --max 40] [--json salida.json]'); process.exit(0); }
}

const NOINDEX_ESPERADO = /(^|\/)(404|componentes|gracias|privacidad-borrador)(\/|\.html|$)/;
const hallazgos = [];
const reportar = (pagina, nivel, regla, detalle) => hallazgos.push({ pagina, nivel, regla, detalle });

// ---------- Utilidades de HTML (sin dependencias, pensadas para HTML generado) ----------
const decodificar = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
const textoPlano = (html) => decodificar(html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
function atributo(etiqueta, nombre) {
  const m = etiqueta.match(new RegExp(`\\s${nombre}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? decodificar(m[2] ?? m[3] ?? m[4] ?? '') : null;
}
function metas(html) {
  const lista = [];
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) lista.push(m[0]);
  return lista;
}
function meta(html, clave) {
  for (const m of metas(html)) {
    const n = atributo(m, 'name') || atributo(m, 'property');
    if (n && n.toLowerCase() === clave) return atributo(m, 'content');
  }
  return null;
}

function revisarPagina(ruta, html, existeInterno) {
  const head = (html.match(/<head[\s\S]*?<\/head>/i) || [''])[0];
  const titulo = textoPlano((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ''])[1]);
  const descripcion = meta(head, 'description');
  const robots = (meta(head, 'robots') || '').toLowerCase();
  const htmlTag = (html.match(/<html\b[^>]*>/i) || [''])[0];
  const lang = atributo(htmlTag, 'lang');
  const canonical = (head.match(/<link\b[^>]*rel=["']?canonical["']?[^>]*>/i) || [null])[0];
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => textoPlano(m[1]));
  const noindex = robots.includes('noindex');

  if (!titulo) reportar(ruta, 'error', 'title', 'la página no tiene <title>');
  else if (!noindex && (titulo.length < 15 || titulo.length > 65)) reportar(ruta, 'aviso', 'title', `mide ${titulo.length} caracteres (ideal 30–60): «${titulo}»`);
  if (!descripcion) reportar(ruta, noindex ? 'info' : 'error', 'meta description', 'falta <meta name="description">');
  else if (!noindex && (descripcion.length < 70 || descripcion.length > 165)) reportar(ruta, 'aviso', 'meta description', `mide ${descripcion.length} caracteres (ideal 70–160)`);
  if (!lang) reportar(ruta, 'error', 'lang', 'falta lang en <html> (debería ser "es" o "es-XX")');
  else if (!/^es\b/i.test(lang)) reportar(ruta, 'aviso', 'lang', `lang="${lang}" en un sitio en español`);
  if (h1s.length === 0) reportar(ruta, 'error', 'h1', 'no hay h1');
  else if (h1s.length > 1) reportar(ruta, 'aviso', 'h1', `hay ${h1s.length} h1: ${h1s.map((h) => `«${h.slice(0, 40)}»`).join(', ')}`);
  if (!canonical && !noindex) reportar(ruta, 'aviso', 'canonical', 'falta <link rel="canonical">');
  for (const og of ['og:title', 'og:description', 'og:image']) {
    if (!meta(head, og) && !noindex) reportar(ruta, og === 'og:image' ? 'info' : 'aviso', 'open graph', `falta ${og} (así se ve al compartir el link)`);
  }
  const ogImage = meta(head, 'og:image');
  if (ogImage && !/^https?:\/\//.test(ogImage)) reportar(ruta, 'aviso', 'open graph', `og:image debe ser una URL absoluta: «${ogImage}»`);
  if (noindex && !NOINDEX_ESPERADO.test(ruta)) reportar(ruta, 'error', 'noindex', 'la página tiene noindex: Google no la mostrará');

  // Imágenes sin alt (alt="" es válido para decorativas).
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (atributo(m[0], 'alt') === null) reportar(ruta, 'error', 'imagen sin alt', (atributo(m[0], 'src') || '').slice(0, 80));
  }
  // Enlaces sin texto accesible.
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const texto = textoPlano(m[2]);
    const etiqueta = `<a${m[1]}>`;
    const tieneAlt = /<img\b[^>]*alt=["'][^"']+["']/i.test(m[2]) || /aria-label/i.test(m[1]) || /<title>/i.test(m[2]);
    if (!texto && !tieneAlt) reportar(ruta, 'aviso', 'enlace sin texto', (atributo(etiqueta, 'href') || '').slice(0, 80));
  }
  // Enlaces internos rotos.
  if (existeInterno) {
    for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)(#[^"']*)?["'][^>]*>/gi)) {
      const href = m[1];
      if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(href) || href.startsWith('//')) continue;
      if (!existeInterno(href, ruta)) reportar(ruta, 'error', 'enlace interno roto', href);
    }
  }
  return { titulo, descripcion, noindex };
}

const resumenPaginas = [];
function despues(sitio) {
  // Duplicados.
  const porTitulo = new Map(), porDesc = new Map();
  for (const p of resumenPaginas) {
    if (p.noindex) continue;
    if (p.titulo) porTitulo.set(p.titulo, [...(porTitulo.get(p.titulo) || []), p.ruta]);
    if (p.descripcion) porDesc.set(p.descripcion, [...(porDesc.get(p.descripcion) || []), p.ruta]);
  }
  for (const [t, rutas] of porTitulo) if (rutas.length > 1) reportar(rutas.join(', '), 'aviso', 'title repetido', `«${t}»`);
  for (const [d, rutas] of porDesc) if (rutas.length > 1) reportar(rutas.join(', '), 'aviso', 'description repetida', `«${d.slice(0, 60)}…»`);
  // robots y sitemap
  if (!sitio.robots) reportar('/robots.txt', 'aviso', 'robots.txt', 'no existe robots.txt');
  else if (!/sitemap:/i.test(sitio.robots)) reportar('/robots.txt', 'aviso', 'robots.txt', 'no indica dónde está el sitemap (línea «Sitemap: https://…»)');
  else if (/^\s*disallow:\s*\/\s*$/im.test(sitio.robots)) reportar('/robots.txt', 'error', 'robots.txt', 'bloquea todo el sitio (Disallow: /)');
  if (!sitio.sitemap) reportar('/sitemap', 'aviso', 'sitemap', 'no encontré sitemap.xml ni sitemap-index.xml');
  if (sitio.sitemap && /example\.com/.test(sitio.sitemap)) reportar('/sitemap', 'error', 'sitemap', 'el sitemap usa example.com: configura tu dominio real (en Astro, «site» en astro.config)');
  if (sitio.robots && /example\.com/.test(sitio.robots)) reportar('/robots.txt', 'error', 'robots.txt', 'el robots.txt apunta a example.com: pon tu dominio real');
}

// ---------- Modo carpeta (dist) ----------
async function modoDist() {
  const raiz = path.resolve(op.dist);
  if (!fs.existsSync(raiz)) { console.error(`No existe ${op.dist}. Corre primero el build (npm run build).`); process.exit(2); }
  const htmls = [];
  const recorrer = (d) => {
    for (const n of fs.readdirSync(d)) {
      const p = path.join(d, n);
      if (fs.statSync(p).isDirectory()) recorrer(p);
      else if (n.endsWith('.html')) htmls.push(p);
    }
  };
  recorrer(raiz);
  const existeInterno = (href, desde) => {
    let destino = href.split('?')[0];
    if (!destino.startsWith('/')) destino = path.posix.join(path.posix.dirname(desde), destino);
    const limpio = decodeURIComponent(destino).replace(/\/+$/, '');
    const candidatos = [limpio, `${limpio}.html`, `${limpio}/index.html`, limpio === '' ? '/index.html' : null].filter(Boolean);
    return candidatos.some((c) => fs.existsSync(path.join(raiz, c)) && fs.statSync(path.join(raiz, c)).isFile());
  };
  for (const archivo of htmls) {
    const ruta = '/' + path.relative(raiz, archivo).split(path.sep).join('/').replace(/index\.html$/, '').replace(/\.html$/, '');
    const r = revisarPagina(ruta, fs.readFileSync(archivo, 'utf8'), existeInterno);
    resumenPaginas.push({ ruta, ...r });
  }
  const leer = (n) => (fs.existsSync(path.join(raiz, n)) ? fs.readFileSync(path.join(raiz, n), 'utf8') : null);
  despues({ robots: leer('robots.txt'), sitemap: leer('sitemap-index.xml') || leer('sitemap.xml') || leer('sitemap-0.xml') });
  return htmls.length;
}

// ---------- Modo URL ----------
async function modoUrl() {
  const base = new URL(op.url);
  const vistas = new Set();
  const cola = [base.href];
  const estados = new Map();
  const ua = { 'user-agent': 'kit-seo-basico/1.0 (+revision propia)' };
  while (cola.length && vistas.size < op.max) {
    const url = cola.shift();
    if (vistas.has(url)) continue;
    vistas.add(url);
    let res;
    try { res = await fetch(url, { headers: ua, redirect: 'follow' }); } catch (e) { reportar(url, 'error', 'no carga', e.message); continue; }
    estados.set(url, res.status);
    if (res.status >= 400) { reportar(new URL(url).pathname, 'error', 'página con error', `HTTP ${res.status}`); continue; }
    if (!(res.headers.get('content-type') || '').includes('text/html')) continue;
    const html = await res.text();
    const ruta = new URL(url).pathname;
    const r = revisarPagina(ruta, html, null);
    resumenPaginas.push({ ruta, ...r });
    for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)/gi)) {
      try {
        const u = new URL(m[1], url);
        if (u.origin === base.origin && !/\.(pdf|png|jpe?g|webp|svg|zip|xml|txt)$/i.test(u.pathname)) { u.search = ''; if (!vistas.has(u.href)) cola.push(u.href); }
      } catch {}
    }
  }
  const traer = async (p) => { try { const r = await fetch(new URL(p, base), { headers: ua }); return r.ok ? await r.text() : null; } catch { return null; } };
  despues({ robots: await traer('/robots.txt'), sitemap: (await traer('/sitemap-index.xml')) || (await traer('/sitemap.xml')) });
  return vistas.size;
}

const paginas = op.url ? await modoUrl() : await modoDist();
const orden = { error: 0, aviso: 1, info: 2 };
hallazgos.sort((a, b) => orden[a.nivel] - orden[b.nivel] || a.pagina.localeCompare(b.pagina));
const errores = hallazgos.filter((h) => h.nivel === 'error').length;
console.log(`Páginas revisadas: ${paginas}${op.url ? ` (desde ${op.url}, máx. ${op.max})` : ` (en ${op.dist}/)`}`);
if (!hallazgos.length) console.log('Sin hallazgos de SEO básico.');
for (const h of hallazgos) console.log(`  [${h.nivel}] ${h.pagina || '/'} · ${h.regla}: ${h.detalle}`);
console.log(`\nResumen: ${errores} errores, ${hallazgos.filter((h) => h.nivel === 'aviso').length} avisos, ${hallazgos.filter((h) => h.nivel === 'info').length} notas.`);
if (op.json) fs.writeFileSync(op.json, JSON.stringify({ paginas, hallazgos }, null, 2));
process.exit(errores ? 1 : 0);
