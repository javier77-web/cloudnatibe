// T3 · archivo 2 de 3 — EL VERIFICADOR
// La API de la biblioteca. NO tiene ninguna llave secreta: se baja el JWKS del
// firmador y con eso comprueba las firmas. Se levanta así:
//
//     node 2-verificador.js       →  http://localhost:4001
//
//     GET /prestamos      necesita un token válido, cualquier rol
//     GET /devoluciones   necesita un token válido Y rol=bibliotecario

const http = require("node:http");
const crypto = require("node:crypto");

const PUERTO = 4001;
const JWKS_URL = "http://localhost:4000/.well-known/jwks.json";
const EMISOR_ESPERADO = "http://localhost:4000";
const AUDIENCIA_ESPERADA = "api-biblioteca";

// ─── 1 · La caché del JWKS ─────────────────────────────────────────────────

let cache = { keys: [], vence: 0 };
const TTL = 10 * 60 * 1000; // 10 minutos

// Freno para evitar descargar el JWKS repetidamente cuando llegan
// muchos tokens con kids desconocidos.
let ultimaRecargaForzada = 0;
const COOLDOWN_RECARGA = 5000; // 5 segundos

async function obtenerLlaves() {
  if (Date.now() < cache.vence && cache.keys.length) {
    return cache.keys;
  }

  const r = await fetch(JWKS_URL);
  const { keys } = await r.json();

  cache = {
    keys,
    vence: Date.now() + TTL,
  };

  console.log(
    `   [jwks] descargado · ${keys.length} llave(s): ${keys
      .map((k) => k.kid)
      .join(", ")}`,
  );

  return keys;
}

// ─── 2 · Verificar ─────────────────────────────────────────────────────────

const leerParte = (parte) =>
  JSON.parse(Buffer.from(parte, "base64url").toString());

async function verificar(token) {
  const [h, p, s] = String(token).split(".");

  if (!h || !p) {
    throw new Error("el token no tiene forma de JWT");
  }

  const header = leerParte(h);
  const payload = leerParte(p);

  // ─── DESAFÍO 1 · algoritmo fijo ─────────────────────────────────────────

  // El algoritmo NO lo decide el token.
  const algoritmo = "RSA-SHA256";

  if (header.alg !== "RS256") {
    throw new Error(`alg inválido: ${header.alg}`);
  }

  // ─── Búsqueda de la llave ────────────────────────────────────────────────

  let llaves = await obtenerLlaves();

  let jwk = llaves.find((k) => k.kid === header.kid);

  // Si no conocemos el kid, puede que el emisor haya rotado la llave.
  if (!jwk) {
    const ahoraMs = Date.now();

    // Freno para no hacer una petición al JWKS por cada kid inventado.
    if (ahoraMs - ultimaRecargaForzada < COOLDOWN_RECARGA) {
      throw new Error(`kid desconocido: ${header.kid}`);
    }

    ultimaRecargaForzada = ahoraMs;

    console.log(`   [jwks] kid ${header.kid} no está en caché · refrescando`);

    const r = await fetch(JWKS_URL);
    const { keys } = await r.json();

    cache = {
      keys,
      vence: Date.now() + TTL,
    };

    console.log(
      `   [jwks] refrescado por kid desconocido · ${keys.length} llave(s): ${keys
        .map((k) => k.kid)
        .join(", ")}`,
    );

    llaves = keys;

    jwk = llaves.find((k) => k.kid === header.kid);
  }

  if (!jwk) {
    throw new Error(`kid desconocido: ${header.kid}`);
  }

  // ─── Verificación de firma ──────────────────────────────────────────────

  const publica = crypto.createPublicKey({
    key: {
      kty: jwk.kty,
      n: jwk.n,
      e: jwk.e,
    },
    format: "jwk",
  });

  const firmaOk = crypto
    .createVerify(algoritmo)
    .update(`${h}.${p}`)
    .verify(publica, Buffer.from(s || "", "base64url"));

  if (!firmaOk) {
    throw new Error("la firma no calza");
  }

  // ─── Validación de claims ────────────────────────────────────────────────

  const ahora = Math.floor(Date.now() / 1000);

  if (!payload.exp || payload.exp < ahora) {
    throw new Error("token expirado");
  }

  if (payload.iss !== EMISOR_ESPERADO) {
    throw new Error(`iss inválido: ${payload.iss}`);
  }

  // ─── DESAFÍO 1 · validar audiencia ──────────────────────────────────────

  if (payload.aud !== AUDIENCIA_ESPERADA) {
    throw new Error(`aud inválida: ${payload.aud}`);
  }

  return payload;
}

// ─── 3 · Las rutas protegidas ──────────────────────────────────────────────

http
  .createServer(async (req, res) => {
    const responder = (codigo, obj) => {
      res.writeHead(codigo, {
        "content-type": "application/json",
      });

      res.end(JSON.stringify(obj, null, 2));
    };

    const cabecera = req.headers.authorization || "";

    const token = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : null;

    if (!token) {
      return responder(401, {
        error: "falta la cabecera Authorization: Bearer <token>",
      });
    }

    let claims;

    try {
      claims = await verificar(token);
    } catch (e) {
      console.log(`   ✗ RECHAZADO: ${e.message}`);

      return responder(401, {
        error: e.message,
      });
    }

    console.log(
      `   ✓ ACEPTADO: sub=${claims.sub} rol=${claims.rol} aud=${claims.aud} alg=${
        leerParte(token.split(".")[0]).alg
      }`,
    );

    if (req.url === "/prestamos") {
      return responder(200, {
        de: claims.sub,
        prestamos: ["Cien años de soledad", "Rayuela"],
      });
    }

    if (req.url === "/devoluciones") {
      if (claims.rol !== "bibliotecario") {
        return responder(403, {
          error: "necesitas rol bibliotecario",
        });
      }

      return responder(200, {
        registrado_por: claims.sub,
        devoluciones: 12,
      });
    }

    responder(404, {
      error: "esa ruta no existe",
    });
  })
  .listen(PUERTO, () => {
    console.log(`VERIFICADOR en http://localhost:${PUERTO}`);
    console.log(`  confío en ${JWKS_URL}`);
    console.log(
      `  espero iss=${EMISOR_ESPERADO} · aud=${AUDIENCIA_ESPERADA}\n`,
    );
  });
