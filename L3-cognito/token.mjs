const DOMINIO = "https://us-east-1pblz2mtpt.auth.us-east-1.amazoncognito.com";
const CLIENT_ID = "5n3a86kcqek7tcu053pthscum";
const REDIRECT = "http://localhost:4200/callback";

const [, , code, verifier] = process.argv;

if (!code || !verifier) {
  console.error("Uso: node token.mjs <EL_CODIGO> <EL_CODE_VERIFIER>");
  process.exit(1);
}

const respuesta = await fetch(`${DOMINIO}/oauth2/token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    code,
    redirect_uri: REDIRECT,
    code_verifier: verifier,
  }),
});

const datos = await respuesta.json();

if (!respuesta.ok) {
  console.error("Cognito dijo que no:", datos);
  process.exit(1);
}

console.log("access_token:\n", datos.access_token, "\n");
console.log("expira en", datos.expires_in, "segundos");

const [, payload] = datos.access_token.split(".");
console.log("\nLo que trae adentro:");
console.log(JSON.parse(Buffer.from(payload, "base64url")));
