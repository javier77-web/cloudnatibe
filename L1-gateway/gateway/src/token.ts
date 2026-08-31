import { UnauthorizedException } from '@nestjs/common';

// ── Rellena con lo que viste en el tramo 8 ─────────────────────────
const ISSUER_ESPERADO =
  'https://a25de1fd-3e90-4ce1-b7d2-f892c8efae6a.ciamlogin.com/a25de1fd-3e90-4ce1-b7d2-f892c8efae6a/'; // el claim iss, tal cual
const AUDIENCE_ESPERADA = 'api://94c98665-484c-4b8a-b404-4ec146ad9dee'; // el claim aud, tal cual
// ───────────────────────────────────────────────────────────────────

export function revisarToken(authorization?: string) {
  if (!authorization?.startsWith('Bearer ')) {
    throw new UnauthorizedException(
      'falta el header Authorization con un Bearer',
    );
  }

  const partes = authorization.slice('Bearer '.length).split('.');
  if (partes.length !== 3) {
    throw new UnauthorizedException('esto no tiene forma de JWT');
  }

  let carga: any;
  try {
    carga = JSON.parse(Buffer.from(partes[1], 'base64url').toString());
  } catch {
    throw new UnauthorizedException('la carga del token no es JSON');
  }

  if (carga.iss !== ISSUER_ESPERADO) {
    throw new UnauthorizedException(`emisor no reconocido: ${carga.iss}`);
  }
  if (carga.aud !== AUDIENCE_ESPERADA) {
    throw new UnauthorizedException(`este token no es para mí: ${carga.aud}`);
  }
  if (carga.exp <= Math.floor(Date.now() / 1000)) {
    throw new UnauthorizedException('el token venció');
  }

  return carga;
}
