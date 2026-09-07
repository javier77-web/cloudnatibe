import { randomBytes, createHash } from "node:crypto";

const b64url = (buf) => buf.toString("base64url");

const verifier = b64url(randomBytes(32));
const challenge = b64url(createHash("sha256").update(verifier).digest());
const state = b64url(randomBytes(16)); // ← no es lo mismo que el PKCE. Ver abajo

console.log("code_verifier  =", verifier);
console.log("code_challenge =", challenge);
console.log("state          =", state);
