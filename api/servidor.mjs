// =============================================================================
//  Servidor propio de la clase · COM30 S10 y S11
// -----------------------------------------------------------------------------
//  Qué es: un servidor HTTP escrito con Node puro (sin dependencias) que
//  responde con las MISMAS rutas y la misma forma de dummyjson.com para
//  /todos y /products, pero que SÍ guarda los cambios en una base de datos en
//  archivo: api/datos.json. Se crea a partir de api/semilla.json la primera vez.
//
//  Cómo se arranca (en una segunda terminal, junto a ng serve):
//      npm run api                 -> http://localhost:3000
//      npm run api -- --reiniciar  -> vuelve a los datos de la semilla
//
//  Angular no llama a localhost:3000 directamente: ng serve redirige /api a
//  este servidor (proxy.conf.json). Así funciona igual en el equipo de la sala
//  y dentro de StackBlitz, sin problemas de CORS.
//
//  Diferencia con dummyjson que se observa en F12 > Red:
//      POST /products/add y luego PATCH /products/<id nuevo>
//      dummyjson -> 404 (no guardó nada)    servidor propio -> 200 (sí guardó)
// =============================================================================
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const SEMILLA = join(DIR, 'semilla.json');
const DATOS = join(DIR, 'datos.json');
const PUERTO = Number(process.env.PORT || 3000);

if (process.argv.includes('--reiniciar') || !existsSync(DATOS)) copyFileSync(SEMILLA, DATOS);
let db = JSON.parse(readFileSync(DATOS, 'utf8'));
const guardar = () => writeFileSync(DATOS, JSON.stringify(db, null, 1));

// ---------------------------------------------------------------- utilidades
function responder(res, status, cuerpo) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(cuerpo === undefined ? '' : JSON.stringify(cuerpo));
}

const leerCuerpo = (req) => new Promise((ok, mal) => {
  let t = '';
  req.on('data', (c) => { t += c; if (t.length > 1e6) req.destroy(); });
  req.on('end', () => { try { ok(t ? JSON.parse(t) : {}); } catch { mal(new Error('JSON inválido')); } });
});

/** limit, skip, sortBy, order y select, como en dummyjson. limit=0 devuelve todos. */
function paginar(lista, q, clave) {
  let r = [...lista];
  const sortBy = q.get('sortBy');
  if (sortBy) {
    const dir = q.get('order') === 'desc' ? -1 : 1;
    r.sort((a, b) => (a[sortBy] > b[sortBy] ? dir : a[sortBy] < b[sortBy] ? -dir : 0));
  }
  const total = r.length;
  const skip = Number(q.get('skip') || 0);
  const lim = q.has('limit') ? Number(q.get('limit')) : 30;
  r = r.slice(skip, lim === 0 ? undefined : skip + lim);
  const select = q.get('select');
  if (select) {
    const campos = ['id', ...select.split(',').map((s) => s.trim())];
    r = r.map((x) => Object.fromEntries(campos.filter((c) => c in x).map((c) => [c, x[c]])));
  }
  return { [clave]: r, total, skip, limit: lim === 0 ? total : r.length };
}

const siguienteId = (lista) => Math.max(0, ...lista.map((x) => x.id)) + 1;
const NOMBRE = { todos: 'Todo', products: 'Product' };

// ---------------------------------------------------------------- rutas
async function atender(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const partes = url.pathname.replace(/^\/api/, '').split('/').filter(Boolean);
  const [recurso, a, b] = partes;
  const q = url.searchParams;
  if (req.method === 'OPTIONS') return responder(res, 204);
  if (!recurso) return responder(res, 200, { mensaje: 'Servidor de la clase COM30', recursos: ['/todos', '/products'] });
  if (!(recurso in db)) return responder(res, 404, { message: `Ruta no encontrada: ${url.pathname}` });
  const lista = db[recurso];
  const noExiste = (id) => responder(res, 404, { message: `${NOMBRE[recurso]} with id '${id}' not found` });

  if (req.method === 'GET') {
    if (!a) return responder(res, 200, paginar(lista, q, recurso));
    if (recurso === 'products' && a === 'category') return responder(res, 200, paginar(lista.filter((p) => p.category === b), q, recurso));
    if (recurso === 'products' && a === 'search') {
      const t = (q.get('q') || '').toLowerCase();
      return responder(res, 200, paginar(lista.filter((p) => `${p.title} ${p.description}`.toLowerCase().includes(t)), q, recurso));
    }
    const x = lista.find((y) => String(y.id) === a);
    return x ? responder(res, 200, x) : noExiste(a);
  }

  let cuerpo;
  try { cuerpo = await leerCuerpo(req); } catch (e) { return responder(res, 400, { message: e.message }); }

  if (req.method === 'POST' && a === 'add') {
    const nuevo = { ...cuerpo, id: siguienteId(lista) };
    lista.push(nuevo); guardar();
    return responder(res, 201, nuevo);
  }
  const i = lista.findIndex((y) => String(y.id) === a);
  if (i < 0) return noExiste(a);
  if (req.method === 'PATCH') { lista[i] = { ...lista[i], ...cuerpo, id: lista[i].id }; guardar(); return responder(res, 200, lista[i]); }
  if (req.method === 'PUT') { lista[i] = { ...cuerpo, id: lista[i].id }; guardar(); return responder(res, 200, lista[i]); }
  if (req.method === 'DELETE') {
    const [borrado] = lista.splice(i, 1); guardar();
    return responder(res, 200, { ...borrado, isDeleted: true, deletedOn: new Date().toISOString() });
  }
  return responder(res, 405, { message: `Método ${req.method} no permitido en ${url.pathname}` });
}

createServer((req, res) => {
  atender(req, res).catch((e) => responder(res, 500, { message: 'Error interno del servidor', detalle: String(e) }));
  res.on('finish', () => console.log(`${req.method} ${req.url} -> ${res.statusCode}`));
}).listen(PUERTO, () => console.log(`Servidor de la clase en http://localhost:${PUERTO} · datos en api/datos.json`));
