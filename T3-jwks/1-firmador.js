// T3 · archivo 1 de 3 — EL FIRMADOR
// El único que tiene la llave privada. Se levanta así:
//
//     node 1-firmador.js          →  http://localhost:4000
//
// Expone tres cosas, y nada más:
//     POST /login                   emite un JWT firmado con RS256
//     GET  /.well-known/jwks.json   publica la llave PÚBLICA, para que cualquiera verifique
//     POST /rotar                   cambia de par de llaves (esto es el desafío 2)

const http = require("node:http");
const crypto = require("node:crypto");

const PUERTO = 4000;
const EMISOR = "http://localhost:4000";
const AUDIENCIA = "api-biblioteca";
const VIDA = 120;

// ─── 1 · Las llaves ────────────────────────────────────────────────────────

let llaves = [];

function nuevaLlave() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  const jwk = publicKey.export({ format: "jwk" });

  const kid = crypto
    .createHash("sha256")
    .update(jwk.n)
    .digest("base64url")
    .slice(0, 12);

  llaves.unshift({ kid, jwk, privateKey });

  return kid;
}

const jwks = () => ({
  keys: llaves.map(({ kid, jwk }) => ({
    ...jwk,
    kid,
    alg: "RS256",
    use: "sig",
  })),
});

// ─── 2 · Firmar ────────────────────────────────────────────────────────────

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");

function firmar(datos, audiencia = AUDIENCIA) {
  const activa = llaves[0];

  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: activa.kid,
  };

  const ahora = Math.floor(Date.now() / 1000);

  const payload = {
    iss: EMISOR,
    aud: audiencia,
    iat: ahora,
    exp: ahora + VIDA,
    ...datos,
  };

  const cuerpo = `${b64(header)}.${b64(payload)}`;

  const firma = crypto
    .createSign("RSA-SHA256")
    .update(cuerpo)
    .sign(activa.privateKey);

  return `${cuerpo}.${firma.toString("base64url")}`;
}

// ─── 3 · Los usuarios de la biblioteca ─────────────────────────────────────

const USUARIOS = {
  ana: {
    clave: "1234",
    rol: "bibliotecario",
  },

  luis: {
    clave: "1234",
    rol: "lector",
  },
};

// ─── 4 · El servidor ───────────────────────────────────────────────────────

function leerJson(req) {
  return new Promise((resolve) => {
    let texto = "";

    req.on("data", (t) => {
      texto += t;
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(texto));
      } catch {
        resolve({});
      }
    });
  });
}

http
  .createServer(async (req, res) => {
    const responder = (codigo, obj) => {
      res.writeHead(codigo, {
        "content-type": "application/json",
      });

      res.end(JSON.stringify(obj, null, 2));
    };

    console.log(`→ ${req.method} ${req.url}`);

    // ─── JWKS ────────────────────────────────────────────────────────────────

    if (req.method === "GET" && req.url === "/.well-known/jwks.json") {
      return responder(200, jwks());
    }

    // ─── LOGIN ───────────────────────────────────────────────────────────────

    if (req.method === "POST" && req.url === "/login") {
      const { usuario, clave, aud } = await leerJson(req);

      // DEBUG TEMPORAL
      console.log("DATOS RECIBIDOS:", { usuario, clave, aud });
      console.log("USUARIO BUSCADO:", USUARIOS[usuario]);

      const u = USUARIOS[usuario];

      if (!u || u.clave !== clave) {
        return responder(401, {
          error: "usuario o clave incorrectos",
        });
      }

      return responder(200, {
        token: firmar(
          {
            sub: usuario,
            rol: u.rol,
          },
          aud || AUDIENCIA,
        ),
      });
    }

    // ─── ROTAR ───────────────────────────────────────────────────────────────

    if (req.method === "POST" && req.url === "/rotar") {
      const kid = nuevaLlave();

      llaves = llaves.slice(0, 2);

      console.log(`   llave rotada. ahora firmo con kid=${kid}`);

      return responder(200, {
        firmando_con: kid,
        publicadas: llaves.map((l) => l.kid),
      });
    }

    responder(404, {
      error: "esa ruta no existe",
    });
  })
  .listen(PUERTO, () => {
    nuevaLlave();

    console.log(`FIRMADOR en http://localhost:${PUERTO}`);

    console.log(`  firmo con kid=${llaves[0].kid} · alg=RS256`);

    console.log(`  JWKS: http://localhost:${PUERTO}/.well-known/jwks.json\n`);
  });
