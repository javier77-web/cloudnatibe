import { Controller, Get, Headers } from '@nestjs/common';
import { revisarToken } from './token';

@Controller('v1/libros')
export class LibrosController {
  @Get()
  async listar(@Headers('authorization') authorization?: string) {
    const usuario = revisarToken(authorization);
    console.log(`[gateway] deja pasar a ${usuario.name} (${usuario.sub})`);

    const respuesta = await fetch('http://localhost:3001/libros');
    return respuesta.json();
  }
}
