// ── Rellena estos dos ──────────────────────────────────────────────
const SUBDOMINIO = 'biblotecaNilo123';   // tu Domain Name SIN el .onmicrosoft.com
const TENANT_ID  = 'a25de1fd-3e90-4ce1-b7d2-f892c8efae6a';   // el GUID del tramo 3.1
// ───────────────────────────────────────────────────────────────────

const url = `https://biblotecaNilo123.ciamlogin.com/a25de1fd-3e90-4ce1-b7d2-f892c8efae6a/v2.0/.well-known/openid-configuration`;
console.log('Pidiendo:', url, '\n');

const respuesta = await fetch(url);
if (!respuesta.ok) {
  console.error('No respondió bien:', respuesta.status, respuesta.statusText);
  process.exit(1);
}

const doc = await respuesta.json();

console.log('issuer                 :', doc.issuer);
console.log('authorization_endpoint :', doc.authorization_endpoint);
console.log('token_endpoint         :', doc.token_endpoint);
console.log('jwks_uri               :', doc.jwks_uri);