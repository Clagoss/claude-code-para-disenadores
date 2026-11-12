// Pruebas de los códigos de salida: 1 con errores, 0 sin errores, 2 si no se revisó nada.
// Se corren con: node --test (desde la raíz del repo)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const skills = path.join(raiz, 'plugins/lagos-diseno-es/skills');
const texto = path.join(skills, 'ux-writing-es/scripts/revisar-texto.mjs');
const seo = path.join(skills, 'seo-basico/scripts/seo.mjs');

const correr = (script, args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
const carpeta = (archivos = {}) => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'lagos-diseno-es-'));
  for (const [n, c] of Object.entries(archivos)) fs.writeFileSync(path.join(d, n), c);
  return d;
};

test('revisar-texto: con voseo sale con 1 y dice cuánto revisó', () => {
  const r = correr(texto, [carpeta({ 'boton.html': '<button>Podés guardar tus cambios</button>' })]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /voseo/);
  assert.match(r.stdout, /Revisé 1 archivo\./);
});

test('revisar-texto: texto correcto sale con 0 y dice cuánto revisó', () => {
  const r = correr(texto, [carpeta({ 'boton.html': '<button>Guarda tus cambios</button>' })]);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Revisé 1 archivo\. Sin hallazgos/);
});

test('revisar-texto: carpeta vacía sale con 2, sin «Sin hallazgos»', () => {
  const r = correr(texto, [carpeta()]);
  assert.equal(r.status, 2);
  assert.doesNotMatch(r.stdout, /Sin hallazgos/);
  assert.match(r.stderr, /No revisé ningún archivo/);
});

test('revisar-texto: ruta que no existe sale con 2', () => {
  const r = correr(texto, [path.join(os.tmpdir(), 'no-existe-lagos-diseno-es')]);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /No existe/);
  assert.doesNotMatch(r.stdout, /Sin hallazgos/);
});

test('seo: carpeta sin .html sale con 2', () => {
  const r = correr(seo, ['--dist', carpeta({ 'nota.txt': 'hola' })]);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /No encontré páginas \.html/);
});

test('seo: página sin title sale con 1', () => {
  const r = correr(seo, ['--dist', carpeta({ 'index.html': '<!doctype html><html lang="es"><head></head><body><h1>Hola</h1></body></html>' })]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /Páginas revisadas: 1/);
});

test('los 3 scripts aceptan --help: imprimen el uso y salen con 0', () => {
  for (const s of [texto, seo, path.join(skills, 'contraste-colores/scripts/contraste.mjs')]) {
    const r = correr(s, ['--help']);
    assert.equal(r.status, 0, s);
    assert.match(r.stdout, /^Uso:/);
  }
});

test('revisar-texto: una ruta buena y otra que no existe sale con 2', () => {
  const d = carpeta({ 'ok.md': 'Guarda tus cambios' });
  const r = correr(texto, [d, path.join(os.tmpdir(), 'no-existe-lagos-diseno-es')]);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /No existe/);
});

test('revisar-texto: un archivo ilegible junto a uno legible sale con 2', { skip: process.getuid?.() === 0 || process.platform === 'win32' }, () => {
  const d = carpeta({ 'a.md': 'Guarda tus cambios', 'b.md': 'Podés guardar' });
  fs.chmodSync(path.join(d, 'b.md'), 0o000);
  const r = correr(texto, [d]);
  fs.chmodSync(path.join(d, 'b.md'), 0o644);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /No pude leer/);
});
