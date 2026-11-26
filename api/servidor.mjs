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
//
//  S11 · Autenticación con token, igual que dummyjson:
//      POST /auth/login    { username, password, expiresInMins? } -> accessToken, refreshToken, usuario
//      GET  /auth/me       con  Authorization: Bearer <accessToken>
//      POST /auth/refresh  { refreshToken, expiresInMins? }       -> tokens nuevos
//      /auth/<recurso>...  la misma ruta pública, pero exige el token:
//                          GET /auth/products/1  sin token -> 401 «Access Token is required»
//                                                vencido   -> 401 «Token Expired!»
//  Usuarios de prueba (api/semilla.json, tomados de dummyjson): emilys / emilyspass,
//  michaelw / michaelwpass, sophiab / sophiabpass.
//  Diferencias deliberadas: un token mal formado o alterado responde 401 (dummyjson responde
//  500), y el refreshToken solo sirve en /auth/refresh (no abre rutas protegidas).
// =============================================================================
import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const SEMILLA = join(DIR, 'semilla.json');
const DATOS = join(DIR, 'datos.json');
const PUERTO = Number(process.env.PORT || 3000);

if (process.argv.includes('--reiniciar') || !existsSync(DATOS)) copyFileSync(SEMILLA, DATOS);
let db = JSON.parse(readFileSync(DATOS, 'utf8'));
// recursos agregados a la semilla después de creada la base (p. ej. users en la S11)
const semilla = JSON.parse(readFileSync(SEMILLA, 'utf8'));
for (const k of Object.keys(semilla)) if (!(k in db)) db[k] = semilla[k];
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

// ---------------------------------------------------------------- tokens (JWT firmado con HMAC SHA-256)
const SECRETO = process.env.SECRETO || 'iub-com30-servidor-de-clase';
const b64u = (x) => Buffer.from(x).toString('base64url');
const firma = (texto) => createHmac('sha256', SECRETO).update(texto).digest('base64url');

function emitir(datos, minutos) {
  const ahora = Math.floor(Date.now() / 1000);
  const cab = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const cuerpo = b64u(JSON.stringify({ ...datos, iat: ahora, exp: ahora + Math.round(minutos * 60) }));
  return `${cab}.${cuerpo}.${firma(`${cab}.${cuerpo}`)}`;
}

/** Devuelve { datos } si el token es válido, o { error } con el mensaje de dummyjson. */
function validar(token) {
  if (!token) return { error: 'Access Token is required' };
  const [cab, cuerpo, f] = token.split('.');
  if (!cab || !cuerpo || !f) return { error: 'invalid token' };
  const esperada = Buffer.from(firma(`${cab}.${cuerpo}`)), recibida = Buffer.from(f);
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return { error: 'invalid token' };
  let datos;
  try { datos = JSON.parse(Buffer.from(cuerpo, 'base64url').toString()); } catch { return { error: 'invalid token' }; }
  if (datos.exp * 1000 < Date.now()) return { error: 'Token Expired!' };
  return { datos };
}

const publico = (u) => ({ id: u.id, username: u.username, email: u.email, firstName: u.firstName,
  lastName: u.lastName, gender: u.gender, image: u.image });
function tokens(u, minutos) {
  return { accessToken: emitir(publico(u), minutos || 60), refreshToken: emitir({ id: u.id, tipo: 'refresh' }, 60 * 24 * 30) };
}
const bearer = (req) => (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
const NOMBRE = { todos: 'Todo', products: 'Product' };

// ---------------------------------------------------------------- rutas
async function atender(req, res) {
  const url = new URL(req.url, 'http://localhost');
  let partes = url.pathname.replace(/^\/api/, '').split('/').filter(Boolean);
  const q = url.searchParams;
  if (req.method === 'OPTIONS') return responder(res, 204);

  // ------------------------------------------------ S11 · autenticación
  if (partes[0] === 'auth') {
    if (req.method === 'POST' && partes[1] === 'login') {
      let c; try { c = await leerCuerpo(req); } catch (e) { return responder(res, 400, { message: e.message }); }
      if (!c.username || !c.password) return responder(res, 400, { message: 'Username and password required' });
      const u = db.users.find((x) => x.username === c.username && x.password === c.password);
      if (!u) return responder(res, 400, { message: 'Invalid credentials' });
      return responder(res, 200, { ...publico(u), ...tokens(u, Number(c.expiresInMins) || 60) });
    }
    if (req.method === 'POST' && partes[1] === 'refresh') {
      let c; try { c = await leerCuerpo(req); } catch (e) { return responder(res, 400, { message: e.message }); }
      const v = validar(c.refreshToken);
      if (!v.error && v.datos.tipo !== 'refresh') v.error = 'invalid token';   // un accessToken no renueva
      if (v.error) return responder(res, 401, { message: v.error === 'Access Token is required' ? 'Refresh token required' : v.error });
      const u = db.users.find((x) => x.id === v.datos.id);
      if (!u) return responder(res, 401, { message: 'invalid token' });
      return responder(res, 200, tokens(u, Number(c.expiresInMins) || 60));
    }
    const v = validar(bearer(req));
    if (!v.error && v.datos.tipo === 'refresh') v.error = 'invalid token';      // un refreshToken no abre rutas
    if (v.error) return responder(res, 401, { message: v.error });
    if (partes[1] === 'me') {
      const u = db.users.find((x) => x.id === v.datos.id);
      return u ? responder(res, 200, u) : responder(res, 404, { message: 'User not found' });
    }
    partes = partes.slice(1);           // /auth/products/1 -> la misma ruta pública, ya autorizada
  }

  const [recurso, a, b] = partes;
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
    if (!x) return noExiste(a);
    const sel = q.get('select');
    return responder(res, 200, sel ? Object.fromEntries(['id', ...sel.split(',').map((s) => s.trim())]
      .filter((c) => c in x).map((c) => [c, x[c]])) : x);
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
