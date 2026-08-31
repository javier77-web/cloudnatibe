import { randomBytes, createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

// ── Rellena estos tres desde tu ficha ──────────────────────────────
const AUTHORIZATION_ENDPOINT = 'https://biblotecanilo123.ciamlogin.com/a25de1fd-3e90-4ce1-b7d2-f892c8efae6a/oauth2/v2.0/authorize';   // tramo 6
const CLIENT_ID              = 'd24aa9f3-7ccd-4e3b-b254-b98f34dfef24';   // el de biblioteca-CLIENTE, tramo 4.1
const SCOPE_API              = 'api://94c98665-484c-4b8a-b404-4ec146ad9dee/libros.leer';   // api://.../libros.leer, tramo 3.3
// ───────────────────────────────────────────────────────────────────

// PKCE: un secreto al azar, y su huella SHA-256.
const verificador = randomBytes(32).toString('base64url');
const desafio = createHash('sha256').update(verificador).digest('base64url');

// El secreto se guarda: lo necesitas en el tramo 8 para probar que fuiste tú.
writeFileSync('datos/verificador.txt', verificador);

const parametros = new URLSearchParams({
  client_id: CLIENT_ID,
  response_type: 'code',
  redirect_uri: 'http://localhost:4200/',
  response_mode: 'query',
  scope: `openid ${SCOPE_API}`,
  code_challenge: desafio,
  code_challenge_method: 'S256',
});

console.log('Abre esta dirección en el navegador:\n');
console.log(`${AUTHORIZATION_ENDPOINT}?${parametros}`);